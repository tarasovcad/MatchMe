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
} from "@/components/shadcn/dialog";
import {Button} from "@/components/shadcn/button";
import SimpleInput from "@/components/ui/form/SimpleInput";
import SelectInput from "@/components/ui/form/SelectInput";

const editMemberRoleSchema = z.object({
  newRole: z.string().nonempty("Select a new role"),
});

export type EditMemberRoleFormData = z.infer<typeof editMemberRoleSchema>;

type Member = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  currentRole: string;
  roleBadgeName: string;
  roleBadgeColor: string | null;
};

type Role = {
  id: string;
  name: string;
  badge_color: string | null;
};

interface EditMemberRoleDialogProps {
  member: Member;
  availableRoles: Role[];
  trigger?: React.ReactNode;
  onUpdateRole?: (memberId: string, newRoleId: string) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function EditMemberRoleDialog({
  member,
  availableRoles,
  trigger,
  onUpdateRole,
  open,
  onOpenChange,
}: EditMemberRoleDialogProps) {
  const methods = useForm<EditMemberRoleFormData>({
    resolver: zodResolver(editMemberRoleSchema),
    mode: "onChange",
    defaultValues: {
      newRole: "",
    },
  });

  const {
    handleSubmit,
    formState: {isValid},
    reset,
  } = methods;

  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset(); // Reset form when dialog closes
    }

    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const submitAndClose = handleSubmit(async (data) => {
    if (onUpdateRole && data.newRole) {
      // Convert role name back to role ID
      const roleId = roleNameToIdMap[data.newRole];
      if (roleId) {
        await onUpdateRole(member.id, roleId);
      } else {
        console.error("Could not find role ID for role name:", data.newRole);
      }
    }
    reset();
  });

  // Build role options for dropdown
  const roleOptions = React.useMemo(() => {
    return availableRoles
      .filter((role) => role.name.toLowerCase() !== "owner") // Don't allow changing to owner
      .filter((role) => role.name.toLowerCase() !== member.roleBadgeName.toLowerCase()) // Don't allow changing to same role
      .map((role) => ({title: role.name}));
  }, [availableRoles, member.roleBadgeName]);

  // Create a map to convert role names back to IDs
  const roleNameToIdMap = React.useMemo(() => {
    return availableRoles.reduce(
      (acc, role) => {
        acc[role.name] = role.id;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [availableRoles]);

  // Check if there are any available roles to change to
  const hasAvailableRoles = roleOptions.length > 0;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md p-4 py-6">
        <DialogHeader className="pb-2">
          <DialogTitle>Edit Member Role</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitAndClose();
            }}
            className="space-y-5">
            {/* Current Role (disabled) */}
            <div className="space-y-2">
              <p className="font-medium text-sm">Current Role</p>
              <SimpleInput value={member.roleBadgeName} readOnly className="bg-muted/50" />
            </div>

            {/* New Role */}
            <div className="space-y-2">
              <p className="font-medium text-sm">New Role</p>
              {hasAvailableRoles ? (
                <SelectInput
                  id="newRole-select"
                  placeholder="Select a new role"
                  name="newRole"
                  className=""
                  options={roleOptions}
                  error={methods.formState.errors.newRole}
                />
              ) : (
                <div className="p-3 border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    No other roles available for this member
                  </p>
                </div>
              )}
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
                disabled={!isValid || !hasAvailableRoles}>
                Update Role
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
