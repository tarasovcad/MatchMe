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
  tagline: string | null;
  public_current_role: string | null;
  is_profile_verified?: boolean;
}

export async function searchProfiles(query: string, limit = 10): Promise<SearchProfileResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const ip = await getClientIp();

    // Rate limiting for profile search
    const searchLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 search requests per minute per IP
      analytics: true,
      prefix: "ratelimit:ip:profile-search",
      enableProtection: true,
    });

    const ipLimit = await searchLimiter.limit(ip);

    if (!ipLimit.success) {
      throw new Error("Too many search requests. Please slow down and try again.");
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
        profile_image,
        tagline,
        public_current_role,
        is_profile_verified
      `,
      )
      .eq("is_profile_public", true)
      .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error("Error searching profiles:", error);
      throw new Error("Failed to search profiles");
    }

    return data || [];
  } catch (error) {
    console.error("Error in searchProfiles:", error);
    if (error instanceof Error && error.message.includes("Too many")) {
      throw error; // Re-throw rate limit errors
    }
    throw new Error("Failed to search profiles");
  }
}
