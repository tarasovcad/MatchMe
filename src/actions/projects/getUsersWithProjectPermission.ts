"use server";

import {createClient} from "@/utils/supabase/server";

export type ProjectPermissionAction = "view" | "create" | "update" | "delete" | "notification";

export interface GetUsersWithProjectPermissionParams {
  projectId: string;
  resource: string; // e.g. "Members", "Analytics"
  action: ProjectPermissionAction;
  excludeUserIds?: string[];
}

export interface GetUsersWithProjectPermissionResult {
  error: string | null;
  userIds: string[];
}

/**
 * Returns all user IDs in a project whose assigned role grants the specified resource/action permission.
 */
export async function getUsersWithProjectPermission(
  params: GetUsersWithProjectPermissionParams,
): Promise<GetUsersWithProjectPermissionResult> {
  const {projectId, resource, action, excludeUserIds = []} = params;

  try {
    if (!projectId || !resource || !action) {
      return {error: "Missing required params", userIds: []};
    }

    const supabase = await createClient();

    // 1) Find role IDs in this project that contain the permission: { [resource]: { [action]: true } }
    const {data: roles, error: rolesError} = await supabase
      .from("project_roles")
      .select("id")
      .eq("project_id", projectId)
      .contains("permissions", {[resource]: {[action]: true}});

    if (rolesError) {
      console.error("getUsersWithProjectPermission rolesError", rolesError);
      return {error: "Failed to fetch project roles", userIds: []};
    }

    const eligibleRoleIds = (roles ?? []).map((r) => r.id);
    if (eligibleRoleIds.length === 0) {
      return {error: null, userIds: []};
    }

    // 2) Fetch active members in this project whose role_id is in the eligible set
    const {data: members, error: membersError} = await supabase
      .from("project_team_members")
      .select("user_id")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .in("role_id", eligibleRoleIds);

    if (membersError) {
      console.error("getUsersWithProjectPermission membersError", membersError);
      return {error: "Failed to fetch team members", userIds: []};
    }

    let userIds = (members ?? []).map((m) => m.user_id as string);

    // 3)  exclude some user IDs from results
    if (excludeUserIds && excludeUserIds.length > 0) {
      const exclude = new Set(excludeUserIds);
      userIds = userIds.filter((id) => !exclude.has(id));
    }

    return {error: null, userIds};
  } catch (err) {
    console.error("getUsersWithProjectPermission unexpected error", err);
    return {error: err instanceof Error ? err.message : "Unexpected error", userIds: []};
  }
}
