"use server";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";

async function invalidateUserFavoritesCache(userId: string) {
  const cacheKey = `favorites_${userId}`;
  await redis.del(cacheKey);
}

export async function toggleUserFavorite(
  userId: string,
  favoriteUserId: string,
) {
  try {
    const supabase = await createClient();

    if (userId === favoriteUserId) {
      return {
        error: "You cannot add yourself to favorites",
      };
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
      // Invalidate the favorites cache for this user
      await invalidateUserFavoritesCache(userId);

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
      // Invalidate the favorites cache for this user
      await invalidateUserFavoritesCache(userId);

      return {success: true, message: "Added to favorites"};
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return {
      error: error,
      message: "Error toggling favorite",
    };
  }
}
