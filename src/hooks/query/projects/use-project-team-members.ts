import {useQuery} from "@tanstack/react-query";
import {
  getProjectTeamMembersProfiles,
  ProjectTeamMemberProfile,
} from "@/actions/projects/projectTeamMembers";

interface ProjectTeamMembersResponse {
  members: ProjectTeamMemberProfile[];
  roles: Array<{
    id: string;
    name: string;
    badge_color: string | null;
    is_default: boolean;
  }>;
  open_positions: Array<{
    title: string;
    value: string;
  }>;
  pending_requests: string[];
}

export const useProjectTeamMembers = (projectId: string) => {
  return useQuery<ProjectTeamMembersResponse>({
    queryKey: ["project-team-members-profiles", projectId],
    queryFn: async () => {
      const response = await getProjectTeamMembersProfiles(projectId);
      if (response.error) {
        // Return safe defaults instead of triggering render-time toasts/throws
        console.error("Error fetching team members:", response.error);
        return {
          members: [],
          roles: [],
          open_positions: [],
          pending_requests: [],
        };
      }
      return {
        members: response.data ?? [],
        roles: response.roles ?? [],
        open_positions: response.open_positions ?? [],
        pending_requests: response.pending_requests ?? [],
      };
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};
