"use server";

import {createClient} from "@/utils/supabase/server";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {SerializableFilter} from "@/store/filterStore";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";

const TABLE_NAME = "mock_profiles";

export async function getAllProfiles(
  page = 1,
  perPage: number,
  pageFilters?: SerializableFilter[],
) {
  const supabase = await createClient();

  // Calculate range for pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Query with only required columns for CardMatchMeUser
  let query = supabase
    .from(TABLE_NAME)
    .select(
      `
     id,
     name,
     username,
     profile_image,
     looking_for,
     tagline,
     skills,
     created_at,
     public_current_role,
     seniority_level
   `,
    )
    .eq("is_profile_public", true);

  // Apply filters if provided
  if (pageFilters && pageFilters.length > 0) {
    query = applyFiltersToSupabaseQuery(query, pageFilters);
  }

  // Apply pagination
  query = query.range(from, to);
  const {data, error: profilesError} = await query;

  if (profilesError) {
    console.error("Supabase query error:", profilesError);
    throw new Error(`Error fetching profiles: ${profilesError.message}`);
  }
  if (!data) {
    console.warn("No data returned from Supabase");
    return [];
  }

  return data;
}

export async function getUserFavoritesProfiles(userId: string) {
  if (!userId) return [];

  const supabase = await createClient();

  const {data, error: favoritesError} = await supabase
    .from("favorites_users")
    .select("favorite_user_id")
    .eq("user_id", userId);

  if (favoritesError) {
    console.log("Error fetching favorites:", favoritesError.message);
    return [];
  }

  return data.map((fav) => fav.favorite_user_id);
}
