import {useQuery} from "@tanstack/react-query";
import {getUserFavoritesProfiles} from "@/actions/profiles/profiles";

export const useSavedCounts = (userId: string) => {
  return useQuery({
    queryKey: ["saved-counts", userId],
    queryFn: async () => {
      const favoriteProfileIds = await getUserFavoritesProfiles(userId);
      return {
        profiles: favoriteProfileIds.length,
      } as {profiles: number};
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
