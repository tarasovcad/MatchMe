"use server";

import {createClient} from "@/utils/supabase/server";
import {postProfileInteraction} from "../profiles/profileInteractions";
import {redis} from "@/utils/redis/redis";
import {sendNotification} from "../notifications/sendNotification";
import {Ratelimit} from "@upstash/ratelimit";
import {getClientIp} from "@/utils/network/getClientIp";
import {invalidateFollowRelationship} from "../profiles/singleUserProfile";

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
    const ip = await getClientIp();

    if (followerId === followingId) {
      return {
        error: "You cannot follow yourself",
      };
    }

    // Rate limiting for follow actions
    const followUserLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "5 m"), // 20 follow actions per 5 minutes per user
      analytics: true,
      prefix: "ratelimit:user:follow",
      enableProtection: true,
    });

    const followIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "5 m"), // 100 follow actions per 5 minutes per IP
      analytics: true,
      prefix: "ratelimit:ip:follow",
      enableProtection: true,
    });

    // Per-user-target pair limit to prevent targeting specific users
    const followPairLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 follow toggles per minute per user-target pair
      analytics: true,
      prefix: "ratelimit:pair:follow",
      enableProtection: true,
    });

    const [userLimit, ipLimit, pairLimit] = await Promise.all([
      followUserLimiter.limit(followerId),
      followIpLimiter.limit(ip),
      followPairLimiter.limit(`${followerId}:${followingId}`),
    ]);

    if (!userLimit.success) {
      return {
        success: false,
        message: "You're following/unfollowing too quickly. Please wait a moment and try again.",
      };
    }

    if (!ipLimit.success) {
      return {
        success: false,
        message: "Too many follow actions from this connection. Please try again later.",
      };
    }

    if (!pairLimit.success) {
      return {
        success: false,
        message: "You're interacting with this profile too frequently. Please wait a moment.",
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

      await sendNotification({
        type: "follow",
        recipientId: followingId,
      });

      result = {success: true, message: "Followed successfully"};
    }

    // Invalidate caches affected by follow changes
    await Promise.all([
      // Stats (counts) for both users
      redis.del(`stats_${followingId}`),
      redis.del(`stats_${followerId}`),
      // Follow relationship in both directions
      invalidateFollowRelationship(followerId, followingId),
      invalidateFollowRelationship(followingId, followerId),
    ]).catch((err) => console.error("Cache error:", err));

    return result;
  } catch (error) {
    console.error("Error toggling user follow:", error);
    return {
      error: error,
      message: "Error toggling user follow",
    };
  }
}
