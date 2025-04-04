"use server";
import {qstash} from "@/utils/redis/qstash";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";

const USER_STATS_CACHE_KEY = (userId: string) => `user_stats_${userId}`;

export async function toggleUserFollow(followingId: string) {
  try {
    const supabase = await createClient();
    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {success: false, message: "Unauthorized"};
    }
    const followerId = user.id;

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

    if (error) {
      console.error("Error checking follow status:", error.message);
      return {success: false, message: "Error checking follow status"};
    }
    let result;
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
      result = {success: true, message: "Unfollowed successfully"};
    } else {
      // Follow (insert new entry)
      const {error: insertError} = await supabase
        .from("follows")
        .insert([{follower_id: followerId, following_id: followingId}]);

      if (insertError) {
        console.error("Error following:", insertError.message);
        return {success: false, message: "Error following user"};
      }
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "https://ten-lemons-show.loca.lt"
          : process.env.NEXT_PUBLIC_SITE_URL;

      const response = await qstash.publishJSON({
        url: `${baseUrl}/api/notifications`,
        body: {
          followerId,
          followingId,
          type: "follow",
        },
      });
      console.log(response);
      result = {success: true, message: "Followed successfully"};
    }
    // Invalidate caches for both users
    // The user being followed needs their follower count updated
    await redis.del(USER_STATS_CACHE_KEY(followingId));
    // The follower needs their following count updated
    await redis.del(USER_STATS_CACHE_KEY(followerId));

    return result;
  } catch (error) {
    console.error("Error toggling user follow:", error);
    return {
      error: error,
      message: "Error toggling user follow",
    };
  }
}
