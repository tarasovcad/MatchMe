import {useQuery} from "@tanstack/react-query";
import {supabase} from "@/utils/supabase/client";

export const useSavedCounts = (userId: string) => {
  return useQuery({
    queryKey: ["saved-counts", userId],
    queryFn: async () => {
      // Count favorite profiles
      const {count: favoriteProfilesCount, error: favoriteProfilesError} = await supabase
        .from("favorites_users")
        .select("*", {count: "exact", head: true})
        .eq("user_id", userId);
      if (favoriteProfilesError) throw favoriteProfilesError;

      // Count favorite projects
      const {count: favoriteProjectsCount, error: favoriteProjectsError} = await supabase
        .from("favorites_projects")
        .select("*", {count: "exact", head: true})
        .eq("user_id", userId);
      if (favoriteProjectsError) throw favoriteProjectsError;

      // Count favorite open positions
      const {count: favoriteOpenPositionsCount, error: favoriteOpenPositionsError} = await supabase
        .from("favorites_open_positions")
        .select("*", {count: "exact", head: true})
        .eq("user_id", userId);
      if (favoriteOpenPositionsError) throw favoriteOpenPositionsError;

      return {
        profiles: favoriteProfilesCount ?? 0,
        projects: favoriteProjectsCount ?? 0,
        openPositions: favoriteOpenPositionsCount ?? 0,
      } as {profiles: number; projects: number; openPositions: number};
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Reduce refetch delay for faster updates
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Allow immediate updates from cache
    refetchOnReconnect: false,
  });
};
