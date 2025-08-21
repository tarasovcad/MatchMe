import {useQuery} from "@tanstack/react-query";
import {getProjectRequests} from "@/actions/projects/getProjectRequests";

export const useProjectRequests = (projectId: string) => {
  return useQuery({
    queryKey: ["project-requests", projectId],
    queryFn: async () => {
      return await getProjectRequests(projectId);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
