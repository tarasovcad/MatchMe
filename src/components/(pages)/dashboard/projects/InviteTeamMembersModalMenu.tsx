"use client";

import React, {useState} from "react";
import {useForm, FormProvider} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogDescription,
} from "@/components/shadcn/dialog";
import {Button} from "@/components/shadcn/button";
import SelectInput from "@/components/ui/form/SelectInput";
import {Plus} from "lucide-react";
import AutogrowingTextarea from "@/components/ui/form/AutogrowingTextarea";
import UserSearchDropdown from "@/components/ui/form/UserSearchDropdown";
import {toast} from "sonner";
import SelectInputWithSearch from "@/components/ui/form/SelectInputWithSearch";
import {createProjectRequest} from "@/actions/projects/projectTeamMembers";

const inviteTeamMemberSchema = z.object({
  searchUsers: z.string().trim(),
  _selectedUserId: z.string().min(1, "Please select a user to invite"),
  role: z.string().nonempty("Please select a role"),
  position: z.string().optional(),
  message: z
    .string()
    .trim()
    .max(500, {message: "Message must not exceed 500 characters"})
    .optional(),
});

export type InviteTeamMemberFormData = z.infer<typeof inviteTeamMemberSchema>;

interface SimpleProjectRole {
  id: string;
  name: string;
  badge_color: string | null;
}

interface InviteTeamMembersModalMenuProps {
  projectId: string;
  availableRoles: SimpleProjectRole[];
  onInviteUser?: (data: InviteTeamMemberFormData) => void;
  disabled?: boolean;
  availablePositions: Array<{
    title: string;
    value: string;
  }>;
}

const InviteTeamMembersModalMenu = ({
  projectId,
  availableRoles,
  onInviteUser,
  disabled,
  availablePositions,
}: InviteTeamMembersModalMenuProps) => {
  const methods = useForm<InviteTeamMemberFormData>({
    resolver: zodResolver(inviteTeamMemberSchema),
    mode: "onChange",
    defaultValues: {
      searchUsers: "",
      _selectedUserId: "",
      role: "Member",
      position: "",
      message: "",
    },
  });
  console.log(availablePositions);
  const {
    handleSubmit,
    formState: {isValid},
    reset,
  } = methods;

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAndClose = handleSubmit(async (data) => {
    if (!data._selectedUserId) {
      toast.error("Please select a user to invite");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createProjectRequest({
        project_id: projectId,
        user_id: data._selectedUserId,
        position_id: data.position || undefined,
      });

      if (result.success) {
        onInviteUser?.(data);
        reset();
        toast.success("Invite sent successfully");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to send invite");
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Reset form when modal is closed
    if (!newOpen) {
      reset();
    }
  };

  // Build role options for dropdown
  const roleOptions = React.useMemo(
    () =>
      availableRoles
        .filter((role) => role.name.toLowerCase() !== "owner") // Don't allow inviting as owner
        .map((role) => ({title: role.name})),
    [availableRoles],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="xs" disabled={disabled}>
          <Plus className="w-4 h-4" />
          Invite
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-4 py-6">
        <DialogHeader className="pb-2">
          <DialogTitle>Invite team members</DialogTitle>
          <DialogDescription>
            Search for users and invite them to your project team
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitAndClose();
            }}
            className="space-y-5">
            {/* Search users */}
            <div className="space-y-2">
              <p className="font-medium text-sm">Search users</p>
              <UserSearchDropdown
                name="searchUsers"
                selectedUserIdField="_selectedUserId"
                placeholder="Search by username or name..."
                error={
                  methods.formState.errors.searchUsers || methods.formState.errors._selectedUserId
                }
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
                error={methods.formState.errors.role}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1">
                <p className="font-medium  text-sm">Assign position</p>
                <span className="text-muted-foreground text-sm">Optional</span>
              </div>

              <SelectInputWithSearch
                id="position"
                placeholder="Select a position"
                name="position"
                options={availablePositions}
                error={methods.formState.errors.position}
              />
            </div>

            {/* Message to user */}
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
                error={methods.formState.errors.message}
              />
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button variant="outline" size="xs" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                size="xs"
                variant="secondary"
                type="submit"
                disabled={!isValid || isSubmitting}>
                {isSubmitting ? "Sending..." : "Send invite"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default InviteTeamMembersModalMenu;
