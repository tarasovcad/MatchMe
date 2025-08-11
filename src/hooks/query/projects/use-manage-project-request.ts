import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
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
    onMutate: async (variables) => {
      const {projectId, action, requestId} = variables;

      // Cancel queries to avoid race conditions
      await Promise.all([queryClient.cancelQueries({queryKey: ["project-requests", projectId]})]);

      // Snapshot current data
      const previousRequests = queryClient.getQueryData<ProjectRequestItem[]>([
        "project-requests",
        projectId,
      ]);

      // Optimistic update of status in table
      if (previousRequests) {
        const next = previousRequests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status:
                  action === "accept"
                    ? "accepted"
                    : action === "reject"
                      ? "rejected"
                      : action === "cancel"
                        ? "cancelled"
                        : action === "reset"
                          ? "pending"
                          : r.status,
                updated_at: new Date().toISOString(),
              }
            : r,
        );
        queryClient.setQueryData(["project-requests", projectId], next);
      }

      return {previousRequests};
    },
    onError: (_error, variables, context) => {
      // Revert optimistic update
      if (context?.previousRequests && variables.projectId) {
        queryClient.setQueryData(
          ["project-requests", variables.projectId],
          context.previousRequests,
        );
      }
      toast.error("Failed to process request");
    },
    onSuccess: (result, variables) => {
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);

      const {projectId, action} = variables;

      // Invalidate the requests for fresh data
      queryClient.invalidateQueries({queryKey: ["project-requests", projectId]});

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
