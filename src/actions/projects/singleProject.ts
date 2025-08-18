"use server";

import {Project} from "@/types/projects/projects";
import {redis} from "@/utils/redis/redis";
import {createClient, SupabaseServerClient} from "@/utils/supabase/server";
import {getClientIp} from "@/utils/network/getClientIp";
import {Ratelimit} from "@upstash/ratelimit";

const CACHE_KEYS = {
  project: (slug: string) => `project_${slug}`,
  projectFollow: (userId: string, projectId: string) => `project_follow_${userId}_${projectId}`,
  projectFavoritePair: (userId: string, projectId: string) =>
    `favorite_project_${userId}_${projectId}`,
  projectStats: (projectId: string) => `project_stats_${projectId}`,
};

const CACHE_TTL = 300; // 5 minutes
const TABLE_NAME = "projects";

export async function getProject(slug: string, client?: SupabaseServerClient) {
  try {
    const cacheKey = CACHE_KEYS.project(slug);
    const cachedProject = await redis.get(cacheKey);
    if (cachedProject) return cachedProject;

    const supabase = client ?? (await createClient());

    const {data, error} = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("slug", slug)
      // .eq("is_project_public", true)
      .single();

    if (error) {
      // Check if it's a "no rows found" error (project doesn't exist)
      if (error.code === "PGRST116" || error.message?.includes("No rows found")) {
        return null;
      }
      console.error("Error fetching project:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    await redis.set(cacheKey, data, {ex: 600}); // 10min
    return data;
  } catch (error) {
    console.error("Error in getProject:", error);
    return null;
  }
}

export async function isProjectFollowing(
  userId: string,
  projectId: string,
  client?: SupabaseServerClient,
): Promise<boolean> {
  if (!userId) return false;

  try {
    const cacheKey = CACHE_KEYS.projectFollow(userId, projectId);

    const cachedFollow = (await redis.get(cacheKey)) as "1" | "0" | boolean | null;
    if (cachedFollow !== null && cachedFollow !== undefined) {
      if (typeof cachedFollow === "string") return cachedFollow === "1";
      return Boolean(cachedFollow);
    }

    const supabase = client ?? (await createClient());
    const {count, error} = await supabase
      .from("project_followers")
      .select("*", {count: "exact", head: true})
      .eq("follower_user_id", userId)
      .eq("project_id", projectId);

    if (error) {
      console.error("Error fetching project follow status:", error);
      return false;
    }

    const isFollowing = (count ?? 0) > 0;
    await redis.set(cacheKey, isFollowing ? "1" : "0", {ex: CACHE_TTL});

    return isFollowing;
  } catch (error) {
    console.error("Error in isProjectFollowing:", error);
    return false;
  }
}

export async function isProjectFavorite(
  userId: string,
  projectId: string,
  client?: SupabaseServerClient,
): Promise<boolean> {
  if (!userId) return false;

  try {
    const pairKey = CACHE_KEYS.projectFavoritePair(userId, projectId);

    const cachedPair = (await redis.get(pairKey)) as "1" | "0" | boolean | null;
    if (cachedPair !== null && cachedPair !== undefined) {
      if (typeof cachedPair === "string") return cachedPair === "1";
      return Boolean(cachedPair);
    }

    const supabase = client ?? (await createClient());
    const {count, error} = await supabase
      .from("favorites_projects")
      .select("*", {count: "exact", head: true})
      .eq("user_id", userId)
      .eq("favorite_project_id", projectId);

    if (error) {
      console.error("Error fetching project favorite status:", error);
      return false;
    }

    const isFav = (count ?? 0) > 0;
    await redis.set(pairKey, isFav ? "1" : "0", {ex: CACHE_TTL});

    return isFav;
  } catch (error) {
    console.error("Error in isProjectFavorite:", error);
    return false;
  }
}

export async function getProjectStats(
  projectId: string,
  client?: SupabaseServerClient,
): Promise<{followers: number; members: number; openRoles: number}> {
  try {
    const cacheKey = CACHE_KEYS.projectStats(projectId);
    const cached = (await redis.get(cacheKey)) as {
      followers: number;
      members: number;
      openRoles: number;
    } | null;
    if (cached) return cached;

    const supabase = client ?? (await createClient());

    const [followersRes, membersRes, openRolesRes] = await Promise.all([
      supabase
        .from("project_followers")
        .select("*", {count: "exact", head: true})
        .eq("project_id", projectId),
      supabase
        .from("project_team_members")
        .select("*", {count: "exact", head: true})
        .eq("project_id", projectId)
        .eq("is_active", true),
      supabase
        .from("project_open_positions")
        .select("*", {count: "exact", head: true})
        .eq("project_id", projectId)
        .eq("status", "open"),
    ]);

    const stats = {
      followers: followersRes.error ? 0 : followersRes.count || 0,
      members: membersRes.error ? 0 : membersRes.count || 0,
      openRoles: openRolesRes.error ? 0 : openRolesRes.count || 0,
    };

    await redis.set(cacheKey, stats, {ex: CACHE_TTL});
    return stats;
  } catch (error) {
    console.error("Error in getProjectStats:", error);
    return {followers: 0, members: 0, openRoles: 0};
  }
}

export async function getProjectBundle(
  slug: string,
  sessionId?: string,
  client?: SupabaseServerClient,
): Promise<null | {
  project: Project;
  isFollowing: boolean;
  isFavorite: boolean;
  stats: {followers: number; members: number; openRoles: number};
}> {
  try {
    // Rate limit to prevent scraping/spam
    const ip = await getClientIp();
    const globalLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"), // up to 120 project bundles per minute per IP
      analytics: true,
      prefix: "ratelimit:ip:project-bundle",
      enableProtection: true,
    });
    const pairLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"), // up to 30 hits/min per IP-target pair
      analytics: true,
      prefix: "ratelimit:ip-target:project-bundle",
      enableProtection: true,
    });

    const [globalRes, pairRes] = await Promise.all([
      globalLimiter.limit(ip),
      pairLimiter.limit(`${ip}:${slug}`),
    ]);

    if (!globalRes.success || !pairRes.success) {
      throw new Error("RATE_LIMITED");
    }

    const supabase = client ?? (await createClient());
    const project = await getProject(slug, supabase);

    if (!project) return null;

    const [isFollowing, isFavorite, stats] = await Promise.all([
      sessionId ? isProjectFollowing(sessionId, project.id, supabase) : Promise.resolve(false),
      sessionId ? isProjectFavorite(sessionId, project.id, supabase) : Promise.resolve(false),
      getProjectStats(project.id, supabase),
    ]);

    return {project, isFollowing, isFavorite, stats};
  } catch (error) {
    // Re-throw rate limit errors to be handled specifically in the page component
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      throw error;
    }

    // Log other errors but return null to trigger 404 instead of generic error
    console.error("Error in getProjectBundle:", error);
    return null;
  }
}

// // Cache invalidation helpers
// export async function invalidateProjectCaches(projectId: string): Promise<void> {
//   const keys = [CACHE_KEYS.project(projectId), CACHE_KEYS.projectStats(projectId)];

//   await Promise.all(keys.map((key) => redis.del(key)));
// }
