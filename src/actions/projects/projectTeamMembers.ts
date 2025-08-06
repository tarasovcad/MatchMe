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
  time_commitment: string | null;
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

export interface CreateProjectRequestData {
  project_id: string;
  user_id: string;
  position_id?: string;
}

/**
 * Creates a project request (invite) in the database
 */
export const createProjectRequest = async (data: CreateProjectRequestData) => {
  try {
    const supabase = await createClient();

    // Get current user (the one sending the invite)
    const {
      data: {user},
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Check if the user is already a team member
    const {data: existingMember, error: memberCheckError} = await supabase
      .from("project_team_members")
      .select("id")
      .eq("project_id", data.project_id)
      .eq("user_id", data.user_id)
      .single();

    if (memberCheckError && memberCheckError.code !== "PGRST116") {
      // PGRST116 is "no rows found", which is what we want
      return {
        success: false,
        error: "Error checking team membership",
      };
    }

    if (existingMember) {
      return {
        success: false,
        error: "User is already a team member",
      };
    }

    // Check if there's already a pending invite
    const {data: existingRequest, error: requestCheckError} = await supabase
      .from("project_requests")
      .select("id")
      .eq("project_id", data.project_id)
      .eq("user_id", data.user_id)
      .eq("status", "pending")
      .single();

    if (requestCheckError && requestCheckError.code !== "PGRST116") {
      return {
        success: false,
        error: "Error checking existing requests",
      };
    }

    if (existingRequest) {
      return {
        success: false,
        error: "There's already a pending invite for this user",
      };
    }

    // Insert the project request
    const {data: requestData, error: requestError} = await supabase
      .from("project_requests")
      .insert({
        project_id: data.project_id,
        user_id: data.user_id,
        created_by: user.id,
        position_id: data.position_id || null,
        direction: "invite", // This is an invite from project to user
        status: "pending",
      })
      .select()
      .single();

    if (requestError) {
      console.error("Error creating project request:", requestError);
      return {
        success: false,
        error: requestError.message,
      };
    }

    // Create a notification for the invited user
    const {error: notificationError} = await supabase.from("notifications").insert({
      recipient_id: data.user_id,
      sender_id: user.id,
      type: "project_invite",
      reference_id: requestData.id, // Reference the project_request ID
      is_read: false,
    });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the request creation if notification fails
      // but log it for debugging
    }

    return {
      success: true,
      data: requestData,
    };
  } catch (error) {
    console.error("Unexpected error creating project request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
};

export const getProjectTeamMembersProfiles = async (projectId: string) => {
  try {
    if (!projectId) {
      return {
        error: "Project ID is required",
        data: null,
        roles: null,
        open_positions: null,
        pending_requests: null,
      };
    }

    const supabase = await createClient();

    // 1. Fetch active team members for this project
    const {data: teamMembers, error: teamError} = await supabase
      .from("project_team_members")
      .select("user_id, joined_date, invited_by_user_id, invited_at, role_id")
      .eq("project_id", projectId);

    if (teamError) {
      console.error("getProjectTeamMembersProfiles – team members error", teamError);
      return {
        error: teamError.message,
        data: null,
        roles: null,
        open_positions: null,
        pending_requests: null,
      };
    }

    // 2. Fetch all project roles
    const {data: roles, error: rolesError} = await supabase
      .from("project_roles")
      .select("id, name, badge_color")
      .eq("project_id", projectId);

    if (rolesError) {
      console.error("getProjectTeamMembersProfiles – roles error", rolesError);
      return {
        error: rolesError.message,
        data: null,
        roles: null,
        open_positions: null,
        pending_requests: null,
      };
    }

    // 3. Fetch open positions for this project
    const {data: openPositionsData, error: openPositionsError} = await supabase
      .from("project_open_positions")
      .select("id, title")
      .eq("project_id", projectId);

    if (openPositionsError) {
      console.error("getProjectTeamMembersProfiles – open positions error", openPositionsError);
      return {
        error: openPositionsError.message,
        data: null,
        roles: null,
        open_positions: null,
        pending_requests: null,
      };
    }

    // 4. Fetch pending project requests (user_id only)
    const {data: pendingRequestsData, error: pendingRequestsError} = await supabase
      .from("project_requests")
      .select("user_id")
      .eq("project_id", projectId)
      .eq("status", "pending");

    if (pendingRequestsError) {
      console.error("getProjectTeamMembersProfiles – pending requests error", pendingRequestsError);
      return {
        error: pendingRequestsError.message,
        data: null,
        roles: null,
        open_positions: null,
        pending_requests: null,
      };
    }

    // Extract just the user_ids from pending requests
    const pending_requests = (pendingRequestsData ?? []).map((request) => request.user_id);

    // Transform open positions to the requested format
    const open_positions = (openPositionsData ?? []).map((position) => ({
      title: position.title,
      value: position.id,
    }));

    if (!teamMembers?.length) {
      // No team members found
      return {error: null, data: [], roles: roles ?? [], open_positions, pending_requests};
    }

    // 5. Prepare ids for profile lookup (members + inviters)
    const profileIdsSet = new Set<string>();

    for (const tm of teamMembers) {
      profileIdsSet.add(tm.user_id);
      if (tm.invited_by_user_id) profileIdsSet.add(tm.invited_by_user_id);
    }

    const profileIds = Array.from(profileIdsSet);

    // 6. Fetch profiles
    const {data: profiles, error: profilesError} = await supabase
      .from("profiles")
      .select(
        "id, name, username, public_current_role, profile_image, pronouns, seniority_level, time_commitment, years_of_experience, skills",
      )
      .in("id", profileIds);

    if (profilesError) {
      console.error("getProjectTeamMembersProfiles – profiles error", profilesError);
      return {
        error: profilesError.message,
        data: null,
        roles: null,
        open_positions: null,
        pending_requests: null,
      };
    }

    const roleMap = new Map((roles ?? []).map((r) => [r.id, r]));
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    // 7. Transform into the expected structure
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
        time_commitment: profile?.time_commitment ?? null,
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

    return {error: null, data: mapped, roles: roles ?? [], open_positions, pending_requests};
  } catch (err) {
    console.error("getProjectTeamMembersProfiles unexpected error", err);
    return {
      error: err instanceof Error ? err.message : "Unexpected error",
      data: null,
      roles: null,
      open_positions: null,
      pending_requests: null,
    };
  }
};
