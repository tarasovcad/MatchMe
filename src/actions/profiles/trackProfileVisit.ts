import {qstash} from "@/utils/redis/qstash";
import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";

export const trackProfileVisit = async (visitorId: string, profileOwnerId: string) => {
  if (!visitorId || !profileOwnerId || visitorId === profileOwnerId) return;

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
};
