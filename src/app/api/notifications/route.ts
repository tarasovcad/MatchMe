import {NotificationType} from "@/types/notifications/notificationType";
import {createClient} from "@/utils/supabase/server";
import {SupabaseClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";

interface NotificationRequest {
  type: NotificationType;
  senderId: string;
  recipientId: string;
  referenceId?: string; // For project-related notifications
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const requestData: NotificationRequest = await req.json();

    const {type, senderId, recipientId, referenceId} = requestData;

    // Validate required fields
    if (!type || !senderId || !recipientId) {
      return NextResponse.json(
        {success: false, error: "Missing required fields: type, senderId, recipientId"},
        {status: 400},
      );
    }

    // Prevent self-notifications
    if (senderId === recipientId) {
      return NextResponse.json(
        {success: false, error: "Cannot send notification to yourself"},
        {status: 400},
      );
    }

    // Handle different notification types
    switch (type) {
      case "follow":
        return await handleFollowNotification(supabase, senderId, recipientId);

      case "project_invite":
      case "project_member_added":
      case "project_request_accepted":
        return await handleProjectNotification(supabase, type, senderId, recipientId, referenceId);

      default:
        return NextResponse.json(
          {success: false, error: "Unsupported notification type"},
          {status: 400},
        );
    }
  } catch (error) {
    console.error("Notification API error:", error);
    return NextResponse.json({success: false, error: "Internal server error"}, {status: 500});
  }
}

async function handleFollowNotification(
  supabase: SupabaseClient,
  senderId: string,
  recipientId: string,
) {
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
    return NextResponse.json(
      {success: false, error: "Failed to create notification"},
      {status: 500},
    );
  }

  return NextResponse.json({success: true});
}

async function handleProjectNotification(
  supabase: SupabaseClient,
  type: string,
  senderId: string,
  recipientId: string,
  referenceId?: string,
) {
  if (!referenceId) {
    return NextResponse.json(
      {success: false, error: "Project notifications require referenceId"},
      {status: 400},
    );
  }

  // Check for duplicate project notifications (optional, depending on business logic)
  const {data: existingNotification} = await supabase
    .from("notifications")
    .select("id")
    .eq("type", type)
    .eq("sender_id", senderId)
    .eq("recipient_id", recipientId)
    .eq("reference_id", referenceId)
    .eq("status", "pending")
    .single();

  // Skip if duplicate exists (customize this logic as needed)
  if (existingNotification && type !== "project_member_added") {
    return NextResponse.json({success: true, message: "Notification already exists"});
  }

  const {error} = await supabase.from("notifications").insert([
    {
      recipient_id: recipientId,
      type: type,
      sender_id: senderId,
      reference_id: referenceId,
      created_at: new Date().toISOString(),
      status: "pending",
    },
  ]);

  if (error) {
    console.error("Project notification insert error:", error.message);
    return NextResponse.json(
      {success: false, error: "Failed to create notification"},
      {status: 500},
    );
  }

  return NextResponse.json({success: true});
}
