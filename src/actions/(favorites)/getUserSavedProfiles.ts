"use server";

import {createClient} from "@/utils/supabase/server";
import {applyFiltersToSupabaseQuery} from "@/utils/supabase/applyFiltersToSupabaseQuery";
import {SerializableFilter} from "@/store/filterStore";
import {MatchMeUser} from "@/types/user/matchMeUser";

/**
 * Returns paginated list of profiles that the given user saved to favourites.
 * The result can be filtered using the same SerializableFilter structure that the rest
 * of the app relies on.
 */
export async function getUserSavedProfiles(
  userId: string,
  page = 1,
  perPage: number,
  filters: SerializableFilter[] = [],
): Promise<MatchMeUser[]> {
  if (!userId) return [];

  try {
    const supabase = await createClient();

    // 1. Grab all favourite user ids for this user
    const {data: favouriteIdsData, error: favouritesError} = await supabase
      .from("favorites_users")
      .select("favorite_user_id")
      .eq("user_id", userId);

    if (favouritesError) {
      console.error("Error fetching favourite ids:", favouritesError.message);
      return [];
    }

    const favouriteIds = favouriteIdsData?.map((f) => f.favorite_user_id) || [];
    if (favouriteIds.length === 0) return [];

    // 2. Build query for profiles that are in favourites list
    let query = supabase.from("profiles").select("*").in("id", favouriteIds);

    // Apply search / filter options (if any)
    if (filters && filters.length > 0) {
      query = applyFiltersToSupabaseQuery(query, filters);
    }

    // 3. Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const {data: profilesData, error: profilesError} = await query;

    if (profilesError) {
      console.error("Error fetching favourite profiles:", profilesError.message);
      return [];
    }

    // Return profiles and let the UI handle favorite status display
    return (profilesData || []) as MatchMeUser[];
  } catch (error) {
    console.error("Error in getUserSavedProfiles:", error);
    return [];
  }
}
