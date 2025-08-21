import {useQuery} from "@tanstack/react-query";
import {searchProfiles, SearchProfileResult} from "@/actions/profiles/searchProfiles";

export const useSearchProfiles = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ["search-profiles", query],
    queryFn: () => searchProfiles(query),
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
