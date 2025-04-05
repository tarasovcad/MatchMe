"use server";

import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";
import {MatchMeUser} from "@/types/user/matchMeUser";

const PROFILES_CACHE_KEY = "public_profiles";
const FAVORITES_CACHE_KEY = (userId: string) => `favorites_${userId}`;
const CACHE_TTL = 300; // 5 minutes
const TABLE_NAME = "profiles";
export async function getAllProfiles(page = 1, perPage: number) {
  const supabase = await createClient();

  // Try getting profiles from Redis cache
  const cacheKey = `${PROFILES_CACHE_KEY}_page_${page}_perPage_${perPage}`;
  let profiles = (await redis.get(cacheKey)) as MatchMeUser[];

  if (!profiles) {
    // Calculate range for pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    console.log("Cache miss - fetching from Supabase...");
    const query = supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("is_profile_public", true)
      .range(from, to);

    const {data, error: profilesError} = await query;

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }
    profiles = data;

    // Store in Redis cache
    await redis.set(cacheKey, profiles, {ex: CACHE_TTL});
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
