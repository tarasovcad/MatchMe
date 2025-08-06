import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {handleProjectRequest} from "@/actions/projects/handleProjectRequest";

interface UseHandleProjectRequestParams {
  requestId: string;
  action: "accept" | "reject";
}

export const useHandleProjectRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({requestId, action}: UseHandleProjectRequestParams) => {
      return handleProjectRequest({requestId, action});
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success(result.message);

        // Invalidate relevant queries to refresh the UI
        queryClient.invalidateQueries({queryKey: ["notifications"]});
        queryClient.invalidateQueries({queryKey: ["project-requests"]});

        // If accepted, also invalidate team members
        if (variables.action === "accept" && result.data?.projectId) {
          queryClient.invalidateQueries({
            queryKey: ["project-team-members", result.data.projectId],
          });
        }
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      console.error("Error handling project request:", error);
      toast.error("Something went wrong. Please try again.");
    },
  });
};
