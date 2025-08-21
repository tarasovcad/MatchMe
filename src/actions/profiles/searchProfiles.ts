"use server";

import {createClient} from "@/utils/supabase/server";
import {Ratelimit} from "@upstash/ratelimit";
import {redis} from "@/utils/redis/redis";
import {getClientIp} from "@/utils/network/getClientIp";

const TABLE_NAME = "mock_profiles";

export interface SearchProfileResult {
  id: string;
  name: string;
  username: string;
  profile_image: {
    url: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  }[];
}

export async function searchProfiles(query: string, limit = 10): Promise<SearchProfileResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  // Create cache key for this search query
  const cacheKey = `search:profiles:${query.toLowerCase().trim()}:${limit}`;

  try {
    const ip = await getClientIp();

    // Rate limiting for search profiles
    const searchProfilesIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "5 m"), // 50 searches per 5 minutes per IP
      analytics: true,
      prefix: "ratelimit:ip:search-profiles",
      enableProtection: true,
    });

    const ipLimit = await searchProfilesIpLimiter.limit(ip);

    if (!ipLimit.success) {
      throw new Error("RATE_LIMITED");
    }

    // Try to get cached results first
    try {
      const cachedResults = await redis.get(cacheKey);
      if (cachedResults) {
        return JSON.parse(cachedResults as string) as SearchProfileResult[];
      }
    } catch (cacheError) {
      console.warn("Redis cache read error:", cacheError);
      // Continue to database query if cache fails
    }

    const supabase = await createClient();

    // Simple search by name or username
    const {data, error} = await supabase
      .from(TABLE_NAME)
      .select(
        `
        id,
        name,
        username,
        profile_image
      `,
      )
      .eq("is_profile_public", true)
      .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error("Error searching profiles:", error);
      throw new Error("Failed to search profiles");
    }

    const results = data || [];

    // Cache the results for 5 minutes
    try {
      await redis.set(cacheKey, JSON.stringify(results), {ex: 600}); // 600 seconds = 10 minutes
      console.log(`Cached search results for query: ${query}`);
    } catch (cacheError) {
      console.warn("Redis cache write error:", cacheError);
      // Don't throw error, just continue without caching
    }

    return results;
  } catch (error) {
    console.error("Error in searchProfiles:", error);

    if (error instanceof Error && error.message === "RATE_LIMITED") {
      throw new Error("Too many search requests. Please try again later.");
    }

    throw new Error("Failed to search profiles");
  }
}
