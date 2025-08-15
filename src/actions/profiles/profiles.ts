"use server";

import {createClient} from "@/utils/supabase/server";
import {SerializableFilter} from "@/store/filterStore";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";
import {Ratelimit} from "@upstash/ratelimit";
import {redis} from "@/utils/redis/redis";
import {getClientIp} from "@/utils/network/getClientIp";

const TABLE_NAME = "mock_profiles";

export async function getAllProfiles(
  page = 1,
  perPage: number,
  pageFilters?: SerializableFilter[],
) {
  try {
    const ip = await getClientIp();

    // Rate limiting for profile listing
    const profilesIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 m"), // 200 requests per minute per IP
      analytics: true,
      prefix: "ratelimit:ip:profiles-list",
      enableProtection: true,
    });

    // More restrictive limit for high page numbers to prevent deep scraping
    const profilesDeepLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1 m"), // 50 requests per minute for pages > 5
      analytics: true,
      prefix: "ratelimit:ip:profiles-deep",
      enableProtection: true,
    });

    const ipLimit = await profilesIpLimiter.limit(ip);

    if (!ipLimit.success) {
      throw new Error("Too many profile listing requests. Please slow down and try again.");
    }

    // Additional check for deep pagination
    if (page > 5) {
      const deepLimit = await profilesDeepLimiter.limit(ip);
      if (!deepLimit.success) {
        throw new Error("Too many deep page requests. Please try again later.");
      }
    }

    const supabase = await createClient();

    // Calculate range for pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Query with only required columns for CardMatchMeUser
    let query = supabase
      .from(TABLE_NAME)
      .select(
        `
       id,
       name,
       username,
       profile_image,
       looking_for,
       tagline,
       skills,
       created_at,
       public_current_role,
       seniority_level
     `,
      )
      .eq("is_profile_public", true);

    // Apply filters if provided
    if (pageFilters && pageFilters.length > 0) {
      query = applyFiltersToSupabaseQuery(query, pageFilters);
    }

    // Order by created_at descending (newest first)
    query = query.order("created_at", {ascending: false});

    // Apply pagination
    query = query.range(from, to);
    const {data, error: profilesError} = await query;

    return data || [];
  } catch (error) {
    console.error("Error in getAllProfiles:", error);
    if (error instanceof Error && error.message.includes("Too many")) {
      throw error; // Re-throw rate limit errors
    }
    throw new Error("Failed to fetch profiles");
  }
}

export async function getUserFavoritesProfiles(userId: string) {
  if (!userId) return [];

  const supabase = await createClient();

  const {data, error: favoritesError} = await supabase
    .from("favorites_users")
    .select("favorite_user_id")
    .eq("user_id", userId);

  if (favoritesError) {
    console.log("Error fetching favorites:", favoritesError.message);
    return [];
  }

  return data.map((fav) => fav.favorite_user_id);
}
