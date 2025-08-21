import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
  createProjectRequest,
  CreateProjectRequestData,
} from "@/actions/projects/projectTeamMembers";
import {toast} from "sonner";

export function useCreateProjectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectRequestData) => createProjectRequest(data),
    onMutate: async (variables) => {
      // Optimistically we could add to pending requests list; for now just cancel fetches
      await queryClient.cancelQueries({queryKey: ["project-requests", variables.project_id]});
      return {};
    },
    onSuccess: (result, variables) => {
      if (!result.success) {
        toast.error(result.error || "Failed to send invite");
        return;
      }
      // Refresh requests list so the new pending invite appears
      queryClient.invalidateQueries({queryKey: ["project-requests", variables.project_id]});

      // Refresh open positions to update applicant counts
      queryClient.invalidateQueries({queryKey: ["project-open-positions", variables.project_id]});

      toast.success("Invite sent successfully");
    },
    onError: () => {
      toast.error("Failed to send invite");
    },
  });
}
