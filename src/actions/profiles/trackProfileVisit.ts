import {qstash} from "@/utils/redis/qstash";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";
import {Ratelimit} from "@upstash/ratelimit";
import {getClientIp} from "@/utils/network/getClientIp";

export const trackProfileVisit = async (visitorId: string, profileOwnerId: string) => {
  if (!visitorId || !profileOwnerId || visitorId === profileOwnerId) return;

  try {
    const ip = await getClientIp();

    // Rate limiting for profile visit tracking
    const visitIpLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(300, "1 m"), // 300 visits per minute per IP (generous for browsing)
      analytics: true,
      prefix: "ratelimit:ip:visit-track",
      enableProtection: true,
    });

    const visitUserLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 visits per minute per user (very generous)
      analytics: true,
      prefix: "ratelimit:user:visit-track",
      enableProtection: true,
    });

    // Per-user-target pair limit to prevent spam visits to specific users
    const visitPairLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 visits per minute to same profile
      analytics: true,
      prefix: "ratelimit:pair:visit-track",
      enableProtection: true,
    });

    const [ipLimit, userLimit, pairLimit] = await Promise.all([
      visitIpLimiter.limit(ip),
      visitUserLimiter.limit(visitorId),
      visitPairLimiter.limit(`${visitorId}:${profileOwnerId}`),
    ]);

    if (!ipLimit.success || !userLimit.success || !pairLimit.success) {
      // Silently fail rate-limited visit tracking to not interrupt user experience
      console.warn(`Visit tracking rate limited for visitor ${visitorId} -> ${profileOwnerId}`);
      return;
    }

    const redisKey = `profile_visit:${visitorId}:${profileOwnerId}`;
    const visited = await redis.get(redisKey);

    // if user has already visited this profile, return
    if (visited) return;

    // set cache for 3 hours
    await redis.set(redisKey, "1", {ex: 60 * 60 * 3});

    const supabase = await createClient();

    const {data: visitorData, error: visitorError} = await supabase
      .from("profiles")
      .select(
        "public_current_role, skills, location, age, pronouns, looking_for, work_availability, languages",
      )
      .eq("id", visitorId)
      .single();

    if (visitorError || !visitorData) return;

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? process.env.FAKE_TEST_URL
        : process.env.NEXT_PUBLIC_SITE_URL;

    await qstash
      .publishJSON({
        url: `${baseUrl}/api/track-visit`,
        body: {
          visitorId,
          profileOwnerId,
          metadata: visitorData,
        },
        retries: 2,
        delay: 15,
      })
      .catch((err) => console.error("Profile visit error:", err));
  } catch (error) {
    // Silently handle errors to not interrupt user experience
    console.error("Error in trackProfileVisit:", error);
  }
};
