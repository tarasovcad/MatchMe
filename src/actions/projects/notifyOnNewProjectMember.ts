"use server";

import {createClient} from "@/utils/supabase/server";
import {getUsersWithProjectPermission} from "./getUsersWithProjectPermission";

interface NotifyOnNewProjectMemberParams {
  projectId: string;
  newMemberUserId: string;
  excludeUserIds?: string[];
}

interface NotifyOnNewProjectMemberResult {
  error: string | null;
  notifiedUserIds: string[];
}

export async function notifyOnNewProjectMember(
  params: NotifyOnNewProjectMemberParams,
): Promise<NotifyOnNewProjectMemberResult> {
  const {projectId, newMemberUserId, excludeUserIds = []} = params;

  try {
    if (!projectId || !newMemberUserId) {
      return {error: "Missing required params", notifiedUserIds: []};
    }

    const supabase = await createClient();

    // Ensure current user exists (sender of the notifications)
    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
      return {error: "User not authenticated", notifiedUserIds: []};
    }

    // Verify the new member belongs to this project (optional safety)
    const {data: member, error: memberError} = await supabase
      .from("project_team_members")
      .select("user_id")
      .eq("project_id", projectId)
      .eq("user_id", newMemberUserId)
      .single();

    if (memberError || !member) {
      return {error: "New member not found in this project", notifiedUserIds: []};
    }

    // Build exclusion list: joining user + optional excludes
    const exclusion = Array.from(new Set([newMemberUserId, ...excludeUserIds]));

    // Find all users with Members.notification permission
    const {error, userIds} = await getUsersWithProjectPermission({
      projectId,
      resource: "Members",
      action: "notification",
      excludeUserIds: exclusion,
    });

    if (error) {
      return {error, notifiedUserIds: []};
    }

    if (userIds.length === 0) {
      return {error: null, notifiedUserIds: []};
    }

    const nowIso = new Date().toISOString();
    const rows = userIds.map((recipientId) => ({
      recipient_id: recipientId,
      type: "project_member_added",
      sender_id: user.id,
      reference_id: projectId,
      created_at: nowIso,
      status: "info",
    }));

    const {error: insertError} = await supabase.from("notifications").insert(rows);

    if (insertError) {
      console.error("notifyOnNewProjectMember insert error", insertError);
      return {error: "Failed to create notifications", notifiedUserIds: []};
    }

    return {error: null, notifiedUserIds: userIds};
  } catch (err) {
    console.error("notifyOnNewProjectMember unexpected error", err);
    return {error: err instanceof Error ? err.message : "Unexpected error", notifiedUserIds: []};
  }
}
