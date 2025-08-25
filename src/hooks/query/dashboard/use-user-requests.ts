import {useQuery} from "@tanstack/react-query";
import {getUserRequests, UserRequestForProfileTab} from "@/actions/projects/getUserRequests";

export const useUserRequests = (userId: string) => {
  return useQuery<UserRequestForProfileTab[]>({
    queryKey: ["user-requests", userId],
    queryFn: async () => {
      return await getUserRequests(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
