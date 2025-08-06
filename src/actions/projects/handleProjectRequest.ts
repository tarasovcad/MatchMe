"use server";

import {createClient} from "@/utils/supabase/server";

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
  };
}

export async function handleProjectRequest({
  requestId,
  action,
}: HandleProjectRequestParams): Promise<HandleProjectRequestResult> {
  try {
    const supabase = await createClient();

    // Get current user
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

    // Note: requestId is actually the project ID (from notification.reference_id)
    // We need to find the actual project request using project_id and user_id
    const {data: projectRequest, error: fetchError} = await supabase
      .from("project_requests")
      .select("*")
      .eq("project_id", requestId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .eq("direction", "invite")
      .single();

    console.log("projectRequest", projectRequest);

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
      // First, get the default role for the project
      const {data: defaultRole, error: roleError} = await supabase
        .from("project_roles")
        .select("id, name")
        .eq("project_id", projectRequest.project_id)
        .eq("is_default", true)
        .single();

      if (roleError || !defaultRole) {
        console.error("Error fetching default role:", roleError);
        return {
          success: false,
          message: "Failed to get project role information",
        };
      }

      // Add the user to the project team first (while request is still pending)
      const {error: teamMemberError} = await supabase.from("project_team_members").insert({
        project_id: projectRequest.project_id,
        user_id: user.id,
        role_id: defaultRole.id,
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
        // Try to remove the team member we just added
        await supabase
          .from("project_team_members")
          .delete()
          .eq("project_id", projectRequest.project_id)
          .eq("user_id", user.id);

        return {
          success: false,
          message: "Failed to complete acceptance process",
        };
      }

      // Update the corresponding notification status
      const {error: notificationError} = await supabase
        .from("notifications")
        .update({
          status: "accepted",
          action_taken_at: new Date().toISOString(),
        })
        .eq("reference_id", requestId)
        .eq("recipient_id", user.id)
        .eq("type", "project_invite");

      if (notificationError) {
        console.error("Error updating notification:", notificationError);
        // Don't fail the entire operation if notification update fails
      }

      return {
        success: true,
        message: "Successfully joined the project!",
        data: {
          projectId: projectRequest.project_id,
          userId: user.id,
          role: defaultRole.name,
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
