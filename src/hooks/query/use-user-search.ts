import {useQuery} from "@tanstack/react-query";
import {searchUsers} from "@/actions/profiles/searchUsers";
import type {MiniCardMatchMeUser} from "@/types/user/matchMeUser";

interface UserSearchParams {
  query: string;
  limit?: number;
}

const fetchUserSearch = async ({
  query,
  limit = 10,
}: UserSearchParams): Promise<MiniCardMatchMeUser[]> => {
  if (!query.trim()) {
    return [];
  }

  return await searchUsers(query, limit);
};

export const useUserSearch = (query: string, limit = 10) => {
  return useQuery({
    queryKey: ["user-search", query, limit],
    queryFn: () => fetchUserSearch({query, limit}),
    enabled: !!query.trim() && query.length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
