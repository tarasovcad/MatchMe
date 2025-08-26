"use server";

import {createClient} from "@/utils/supabase/server";
import {sendNotification} from "@/actions/notifications/sendNotification";
import {notifyOnNewProjectMember} from "./notifyOnNewProjectMember";
import {getUsersWithProjectPermission} from "./getUsersWithProjectPermission";
import {PostgrestError} from "@supabase/supabase-js";
import {createClient as createAdminClient} from "@/utils/supabase/admin";

export type ManageProjectRequestAction = "accept" | "reject" | "cancel" | "resend" | "reset";

interface ProjectRequest {
  id: string;
  project_id: string;
  user_id: string;
  created_by: string;
  created_at: string;
  position_id: string | null;
  role_id: string | null;
  direction: "invite" | "application";
  status: "pending" | "accepted" | "rejected" | "cancelled";
  resend_count?: number;
  next_allowed_at?: string | null;
}

interface ManageProjectRequestParams {
  requestId: string | null;
  action: ManageProjectRequestAction;
  projectId: string;
}

interface ManageProjectRequestResult {
  success: boolean;
  message: string;
  data?: {
    projectId: string;
    userId: string;
  };
}

export async function manageProjectRequest({
  requestId,
  projectId,
  action,
}: ManageProjectRequestParams): Promise<ManageProjectRequestResult> {
  const supabase = await createClient();
  const admin = await createAdminClient();
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {success: false, message: "User not authenticated"};
  }

  let request: ProjectRequest | null = null;
  let requestError: PostgrestError | null = null;

  if (requestId !== null) {
    const {data, error} = await supabase
      .from("project_requests")
      .select(
        "id, project_id, user_id, created_by, created_at, position_id, role_id, direction, status, resend_count, next_allowed_at",
      )
      .eq("id", requestId)
      .single();
    request = data;
    requestError = error;
  } else {
    // when using request from notificaion
    const {data, error} = await supabase
      .from("project_requests")
      .select(
        "id, project_id, user_id, created_by, created_at, position_id, role_id, direction, status, resend_count, next_allowed_at",
      )
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .eq("direction", "invite")
      .single();
    request = data;
    requestError = error;
  }

  if (requestError || !request) {
    return {success: false, message: "Project request not found or already processed"};
  }

  // resolve current user's role permissions
  const resolveUserPermissions = async (
    projectIdToCheck: string,
    userIdToCheck: string,
  ): Promise<Record<string, Record<string, boolean>> | null> => {
    const {data: member} = await supabase
      .from("project_team_members")
      .select("role_id")
      .eq("project_id", projectIdToCheck)
      .eq("user_id", userIdToCheck)
      .maybeSingle();

    if (!member) return null; // non-members do not have project-granted permissions
    const roleId = member.role_id as string | null;

    const {data: role} = await supabase
      .from("project_roles")
      .select("permissions")
      .eq("id", roleId)
      .maybeSingle();
    return (role?.permissions as Record<string, Record<string, boolean>>) ?? null;
  };

  // Authorization gates per action/direction
  const isInvitedUser = user.id === request.user_id;
  const isApplication = request.direction === "application";
  const isInvite = request.direction === "invite";

  const perms = await resolveUserPermissions(request.project_id, user.id);
  const canUpdateInvitations = !!perms?.["Invitations"]?.update;
  const canUpdateApplications = !!perms?.["Applications"]?.update;

  // Rules:
  // - Invites: invited user may accept/reject their own invite; resend/cancel require Invitations.update
  // - Applications: accept/reject require Applications.update; applicant may cancel their own application
  // - Reset: require update on relevant resource
  if (isInvite) {
    if (action === "resend" || action === "cancel") {
      if (!canUpdateInvitations) {
        return {success: false, message: "Restricted Access"};
      }
    } else if (action === "accept" || action === "reject") {
      if (!isInvitedUser) {
        return {success: false, message: "Only the invited user can perform this action"};
      }
    }
  }

  if (isApplication) {
    if (action === "accept" || action === "reject") {
      if (!canUpdateApplications) {
        return {success: false, message: "Restricted Access"};
      }
    }
    if (action === "cancel") {
      const isApplicant = isInvitedUser; // for applications, request.user_id is the applicant
      if (!isApplicant && !canUpdateApplications) {
        return {success: false, message: "Restricted Access"};
      }
    }
  }

  if (action === "reset") {
    const needApplications = isApplication;
    const allowed = needApplications ? canUpdateApplications : canUpdateInvitations;
    if (!allowed) {
      return {success: false, message: "Restricted Access"};
    }
  }

  // Helpers
  const updateStatus = async (status: "pending" | "accepted" | "rejected" | "cancelled") => {
    const {error} = await supabase
      .from("project_requests")
      .update({status, updated_at: new Date().toISOString()})
      .eq("id", request.id);
    return error;
  };

  // Get default role for project
  const getDefaultRole = async () => {
    return request.role_id
      ? await supabase.from("project_roles").select("id, name").eq("id", request.role_id).single()
      : await supabase
          .from("project_roles")
          .select("id, name")
          .eq("project_id", request.project_id)
          .eq("is_default", true)
          .single();
  };

  // Compute display role helper (position title > user's public_current_role > role name)
  const computeDisplayRole = async (fallbackRoleName: string) => {
    const [userProfileRes, assignedPositionRes] = await Promise.all([
      supabase.from("profiles").select("public_current_role").eq("id", request.user_id).single(),
      request.position_id
        ? supabase
            .from("project_open_positions")
            .select("id, title")
            .eq("id", request.position_id)
            .single()
        : Promise.resolve({data: null, error: null} as const),
    ]);

    const userPublicRole = userProfileRes.data?.public_current_role;
    const assignedPosition = assignedPositionRes.data;
    return assignedPosition?.title || userPublicRole || fallbackRoleName;
  };

  // Handle actions
  if (action === "accept") {
    const roleRes = await getDefaultRole();
    if (roleRes.error || !roleRes.data) {
      return {success: false, message: "Failed to resolve project role"};
    }
    const displayRole = await computeDisplayRole(roleRes.data.name);

    // Insert team member
    const {error: addMemberError} = await supabase.from("project_team_members").insert({
      project_id: request.project_id,
      user_id: request.user_id,
      role_id: roleRes.data.id,
      display_role: displayRole,
      display_role_set_by: user.id,
      display_role_updated_at: new Date().toISOString(),
      invited_by_user_id: request.created_by,
      invited_at: request.created_at,
      joined_date: new Date().toISOString(),
      is_active: true,
    });

    if (addMemberError) {
      return {success: false, message: "Failed to add user to team"};
    }

    // Clear cooldown fields after a successful join/acceptance
    await supabase
      .from("project_requests")
      .update({resend_count: 0, next_allowed_at: null, status: "accepted"})
      .eq("id", request.id);

    // Notifications differ by direction
    if (request.direction === "application") {
      // Notify applicant (user who applied)
      await sendNotification({
        type: "user_request_accepted",
        recipientId: request.user_id,
        referenceId: request.project_id,
      });
    } else if (request.direction === "invite") {
      // Update the invitation notification status for the invited user
      await supabase
        .from("notifications")
        .update({status: "accepted", action_taken_at: new Date().toISOString()})
        .eq("recipient_id", request.user_id)
        .eq("reference_id", request.project_id)
        .eq("type", "project_invite");

      // Notify the inviter and project members
      await Promise.allSettled([
        sendNotification({
          type: "project_invite_accepted",
          recipientId: request.created_by,
          referenceId: request.project_id,
        }),
        notifyOnNewProjectMember({
          projectId: request.project_id,
          newMemberUserId: request.user_id,
          excludeUserIds: [request.created_by],
        }),
      ]);
    }

    return {
      success: true,
      message: "Request accepted",
      data: {projectId: request.project_id, userId: request.user_id},
    };
  }

  if (action === "reject") {
    const {data: rejectionHistory, error: rejectionHistoryError} = await supabase
      .from("project_requests")
      .select("id")
      .eq("project_id", request.project_id)
      .eq("user_id", request.user_id)
      .eq("direction", "application")
      .eq("status", "rejected");

    if (rejectionHistoryError) {
      return {success: false, message: "Failed to check rejection history"};
    }

    const rejectionCount = (rejectionHistory?.length || 0) + 1;

    const statusErr = await updateStatus("rejected");
    if (statusErr) {
      return {success: false, message: "Failed to update request status"};
    }

    // Set cooldown based on rejection count
    // 1st rejection: 7 days, 2nd and subsequent: 30 days
    const now = new Date();
    let coolOffMs: number;

    if (rejectionCount === 1) {
      coolOffMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    } else {
      coolOffMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    // For applications, set cooldown to prevent re-applying. For invites, keep the original 14-day logic.
    if (request.direction === "application") {
      await supabase
        .from("project_requests")
        .update({
          resend_count: 0,
          next_allowed_at: new Date(now.getTime() + coolOffMs).toISOString(),
        })
        .eq("id", request.id);
    } else {
      // 14-day cool-off for re-invites
      const coolOffMs = 14 * 24 * 60 * 60 * 1000;
      await supabase
        .from("project_requests")
        .update({
          resend_count: 0,
          next_allowed_at: new Date(now.getTime() + coolOffMs).toISOString(),
        })
        .eq("id", request.id);
    }

    if (request.direction === "application") {
      await sendNotification({
        type: "user_request_rejected",
        recipientId: request.user_id,
        referenceId: request.project_id,
      });
    } else if (request.direction === "invite") {
      // Update the invitation notification status for the invited user
      await supabase
        .from("notifications")
        .update({status: "declined", action_taken_at: new Date().toISOString()})
        .eq("recipient_id", request.user_id)
        .eq("reference_id", request.project_id)
        .eq("type", "project_invite");

      // Notify inviter about rejection
      await sendNotification({
        type: "project_invite_rejected",
        recipientId: request.created_by,
        referenceId: request.project_id,
      });
    }

    return {
      success: true,
      message: "Request rejected",
      data: {projectId: request.project_id, userId: request.user_id},
    };
  }

  if (action === "cancel") {
    if (request.direction === "invite") {
      const statusErr = await updateStatus("cancelled");

      if (statusErr) {
        return {success: false, message: "Failed to cancel invite"};
      }

      // Set a 7-day cool-off and clear resend-related fields so owners cannot cancel to bypass cooldowns
      const now = new Date();
      const coolOffMs = 7 * 24 * 60 * 60 * 1000;
      await supabase
        .from("project_requests")
        .update({
          resend_count: 0,
          next_allowed_at: new Date(now.getTime() + coolOffMs).toISOString(),
        })
        .eq("id", request.id);

      const {error: notificationError} = await admin
        .from("notifications")
        .update({status: "cancelled", action_taken_at: new Date().toISOString()})
        .eq("recipient_id", request.user_id)
        .eq("reference_id", request.project_id)
        .eq("type", "project_invite");

      console.log("notificationError", notificationError);
      if (notificationError) {
        return {success: false, message: "Failed to update notification status"};
      }

      return {
        success: true,
        message: "Invitation cancelled",
        data: {projectId: request.project_id, userId: request.user_id},
      };
    }

    // Allow users to cancel their own applications
    if (request.direction === "application") {
      const statusErr = await updateStatus("cancelled");
      if (statusErr) {
        return {success: false, message: "Failed to cancel application"};
      }

      // Apply a short cool-off (7 days) to discourage quick re-spam
      const now = new Date();
      const coolOffMs = 7 * 24 * 60 * 60 * 1000;
      await supabase
        .from("project_requests")
        .update({
          resend_count: 0,
          next_allowed_at: new Date(now.getTime() + coolOffMs).toISOString(),
        })
        .eq("id", request.id);

      // Mark application notifications as cancelled
      await admin
        .from("notifications")
        .update({status: "cancelled", action_taken_at: new Date().toISOString()})
        .eq("sender_id", request.user_id)
        .eq("reference_id", request.project_id)
        .eq("type", "project_request")
        .eq("status", "pending");

      return {
        success: true,
        message: "Application cancelled",
        data: {projectId: request.project_id, userId: request.user_id},
      };
    }

    return {success: false, message: "Invalid cancel action"};
  }

  if (action === "resend") {
    if (request.direction !== "invite") {
      return {success: false, message: "Only invites can be resent"};
    }

    // Max 5 resends per invite (after original send)
    const currentResendCount = request.resend_count ?? 0;
    const MAX_RESENDS = 5;
    if (currentResendCount >= MAX_RESENDS) {
      return {
        success: false,
        message:
          "You've reached the resend limit for this invite. Further resends are not available. The counter will reset only if the user applies to your project.",
      };
    }

    // Cooldown check: require now >= next_allowed_at if set
    const now = new Date();
    const nextAllowedAt = request.next_allowed_at ? new Date(request.next_allowed_at) : null;
    if (nextAllowedAt && nextAllowedAt.getTime() > now.getTime()) {
      return {
        success: false,
        message: `You can resend this invitation on ${nextAllowedAt.toISOString()}`,
      };
    }

    // Determine next cooldown window based on the resend step just performed
    // Step mapping (before increment):
    // 0 -> after first resend, next window = 3 days
    // 1 -> after second resend, next window = 7 days
    // 2 -> after third resend, next window = 7 days
    // 3 -> after fourth resend, next window = 7 days
    // 4 -> after fifth resend, next window = 365 days (soft-freeze)
    let nextWindowMs: number | null = null;
    if (currentResendCount === 0) {
      nextWindowMs = 3 * 24 * 60 * 60 * 1000; // 3 days
    } else if (currentResendCount === 1) {
      nextWindowMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    } else if (currentResendCount === 2) {
      nextWindowMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    } else if (currentResendCount === 3) {
      nextWindowMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    } else if (currentResendCount >= 4) {
      // After performing the 5th resend, set a long cooldown (365 days)
      nextWindowMs = 365 * 24 * 60 * 60 * 1000; // 365 days
    }

    const updatedFields = {
      updated_at: now.toISOString(),
      next_allowed_at: nextWindowMs ? new Date(now.getTime() + nextWindowMs).toISOString() : null,
      resend_count: currentResendCount + 1,
    } as const;

    const {error: timeUpdateErr} = await supabase
      .from("project_requests")
      .update(updatedFields)
      .eq("id", request.id);

    if (timeUpdateErr) {
      return {success: false, message: "Failed to update invite"};
    }

    await sendNotification({
      type: "project_invite",
      recipientId: request.user_id,
      referenceId: request.project_id,
    });

    return {
      success: true,
      message: "Invitation resent",
      data: {projectId: request.project_id, userId: request.user_id},
    };
  }

  if (action === "reset") {
    const statusErr = await updateStatus("pending");
    if (statusErr) {
      return {success: false, message: "Failed to reset request"};
    }

    return {
      success: true,
      message: "Request reset",
      data: {projectId: request.project_id, userId: request.user_id},
    };
  }

  return {success: false, message: "Invalid action"};
}
