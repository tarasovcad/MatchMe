"use server";

import {createClient} from "@/utils/supabase/server";
import {redis} from "@/utils/redis/redis";
import {Ratelimit} from "@upstash/ratelimit";
import {getClientIp} from "@/utils/network/getClientIp";

async function invalidateFavoritePair(userId: string, favoriteProjectId: string) {
  const pairKey = `favorite_project_${userId}_${favoriteProjectId}`;
  await redis.del(pairKey);
}

export async function toggleProjectFavorite(userId: string, projectId: string) {
  try {
    const supabase = await createClient();
    const ip = await getClientIp();

    // Rate limiting for favorite actions
    const favoriteUserLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "5 m"), // 30 favorite actions per 5 minutes per user
      analytics: true,
      prefix: "ratelimit:user:favorite:project",
      enableProtection: true,
    });

    const favoriteIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(150, "5 m"), // 150 favorite actions per 5 minutes per IP
      analytics: true,
      prefix: "ratelimit:ip:favorite:project",
      enableProtection: true,
    });

    // Per-user-project pair limit to prevent targeting specific projects
    const favoritePairLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 favorite toggles per minute per user-project pair
      analytics: true,
      prefix: "ratelimit:pair:favorite:project",
      enableProtection: true,
    });

    const [userLimit, ipLimit, pairLimit] = await Promise.all([
      favoriteUserLimiter.limit(userId),
      favoriteIpLimiter.limit(ip),
      favoritePairLimiter.limit(`${userId}:${projectId}`),
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
        message: "You're interacting with this project too frequently. Please wait a moment.",
      };
    }

    // Check if the project is already in the favorites list
    const {data: existingFavorite, error} = await supabase
      .from("favorites_projects")
      .select("id")
      .eq("user_id", userId)
      .eq("favorite_project_id", projectId)
      .maybeSingle();

    if (error) {
      console.error("Error checking favorite status:", error.message);
      return {success: false, message: "Error checking favorite status"};
    }

    if (existingFavorite) {
      // Remove from favorites (delete entry)
      const {error: deleteError} = await supabase
        .from("favorites_projects")
        .delete()
        .eq("id", existingFavorite.id);

      if (deleteError) {
        console.error("Error removing from favorites:", deleteError.message);
        return {success: false, message: "Error removing from favorites"};
      }

      await invalidateFavoritePair(userId, projectId);
      return {success: true, message: "Removed from favorites"};
    } else {
      // Add to favorites (insert new entry)
      const {error: insertError} = await supabase
        .from("favorites_projects")
        .insert([{user_id: userId, favorite_project_id: projectId}]);

      if (insertError) {
        console.error("Error adding to favorites:", insertError.message);
        return {success: false, message: "Error adding to favorites"};
      }

      await invalidateFavoritePair(userId, projectId);
      return {success: true, message: "Added to favorites"};
    }
  } catch (error) {
    console.error("Error toggling project favorite:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
