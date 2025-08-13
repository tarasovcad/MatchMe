"use client";

import React, {useEffect, useMemo, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/shadcn/dialog";
import {Button} from "@/components/shadcn/button";
import SelectInputWithSearch from "@/components/ui/form/SelectInputWithSearch";
import SelectInput from "@/components/ui/form/SelectInput";
import AutogrowingTextarea from "@/components/ui/form/AutogrowingTextarea";
import {FormProvider, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useProjectsUserCanInviteTo} from "@/hooks/query/projects/use-projects-user-can-invite-to";
import {useProjectRoles} from "@/hooks/query/projects/use-project-roles";
import {useProjectOpenPositions} from "@/hooks/query/projects/use-project-open-positions";
import {useCreateProjectRequest} from "@/hooks/query/projects/use-create-project-request";
import {toast} from "sonner";
import {X} from "lucide-react";
import {useProjectRequests} from "@/hooks/query/projects/use-project-requests";
import Alert from "@/components/ui/Alert";

const inviteSchema = z.object({
  project: z.string().min(1, "Select a project"),
  role: z.string().min(1, "Please select a role"),
  position: z.string().optional(),
  message: z
    .string()
    .trim()
    .max(500, {message: "Message must not exceed 500 characters"})
    .optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

type ProjectRequestMinimal = {
  user_id: string;
  direction: "invite" | "application";
  status: "pending" | "accepted" | "rejected" | "cancelled";
  user_name?: string | null;
};

export default function InviteUserToProjectDialog({
  targetUserId,
  targetUserName,
  open,
  onOpenChange,
}: {
  targetUserId: string;
  targetUserName?: string;
  open: boolean;
  onOpenChange: (val: boolean) => void;
}) {
  const methods = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    mode: "onChange",
    defaultValues: {project: "", role: "", position: "", message: ""},
  });

  const {
    watch,
    setValue,
    formState: {isValid},
    reset,
  } = methods;

  const selectedProjectId = watch("project");

  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
  } = useProjectsUserCanInviteTo(open);
  const projectOptions = useMemo(() => projectsData?.options ?? [], [projectsData]);

  // Fetch requests for the selected project to detect existing pending invite
  const {data: projectRequests = [], isLoading: isRequestsLoading} =
    useProjectRequests(selectedProjectId);

  const hasPendingInvite = useMemo(() => {
    if (!projectRequests || !targetUserId) return false;
    const typed = projectRequests as ProjectRequestMinimal[];
    return typed.some(
      (r) => r.user_id === targetUserId && r.direction === "invite" && r.status === "pending",
    );
  }, [projectRequests, targetUserId]);

  // Only fetch roles/positions if no pending invite exists
  const {data: roles = [], isLoading: isLoadingRoles} = useProjectRoles(
    selectedProjectId,
    !!selectedProjectId && !hasPendingInvite,
  );
  const {data: positions = [], isLoading: isLoadingPositions} = useProjectOpenPositions(
    selectedProjectId,
    !!selectedProjectId && !hasPendingInvite,
  );

  const createInviteMutation = useCreateProjectRequest();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear role/position when project changes
  useEffect(() => {
    setValue("role", "");
    setValue("position", "");
  }, [selectedProjectId, setValue]);

  const roleOptions = useMemo(
    () =>
      roles
        .filter((r) => r.name.toLowerCase() !== "owner")
        .map((r) => ({title: r.name, value: r.id})),
    [roles],
  );
  const positionOptions = useMemo(
    () => positions.map((p) => ({title: p.title, value: p.id})),
    [positions],
  );

  // Auto-select the project if only one is available
  useEffect(() => {
    const current = methods.getValues("project");
    if (open && projectOptions.length === 1 && !current) {
      setValue("project", projectOptions[0].value, {shouldValidate: true});
    }
  }, [open, projectOptions, setValue]);

  // Disable other inputs until project is selected, no pending invite, and data loaded
  const isDetailsDisabled =
    !selectedProjectId ||
    hasPendingInvite ||
    isLoadingRoles ||
    isLoadingPositions ||
    isRequestsLoading;

  // Check if we're still loading critical data for the selected project
  const isLoadingCriticalData =
    !!selectedProjectId &&
    !hasPendingInvite &&
    (isLoadingRoles || isLoadingPositions || isRequestsLoading);

  // Check if user has no projects
  const hasNoProjects = !isLoadingProjects && projectOptions.length === 0;

  const handleSend = async () => {
    const values = methods.getValues();
    if (!values.project) {
      toast.error("Select a project first");
      return;
    }
    if (!values.role) {
      toast.error("Please select a role");
      return;
    }
    if (hasPendingInvite) {
      toast.error("User already has a pending invite for this project");
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedRoleId = values.role || roles.find((r) => r.is_default)?.id;
      await createInviteMutation.mutateAsync({
        project_id: values.project,
        user_id: targetUserId,
        position_id: values.position || undefined,
        role_id: selectedRoleId || undefined,
      });
      if (!createInviteMutation.isError) {
        onOpenChange(false);
        reset();
      }
    } catch (e) {
      // handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-4 py-6" disableClose={false}>
        <DialogHeader className="pb-2 relative">
          <div className="flex flex-row justify-between items-start gap-2">
            <div className="flex flex-col">
              <DialogTitle>Invite to one of your projects</DialogTitle>
              <DialogDescription>Select project and details for the invite</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button size={"icon"} className="w-6 h-6">
                <X size={12} />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        {hasPendingInvite && selectedProjectId && (
          <Alert
            title="Pending request exists"
            message={`${targetUserName || "This user"} already has a pending request for this project.`}
            type="warning"
          />
        )}

        {/* No projects available */}
        {!isLoadingProjects && projectOptions.length === 0 && (
          <Alert
            title="No projects available"
            message="You need to create a project first before you can invite team members. Create your first project to get started."
            type="warning"
          />
        )}

        <FormProvider {...methods}>
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="font-medium text-sm">Choose project</p>
              <SelectInputWithSearch
                id="project"
                placeholder={
                  isLoadingProjects
                    ? "Loading projects..."
                    : projectOptions.length === 0
                      ? "No projects available"
                      : "Select a project"
                }
                name="project"
                options={projectOptions}
                error={isProjectsError ? {message: "Failed to load projects"} : undefined}
                loading={isLoadingProjects}
                disabled={projectOptions.length === 0}
              />
            </div>

            {/* Role selection */}
            <div className="space-y-2">
              <p className="font-medium text-sm">Assign role</p>
              <SelectInput
                id="role-select"
                placeholder="Select a role"
                name="role"
                className=""
                options={roleOptions}
                disabled={isDetailsDisabled}
                loading={!!selectedProjectId && !hasPendingInvite && isLoadingRoles}
              />
            </div>

            {/* Position selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1">
                <p className="font-medium  text-sm">Assign position</p>
                <span className="text-muted-foreground text-sm">Optional</span>
              </div>

              <SelectInputWithSearch
                id="position"
                placeholder="Select a position"
                name="position"
                options={positionOptions}
                disabled={isDetailsDisabled}
                loading={!!selectedProjectId && !hasPendingInvite && isLoadingPositions}
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-medium text-sm">Message</p>
                  <span className="text-muted-foreground text-sm">Optional</span>
                </div>
                <AutogrowingTextarea
                  id="message"
                  placeholder="Hey! I’d love for you to join our team on AI recruiting – we’re building something amazing together."
                  name="message"
                  register={methods.register("message")}
                  disabled={isDetailsDisabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                A friendly message helps increase acceptance rates
              </p>
            </div>
          </div>
        </FormProvider>

        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button variant="outline" size="xs" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="xs"
            variant="secondary"
            onClick={handleSend}
            disabled={!isValid || isSubmitting || isLoadingCriticalData || hasNoProjects}>
            {isSubmitting ? "Sending..." : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
