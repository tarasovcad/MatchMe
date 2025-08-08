export interface SendNotificationParams {
  type: "follow" | "project_invite" | "project_member_added" | "project_request_accepted";
  senderId: string;
  recipientId: string;
  referenceId?: string; // Required for project-related notifications
}

export interface NotificationResponse {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Sends a notification to a user via the notifications API
 * @param params - Notification parameters
 * @returns Promise with success status and optional error message
 */
export async function sendNotification(
  params: SendNotificationParams,
): Promise<NotificationResponse> {
  try {
    // Validate project notifications have referenceId
    if (
      ["project_invite", "project_member_added", "project_request_accepted"].includes(
        params.type,
      ) &&
      !params.referenceId
    ) {
      return {
        success: false,
        error: "Project notifications require a referenceId",
      };
    }

    // Prevent self-notifications
    if (params.senderId === params.recipientId) {
      return {
        success: false,
        error: "Cannot send notification to yourself",
      };
    }

    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to send notification",
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    return {
      success: false,
      error: "Network error while sending notification",
    };
  }
}

/**
 * Helper function specifically for follow notifications
 * @param followerId - ID of the user doing the following
 * @param followingId - ID of the user being followed
 */
export async function sendFollowNotification(followerId: string, followingId: string) {
  return sendNotification({
    type: "follow",
    senderId: followerId,
    recipientId: followingId,
  });
}

/**
 * Helper function for project invite notifications
 * @param senderId - ID of the user sending the invite
 * @param recipientId - ID of the user receiving the invite
 * @param projectId - ID of the project
 */
export async function sendProjectInviteNotification(
  senderId: string,
  recipientId: string,
  projectId: string,
) {
  return sendNotification({
    type: "project_invite",
    senderId,
    recipientId,
    referenceId: projectId,
  });
}

/**
 * Helper function for project member added notifications
 * @param newMemberId - ID of the user who joined
 * @param recipientId - ID of the user to notify (project owner/inviter)
 * @param projectId - ID of the project
 */
export async function sendProjectMemberAddedNotification(
  newMemberId: string,
  recipientId: string,
  projectId: string,
) {
  return sendNotification({
    type: "project_member_added",
    senderId: newMemberId,
    recipientId,
    referenceId: projectId,
  });
}

/**
 * Helper function for project request accepted notifications
 * @param accepterId - ID of the user who accepted
 * @param recipientId - ID of the user to notify (original inviter)
 * @param projectId - ID of the project
 */
export async function sendProjectRequestAcceptedNotification(
  accepterId: string,
  recipientId: string,
  projectId: string,
) {
  return sendNotification({
    type: "project_request_accepted",
    senderId: accepterId,
    recipientId,
    referenceId: projectId,
  });
}
