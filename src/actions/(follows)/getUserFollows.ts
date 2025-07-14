"use server";

import {createClient} from "@/utils/supabase/server";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {SerializableFilter} from "@/store/filterStore";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";

const TABLE_NAME = "mock_follows";

export async function getUserFollows(
  userId: string,
  type: "followers" | "following",
  page = 1,
  perPage: number,
  filters?: SerializableFilter[],
): Promise<MatchMeUser[]> {
  if (!userId) return [];

  const supabase = await createClient();

  // Calculate range for pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    // First, get the follow relationships
    let userIds: string[] = [];

    if (type === "followers") {
      // Get people who follow this user
      const {data: followData, error: followError} = await supabase
        .from(TABLE_NAME)
        .select("follower_id")
        .eq("following_id", userId)
        .range(from, to);

      if (followError) {
        console.error("Error fetching followers:", followError);
        return [];
      }

      if (!followData || followData.length === 0) return [];
      userIds = followData.map((item) => item.follower_id);
    } else {
      // Get people this user follows
      const {data: followData, error: followError} = await supabase
        .from(TABLE_NAME)
        .select("following_id")
        .eq("follower_id", userId)
        .range(from, to);

      if (followError) {
        console.error("Error fetching following:", followError);
        return [];
      }

      if (!followData || followData.length === 0) return [];
      userIds = followData.map((item) => item.following_id);
    }

    // Now get the actual user profiles with search filters
    let profilesQuery = supabase.from("mock_profiles").select("*").in("id", userIds);

    // Apply search filters if provided
    if (filters && filters.length > 0) {
      profilesQuery = applyFiltersToSupabaseQuery(profilesQuery, filters);
    }

    const {data: profiles, error: profilesError} = await profilesQuery;

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return [];
    }

    return profiles || [];
  } catch (error) {
    console.error("Error in getUserFollows:", error);
    return [];
  }
}

export async function getUserFollowsCount(
  userId: string,
  type: "followers" | "following",
): Promise<number> {
  if (!userId) return 0;

  const supabase = await createClient();

  try {
    let query;

    if (type === "followers") {
      query = supabase
        .from(TABLE_NAME)
        .select("*", {count: "exact", head: true})
        .eq("following_id", userId);
    } else {
      query = supabase
        .from(TABLE_NAME)
        .select("*", {count: "exact", head: true})
        .eq("follower_id", userId);
    }

    const {count, error} = await query;

    if (error) {
      console.error("Error fetching follows count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getUserFollowsCount:", error);
    return 0;
  }
}
