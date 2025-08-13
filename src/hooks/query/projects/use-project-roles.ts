import {useQuery} from "@tanstack/react-query";
import {getAllProjectRoles} from "@/actions/projects/projectsRoles";

export const useProjectRoles = (projectId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["project-roles", projectId],
    queryFn: async () => {
      const response = await getAllProjectRoles(projectId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data ?? [];
    },
    enabled: !!projectId && enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};
