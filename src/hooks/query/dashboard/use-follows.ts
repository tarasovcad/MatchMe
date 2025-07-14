import {useQuery} from "@tanstack/react-query";
import {getUserFollowsCount} from "@/actions/(follows)/getUserFollows";

export const useFollowCounts = (userId: string) => {
  return useQuery({
    queryKey: ["follow-counts", userId],
    queryFn: async () => {
      const [followers, following] = await Promise.all([
        getUserFollowsCount(userId, "followers"),
        getUserFollowsCount(userId, "following"),
      ]);
      return {
        followers,
        following,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
