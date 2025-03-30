"use server";
import {createClient} from "@/utils/supabase/server";

export async function toggleUserFollow(
  followerId: string,
  followingId: string,
) {
  try {
    const supabase = await createClient();

    if (followerId === followingId) {
      return {
        error: "You cannot follow yourself",
      };
    }
    // Check if the user is already following
    const {data: existingFollow, error} = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();

    console.log(existingFollow);

    if (error) {
      console.error("Error checking follow status:", error.message);
      return {success: false, message: "Error checking follow status"};
    }

    if (existingFollow) {
      // Unfollow (delete entry)
      const {error: deleteError} = await supabase
        .from("follows")
        .delete()
        .eq("id", existingFollow.id);

      if (deleteError) {
        console.error("Error unfollowing:", deleteError.message);
        return {success: false, message: "Error unfollowing user"};
      }
      return {success: true, message: "Unfollowed successfully"};
    } else {
      // Follow (insert new entry)
      const {error: insertError} = await supabase
        .from("follows")
        .insert([{follower_id: followerId, following_id: followingId}]);

      if (insertError) {
        console.error("Error following:", insertError.message);
        return {success: false, message: "Error following user"};
      }
      return {success: true, message: "Followed successfully"};
    }
  } catch (error) {
    console.error("Error toggling user follow:", error);
    return {
      error: error,
      message: "Error toggling user follow",
    };
  }
}
