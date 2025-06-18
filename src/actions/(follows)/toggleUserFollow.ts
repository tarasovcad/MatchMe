"use server";
import {qstash} from "@/utils/redis/qstash";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";
import {postProfileInteraction} from "../profiles/profileInteractions";

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
      const profileInteraction = await postProfileInteraction(followingId, followerId, "unfollow");
      if (!profileInteraction.success) {
        return {success: false, message: "Error posting profile interaction"};
      }

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
      const profileInteraction = await postProfileInteraction(followingId, followerId, "follow");
      if (!profileInteraction.success) {
        return {success: false, message: "Error posting profile interaction"};
      }

      const {error: insertError} = await supabase
        .from("follows")
        .insert([{follower_id: followerId, following_id: followingId}]);

      if (insertError) {
        console.error("Error following:", insertError.message);
        return {success: false, message: "Error following user"};
      }

      const baseUrl =
        process.env.NODE_ENV === "development"
          ? process.env.FAKE_TEST_URL
          : process.env.NEXT_PUBLIC_SITE_URL;

      qstash
        .publishJSON({
          url: `${baseUrl}/api/notifications`,
          body: {
            followerId,
            followingId,
            type: "follow",
          },
        })
        .catch((err) => console.error("Notification error:", err));

      result = {success: true, message: "Followed successfully"};
    }
    redis.del(USER_STATS_CACHE_KEY(followingId)).catch((err) => console.error("Cache error:", err));
    redis.del(USER_STATS_CACHE_KEY(followerId)).catch((err) => console.error("Cache error:", err));

    return result;
  } catch (error) {
    console.error("Error toggling user follow:", error);
    return {
      error: error,
      message: "Error toggling user follow",
    };
  }
}
