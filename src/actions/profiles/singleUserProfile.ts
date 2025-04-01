import {MatchMeUser} from "@/types/user/matchMeUser";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";

interface CachedUserStats {
  followerCount: number;
  followingCount: number;
  skills: Array<{name: string; image_url: string}>;
  currentUserFollowInfo: {
    [userId: string]: {
      isFollowing: boolean;
      isFollowingBack: boolean;
    };
  };
}

const USER_PROFILE_CACHE_KEY = (username: string) => `user_profile_${username}`;
const USER_STATS_CACHE_KEY = (userId: string) => `user_stats_${userId}`;
const FAVORITES_CACHE_KEY = (userId: string) => `favorites_${userId}`;
const CACHE_TTL = 300; // 5 minutes

export async function getUserProfile(username: string) {
  const supabase = await createClient();

  const cacheKey = USER_PROFILE_CACHE_KEY(username);
  let user = (await redis.get(cacheKey)) as MatchMeUser;

  if (!user) {
    console.log("Profile cache miss - fetching from Supabase...");
    const {data, error} = await supabase
      .from("mock_profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      console.error("Error fetching user:", error);
      return null;
    }

    user = data;

    // Store in Redis cache
    await redis.set(cacheKey, user, {ex: CACHE_TTL});
  } else {
    console.log("Profile cache hit - using cached profile");
  }

  return user;
}

export async function getUserStats(
  userId: string,
  currentUserId?: string,
  user?: MatchMeUser,
) {
  if (!user || !currentUserId) {
    return {
      followerCount: 0,
      followingCount: 0,
      skills: [],
      isFollowing: false,
      isFollowingBack: false,
    };
  }

  const cacheKey = USER_STATS_CACHE_KEY(userId);
  // Check if we have stats in Redis cache
  const cachedStats = (await redis.get(cacheKey)) as CachedUserStats | null;

  // If we have cached stats and they include following status for the current user
  if (
    cachedStats &&
    cachedStats.currentUserFollowInfo &&
    cachedStats.currentUserFollowInfo[currentUserId]
  ) {
    console.log("Stats cache hit - using cached stats");
    const userFollowInfo = cachedStats.currentUserFollowInfo[currentUserId];
    return {
      followerCount: cachedStats.followerCount,
      followingCount: cachedStats.followingCount,
      skills: cachedStats.skills,
      isFollowing: userFollowInfo.isFollowing,
      isFollowingBack: userFollowInfo.isFollowingBack,
    };
  }

  console.log("Stats cache miss - fetching from Supabase...");
  const supabase = await createClient();

  // Run all queries in parallel
  const [
    followerCountResult,
    followingCountResult,
    skillsResult,
    followStatusResults,
  ] = await Promise.all([
    // Follower count
    supabase
      .from("follows")
      .select("*", {count: "exact", head: true})
      .eq("following_id", userId),

    // Following count
    supabase
      .from("follows")
      .select("*", {count: "exact", head: true})
      .eq("follower_id", userId),

    // Skills
    supabase
      .from("skills")
      .select("name, image_url")
      .in("name", user.skills || []),

    // Only check follow status if logged in for buttons
    currentUserId
      ? Promise.all([
          supabase
            .from("follows")
            .select("id")
            .eq("follower_id", currentUserId)
            .eq("following_id", userId)
            .single(),

          supabase
            .from("follows")
            .select("id")
            .eq("follower_id", userId)
            .eq("following_id", currentUserId)
            .single(),
        ])
      : Promise.resolve([{data: null}, {data: null}]),
  ]);

  // Extract results
  const followerCount = followerCountResult.error
    ? 0
    : followerCountResult.count || 0;
  const followingCount = followingCountResult.error
    ? 0
    : followingCountResult.count || 0;
  const skills = skillsResult.data || [];
  const isFollowing = currentUserId ? !!followStatusResults[0].data : false;
  const isFollowingBack = currentUserId ? !!followStatusResults[1].data : false;

  // Prepare stats object for caching
  // We structure it to store general stats and user-specific follow info separately
  const statsForCache = {
    followerCount,
    followingCount,
    skills,
    // Store follow info by user ID to support different currentUsers
    currentUserFollowInfo: {
      [currentUserId]: {
        isFollowing,
        isFollowingBack,
      },
    },
  };

  await redis.set(cacheKey, statsForCache, {ex: CACHE_TTL});

  return {
    followerCount,
    followingCount,
    skills,
    isFollowing,
    isFollowingBack,
  };
}

export async function isUserFavorite(userId: string, favoriteUserId: string) {
  if (!userId) return false;

  const supabase = await createClient();

  // Try checking in Redis cache first
  const cacheKey = FAVORITES_CACHE_KEY(userId);
  const favoritesData = (await redis.get(cacheKey)) as {
    favorite_user_id: string;
  }[];

  if (!favoritesData) {
    // Cache miss - check directly in database
    const {data, error} = await supabase
      .from("favorites_users")
      .select("favorite_user_id")
      .eq("user_id", userId)
      .eq("favorite_user_id", favoriteUserId)
      .maybeSingle();

    return data !== null;
  }

  // Check if favorite exists in cached data
  return favoritesData.some((fav) => fav.favorite_user_id === favoriteUserId);
}
