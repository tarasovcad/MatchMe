import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {
  manageProjectRequest,
  ManageProjectRequestAction,
} from "@/actions/projects/manageProjectRequest";
import type {UserRequestForProfileTab} from "@/actions/projects/getUserRequests";

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
    onMutate: async (variables) => {
      const {action, requestId} = variables;

      // Cancel queries to avoid race conditions
      await queryClient.cancelQueries({queryKey: ["user-requests", userId]});

      // Snapshot current data
      const previousRequests = queryClient.getQueryData<UserRequestForProfileTab[]>([
        "user-requests",
        userId,
      ]);

      // Optimistic update of status in user requests list
      if (previousRequests) {
        const updatedRequests = previousRequests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status:
                  action === "accept"
                    ? ("accepted" as const)
                    : action === "reject"
                      ? ("rejected" as const)
                      : action === "cancel"
                        ? ("cancelled" as const)
                        : r.status,
                updated_at: new Date().toISOString(),
              }
            : r,
        );
        queryClient.setQueryData(["user-requests", userId], updatedRequests);
      }

      return {previousRequests};
    },
    onError: (_error, _variables, context) => {
      // Revert optimistic update
      if (context?.previousRequests) {
        queryClient.setQueryData(["user-requests", userId], context.previousRequests);
      }
      toast.error("Failed to process request");
    },
    onSuccess: (result, variables) => {
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const {action} = variables;

      // Show appropriate success message based on action
      const actionMessages = {
        accept: "Invitation accepted successfully!",
        reject: "Invitation declined",
        cancel: "Application cancelled",
        resend: "Resent successfully",
      } as const;

      toast.success(actionMessages[action as keyof typeof actionMessages] || result.message);

      // Invalidate user requests to get fresh data
      queryClient.invalidateQueries({queryKey: ["user-requests", userId]});

      // Also refresh notifications since these actions affect notifications
      queryClient.invalidateQueries({queryKey: ["notifications"]});

      // Refresh notification counts
      queryClient.invalidateQueries({queryKey: ["notification-group-counts"]});
    },
  });
}
