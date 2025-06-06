import {redis} from "@/utils/redis/redis";
import {createClient} from "@/utils/supabase/server";

type ProfileInteractionType = "follow" | "message" | "save_to_favourites" | "share";

export async function postProfileInteraction(
  profileId: string,
  interactedBy: string,
  type: ProfileInteractionType,
) {
  try {
    const key = `profile_interactions:${type}:${profileId}_by_${interactedBy}`;

    const cachedInteraction = await redis.get(key);

    if (cachedInteraction) {
      return {
        success: true,
        message: "Profile interaction already exists",
        data: cachedInteraction,
      };
    }

    const supabase = await createClient();

    const {data, error} = await supabase
      .from("profile_interactions")
      .insert([
        {
          profile_id: profileId,
          interacted_by: interactedBy,
          type: type,
        },
      ])
      .select();

    await redis.set(key, JSON.stringify(1), {ex: 60 * 60 * 6});

    if (error) {
      console.error("Error posting profile interaction:", error.message);
      return {success: false, message: "Error posting profile interaction", error};
    }

    return {success: true, message: "Profile interaction posted successfully", data};
  } catch (error) {
    console.error("Error posting profile interaction:", error);
    return {success: false, message: "Error posting profile interaction", error};
  }
}
