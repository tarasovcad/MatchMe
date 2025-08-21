import {useQuery} from "@tanstack/react-query";
import {getProjectOpenPositions} from "@/actions/projects/getProjectOpenPositions";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";

export const useProjectOpenPositions = (projectId: string, enabled: boolean = true) => {
  return useQuery<ProjectOpenPosition[]>({
    queryKey: ["project-open-positions", projectId],
    queryFn: async () => {
      const response = await getProjectOpenPositions(projectId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data ?? [];
    },
    enabled: !!projectId && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
