import {useQuery} from "@tanstack/react-query";
import {
  getProjectOpenPositions,
  ProjectOpenPositionDb,
} from "@/actions/projects/getProjectOpenPositions";

export const useProjectOpenPositions = (projectId: string) => {
  return useQuery<ProjectOpenPositionDb[]>({
    queryKey: ["project-open-positions", projectId],
    queryFn: async () => {
      const response = await getProjectOpenPositions(projectId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data ?? [];
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
