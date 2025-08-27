"use server";

import {createClient} from "@/utils/supabase/server";
import {MiniCardMatchMeUser} from "@/types/user/matchMeUser";
import {SerializableFilter} from "@/store/filterStore";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";

const PROJECT_FOLLOWERS_TABLE = "project_followers";
const PROFILES_TABLE_NAME = "profiles";

const MINI_CARD_COLUMNS = `
  id,
  name,
  username,
  profile_image
`;

export interface ProjectFollowerWithStatus extends MiniCardMatchMeUser {
  isFollowingBack?: boolean; // follower -> current user
  isFollowedBy?: boolean; // current user -> follower
}

export async function getProjectFollowers(
  projectId: string,
  page = 1,
  perPage: number,
  filters?: SerializableFilter[],
  currentUserId?: string,
): Promise<ProjectFollowerWithStatus[]> {
  if (!projectId) return [];

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    // 1) Fetch follower user ids (paginated)
    const {data: followerRows, error: followerErr} = await supabase
      .from(PROJECT_FOLLOWERS_TABLE)
      .select("follower_user_id")
      .eq("project_id", projectId)
      .order("followed_at", {ascending: false})
      .range(from, to);

    if (followerErr) {
      console.error("Error fetching project followers:", followerErr);
      return [];
    }

    const followerIds = (followerRows ?? []).map((r) => r.follower_user_id as string);
    if (followerIds.length === 0) return [];

    // 2) Fetch follower profiles with only required columns and apply filters
    let profilesQuery = supabase
      .from(PROFILES_TABLE_NAME)
      .select(MINI_CARD_COLUMNS)
      .in("id", followerIds);

    profilesQuery = applyFiltersToSupabaseQuery(profilesQuery, filters || []);

    const {data: profiles, error: profilesErr} = await profilesQuery;
    if (profilesErr) {
      console.error("Error fetching follower profiles:", profilesErr);
      return [];
    }

    const filteredProfiles: MiniCardMatchMeUser[] = (profiles ?? []) as MiniCardMatchMeUser[];

    // 3) Compute follow relationship relative to current user if provided
    if (!currentUserId || filteredProfiles.length === 0) {
      return filteredProfiles as ProjectFollowerWithStatus[];
    }

    const profileIds = filteredProfiles.map((p) => p.id);

    // current user -> follower (isFollowedBy)
    const {data: followingData} = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUserId)
      .in("following_id", profileIds);

    // follower -> current user (isFollowingBack)
    const {data: followersData} = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", currentUserId)
      .in("follower_id", profileIds);

    const followingSet = new Set((followingData ?? []).map((r) => r.following_id as string));
    const followersSet = new Set((followersData ?? []).map((r) => r.follower_id as string));

    return filteredProfiles.map((p) => ({
      ...p,
      isFollowedBy: followingSet.has(p.id),
      isFollowingBack: followersSet.has(p.id),
    }));
  } catch (error) {
    console.error("Error in getProjectFollowers:", error);
    return [];
  }
}

export async function getProjectFollowersCount(projectId: string): Promise<number> {
  if (!projectId) return 0;
  const supabase = await createClient();
  try {
    const {count, error} = await supabase
      .from(PROJECT_FOLLOWERS_TABLE)
      .select("*", {count: "exact", head: true})
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching project followers count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getProjectFollowersCount:", error);
    return 0;
  }
}
