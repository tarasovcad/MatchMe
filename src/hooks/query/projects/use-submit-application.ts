import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
  submitProjectApplication,
  SubmitProjectApplicationData,
} from "@/actions/projects/submitProjectApplication";
import {toast} from "sonner";

export const useSubmitProjectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitProjectApplicationData) => submitProjectApplication(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast.success("Application submitted successfully!");

        // Invalidate related queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ["project-open-positions-minimal", variables.project_id],
        });

        // You might also want to invalidate user's applications if you have that query
        queryClient.invalidateQueries({
          queryKey: ["user-applications"],
        });
      } else {
        toast.error("Failed to submit application", {
          description: result.error || "An unexpected error occurred. Please try again.",
        });
      }
    },
    onError: (error: Error) => {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application", {
        description: "An unexpected error occurred. Please try again.",
      });
    },
  });
};
