"use server";

import {RESERVED_USERNAMES} from "@/data/auth/reservedUsernames";
import {getClientIp} from "@/utils/network/getClientIp";
import {hasProfanity} from "@/utils/other/profanityCheck";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";
import {Ratelimit} from "@upstash/ratelimit";
export async function checkUsernameAvailabilityAuth(username: string) {
  try {
    if (username.length === 0) {
      return {
        error: "Username is required",
      };
    }
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return {error: "This username is reserved and cannot be used"};
    }
    if (!username || username.length < 3 || username.length > 20) {
      return {
        error: "Username must be between 3 and 20 characters long",
      };
    }
    if (hasProfanity(username)) {
      return {
        error:
          "Username contains inappropriate language. Please choose another.",
      };
    }
    const ip = await getClientIp();
    const usernameRateLimiter = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, "3 m"), // 10 tries per 3 minutes
      analytics: true,
      prefix: "ratelimit:ip:username-check",
      enableProtection: true,
    });
    const usernameLimit = await usernameRateLimiter.limit(ip);

    if (!usernameLimit.success) {
      return {
        error: "Too many username checks. Please try again later.",
      };
    }

    const supabase = await createClient();

    const usernameTrimmed = username.trim().toLowerCase();

    const {count, error} = await supabase
      .from("profiles")
      .select("username", {
        head: true,
        count: "exact",
      })
      .eq("username", usernameTrimmed);

    const isAvailable = count === 0;

    if (error) {
      return {
        error: error.message,
      };
    }
    if (isAvailable) {
      return {
        error: null,
        message: "Username is available",
      };
    }
    return {
      error: null,
      message: "Username is already taken",
    };
  } catch (error) {
    console.log("Undexpected error in checkUsernameAvailabilityAuth:", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
