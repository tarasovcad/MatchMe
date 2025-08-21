"use server";
import {createClient} from "@/utils/supabase/server";
import {getUsersWithProjectPermission} from "@/actions/projects/getUsersWithProjectPermission";

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

    // Check if the user is already a team member
    const {data: existingMember, error: memberCheckError} = await supabase
      .from("project_team_members")
      .select("id")
      .eq("project_id", data.project_id)
      .eq("user_id", user.id)
      .single();

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

    // Check if there's already a pending application for this project (any position)
    const {data: existingApplication, error: applicationCheckError} = await supabase
      .from("project_requests")
      .select("id, position_id")
      .eq("project_id", data.project_id)
      .eq("user_id", user.id)
      .eq("direction", "application")
      .eq("status", "pending")
      .single();

    if (applicationCheckError && applicationCheckError.code !== "PGRST116") {
      return {
        success: false,
        error: "Error checking existing applications",
      };
    }

    // If there's an existing application, update it instead of creating new one
    if (existingApplication) {
      const {data: updatedApplication, error: updateError} = await supabase
        .from("project_requests")
        .update({
          position_id: data.position_id,
          last_sent_at: new Date().toISOString(),
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

    // Check if most recent application is in cool-off
    const {data: lastRejected, error: lastRejectedErr} = await supabase
      .from("project_requests")
      .select("id, status, next_allowed_at")
      .eq("project_id", data.project_id)
      .eq("user_id", user.id)
      .eq("direction", "application")
      .order("updated_at", {ascending: false})
      .limit(1)
      .maybeSingle();

    if (!lastRejectedErr && lastRejected?.next_allowed_at) {
      const now = new Date();
      const nextAllowed = new Date(lastRejected.next_allowed_at);
      if (nextAllowed.getTime() > now.getTime()) {
        return {
          success: false,
          error: `You have applied within the cool-off period and cannot apply again until ${nextAllowed.toLocaleDateString()}`,
        };
      }
    }

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
        last_sent_at: new Date().toISOString(),
        next_allowed_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
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

    // Notify all team members with permission to receive application notifications
    const {error: permError, userIds} = await getUsersWithProjectPermission({
      projectId: data.project_id,
      resource: "Applications",
      action: "notification",
      excludeUserIds: [user.id],
    });

    if (!permError && userIds.length > 0) {
      const nowIso = new Date().toISOString();
      const rows = userIds.map((recipientId) => ({
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
