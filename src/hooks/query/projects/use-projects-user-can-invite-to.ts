import {useQuery} from "@tanstack/react-query";
import {getProjectsUserCanInviteTo} from "@/actions/projects/getProjectsUserCanInviteTo";

export function useProjectsUserCanInviteTo(enabled: boolean = true) {
  return useQuery({
    queryKey: ["projects-user-can-invite-to"],
    queryFn: async () => {
      const result = await getProjectsUserCanInviteTo();
      if (result.error) throw new Error(result.error);
      return result;
    },
    enabled,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}
