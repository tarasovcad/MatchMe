"use server";
import {createClient} from "@/utils/supabase/server";
import {getUsersWithProjectPermission} from "@/actions/projects/getUsersWithProjectPermission";
import {Ratelimit} from "@upstash/ratelimit";
import {redis} from "@/utils/redis/redis";
import {getClientIp} from "@/utils/network/getClientIp";

export interface SubmitProjectApplicationData {
  project_id: string;
  position_id: string;
  message?: string;
}

export const submitProjectApplication = async (data: SubmitProjectApplicationData) => {
  try {
    const supabase = await createClient();

    const {
      data: {user},
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const nowIso = new Date().toISOString();
    const ip = await getClientIp();

    // Preflight global rate limit to short-circuit spam before DB reads
    const preflightUserLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "2 m"), // 10 attempts per 2 minutes per user
      analytics: true,
      prefix: "ratelimit:user:application-preflight",
      enableProtection: true,
    });
    const preflightIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 attempts per 1 minute per IP
      analytics: true,
      prefix: "ratelimit:ip:application-preflight",
      enableProtection: true,
    });

    const [preUser, preIp] = await Promise.all([
      preflightUserLimiter.limit(user.id),
      preflightIpLimiter.limit(ip),
    ]);

    if (!preUser.success || !preIp.success) {
      return {
        success: false,
        error: "Too many application attempts. Please slow down and try again later.",
      };
    }

    // Run independent checks in parallel to reduce latency
    const [
      {data: existingMember, error: memberCheckError},
      {data: pendingInvite, error: pendingInviteError},
      {data: existingApplication, error: applicationCheckError},
      {data: lastRejected, error: lastRejectedErr},
    ] = await Promise.all([
      supabase
        .from("project_team_members")
        .select("id")
        .eq("project_id", data.project_id)
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("project_requests")
        .select("id")
        .eq("project_id", data.project_id)
        .eq("user_id", user.id)
        .eq("direction", "invite")
        .eq("status", "pending")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("project_requests")
        .select("id, position_id")
        .eq("project_id", data.project_id)
        .eq("user_id", user.id)
        .eq("direction", "application")
        .eq("status", "pending")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("project_requests")
        .select("id, status, next_allowed_at")
        .eq("project_id", data.project_id)
        .eq("user_id", user.id)
        .eq("direction", "application")
        .order("updated_at", {ascending: false})
        .limit(1)
        .maybeSingle(),
    ]);

    if (memberCheckError && memberCheckError.code !== "PGRST116") {
      return {
        success: false,
        error: "Error checking team membership",
      };
    }

    if (existingMember) {
      return {
        success: false,
        error: "You are already a team member of this project",
      };
    }

    if (pendingInviteError && pendingInviteError.code !== "PGRST116") {
      return {
        success: false,
        error: "Error checking invitations",
      };
    }

    if (pendingInvite) {
      return {
        success: false,
        error:
          "This project has already sent you an invitation. No need to apply to positions - you can accept or decline the existing invitation.",
      };
    }

    if (applicationCheckError && applicationCheckError.code !== "PGRST116") {
      return {
        success: false,
        error: "Error checking existing applications",
      };
    }

    // If there's an existing application, update it instead of creating a new one
    if (existingApplication) {
      // Rate limits for updating an existing application (changing position)
      const updateUserLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "24 h"), // up to 10 updates per 24 hours per user
        analytics: true,
        prefix: "ratelimit:user:application-update",
        enableProtection: true,
      });
      const updatePairLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "24 h"), // up to 5 updates per 24 hours per user-project pair
        analytics: true,
        prefix: "ratelimit:pair:application-update",
        enableProtection: true,
      });

      const [updateUserLimit, updatePairLimit] = await Promise.all([
        updateUserLimiter.limit(user.id),
        updatePairLimiter.limit(`${user.id}:${data.project_id}`),
      ]);

      if (!updateUserLimit.success || !updatePairLimit.success) {
        return {
          success: false,
          error: "Too many application updates. Please slow down and try again later.",
        };
      }

      const {data: updatedApplication, error: updateError} = await supabase
        .from("project_requests")
        .update({
          position_id: data.position_id,
          updated_at: nowIso,
          last_sent_at: nowIso,
        })
        .eq("id", existingApplication.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating project application:", updateError);
        return {
          success: false,
          error: updateError.message,
        };
      }
      return {
        success: true,
        data: updatedApplication,
      };
    }

    // Enforce cool-off period when applicable
    if (!lastRejectedErr && lastRejected?.next_allowed_at) {
      const now = new Date(nowIso);
      const nextAllowed = new Date(lastRejected.next_allowed_at);
      if (nextAllowed.getTime() > now.getTime()) {
        return {
          success: false,
          error: `You have applied within the cool-off period and cannot apply again until ${nextAllowed.toLocaleDateString()}`,
        };
      }
    }

    // Rate limits for creating a new application
    const createUserLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "24 h"), // up to 10 new applications per 24 hours per user
      analytics: true,
      prefix: "ratelimit:user:application-create",
      enableProtection: true,
    });
    const createIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "24 h"), // up to 50 new applications per 24 hours per IP
      analytics: true,
      prefix: "ratelimit:ip:application-create",
      enableProtection: true,
    });

    const [createUserLimit, createIpLimit] = await Promise.all([
      createUserLimiter.limit(user.id),
      createIpLimiter.limit(ip),
    ]);

    if (!createUserLimit.success || !createIpLimit.success) {
      return {
        success: false,
        error: "Too many applications from your account or IP. Please try again later.",
      };
    }

    // Kick off recipient lookup in parallel with insert
    const recipientsPromise = getUsersWithProjectPermission({
      projectId: data.project_id,
      resource: "Applications",
      action: "notification",
      excludeUserIds: [user.id],
    });

    // Create new application
    const {data: applicationData, error: applicationError} = await supabase
      .from("project_requests")
      .insert({
        project_id: data.project_id,
        user_id: user.id,
        created_by: user.id,
        position_id: data.position_id,
        direction: "application",
        status: "pending",
        last_sent_at: nowIso,
        created_at: nowIso,
      })
      .select()
      .single();

    if (applicationError) {
      console.error("Error creating project application:", applicationError);
      return {
        success: false,
        error: applicationError.message,
      };
    }

    // Resolve recipients and send notifications
    const {error: permError, userIds} = await recipientsPromise;
    console.log("userIds", userIds);
    if (!permError) {
      const recipientSet = new Set<string>(userIds ?? []);

      if (recipientSet.size > 0) {
        const rows = Array.from(recipientSet).map((recipientId) => ({
          recipient_id: recipientId,
          type: "project_request",
          sender_id: user.id,
          reference_id: data.project_id,
          created_at: nowIso,
          status: "pending",
        }));

        const {error: insertError} = await supabase.from("notifications").insert(rows);
        if (insertError) {
          console.error("submitProjectApplication notifications insert error", insertError);
        }
      }
    }

    return {
      success: true,
      data: applicationData,
    };
  } catch (error) {
    console.error("Unexpected error submitting project application:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
};
