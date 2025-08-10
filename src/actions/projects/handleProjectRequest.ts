"use server";

import {createClient} from "@/utils/supabase/server";
import {sendNotification} from "../notifications/sendNotification";
import {notifyOnNewProjectMember} from "./notifyOnNewProjectMember";

interface HandleProjectRequestParams {
  requestId: string;
  action: "accept" | "reject";
}

interface HandleProjectRequestResult {
  success: boolean;
  message: string;
  data?: {
    projectId: string;
    userId: string;
    role: string;
    displayRole?: string;
  };
}

export async function handleProjectRequest({
  requestId,
  action,
}: HandleProjectRequestParams): Promise<HandleProjectRequestResult> {
  try {
    const supabase = await createClient();

    const {
      data: {user},
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const {data: projectRequest, error: fetchError} = await supabase
      .from("project_requests")
      .select("id, project_id, created_by, created_at, position_id")
      .eq("project_id", requestId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .eq("direction", "invite")
      .single();

    if (fetchError || !projectRequest) {
      return {
        success: false,
        message: "Project request not found or already processed",
      };
    }

    if (action === "reject") {
      // Update the project request status to rejected
      const {error: updateError} = await supabase
        .from("project_requests")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectRequest.id);

      if (updateError) {
        console.error("Error updating project request:", updateError);
        return {
          success: false,
          message: "Failed to reject project request",
        };
      }

      // Update the corresponding notification status
      const {error: notificationError} = await supabase
        .from("notifications")
        .update({
          status: "declined",
          action_taken_at: new Date().toISOString(),
        })
        .eq("reference_id", requestId)
        .eq("recipient_id", user.id)
        .eq("type", "project_invite");

      if (notificationError) {
        console.error("Error updating notification:", notificationError);
        // Don't fail the entire operation if notification update fails
      }

      // Send notification to the user who sent the invite
      await sendNotification({
        type: "project_invite_rejected",
        recipientId: projectRequest.created_by,
        referenceId: projectRequest.project_id,
      });

      return {
        success: true,
        message: "Project invitation declined successfully",
        data: {
          projectId: projectRequest.project_id,
          userId: user.id,
          role: "declined",
        },
      };
    }

    if (action === "accept") {
      // Fetch default role, profile, and (optional) position concurrently
      const [defaultRoleRes, userProfileRes, assignedPositionRes] = await Promise.all([
        supabase
          .from("project_roles")
          .select("id, name")
          .eq("project_id", projectRequest.project_id)
          .eq("is_default", true)
          .single(),
        supabase.from("profiles").select("public_current_role").eq("id", user.id).single(),
        projectRequest.position_id
          ? supabase
              .from("project_open_positions")
              .select("id, title")
              .eq("id", projectRequest.position_id)
              .single()
          : Promise.resolve({data: null, error: null} as const),
      ]);

      const {data: defaultRole, error: roleError} = defaultRoleRes;
      const {data: userProfile} = userProfileRes;
      const {data: assignedPosition} = assignedPositionRes as {
        data: {id: string; title: string} | null;
        error: unknown;
      };

      if (roleError || !defaultRole) {
        console.error("Error fetching default role:", roleError);
        return {
          success: false,
          message: "Failed to get project role information",
        };
      }

      // Determine display role using priority logic
      let displayRole: string = defaultRole.name;
      if (assignedPosition) {
        displayRole = assignedPosition.title;
      } else if (userProfile?.public_current_role) {
        displayRole = userProfile.public_current_role;
      }

      // Add the user to the project team
      const {error: teamMemberError} = await supabase.from("project_team_members").insert({
        project_id: projectRequest.project_id,
        user_id: user.id,
        role_id: defaultRole.id,
        display_role: displayRole,
        display_role_set_by: user.id,
        display_role_updated_at: new Date().toISOString(),
        invited_by_user_id: projectRequest.created_by,
        joined_date: new Date().toISOString(),
        invited_at: projectRequest.created_at,
        is_active: true,
      });

      if (teamMemberError) {
        console.error("Error adding team member:", teamMemberError);
        return {
          success: false,
          message: "Failed to join project team",
        };
      }

      // Update the project request status to accepted (after successfully adding team member)
      const {error: updateError} = await supabase
        .from("project_requests")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectRequest.id);

      if (updateError) {
        console.error("Error updating project request:", updateError);
        return {
          success: false,
          message: "Failed to update project request",
        };
      }

      await Promise.allSettled([
        supabase
          .from("notifications")
          .update({
            status: "accepted",
            action_taken_at: new Date().toISOString(),
          })
          .eq("reference_id", requestId)
          .eq("recipient_id", user.id)
          .eq("type", "project_invite"),
        sendNotification({
          type: "project_invite_accepted",
          recipientId: projectRequest.created_by,
          referenceId: projectRequest.project_id,
        }),
        notifyOnNewProjectMember({
          projectId: projectRequest.project_id,
          newMemberUserId: user.id,
          excludeUserIds: [projectRequest.created_by],
        }),
      ]);

      return {
        success: true,
        message: "Successfully joined the project!",
        data: {
          projectId: projectRequest.project_id,
          userId: user.id,
          role: defaultRole.name,
          displayRole: displayRole,
        },
      };
    }

    return {
      success: false,
      message: "Invalid action",
    };
  } catch (error) {
    console.error("Error handling project request:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}
