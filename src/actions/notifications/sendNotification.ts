"use server";

import {NotificationType} from "@/types/notifications/notificationType";
import {createClient} from "@/utils/supabase/server";
import type {SupabaseClient} from "@supabase/supabase-js";

export interface SendNotificationBody {
  type: NotificationType;
  recipientId: string;
  referenceId?: string; // For project-related notifications
}

export interface SendNotificationResult {
  success: boolean;
  error?: string;
}

export async function sendNotification(
  body: SendNotificationBody,
): Promise<SendNotificationResult> {
  try {
    const supabase = await createClient();

    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
      return {success: false, error: "User not authenticated"};
    }

    const {type, recipientId, referenceId} = body;

    if (!type || !recipientId) {
      return {success: false, error: "Missing required fields: type, recipientId"};
    }

    if (user.id === recipientId) {
      return {success: false, error: "Cannot send notification to yourself"};
    }

    switch (type) {
      case "follow":
        return await handleFollowNotification(supabase, user.id, recipientId);

      case "project_invite":
      case "project_request":
      case "user_request_accepted":
      case "user_request_rejected":
      case "project_invite_accepted":
      case "project_invite_rejected":
      case "project_member_added":
      case "project_member_removed":
      case "project_role_updated":
      case "project_deleted":
        return await handleProjectNotification(supabase, type, user.id, recipientId, referenceId);

      default:
        return {success: false, error: "Unsupported notification type"};
    }
  } catch (error) {
    console.error("sendNotification (server action) error:", error);
    return {success: false, error: "Internal server error"};
  }
}

async function handleFollowNotification(
  supabase: SupabaseClient,
  senderId: string,
  recipientId: string,
): Promise<SendNotificationResult> {
  // Deduplicate: if a follow notification from this sender to this recipient exists in the last 3 days, do not insert another
  const threeDaysAgoIso = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const {count, error: checkError} = await supabase
    .from("notifications")
    .select("*", {count: "exact", head: true})
    .eq("recipient_id", recipientId)
    .eq("sender_id", senderId)
    .eq("type", "follow")
    .gte("created_at", threeDaysAgoIso);

  if (!checkError && (count ?? 0) > 0) {
    // A recent follow notification already exists; treat as success without inserting a duplicate
    return {success: true};
  }

  const {error} = await supabase.from("notifications").insert([
    {
      recipient_id: recipientId,
      type: "follow",
      sender_id: senderId,
      created_at: new Date().toISOString(),
      status: "pending",
    },
  ]);

  if (error) {
    console.error("Follow notification insert error:", error.message);
    return {success: false, error: "Failed to create notification"};
  }

  return {success: true};
}

async function handleProjectNotification(
  supabase: SupabaseClient,
  type: NotificationType,
  senderId: string,
  recipientId: string,
  referenceId?: string,
): Promise<SendNotificationResult> {
  if (!referenceId) {
    return {success: false, error: "Project notifications require referenceId"};
  }

  let status = "info";
  if (type === "project_invite" || type === "project_request") {
    status = "pending";
  }

  const {error} = await supabase.from("notifications").insert([
    {
      recipient_id: recipientId,
      type: type,
      sender_id: senderId,
      reference_id: referenceId,
      created_at: new Date().toISOString(),
      status: status,
    },
  ]);

  if (error) {
    console.error("Project notification insert error:", error.message);
    return {success: false, error: "Failed to create notification"};
  }

  return {success: true};
}
