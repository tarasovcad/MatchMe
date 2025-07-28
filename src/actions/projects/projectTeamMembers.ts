"use server";

import {createClient} from "@/utils/supabase/server";

export interface ProjectTeamMemberProfile {
  user_id: string;
  name: string;
  username: string;
  public_current_role: string | null;
  profile_image:
    | {
        fileName: string;
        fileSize: number;
        uploadedAt: string;
        url: string;
      }[]
    | null;
  pronouns: string | null;
  seniority_level: string | null;
  work_availability: number | null;
  years_of_experience: number | null;
  skills: string[] | null;
  joined_date: string | null;
  invited_by_user_id: string | null;
  invited_at: string | null;
  invited_by_name: string | null;
  invited_by_username: string | null;
  // New role-related fields
  role_id: string | null;
  role_name: string | null;
  role_badge_color: string | null;
}

export const getProjectTeamMembersProfiles = async (projectId: string) => {
  try {
    if (!projectId) {
      return {error: "Project ID is required", data: null, roles: null};
    }

    const supabase = await createClient();

    // 1. Fetch active team members for this project
    const {data: teamMembers, error: teamError} = await supabase
      .from("project_team_members")
      .select("user_id, joined_date, invited_by_user_id, invited_at, role_id")
      .eq("project_id", projectId);

    if (teamError) {
      console.error("getProjectTeamMembersProfiles – team members error", teamError);
      return {error: teamError.message, data: null, roles: null};
    }

    // 2. Fetch all project roles
    const {data: roles, error: rolesError} = await supabase
      .from("project_roles")
      .select("id, name, badge_color")
      .eq("project_id", projectId);

    if (rolesError) {
      console.error("getProjectTeamMembersProfiles – roles error", rolesError);
      return {error: rolesError.message, data: null, roles: null};
    }

    if (!teamMembers?.length) {
      // No team members found
      return {error: null, data: [], roles: roles ?? []};
    }

    // 3. Prepare ids for profile lookup (members + inviters)
    const profileIdsSet = new Set<string>();

    for (const tm of teamMembers) {
      profileIdsSet.add(tm.user_id);
      if (tm.invited_by_user_id) profileIdsSet.add(tm.invited_by_user_id);
    }

    const profileIds = Array.from(profileIdsSet);

    // 4. Fetch profiles
    const {data: profiles, error: profilesError} = await supabase
      .from("profiles")
      .select(
        "id, name, username, public_current_role, profile_image, pronouns, seniority_level, work_availability, years_of_experience, skills",
      )
      .in("id", profileIds);

    if (profilesError) {
      console.error("getProjectTeamMembersProfiles – profiles error", profilesError);
      return {error: profilesError.message, data: null, roles: null};
    }

    const roleMap = new Map((roles ?? []).map((r) => [r.id, r]));
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    // 5. Transform into the expected structure
    const mapped: ProjectTeamMemberProfile[] = teamMembers.map((tm) => {
      const profile = profileMap.get(tm.user_id);
      const inviterProfile = tm.invited_by_user_id ? profileMap.get(tm.invited_by_user_id) : null;
      const role = tm.role_id ? roleMap.get(tm.role_id) : null;

      return {
        user_id: tm.user_id,
        name: profile?.name ?? "",
        username: profile?.username ?? "",
        public_current_role: profile?.public_current_role ?? null,
        profile_image: profile?.profile_image ?? null,
        pronouns: profile?.pronouns ?? null,
        seniority_level: profile?.seniority_level ?? null,
        work_availability: profile?.work_availability ?? null,
        years_of_experience: profile?.years_of_experience ?? null,
        skills: profile?.skills ?? null,
        joined_date: tm.joined_date ?? null,
        invited_by_user_id: tm.invited_by_user_id ?? null,
        invited_at: tm.invited_at ?? null,
        invited_by_name: inviterProfile?.name ?? null,
        invited_by_username: inviterProfile?.username ?? null,
        // Role related
        role_id: tm.role_id ?? null,
        role_name: role?.name ?? null,
        role_badge_color: role?.badge_color ?? null,
      };
    });

    return {error: null, data: mapped, roles: roles ?? []};
  } catch (err) {
    console.error("getProjectTeamMembersProfiles unexpected error", err);
    return {
      error: err instanceof Error ? err.message : "Unexpected error",
      data: null,
      roles: null,
    };
  }
};
