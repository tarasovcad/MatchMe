"use server";

import {createClient} from "@/utils/supabase/server";
import type {MiniCardMatchMeUser} from "@/types/user/matchMeUser";

export async function searchUsers(query: string, limit = 10): Promise<MiniCardMatchMeUser[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const supabase = await createClient();

    const {data, error} = await supabase
      .from("profiles")
      .select(
        `
        id,
        name,
        username,
        profile_image
      `,
      )
      // .eq("is_profile_public", true)
      .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error("Error searching users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in searchUsers:", error);
    return [];
  }
}
