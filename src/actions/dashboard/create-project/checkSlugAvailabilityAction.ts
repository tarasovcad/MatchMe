"use server";

import {getClientIp} from "@/utils/network/getClientIp";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";
import {Ratelimit} from "@upstash/ratelimit";

export async function checkSlugAvailabilityAction(slug: string) {
  try {
    if (slug.length === 0) {
      return {
        error: "Slug is required",
      };
    }

    if (!slug || slug.length < 3 || slug.length > 50) {
      return {
        error: "Slug must be between 3 and 30 characters long",
      };
    }

    const ip = await getClientIp();
    const slugRateLimiter = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 tries per 1 minute
      analytics: true,
      prefix: "ratelimit:ip:slug-check",
      enableProtection: true,
    });
    const slugLimit = await slugRateLimiter.limit(ip);

    if (!slugLimit.success) {
      return {
        error: "Too many slug checks. Please try again later.",
      };
    }

    const supabase = await createClient();

    const slugTrimmed = slug.trim().toLowerCase();

    const {count, error} = await supabase
      .from("projects")
      .select("slug", {
        head: true,
        count: "exact",
      })
      .eq("slug", slugTrimmed);

    const isAvailable = count === 0;

    if (error) {
      return {
        error: error.message,
      };
    }

    if (isAvailable) {
      return {
        error: null,
        message: "Slug is available",
      };
    }

    return {
      error: null,
      message: "Slug is already taken",
    };
  } catch (error) {
    console.log("Unexpected error in checkSlugAvailabilityAction:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
