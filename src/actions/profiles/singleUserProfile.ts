import {MatchMeUser} from "@/types/user/matchMeUser";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";

interface CachedUserStats {
  followerCount: number;
  followingCount: number;
  skills: Array<{name: string; image_url?: string}>;
  lastUpdated: number;
}

interface UserStats {
  followerCount: number;
  followingCount: number;
  skills: Array<{name: string; image_url?: string}>;
}

interface UserFollowRelationship {
  isFollowing: boolean;
  isFollowingBack: boolean;
  lastUpdated: number;
}

const CACHE_KEYS = {
  userProfile: (username: string) => `profile_${username}`,
  userStats: (userId: string) => `stats_${userId}`,
  userFavorites: (userId: string) => `favorites_${userId}`,
  followRelationship: (userId: string, targetUserId: string) => `follow_${userId}_${targetUserId}`,
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
      .single<MatchMeUser>();
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

export async function getUserFollowRelationship(
  currentUserId: string,
  targetUserId: string,
): Promise<UserFollowRelationship> {
  const defaultRelationship: UserFollowRelationship = {
    isFollowing: false,
    isFollowingBack: false,
    lastUpdated: Date.now(),
  };

  if (!currentUserId) return defaultRelationship;

  try {
    const cacheKey = CACHE_KEYS.followRelationship(currentUserId, targetUserId);
    const cachedRelationship = (await redis.get(cacheKey)) as UserFollowRelationship | null;

    if (cachedRelationship) {
      console.log("Follow relationship cache hit");
      return cachedRelationship;
    }

    console.log("Follow relationship cache miss - fetching from Supabase...");
    const supabase = await createClient();

    // Get both follow statuses in parallel
    const [followingResult, followedByResult] = await Promise.all([
      supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)
        .single(),

      supabase
        .from("follows")
        .select("id")
        .eq("follower_id", targetUserId)
        .eq("following_id", currentUserId)
        .single(),
    ]);

    const followInfo: UserFollowRelationship = {
      isFollowing: !!followingResult.data,
      isFollowingBack: !!followedByResult.data,
      lastUpdated: Date.now(),
    };

    // Cache the follow relationship
    await redis.set(cacheKey, followInfo, {ex: CACHE_TTL});

    return followInfo;
  } catch (error) {
    console.error("Error in getFollowRelationship:", error);
    return {
      isFollowing: false,
      isFollowingBack: false,
      lastUpdated: Date.now(),
    };
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
      };

      return result;
    }

    console.log("Stats cache miss - fetching from Supabase...");
    const supabase = await createClient();

    // Run all queries in parallel
    const [followerCountResult, followingCountResult, skillsResult] = await Promise.all([
      // Follower count
      supabase.from("follows").select("*", {count: "exact", head: true}).eq("following_id", userId),

      // Following count
      supabase.from("follows").select("*", {count: "exact", head: true}).eq("follower_id", userId),

      // Skills - fetch skills from database if user has skills
      user.skills?.length
        ? supabase.from("skills").select("name, image_url").in("name", user.skills)
        : Promise.resolve({data: []}),
    ]);

    // Extract results
    const followerCount = followerCountResult.error ? 0 : followerCountResult.count || 0;
    const followingCount = followingCountResult.error ? 0 : followingCountResult.count || 0;
    const skillsFromDb = skillsResult.data || [];

    // Merge user skills with database skills - include all user skills, with image_url when available
    const mergedSkills =
      user.skills?.map((skillName) => {
        const skillFromDb = skillsFromDb.find((dbSkill) => dbSkill.name === skillName);
        return {
          name: skillName,
          image_url: skillFromDb?.image_url,
        };
      }) || [];

    // Cache the stats
    const statsForCache = {
      followerCount,
      followingCount,
      skills: mergedSkills,
      lastUpdated: Date.now(),
    };

    await redis.set(cacheKey, statsForCache, {ex: CACHE_TTL});

    return {
      followerCount,
      followingCount,
      skills: mergedSkills,
    };
  } catch (error) {
    console.error("Error in getUserStats:", error);
    return defaultStats;
  }
}

export async function isUserFavorite(userId: string, favoriteUserId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const cacheKey = CACHE_KEYS.userFavorites(userId);

    const favoritesData = (await redis.get(cacheKey)) as Array<{
      favorite_user_id: string;
    }> | null;
    if (favoritesData) {
      // Check cached favorites
      return favoritesData.some((fav) => fav.favorite_user_id === favoriteUserId);
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
export async function invalidateUserCaches(userId: string, username: string): Promise<void> {
  const keys = [
    CACHE_KEYS.userProfile(username),
    CACHE_KEYS.userStats(userId),
    CACHE_KEYS.userFavorites(userId),
  ];

  await Promise.all(keys.map((key) => redis.del(key)));
}

export async function invalidateFollowRelationship(
  followerId: string,
  followingId: string,
): Promise<void> {
  const key = CACHE_KEYS.followRelationship(followerId, followingId);
  await redis.del(key);
}
