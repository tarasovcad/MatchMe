import {MatchMeUser} from "@/types/user/matchMeUser";
import {redis} from "@/utils/redis/redis";
import {createClient, SupabaseServerClient} from "@/utils/supabase/server";
import {getClientIp} from "@/utils/network/getClientIp";
import {Ratelimit} from "@upstash/ratelimit";

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

interface UserProject {
  id: string;
  name: string;
  tagline: string;
  current_stage: string;
  category: string;
}

export interface UserProjects {
  ownedProjects: UserProject[];
  joinedProjects: UserProject[];
}

const CACHE_KEYS = {
  userProfile: (username: string) => `profile_${username}`,
  userStats: (userId: string) => `stats_${userId}`,
  favoritePair: (userId: string, targetUserId: string) => `favorite_${userId}_${targetUserId}`,
  followRelationship: (userId: string, targetUserId: string) => `follow_${userId}_${targetUserId}`,
};
const CACHE_TTL = 300; // 5 minutes
const TABLE_NAME = "profiles";

export async function getUserProfile(username: string, client?: SupabaseServerClient) {
  try {
    const cacheKey = CACHE_KEYS.userProfile(username);
    const cachedUser = (await redis.get(cacheKey)) as MatchMeUser | null;
    if (cachedUser) return cachedUser;

    const supabase = client ?? (await createClient());

    const {data, error} = await supabase
      .from(TABLE_NAME)
      .select(
        [
          "id",
          "name",
          "username",
          "profile_image",
          "background_image",
          "tagline",
          "is_profile_verified",
          "skills",
          "about_you",
          "goal",
          "public_current_role",
          "looking_for",
          "years_of_experience",
          "seniority_level",
          "languages",
          "location",
          "pronouns",
          "personal_website",
          "time_commitment",
          "age",
          "social_links_1_platform",
          "social_links_1",
          "social_links_2_platform",
          "social_links_2",
          "social_links_3_platform",
          "social_links_3",
        ].join(", "),
      )
      .eq("username", username)
      .single<MatchMeUser>();

    if (error || !data) {
      console.error("Error fetching user:", error);
      return null;
    }
    await redis.set(cacheKey, data, {ex: 600}); //10min
    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

export async function getUserFollowRelationship(
  currentUserId: string,
  targetUserId: string,
  client?: SupabaseServerClient,
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
      return cachedRelationship;
    }

    const supabase = client ?? (await createClient());

    // Consolidate into a single round-trip using an OR across both directions
    const {data, error} = await supabase
      .from("follows")
      .select("follower_id, following_id")
      .in("follower_id", [currentUserId, targetUserId])
      .in("following_id", [currentUserId, targetUserId]);

    if (error) {
      console.error("Error fetching follow relationship:", error);
      return defaultRelationship;
    }

    const isFollowing = data?.some(
      (row) => row.follower_id === currentUserId && row.following_id === targetUserId,
    );
    const isFollowingBack = data?.some(
      (row) => row.follower_id === targetUserId && row.following_id === currentUserId,
    );

    const followInfo: UserFollowRelationship = {
      isFollowing: !!isFollowing,
      isFollowingBack: !!isFollowingBack,
      lastUpdated: Date.now(),
    };

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
  client?: SupabaseServerClient,
): Promise<UserStats> {
  const defaultStats: UserStats = {
    followerCount: 0,
    followingCount: 0,
    skills: [],
  };

  if (!user) return defaultStats;

  try {
    const cacheKey = CACHE_KEYS.userStats(userId);

    const cachedStats = (await redis.get(cacheKey)) as CachedUserStats | null;

    if (cachedStats) {
      const result: UserStats = {
        followerCount: cachedStats.followerCount,
        followingCount: cachedStats.followingCount,
        skills: cachedStats.skills,
      };

      return result;
    }

    const supabase = client ?? (await createClient());

    const [followerCountResult, followingCountResult, skillsResult] = await Promise.all([
      supabase.from("follows").select("*", {count: "exact", head: true}).eq("following_id", userId),
      supabase.from("follows").select("*", {count: "exact", head: true}).eq("follower_id", userId),
      user.skills?.length
        ? supabase.from("skills").select("name, image_url").in("name", user.skills)
        : Promise.resolve({data: [] as Array<{name: string; image_url?: string}>}),
    ]);

    const followerCount = followerCountResult.error ? 0 : followerCountResult.count || 0;
    const followingCount = followingCountResult.error ? 0 : followingCountResult.count || 0;
    const skillsFromDb =
      (skillsResult as {data?: Array<{name: string; image_url?: string}>}).data || [];

    const mergedSkills =
      user.skills?.map((skillName) => {
        const skillFromDb = skillsFromDb.find((dbSkill) => dbSkill.name === skillName);
        return {
          name: skillName,
          image_url: skillFromDb?.image_url,
        };
      }) || [];

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

export async function isUserFavorite(
  userId: string,
  favoriteUserId: string,
  client?: SupabaseServerClient,
): Promise<boolean> {
  if (!userId) return false;

  try {
    const pairKey = CACHE_KEYS.favoritePair(userId, favoriteUserId);

    const cachedPair = (await redis.get(pairKey)) as "1" | "0" | boolean | null;
    if (cachedPair !== null && cachedPair !== undefined) {
      if (typeof cachedPair === "string") return cachedPair === "1";
      return Boolean(cachedPair);
    }

    const supabase = client ?? (await createClient());
    const {count, error} = await supabase
      .from("favorites_users")
      .select("*", {count: "exact", head: true})
      .eq("user_id", userId)
      .eq("favorite_user_id", favoriteUserId);

    if (error) {
      console.error("Error fetching favorites:", error);
      return false;
    }

    const isFav = (count ?? 0) > 0;
    await redis.set(pairKey, isFav ? "1" : "0", {ex: CACHE_TTL});

    return isFav;
  } catch (error) {
    console.error("Error in isUserFavorite:", error);
    return false;
  }
}

// Invalidates user-related caches when data changes
export async function invalidateUserCaches(userId: string, username: string): Promise<void> {
  const keys = [CACHE_KEYS.userProfile(username), CACHE_KEYS.userStats(userId)];

  await Promise.all(keys.map((key) => redis.del(key)));
}

export async function invalidateFollowRelationship(
  followerId: string,
  followingId: string,
): Promise<void> {
  const key = CACHE_KEYS.followRelationship(followerId, followingId);
  await redis.del(key);
}

export async function getUserProjects(
  userId: string,
  client?: SupabaseServerClient,
): Promise<UserProjects> {
  try {
    const supabase = client ?? (await createClient());

    // Get projects where user is owner or team member
    const [ownedProjects, memberProjectsIds] = await Promise.all([
      // Projects owned by user
      supabase
        .from("projects")
        .select("id, name, tagline,  current_stage, category, technology_stack, project_image")
        .eq("user_id", userId)
        .eq("is_project_public", true),

      // Project IDs where user is team member (only public projects)
      supabase
        .from("project_team_members")
        .select("project_id")
        .eq("user_id", userId)
        .eq("projects.is_project_public", true),
    ]);

    // Get joined project IDs (exclude owned projects)
    const ownedProjectIds = new Set(ownedProjects.data?.map((p) => p.id) || []);
    const joinedProjectIds =
      memberProjectsIds.data?.map((p) => p.project_id).filter((id) => !ownedProjectIds.has(id)) ||
      [];

    let joinedProjects: UserProject[] = [];
    if (joinedProjectIds.length > 0) {
      const {data, error} = await supabase
        .from("projects")
        .select("id, name, tagline, current_stage, category, technology_stack, project_image")
        .in("id", joinedProjectIds)
        .eq("is_project_public", true);

      if (error) {
        console.error("Error fetching joined projects:", error);
      } else {
        joinedProjects = data || [];
      }
    }

    return {
      ownedProjects: ownedProjects.data || [],
      joinedProjects: joinedProjects,
    };
  } catch (error) {
    console.error("Error in getUserProjects:", error);
    return {
      ownedProjects: [],
      joinedProjects: [],
    };
  }
}

export async function getUserProfileBundle(
  username: string,
  viewerUserId?: string,
  client?: SupabaseServerClient,
): Promise<null | {
  user: MatchMeUser;
  stats: UserStats;
  follow: UserFollowRelationship;
  favorite: boolean;
  projects: UserProjects;
}> {
  // Rate limit to prevent scraping/spam
  const ip = await getClientIp();
  const globalLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, "1 m"), // up to 120 profile bundles per minute per IP
    analytics: true,
    prefix: "ratelimit:ip:profile-bundle",
    enableProtection: true,
  });
  const pairLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"), // up to 30 hits/min per IP-target pair
    analytics: true,
    prefix: "ratelimit:ip-target:profile-bundle",
    enableProtection: true,
  });

  const [globalRes, pairRes] = await Promise.all([
    globalLimiter.limit(ip),
    pairLimiter.limit(`${ip}:${username}`),
  ]);

  if (!globalRes.success || !pairRes.success) {
    throw new Error("RATE_LIMITED");
  }

  const supabase = client ?? (await createClient());
  const user = await getUserProfile(username, supabase);
  if (!user) return null;

  const [stats, follow, favorite, projects] = await Promise.all([
    getUserStats(user.id, viewerUserId, user, supabase),
    viewerUserId
      ? getUserFollowRelationship(viewerUserId, user.id, supabase)
      : Promise.resolve({isFollowing: false, isFollowingBack: false, lastUpdated: Date.now()}),
    viewerUserId ? isUserFavorite(viewerUserId, user.id, supabase) : Promise.resolve(false),
    getUserProjects(user.id, supabase),
  ]);

  return {user, stats, follow, favorite, projects};
}
