import {useQuery} from "@tanstack/react-query";
import {getProjectTeamMembersMinimal} from "@/actions/projects/getProjectTeamMembersMinimal";
import {ProjectTeamMemberMinimal} from "@/types/user/matchMeUser";

export function useProjectTeamMembersMinimal(projectId: string, currentUserId?: string) {
  return useQuery<ProjectTeamMemberMinimal[]>({
    queryKey: ["project-team-members-minimal", projectId, currentUserId ?? null],
    queryFn: async () => {
      const {data, error} = await getProjectTeamMembersMinimal(projectId, currentUserId);
      if (error) throw new Error(error);
      return data ?? [];
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}
