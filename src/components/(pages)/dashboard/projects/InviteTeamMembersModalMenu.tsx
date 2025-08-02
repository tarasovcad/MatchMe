"use client";

import React from "react";
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
import type {ProjectRoleDb} from "@/actions/projects/projectsRoles";
import AutogrowingTextarea from "@/components/ui/form/AutogrowingTextarea";
import UserSearchDropdown from "@/components/ui/form/UserSearchDropdown";
import {toast} from "sonner";

const inviteTeamMemberSchema = z.object({
  searchUsers: z.string().trim(),
  _selectedUserId: z.string().min(1, "Please select a user to invite"),
  role: z.string().nonempty("Please select a role"),
  inviteExpiry: z.string().nonempty("Please select an expiry time"),
  message: z
    .string()
    .trim()
    .max(500, {message: "Message must not exceed 500 characters"})
    .optional(),
});

export type InviteTeamMemberFormData = z.infer<typeof inviteTeamMemberSchema>;

interface InviteTeamMembersModalMenuProps {
  availableRoles: ProjectRoleDb[];
  onInviteUser?: (data: InviteTeamMemberFormData) => void;
}

const InviteTeamMembersModalMenu = ({
  availableRoles,
  onInviteUser,
}: InviteTeamMembersModalMenuProps) => {
  const methods = useForm<InviteTeamMemberFormData>({
    resolver: zodResolver(inviteTeamMemberSchema),
    mode: "onChange",
    defaultValues: {
      searchUsers: "",
      _selectedUserId: "",
      role: "Member",
      inviteExpiry: "7 days",
      message: "",
    },
  });

  const {
    handleSubmit,
    formState: {isValid},
    reset,
  } = methods;

  const [open, setOpen] = React.useState(false);

  const submitAndClose = handleSubmit((data) => {
    if (data._selectedUserId) {
      onInviteUser?.(data);
      reset();
      // TODO: Send email to user
      toast.success("Invite sent successfully");
      toast.info("");
      setOpen(false);
    } else {
      console.log("No user selected, cannot submit form");
      toast.error("Please select a user to invite");
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
        <Button variant="secondary" size="xs">
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

            {/* Message to user */}
            <div className="space-y-2">
              <p className="font-medium text-sm">Message (optional)</p>
              <AutogrowingTextarea
                id="message"
                placeholder="Hey! I’d love for you to join our team on AI recruiting – we’re building something amazing together."
                name="message"
                register={methods.register("message")}
                error={methods.formState.errors.message}
              />
            </div>

            <div className="space-y-2">
              <p className="font-medium text-sm">Invite expiry</p>
              <SelectInput
                id="invite-expiry"
                placeholder="Select expiry time"
                name="inviteExpiry"
                className=""
                options={[
                  {title: "1 day"},
                  {title: "3 days"},
                  {title: "7 days"},
                  {title: "14 days"},
                  {title: "30 days"},
                ]}
                error={methods.formState.errors.inviteExpiry}
              />
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button variant="outline" size="xs" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button size="xs" variant="secondary" type="submit" disabled={!isValid}>
                Send invite
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default InviteTeamMembersModalMenu;
