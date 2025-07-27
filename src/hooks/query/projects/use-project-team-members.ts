import {useQuery} from "@tanstack/react-query";
import {
  getProjectTeamMembersProfiles,
  ProjectTeamMemberProfile,
} from "@/actions/projects/projectTeamMembers";

export const useProjectTeamMembers = (projectId: string) => {
  return useQuery<ProjectTeamMemberProfile[]>({
    queryKey: ["project-team-members-profiles", projectId],
    queryFn: async () => {
      const response = await getProjectTeamMembersProfiles(projectId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data ?? [];
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};
