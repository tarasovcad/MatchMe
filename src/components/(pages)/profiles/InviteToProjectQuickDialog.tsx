"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/shadcn/dialog";
import {Button} from "@/components/shadcn/button";
import SelectInputWithSearch from "@/components/ui/form/SelectInputWithSearch";
import {useProjectsUserCanInviteTo} from "@/hooks/query/projects/use-projects-user-can-invite-to";
import {useCreateProjectRequest} from "@/hooks/query/projects/use-create-project-request";
import {toast} from "sonner";
import {FormProvider, useForm} from "react-hook-form";

export default function InviteToProjectQuickDialog({
  targetUserId,
  open,
  onOpenChange,
}: {
  targetUserId: string;
  open: boolean;
  onOpenChange: (val: boolean) => void;
}) {
  const methods = useForm<{project: string}>({
    mode: "onChange",
    defaultValues: {project: ""},
  });

  const {data, isLoading, isError} = useProjectsUserCanInviteTo();
  const createInviteMutation = useCreateProjectRequest();

  const options = data?.options ?? [];

  const handleSend = async () => {
    const selectedProjectId = methods.getValues("project");
    if (!selectedProjectId) {
      toast.error("Select a project first");
      return;
    }

    try {
      await createInviteMutation.mutateAsync({
        project_id: selectedProjectId,
        user_id: targetUserId,
      });
      if (!createInviteMutation.isError) {
        onOpenChange(false);
        methods.reset();
      }
    } catch (e) {
      // handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 py-6">
        <DialogHeader className="pb-2">
          <DialogTitle>Invite to one of your projects</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="font-medium text-sm">Choose project</p>
              <SelectInputWithSearch
                id="project"
                placeholder={isLoading ? "Loading projects..." : "Select a project"}
                name="project"
                options={options}
                error={isError ? {message: "Failed to load projects"} : undefined}
              />
            </div>
          </div>
        </FormProvider>

        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button variant="outline" size="xs" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button size="xs" variant="secondary" onClick={handleSend}>
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
