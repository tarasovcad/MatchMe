"use server";

import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {Filter, SerializableFilter} from "@/store/filterStore";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";

const PROFILES_CACHE_KEY = "public_profiles";
const FAVORITES_CACHE_KEY = (userId: string) => `favorites_${userId}`;
const CACHE_TTL = 300; // 5 minutes
const TABLE_NAME = "profiles";

export async function getAllProfiles(
  page = 1,
  perPage: number,
  pageFilters?: SerializableFilter[],
) {
  console.log("getAllProfiles");
  const supabase = await createClient();

  // Calculate range for pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // If we have filters, we dont use cache
  const useCache = !pageFilters || pageFilters.length === 0;

  let profiles: MatchMeUser[] | null = null;

  // Try getting profiles from Redis cache if no filters
  if (useCache) {
    const cacheKey = `${PROFILES_CACHE_KEY}_page_${page}_perPage_${perPage}`;
    profiles = (await redis.get(cacheKey)) as MatchMeUser[];
  }

  if (!profiles) {
    console.log("Cache miss or using filters - fetching from Supabase...");

    // Build base query
    let query = supabase.from(TABLE_NAME).select("*").eq("is_profile_public", true);

    // Apply filters if provided
    if (pageFilters && pageFilters.length > 0) {
      query = applyFiltersToSupabaseQuery(query, pageFilters);
    }

    // Apply pagination
    query = query.range(from, to);
    console.log("Query:", query);
    const {data, error: profilesError} = await query;

    if (profilesError) {
      console.error("Supabase query error:", profilesError);
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }
    if (!data) {
      console.warn("No data returned from Supabase");
      return [];
    }
    profiles = data;

    if (useCache) {
      try {
        await redis.set(`${PROFILES_CACHE_KEY}_page_${page}_perPage_${perPage}`, profiles, {
          ex: CACHE_TTL,
        });
        console.log("Successfully cached profiles");
      } catch (redisCacheError) {
        console.error("Redis caching error:", redisCacheError);
      }
    }
  } else {
    console.log("Cache hit - using cached profiles");
  }

  return profiles;
}

export async function getUserFavoritesProfiles(userId: string) {
  if (!userId) return [];

  const supabase = await createClient();

  // Try getting favorites from Redis cache
  const cacheKey = FAVORITES_CACHE_KEY(userId);
  let favoritesData = (await redis.get(cacheKey)) as {
    favorite_user_id: string;
  }[];

  if (!favoritesData) {
    console.log("Favorites cache miss - fetching from Supabase...");
    const {data, error: favoritesError} = await supabase
      .from("favorites_users")
      .select("favorite_user_id")
      .eq("user_id", userId);

    if (favoritesError) {
      console.log("Error fetching favorites:", favoritesError.message);
      return [];
    }

    favoritesData = data;

    // Store in Redis cache
    await redis.set(cacheKey, favoritesData, {ex: CACHE_TTL});
  } else {
    console.log("Favorites cache hit - using cached favorites");
  }

  return favoritesData.map((fav) => fav.favorite_user_id);
}
