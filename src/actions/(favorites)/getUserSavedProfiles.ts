"use server";

import {createClient} from "@/utils/supabase/server";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";
import {SerializableFilter} from "@/store/filterStore";
import {MiniCardMatchMeUser} from "@/types/user/matchMeUser";
import {redis} from "@/utils/redis/redis";
import {Ratelimit} from "@upstash/ratelimit";
import {getClientIp} from "@/utils/network/getClientIp";
import type {UserWithFollowStatus} from "@/actions/(follows)/getUserFollows";

export async function getUserSavedProfiles(
  userId: string,
  page = 1,
  perPage: number,
  filters: SerializableFilter[] = [],
): Promise<UserWithFollowStatus[]> {
  if (!userId) return [];
  try {
    const supabase = await createClient();

    // Rate limiting (read) – mirror saved projects limits
    const ip = await getClientIp();
    const userLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"), // up to 60 saved-profiles fetches per minute per user
      analytics: true,
      prefix: "ratelimit:user:saved-profiles",
      enableProtection: true,
    });
    const ipLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 m"), // up to 200 fetches per minute per IP
      analytics: true,
      prefix: "ratelimit:ip:saved-profiles",
      enableProtection: true,
    });

    const [userLimit, ipLimit] = await Promise.all([
      userLimiter.limit(userId),
      ipLimiter.limit(ip),
    ]);
    if (!userLimit.success || !ipLimit.success) {
      return [];
    }

    // 1. Grab all favourite user ids for this user
    const {data: favouriteIdsData, error: favouritesError} = await supabase
      .from("favorites_users")
      .select("favorite_user_id")
      .eq("user_id", userId);

    if (favouritesError) {
      console.error("Error fetching favourite ids:", favouritesError.message);
      return [];
    }

    const favouriteIds = favouriteIdsData?.map((f) => f.favorite_user_id) || [];
    if (favouriteIds.length === 0) return [];

    // 2. Build query for profiles that are in favourites list
    let query = supabase
      .from("profiles")
      .select("id, name, username, profile_image")
      .in("id", favouriteIds);

    // Apply search / filter options (if any)
    if (filters && filters.length > 0) {
      query = applyFiltersToSupabaseQuery(query, filters);
    }

    // 3. Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const {data: profilesData, error: profilesError} = await query;

    if (profilesError) {
      console.error("Error fetching favourite profiles:", profilesError.message);
      return [];
    }

    const miniProfiles = (profilesData || []) as MiniCardMatchMeUser[];
    if (miniProfiles.length === 0) return [];

    // 4. Compute follow status for the current page
    const profileIds = miniProfiles.map((p) => p.id);

    const [followingRes, followersRes] = await Promise.all([
      supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId)
        .in("following_id", profileIds),
      supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId)
        .in("follower_id", profileIds),
    ]);

    const followingSet = new Set(
      (followingRes.data || []).map((r) => (r as {following_id: string}).following_id),
    );
    const followersSet = new Set(
      (followersRes.data || []).map((r) => (r as {follower_id: string}).follower_id),
    );

    const result: UserWithFollowStatus[] = miniProfiles.map((p) => ({
      ...p,
      isFollowedBy: followingSet.has(p.id),
      isFollowingBack: followersSet.has(p.id),
    }));

    return result;
  } catch (error) {
    console.error("Error in getUserSavedProfiles:", error);
    return [];
  }
}
