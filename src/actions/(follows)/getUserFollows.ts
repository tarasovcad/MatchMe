"use server";

import {createClient} from "@/utils/supabase/server";
import {MiniCardMatchMeUser} from "@/types/user/matchMeUser";
import {SerializableFilter} from "@/store/filterStore";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";
import {SupabaseClient} from "@supabase/supabase-js";

const TABLE_NAME = "follows";
const PROFILES_TABLE_NAME = "profiles";

const MINI_CARD_COLUMNS = `
  id,
  name,
  username,
  profile_image
`;

export interface UserWithFollowStatus extends MiniCardMatchMeUser {
  isFollowingBack?: boolean; // Does this profile follow the current user back?
  isFollowedBy?: boolean; // Does the current user follow this profile?
}

// Function to fetch followers
async function fetchFollowers(supabase: SupabaseClient, userId: string, from: number, to: number) {
  return await supabase
    .from(TABLE_NAME)
    .select(`follower_id, profiles!follows_follower_id_fkey(${MINI_CARD_COLUMNS})`)
    .eq("following_id", userId)
    .range(from, to);
}

// Function to fetch following
async function fetchFollowing(supabase: SupabaseClient, userId: string, from: number, to: number) {
  return await supabase
    .from(TABLE_NAME)
    .select(`following_id, profiles!follows_following_id_fkey(${MINI_CARD_COLUMNS})`)
    .eq("follower_id", userId)
    .range(from, to);
}

// Function to fetch mutual friends
async function fetchMutual(supabase: SupabaseClient, userId: string, from: number, to: number) {
  // Get all followers and following
  const [followersResult, followingResult] = await Promise.all([
    supabase.from(TABLE_NAME).select("follower_id").eq("following_id", userId),
    supabase.from(TABLE_NAME).select("following_id").eq("follower_id", userId),
  ]);

  if (followersResult.error || followingResult.error) {
    throw new Error("Error fetching mutual friends data");
  }

  // Find mutual friends
  const followerIds = new Set(followersResult.data?.map((f) => f.follower_id) || []);
  const followingIds = new Set(followingResult.data?.map((f) => f.following_id) || []);
  const mutualIds = [...followerIds].filter((id) => followingIds.has(id));

  if (mutualIds.length === 0) return {data: [], error: null};

  // Get paginated profiles with only required columns
  const paginatedMutualIds = mutualIds.slice(from, to + 1);
  return await supabase
    .from(PROFILES_TABLE_NAME)
    .select(MINI_CARD_COLUMNS)
    .in("id", paginatedMutualIds);
}

// Helper function to extract profiles from query results
function extractProfiles(
  data: unknown[],
  type: "followers" | "following" | "mutual",
): MiniCardMatchMeUser[] {
  if (type === "mutual") {
    return data.filter(Boolean) as MiniCardMatchMeUser[];
  }

  return data
    .map((item) => (item as Record<string, unknown>).profiles)
    .filter(Boolean) as MiniCardMatchMeUser[];
}

// Helper function to calculate follow status
async function calculateFollowStatus(
  supabase: SupabaseClient,
  profiles: MiniCardMatchMeUser[],
  userId: string,
  type: "followers" | "following" | "mutual",
): Promise<UserWithFollowStatus[]> {
  if (type === "mutual") {
    return profiles.map((profile) => ({
      ...profile,
      isFollowedBy: true,
      isFollowingBack: true,
    }));
  }

  const profileIds = profiles.map((p) => p.id);

  // Get bidirectional follow status
  const bidirectionalQuery =
    type === "followers"
      ? supabase
          .from(TABLE_NAME)
          .select("following_id")
          .eq("follower_id", userId)
          .in("following_id", profileIds)
      : supabase
          .from(TABLE_NAME)
          .select("follower_id")
          .eq("following_id", userId)
          .in("follower_id", profileIds);

  const {data: bidirectionalData} = await bidirectionalQuery;

  const bidirectionalSet = new Set(
    bidirectionalData?.map((item) =>
      type === "followers"
        ? (item as {following_id: string}).following_id
        : (item as {follower_id: string}).follower_id,
    ) || [],
  );

  return profiles.map((profile) => ({
    ...profile,
    isFollowedBy: type === "following" || bidirectionalSet.has(profile.id),
    isFollowingBack: type === "followers" || bidirectionalSet.has(profile.id),
  }));
}

// Helper function to apply filters to profiles
async function applyFiltersToProfiles(
  supabase: SupabaseClient,
  profiles: MiniCardMatchMeUser[],
  filters: SerializableFilter[],
): Promise<MiniCardMatchMeUser[]> {
  if (!filters || filters.length === 0) return profiles;

  const profileIds = profiles.map((p) => p.id);
  let query = supabase.from(PROFILES_TABLE_NAME).select(MINI_CARD_COLUMNS).in("id", profileIds);
  query = applyFiltersToSupabaseQuery(query, filters);

  const {data: filteredData} = await query;
  if (!filteredData) return profiles;

  const filteredIds = new Set(filteredData.map((p) => p.id));
  return profiles.filter((p) => filteredIds.has(p.id));
}

export async function getUserFollows(
  userId: string,
  type: "followers" | "following" | "mutual",
  page = 1,
  perPage: number,
  filters?: SerializableFilter[],
): Promise<UserWithFollowStatus[]> {
  if (!userId) return [];

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    // Fetch data based on type
    const fetchFunctions = {
      followers: fetchFollowers,
      following: fetchFollowing,
      mutual: fetchMutual,
    };

    const {data: followData, error: followError} = await fetchFunctions[type](
      supabase,
      userId,
      from,
      to,
    );

    if (followError) {
      console.error(`Error fetching ${type}:`, followError);
      return [];
    }

    if (!followData || followData.length === 0) return [];

    // Extract profiles from query results
    const profiles = extractProfiles(followData, type);
    if (profiles.length === 0) return [];

    // Apply search filters if provided
    const filteredProfiles = await applyFiltersToProfiles(supabase, profiles, filters || []);

    // Calculate follow status for each profile
    const profilesWithStatus = await calculateFollowStatus(
      supabase,
      filteredProfiles,
      userId,
      type,
    );

    return profilesWithStatus;
  } catch (error) {
    console.error("Error in getUserFollows:", error);
    return [];
  }
}

// Helper function to get mutual friends count
async function getMutualCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const [followersResult, followingResult] = await Promise.all([
    supabase.from(TABLE_NAME).select("follower_id").eq("following_id", userId),
    supabase.from(TABLE_NAME).select("following_id").eq("follower_id", userId),
  ]);

  if (followersResult.error || followingResult.error) {
    throw new Error("Error fetching mutual friends count");
  }

  const followerIds = new Set(followersResult.data?.map((f) => f.follower_id) || []);
  const followingIds = new Set(followingResult.data?.map((f) => f.following_id) || []);
  return [...followerIds].filter((id) => followingIds.has(id)).length;
}

export async function getUserFollowsCount(
  userId: string,
  type: "followers" | "following" | "mutual",
): Promise<number> {
  if (!userId) return 0;

  const supabase = await createClient();

  try {
    if (type === "mutual") {
      return await getMutualCount(supabase, userId);
    }

    const column = type === "followers" ? "following_id" : "follower_id";
    const {count, error} = await supabase
      .from(TABLE_NAME)
      .select("*", {count: "exact", head: true})
      .eq(column, userId);

    if (error) {
      console.error(`Error fetching ${type} count:`, error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getUserFollowsCount:", error);
    return 0;
  }
}
