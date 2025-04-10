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
  lastUpdated: number;
}

interface UserStats {
  followerCount: number;
  followingCount: number;
  skills: Array<{name: string; image_url: string}>;
  isFollowing: boolean;
  isFollowingBack: boolean;
}

const CACHE_KEYS = {
  userProfile: (username: string) => `profile_${username}`,
  userStats: (userId: string) => `stats_${userId}`,
  userFavorites: (userId: string) => `favorites_${userId}`,
};
const CACHE_TTL = 300; // 5 minutes
const TABLE_NAME = "profiles";

export async function getUserProfile(username: string) {
  try {
    const cacheKey = CACHE_KEYS.userProfile(username);
    const cachedUser = (await redis.get(cacheKey)) as MatchMeUser | null;

    if (cachedUser) {
      console.log("Profile cache hit - using cached profile");
      return cachedUser;
    }

    console.log("Profile cache miss - fetching from Supabase...");

    const supabase = await createClient();

    const {data, error} = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("username", username)
      .single();
    if (error || !data) {
      console.error("Error fetching user:", error);
      return null;
    }
    await redis.set(cacheKey, data, {ex: CACHE_TTL});
    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

export async function getUserStats(
  userId: string,
  currentUserId?: string,
  user?: MatchMeUser,
): Promise<UserStats> {
  const defaultStats: UserStats = {
    followerCount: 0,
    followingCount: 0,
    skills: [],
    isFollowing: false,
    isFollowingBack: false,
  };

  if (!user) return defaultStats;

  try {
    const cacheKey = CACHE_KEYS.userStats(userId);

    // Check if we have stats in Redis cache
    const cachedStats = (await redis.get(cacheKey)) as CachedUserStats | null;

    // If we have cached stats
    if (cachedStats) {
      console.log("Stats cache hit - using cached stats");
      // Always use cached general stats regardless of logged-in status
      const result: UserStats = {
        followerCount: cachedStats.followerCount,
        followingCount: cachedStats.followingCount,
        skills: cachedStats.skills,
        isFollowing: false,
        isFollowingBack: false,
      };
      // Add user-specific follow info only if a user is logged in
      if (
        currentUserId &&
        cachedStats.currentUserFollowInfo &&
        cachedStats.currentUserFollowInfo[currentUserId]
      ) {
        const userFollowInfo = cachedStats.currentUserFollowInfo[currentUserId];
        result.isFollowing = userFollowInfo.isFollowing;
        result.isFollowingBack = userFollowInfo.isFollowingBack;
      }

      return result;
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

      // Skills - only fetch if user has skills
      user.skills?.length
        ? supabase
            .from("skills")
            .select("name, image_url")
            .in("name", user.skills)
        : Promise.resolve({data: []}),

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
    const isFollowingBack = currentUserId
      ? !!followStatusResults[1].data
      : false;

    // Cache the stats
    const statsForCache = {
      followerCount,
      followingCount,
      skills,
      currentUserFollowInfo: {} as Record<
        string,
        {isFollowing: boolean; isFollowingBack: boolean}
      >,
      lastUpdated: Date.now(),
    };

    // Add the current user's follow info if available
    if (currentUserId) {
      statsForCache.currentUserFollowInfo[currentUserId] = {
        isFollowing,
        isFollowingBack,
      };
    }

    await redis.set(cacheKey, statsForCache, {ex: CACHE_TTL});

    return {
      followerCount,
      followingCount,
      skills,
      isFollowing,
      isFollowingBack,
    };
  } catch (error) {
    console.error("Error in getUserStats:", error);
    return defaultStats;
  }
}

export async function isUserFavorite(
  userId: string,
  favoriteUserId: string,
): Promise<boolean> {
  if (!userId) return false;

  try {
    const cacheKey = CACHE_KEYS.userFavorites(userId);

    const favoritesData = (await redis.get(cacheKey)) as Array<{
      favorite_user_id: string;
    }> | null;
    if (favoritesData) {
      // Check cached favorites
      return favoritesData.some(
        (fav) => fav.favorite_user_id === favoriteUserId,
      );
    }
    // Cache miss - check directly in database
    const supabase = await createClient();
    const {data: favorites, error} = await supabase
      .from("favorites_users")
      .select("favorite_user_id")
      .eq("user_id", userId)
      .eq("favorite_user_id", favoriteUserId);

    if (error) {
      console.error("Error fetching favorites:", error);
      return false;
    }

    await redis.set(cacheKey, favorites, {ex: CACHE_TTL});

    return favorites?.some((fav) => fav.favorite_user_id === favoriteUserId);
  } catch (error) {
    console.error("Error in isUserFavorite:", error);
    return false;
  }
}

// Invalidates user-related caches when data changes
export async function invalidateUserCaches(
  userId: string,
  username: string,
): Promise<void> {
  const keys = [
    CACHE_KEYS.userProfile(username),
    CACHE_KEYS.userStats(userId),
    CACHE_KEYS.userFavorites(userId),
  ];

  await Promise.all(keys.map((key) => redis.del(key)));
}
