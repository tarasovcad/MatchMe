import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
  manageProjectRequest,
  ManageProjectRequestAction,
} from "@/actions/projects/manageProjectRequest";

interface ProjectRequestItem {
  id: string;
  status: string;
  updated_at: string;
}

interface UseManageProjectRequestParams {
  requestId: string | null;
  action: ManageProjectRequestAction;
  projectId: string;
}

export function useManageProjectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({requestId, projectId, action}: UseManageProjectRequestParams) => {
      return manageProjectRequest({requestId, projectId, action});
    },
    onSuccess: (result, variables) => {
      const {projectId, action} = variables;
      if (!result.success) return;

      // Invalidate the requests for fresh data
      queryClient.invalidateQueries({queryKey: ["project-requests", projectId]});

      // Invalidate open positions to refresh applicant counts
      queryClient.invalidateQueries({queryKey: ["project-open-positions", projectId]});

      // If accepted, refresh team members to reflect change
      if (action === "accept") {
        queryClient.invalidateQueries({
          queryKey: ["project-team-members-profiles", projectId],
        });
      }
      // Also refresh any notifications lists
      queryClient.invalidateQueries({queryKey: ["notifications"]});
    },
  });
}
