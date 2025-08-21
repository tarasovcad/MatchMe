"use server";

import {createClient} from "@/utils/supabase/server";
import {redis} from "@/utils/redis/redis";
import {Ratelimit} from "@upstash/ratelimit";
import {getClientIp} from "@/utils/network/getClientIp";

async function invalidateFavoritePair(userId: string, positionId: string) {
  const pairKey = `favorite_position_${userId}_${positionId}`;
  await redis.del(pairKey);
}

export async function toggleOpenPositionFavorite(userId: string, positionId: string) {
  try {
    const supabase = await createClient();
    const ip = await getClientIp();

    // Rate limiting for favorite actions
    const favoriteUserLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "5 m"),
      analytics: true,
      prefix: "ratelimit:user:favorite:position",
      enableProtection: true,
    });

    const favoriteIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(150, "5 m"),
      analytics: true,
      prefix: "ratelimit:ip:favorite:position",
      enableProtection: true,
    });

    // Per-user-position pair limit
    const favoritePairLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      analytics: true,
      prefix: "ratelimit:pair:favorite:position",
      enableProtection: true,
    });

    const [userLimit, ipLimit, pairLimit] = await Promise.all([
      favoriteUserLimiter.limit(userId),
      favoriteIpLimiter.limit(ip),
      favoritePairLimiter.limit(`${userId}:${positionId}`),
    ]);

    if (!userLimit.success) {
      return {
        success: false,
        message:
          "You're adding/removing favorites too quickly. Please wait a moment and try again.",
      };
    }

    if (!ipLimit.success) {
      return {
        success: false,
        message: "Too many favorite actions from this connection. Please try again later.",
      };
    }

    if (!pairLimit.success) {
      return {
        success: false,
        message: "You're interacting with this position too frequently. Please wait a moment.",
      };
    }

    // Check current favorite state
    const {data: existingFavorite, error} = await supabase
      .from("favorites_open_positions")
      .select("id")
      .eq("user_id", userId)
      .eq("favorite_position_id", positionId)
      .maybeSingle();

    if (error) {
      console.error("Error checking favorite status:", error.message);
      return {success: false, message: "Error checking favorite status"};
    }

    if (existingFavorite) {
      // Remove
      const {error: deleteError} = await supabase
        .from("favorites_open_positions")
        .delete()
        .eq("id", existingFavorite.id);

      if (deleteError) {
        console.error("Error removing from favorites:", deleteError.message);
        return {success: false, message: "Error removing from favorites"};
      }

      await invalidateFavoritePair(userId, positionId);
      return {success: true, message: "Removed from favorites"};
    } else {
      // Add
      const {error: insertError} = await supabase
        .from("favorites_open_positions")
        .insert([{user_id: userId, favorite_position_id: positionId}]);

      if (insertError) {
        console.error("Error adding to favorites:", insertError.message);
        return {success: false, message: "Error adding to favorites"};
      }

      await invalidateFavoritePair(userId, positionId);
      return {success: true, message: "Added to favorites"};
    }
  } catch (error) {
    console.error("Error toggling open position favorite:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
