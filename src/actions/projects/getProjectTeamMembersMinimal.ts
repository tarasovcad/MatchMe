"use server";

import {ProjectTeamMemberMinimal} from "@/types/user/matchMeUser";
import {createClient} from "@/utils/supabase/server";

export async function getProjectTeamMembersMinimal(
  projectId: string,
  currentUserId?: string,
): Promise<{error: string | null; data: ProjectTeamMemberMinimal[] | null}> {
  try {
    if (!projectId) {
      return {error: "Project ID is required", data: null};
    }

    const supabase = await createClient();

    // Resolve current user if not provided
    let resolvedCurrentUserId = currentUserId;
    if (!resolvedCurrentUserId) {
      const {data: authData} = await supabase.auth.getUser();
      resolvedCurrentUserId = authData?.user?.id;
    }

    // Fetch project owner id to compute is_owner flag
    let ownerUserId: string | null = null;
    const {data: projectRow, error: projectErr} = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", projectId)
      .single();
    if (projectErr) {
      console.error("getProjectTeamMembersMinimal – project owner fetch error", projectErr);
    } else {
      ownerUserId = (projectRow as {user_id: string} | null)?.user_id ?? null;
    }

    // 1) Fetch team members for the project
    const {data: teamMembers, error: teamErr} = await supabase
      .from("project_team_members")
      .select("user_id, display_role")
      .eq("project_id", projectId);

    if (teamErr) {
      console.error("getProjectTeamMembersMinimal – team members error", teamErr);
      return {error: teamErr.message, data: null};
    }

    if (!teamMembers || teamMembers.length === 0) {
      return {error: null, data: []};
    }

    const memberIds = teamMembers.map((tm) => tm.user_id);

    // 2) Fetch profiles for those members
    const {data: profiles, error: profilesErr} = await supabase
      .from("profiles")
      .select("id, name, username, profile_image")
      .in("id", memberIds);

    if (profilesErr) {
      console.error("getProjectTeamMembersMinimal – profiles error", profilesErr);
      return {error: profilesErr.message, data: null};
    }

    // Build a quick lookup map
    const profileById = new Map(
      (profiles ?? []).map((p) => [
        p.id as string,
        p as {
          id: string;
          name: string;
          username: string;
          profile_image: ProjectTeamMemberMinimal["profile_image"];
        },
      ]),
    );

    // 3) Compute follow relationship in a single round trip when we have a current user
    const isFollowingSet = new Set<string>();
    const isFollowingBackSet = new Set<string>();

    if (resolvedCurrentUserId) {
      const {data: followData, error: followErr} = await supabase
        .from("follows")
        .select("follower_id, following_id")
        .in("follower_id", [resolvedCurrentUserId, ...memberIds])
        .in("following_id", [resolvedCurrentUserId, ...memberIds]);

      if (followErr) {
        console.error("getProjectTeamMembersMinimal – follows error", followErr);
      } else if (followData) {
        for (const row of followData) {
          const followerId = row.follower_id as string;
          const followingId = row.following_id as string;
          if (followerId === resolvedCurrentUserId && memberIds.includes(followingId)) {
            isFollowingSet.add(followingId); // current user -> member
          }
          if (memberIds.includes(followerId) && followingId === resolvedCurrentUserId) {
            isFollowingBackSet.add(followerId); // member -> current user
          }
        }
      }
    }

    // 4) Shape final payload
    const data: ProjectTeamMemberMinimal[] = teamMembers.map((tm) => {
      const p = profileById.get(tm.user_id);
      return {
        user_id: tm.user_id,
        name: p?.name ?? "",
        username: p?.username ?? "",
        profile_image: p?.profile_image ?? null,
        display_name: (tm as {display_role?: string | null}).display_role ?? null,
        isFollowing: resolvedCurrentUserId ? isFollowingSet.has(tm.user_id) : false,
        isFollowingBack: resolvedCurrentUserId ? isFollowingBackSet.has(tm.user_id) : false,
        is_owner: ownerUserId ? tm.user_id === ownerUserId : false,
      };
    });

    return {error: null, data};
  } catch (err) {
    console.error("getProjectTeamMembersMinimal unexpected error", err);
    return {error: err instanceof Error ? err.message : "Unexpected error", data: null};
  }
}
