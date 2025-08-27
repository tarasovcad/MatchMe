"use server";

import {createClient} from "@/utils/supabase/server";
import {SerializableFilter} from "@/store/filterStore";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";
import {Ratelimit} from "@upstash/ratelimit";
import {redis} from "@/utils/redis/redis";
import {getClientIp} from "@/utils/network/getClientIp";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";

export async function getUserSavedOpenPositions(
  userId: string,
  page = 1,
  perPage: number,
  filters: SerializableFilter[] = [],
): Promise<ProjectOpenPosition[]> {
  if (!userId) return [];

  try {
    const supabase = await createClient();

    // Rate limiting similar to other saved fetches
    const ip = await getClientIp();
    const userLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "ratelimit:user:saved-open-positions",
      enableProtection: true,
    });
    const ipLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 m"),
      analytics: true,
      prefix: "ratelimit:ip:saved-open-positions",
      enableProtection: true,
    });
    const [userLimit, ipLimit] = await Promise.all([
      userLimiter.limit(userId),
      ipLimiter.limit(ip),
    ]);
    if (!userLimit.success || !ipLimit.success) {
      return [];
    }

    // 1) Get favorite open position ids for this user
    const {data: favouriteIdsData, error: favouritesError} = await supabase
      .from("favorites_open_positions")
      .select("favorite_position_id")
      .eq("user_id", userId);

    if (favouritesError) {
      console.error("Error fetching favourite open position ids:", favouritesError.message);
      return [];
    }

    const favouriteIds = favouriteIdsData?.map((f) => f.favorite_position_id) || [];
    if (favouriteIds.length === 0) return [];

    // 2) Build open positions query restricted to favourites
    let query = supabase
      .from("project_open_positions")
      .select(
        "id, project_id, title, description, requirements, required_skills, time_commitment, experience_level, status, posted_by_user_id, created_at, updated_at",
      )
      .in("id", favouriteIds)
      .eq("status", "open");

    if (filters && filters.length > 0) {
      query = applyFiltersToSupabaseQuery(query, filters);
    }

    // 3) Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.order("created_at", {ascending: false}).range(from, to);

    const {data: positionsData, error: positionsError} = await query;
    if (positionsError) {
      console.error("Error fetching favourite open positions:", positionsError.message);
      return [];
    }

    const positions = (positionsData || []) as ProjectOpenPosition[];
    if (positions.length === 0) return [];

    const posterIds = Array.from(
      new Set(positions.map((p) => p.posted_by_user_id).filter((id): id is string => Boolean(id))),
    );
    const projectIds = Array.from(
      new Set(positions.map((p) => p.project_id).filter((id): id is string => Boolean(id))),
    );

    let postersMap = new Map<
      string,
      {name: string | null; username: string | null; profile_image: unknown | null}
    >();
    let projectsMap = new Map<string, string>();

    type PosterRow = {
      id: string;
      name: string | null;
      username: string | null;
      profile_image: unknown | null;
    };
    type ProjectRow = {id: string; slug: string};

    // Fetch posters and projects in parallel
    const [postersRes, projectsRes] = await Promise.all([
      posterIds.length
        ? supabase.from("profiles").select("id, name, username, profile_image").in("id", posterIds)
        : Promise.resolve({data: [] as PosterRow[], error: null} as const),
      projectIds.length
        ? supabase.from("projects").select("id, slug").in("id", projectIds)
        : Promise.resolve({data: [] as ProjectRow[], error: null} as const),
    ]);

    if (postersRes.error) {
      console.error("getUserSavedOpenPositions – posters error", postersRes.error);
    } else if (postersRes.data) {
      postersMap = new Map(
        (postersRes.data as PosterRow[]).map((p) => [
          p.id,
          {
            name: p.name ?? null,
            username: p.username ?? null,
            profile_image: p.profile_image ?? null,
          },
        ]),
      );
    }

    if (projectsRes.error) {
      console.error("getUserSavedOpenPositions – projects error", projectsRes.error);
    } else if (projectsRes.data) {
      projectsMap = new Map((projectsRes.data as ProjectRow[]).map((proj) => [proj.id, proj.slug]));
    }

    const enriched: ProjectOpenPosition[] = positions.map((p) => {
      const poster = p.posted_by_user_id ? postersMap.get(p.posted_by_user_id) : undefined;
      const projectSlug = p.project_id ? projectsMap.get(p.project_id) : undefined;
      return {
        ...p,
        posted_by_name: poster?.name ?? null,
        posted_by_username: poster?.username ?? null,
        posted_by_profile_image: poster?.profile_image ?? null,
        is_saved: true,
        project_slug: projectSlug,
      } as ProjectOpenPosition;
    });

    return enriched;
  } catch (error) {
    console.error("Error in getUserSavedOpenPositions:", error);
    return [];
  }
}
