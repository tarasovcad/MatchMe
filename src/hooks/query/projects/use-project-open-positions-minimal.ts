import {useQuery} from "@tanstack/react-query";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";
import {getProjectOpenPositionsMinimal} from "@/actions/projects/getProjectOpenPositionsMinimal";

export const useProjectOpenPositionsMinimal = (
  projectId: string,
  userId?: string,
  enabled: boolean = true,
) => {
  return useQuery<ProjectOpenPosition[]>({
    queryKey: ["project-open-positions-minimal", projectId, userId ?? null],
    queryFn: async () => {
      const response = await getProjectOpenPositionsMinimal(projectId, userId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data ?? [];
    },
    enabled: !!projectId && enabled,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};
