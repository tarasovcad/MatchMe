import {getUserProjects, checkProjectAccess} from "@/actions/projects/projects";
import {useQuery} from "@tanstack/react-query";

export const useUserProjects = (userId: string) => {
  return useQuery({
    queryKey: ["user-projects", userId],
    queryFn: () => getUserProjects(userId),
    enabled: !!userId,
  });
};

/**
 * Hook to check if current user has access to a project
 * Returns project data with user permission level
 */
export const useProjectAccess = (slug: string, userId: string) => {
  return useQuery({
    queryKey: ["project-access", slug, userId],
    queryFn: () => checkProjectAccess(slug, userId),
    enabled: !!slug && !!userId,
    retry: false, // Don't retry on access denied
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
