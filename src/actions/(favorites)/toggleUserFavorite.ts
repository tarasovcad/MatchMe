"use server";

import {createClient} from "@/utils/supabase/server";
import {postProfileInteraction} from "../profiles/profileInteractions";
import {redis} from "@/utils/redis/redis";
import {Ratelimit} from "@upstash/ratelimit";
import {getClientIp} from "@/utils/network/getClientIp";

async function invalidateFavoritePair(userId: string, favoriteUserId: string) {
  const pairKey = `favorite_${userId}_${favoriteUserId}`;
  await redis.del(pairKey);
}

export async function toggleUserFavorite(userId: string, favoriteUserId: string) {
  try {
    const supabase = await createClient();
    const ip = await getClientIp();

    if (userId === favoriteUserId) {
      return {
        error: "You cannot add yourself to favorites",
      };
    }

    // Rate limiting for favorite actions
    const favoriteUserLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "5 m"), // 30 favorite actions per 5 minutes per user
      analytics: true,
      prefix: "ratelimit:user:favorite",
      enableProtection: true,
    });

    const favoriteIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(150, "5 m"), // 150 favorite actions per 5 minutes per IP
      analytics: true,
      prefix: "ratelimit:ip:favorite",
      enableProtection: true,
    });

    // Per-user-target pair limit to prevent targeting specific users
    const favoritePairLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 favorite toggles per minute per user-target pair
      analytics: true,
      prefix: "ratelimit:pair:favorite",
      enableProtection: true,
    });

    const [userLimit, ipLimit, pairLimit] = await Promise.all([
      favoriteUserLimiter.limit(userId),
      favoriteIpLimiter.limit(ip),
      favoritePairLimiter.limit(`${userId}:${favoriteUserId}`),
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
        message: "You're interacting with this profile too frequently. Please wait a moment.",
      };
    }

    const profileInteraction = await postProfileInteraction(
      favoriteUserId,
      userId,
      "save_to_favourites",
    );

    if (!profileInteraction.success) {
      return {success: false, message: "Error posting profile interaction"};
    }

    // Check if the user is already in the favorites list
    const {data: existingFavorite, error} = await supabase
      .from("favorites_users")
      .select("id")
      .eq("user_id", userId)
      .eq("favorite_user_id", favoriteUserId)
      .maybeSingle();

    if (error) {
      console.error("Error checking favorite status:", error.message);
      return {success: false, message: "Error checking favorite status"};
    }

    if (existingFavorite) {
      // Remove from favorites (delete entry)
      const {error: deleteError} = await supabase
        .from("favorites_users")
        .delete()
        .eq("id", existingFavorite.id);

      if (deleteError) {
        console.error("Error removing from favorites:", deleteError.message);
        return {success: false, message: "Error removing from favorites"};
      }

      await invalidateFavoritePair(userId, favoriteUserId);
      return {success: true, message: "Removed from favorites"};
    } else {
      // Add to favorites (insert new entry)
      const {error: insertError} = await supabase
        .from("favorites_users")
        .insert([{user_id: userId, favorite_user_id: favoriteUserId}]);

      if (insertError) {
        console.error("Error adding to favorites:", insertError.message);
        return {success: false, message: "Error adding to favorites"};
      }

      await invalidateFavoritePair(userId, favoriteUserId);
      return {success: true, message: "Added to favorites"};
    }
  } catch (error) {
    console.error("Error toggling user favorite:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
