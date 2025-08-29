"use server";

import {createClient} from "@/utils/supabase/server";
import {SerializableFilter} from "@/store/filterStore";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";
import {Project} from "@/types/projects/projects";
import {redis} from "@/utils/redis/redis";
import {Ratelimit} from "@upstash/ratelimit";
import {getClientIp} from "@/utils/network/getClientIp";

export async function getUserSavedProjects(
  userId: string,
  page = 1,
  perPage: number,
  filters: SerializableFilter[] = [],
): Promise<Project[]> {
  if (!userId) return [];

  try {
    const supabase = await createClient();

    // Rate limiting (read) – moderate yet protective limits
    const ip = await getClientIp();
    const userLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"), // up to 60 saved-project fetches per minute per user
      analytics: true,
      prefix: "ratelimit:user:saved-projects",
      enableProtection: true,
    });
    const ipLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 m"), // up to 200 fetches per minute per IP
      analytics: true,
      prefix: "ratelimit:ip:saved-projects",
      enableProtection: true,
    });

    const [userLimit, ipLimit] = await Promise.all([
      userLimiter.limit(userId),
      ipLimiter.limit(ip),
    ]);
    if (!userLimit.success || !ipLimit.success) {
      return [];
    }

    // 1) Get favorite project ids for this user
    const {data: favouriteIdsData, error: favouritesError} = await supabase
      .from("favorites_projects")
      .select("favorite_project_id")
      .eq("user_id", userId);

    if (favouritesError) {
      console.error("Error fetching favourite project ids:", favouritesError.message);
      return [];
    }

    const favouriteIds = favouriteIdsData?.map((f) => f.favorite_project_id) || [];
    if (favouriteIds.length === 0) return [];

    // 2) Build projects query restricted to favourites
    let query = supabase
      .from("projects")
      .select("id, name, slug, tagline, category, technology_stack, current_stage, project_image")
      .in("id", favouriteIds);

    if (filters && filters.length > 0) {
      query = applyFiltersToSupabaseQuery(query, filters);
    }

    // 3) Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const {data: projectsData, error: projectsError} = await query;
    if (projectsError) {
      console.error("Error fetching favourite projects:", projectsError.message);
      return [];
    }

    return (projectsData || []) as unknown as Project[];
  } catch (error) {
    console.error("Error in getUserSavedProjects:", error);
    return [];
  }
}
