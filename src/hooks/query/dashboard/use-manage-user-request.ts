import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
  manageProjectRequest,
  ManageProjectRequestAction,
} from "@/actions/projects/manageProjectRequest";

interface UseManageUserRequestParams {
  requestId: string;
  action: ManageProjectRequestAction;
  projectId: string;
}

export function useManageUserRequest(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({requestId, projectId, action}: UseManageUserRequestParams) => {
      return manageProjectRequest({requestId, projectId, action});
    },
    onSuccess: (result) => {
      if (!result.success) return;

      // Invalidate user requests to get fresh data
      queryClient.invalidateQueries({queryKey: ["user-requests", userId]});

      // Also refresh notifications since these actions affect notifications
      queryClient.invalidateQueries({queryKey: ["notifications"]});

      // Refresh notification counts
      queryClient.invalidateQueries({queryKey: ["notification-group-counts"]});
    },
  });
}
