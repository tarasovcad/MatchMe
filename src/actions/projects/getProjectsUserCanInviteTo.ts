"use server";

import {createClient} from "@/utils/supabase/server";

export type InviteableProjectOption = {
  title: string;
  value: string;
};

export type GetProjectsUserCanInviteToResult = {
  error: string | null;
  options: InviteableProjectOption[];
  ownedProjectIds: string[];
  memberProjectIdsWithInvite: string[];
};

/**
 * Returns a list of projects where the current user can invite members.
 * Criteria:
 * - User is the project owner (projects.user_id = auth.uid())
 * - OR user is an active team member with a role that has permissions.Invitations.create = true
 *
 * The result includes options shaped for selects: { title, value }.
 */
export async function getProjectsUserCanInviteTo(): Promise<GetProjectsUserCanInviteToResult> {
  try {
    const supabase = await createClient();

    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("getProjectsUserCanInviteTo auth error", authError);
    }

    if (!user) {
      return {
        error: "User not authenticated",
        options: [],
        ownedProjectIds: [],
        memberProjectIdsWithInvite: [],
      };
    }

    // 1) Projects owned by the user
    const {data: ownedProjects, error: ownedError} = await supabase
      .from("projects")
      .select("id, name")
      .eq("user_id", user.id);

    if (ownedError) {
      console.error("getProjectsUserCanInviteTo owned projects error", ownedError);
      return {
        error: "Failed to fetch owned projects",
        options: [],
        ownedProjectIds: [],
        memberProjectIdsWithInvite: [],
      };
    }

    const ownedProjectIds = (ownedProjects ?? []).map((p) => p.id as string);

    // 2) Active membership rows for this user
    const {data: memberships, error: membershipsError} = await supabase
      .from("project_team_members")
      .select("project_id, role_id")
      .eq("user_id", user.id);

    if (membershipsError) {
      console.error("getProjectsUserCanInviteTo memberships error", membershipsError);
      return {
        error: "Failed to fetch memberships",
        options: [],
        ownedProjectIds,
        memberProjectIdsWithInvite: [],
      };
    }

    const roleIds = Array.from(new Set((memberships ?? []).map((m) => m.role_id).filter(Boolean)));

    // 3) Roles that allow creating invitations
    let allowedRoleIds = new Set<string>();
    if (roleIds.length > 0) {
      const {data: rolesWithInvite, error: rolesError} = await supabase
        .from("project_roles")
        .select("id, project_id")
        .in("id", roleIds)
        .contains("permissions", {Invitations: {create: true}});

      if (rolesError) {
        console.error("getProjectsUserCanInviteTo roles error", rolesError);
        return {
          error: "Failed to fetch roles",
          options: [],
          ownedProjectIds,
          memberProjectIdsWithInvite: [],
        };
      }

      allowedRoleIds = new Set((rolesWithInvite ?? []).map((r) => r.id as string));
    }

    // 4) Member project ids where user's role allows inviting
    const memberProjectIdsWithInvite = (memberships ?? [])
      .filter((m) => m.role_id && allowedRoleIds.has(m.role_id as string))
      .map((m) => m.project_id as string);

    // 5) Combine owned + allowed member projects, dedupe
    const combinedProjectIds = Array.from(
      new Set([...ownedProjectIds, ...memberProjectIdsWithInvite]),
    );

    if (combinedProjectIds.length === 0) {
      return {error: null, options: [], ownedProjectIds, memberProjectIdsWithInvite};
    }

    // 6) Fetch names for all combined project ids
    const {data: allProjects, error: allProjectsError} = await supabase
      .from("projects")
      .select("id, name")
      .in("id", combinedProjectIds);

    if (allProjectsError) {
      console.error("getProjectsUserCanInviteTo all projects error", allProjectsError);
      return {
        error: "Failed to fetch projects",
        options: [],
        ownedProjectIds,
        memberProjectIdsWithInvite,
      };
    }

    const options: InviteableProjectOption[] = (allProjects ?? []).map((p) => ({
      title: p.name as string,
      value: p.id as string,
    }));

    return {error: null, options, ownedProjectIds, memberProjectIdsWithInvite};
  } catch (err) {
    console.error("getProjectsUserCanInviteTo unexpected error", err);
    return {
      error: err instanceof Error ? err.message : "Unexpected error",
      options: [],
      ownedProjectIds: [],
      memberProjectIdsWithInvite: [],
    };
  }
}
