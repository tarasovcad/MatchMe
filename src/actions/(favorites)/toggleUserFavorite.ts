"use server";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";
import {postProfileInteraction} from "../profiles/profileInteractions";

async function invalidateFavoritePair(userId: string, favoriteUserId: string) {
  const pairKey = `favorite_${userId}_${favoriteUserId}`;
  await redis.del(pairKey);
}

export async function toggleUserFavorite(userId: string, favoriteUserId: string) {
  try {
    const supabase = await createClient();

    if (userId === favoriteUserId) {
      return {
        error: "You cannot add yourself to favorites",
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
      // Invalidate caches
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
      // Invalidate caches
      await invalidateFavoritePair(userId, favoriteUserId);

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
