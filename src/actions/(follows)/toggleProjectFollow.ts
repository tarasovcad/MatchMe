"use server";

import {createClient} from "@/utils/supabase/server";
import {redis} from "@/utils/redis/redis";
import {sendNotification} from "../notifications/sendNotification";
import {Ratelimit} from "@upstash/ratelimit";
import {getClientIp} from "@/utils/network/getClientIp";

export async function toggleProjectFollow(projectId: string) {
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

    // Rate limiting for follow actions
    const followUserLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "5 m"), // 20 follow actions per 5 minutes per user
      analytics: true,
      prefix: "ratelimit:user:project-follow",
      enableProtection: true,
    });

    const followIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "5 m"), // 100 follow actions per 5 minutes per IP
      analytics: true,
      prefix: "ratelimit:ip:project-follow",
      enableProtection: true,
    });

    // Per-user-project pair limit to prevent targeting specific projects
    const followPairLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 follow toggles per minute per user-project pair
      analytics: true,
      prefix: "ratelimit:pair:project-follow",
      enableProtection: true,
    });

    const [userLimit, ipLimit, pairLimit] = await Promise.all([
      followUserLimiter.limit(followerId),
      followIpLimiter.limit(ip),
      followPairLimiter.limit(`${followerId}:${projectId}`),
    ]);

    if (!userLimit.success) {
      return {
        success: false,
        message:
          "You're following/unfollowing projects too quickly. Please wait a moment and try again.",
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
        message: "You're interacting with this project too frequently. Please wait a moment.",
      };
    }

    // Check if the user is already following this project
    const {data: existingFollow, error} = await supabase
      .from("project_followers")
      .select("id")
      .eq("follower_user_id", followerId)
      .eq("project_id", projectId)
      .maybeSingle();

    if (error) {
      console.error("Error checking project follow status:", error.message);
      return {success: false, message: "Error checking follow status"};
    }

    let result;
    if (existingFollow) {
      // Unfollow (delete entry)
      const {error: deleteError} = await supabase
        .from("project_followers")
        .delete()
        .eq("id", existingFollow.id);

      if (deleteError) {
        console.error("Error unfollowing project:", deleteError.message);
        return {success: false, message: "Error unfollowing project"};
      }
      result = {success: true, message: "Unfollowed project successfully"};
    } else {
      // Follow (insert new entry)
      const {error: insertError} = await supabase
        .from("project_followers")
        .insert([{follower_user_id: followerId, project_id: projectId}]);

      if (insertError) {
        console.error("Error following project:", insertError.message);
        return {success: false, message: "Error following project"};
      }

      //TODO: Get project owner to send notification

      result = {success: true, message: "Followed project successfully"};
    }

    // TODO: Invalidate profile stats cache

    // Invalidate project-related caches
    await Promise.all([
      // Project stats cache
      redis.del(`project_stats_${projectId}`),
      // Project follow cache for this user-project pair
      redis.del(`project_follow_${followerId}_${projectId}`),
    ]).catch((err) => console.error("Cache error:", err));

    return result;
  } catch (error) {
    console.error("Error toggling project follow:", error);
    return {
      error: error,
      message: "Error toggling project follow",
    };
  }
}
