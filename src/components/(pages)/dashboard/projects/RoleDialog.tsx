"use client";

import React from "react";
import {useForm, FormProvider, useFormContext} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import {Button} from "@/components/shadcn/button";
import SimpleInput from "@/components/ui/form/SimpleInput";
import SelectInput from "@/components/ui/form/SelectInput";
import ProjectRoleBadge, {type ProjectRoleBadgeColorKey} from "@/components/ui/ProjectRoleBadge";
import type {ProjectRoleDb} from "@/actions/projects/projectsRoles";

export const COLOR_OPTIONS = [
  {key: "orange", hex: "#FF6930"},
  {key: "yellow", hex: "#FBC614"},
  {key: "green", hex: "#3CCA81"},
  {key: "red", hex: "#F77065"},
  {key: "blue", hex: "#528AFF"},
  {key: "indigo", hex: "#B493F2"},
  {key: "purple", hex: "#9A8BF9"},
  {key: "pink", hex: "#F670C6"},
  {key: "gray", hex: "#A1A2AC"},
  {key: "cyan", hex: "#22CCEE"},
] as const;

const createAddRoleSchema = (existingRoles: ProjectRoleDb[]) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, {message: "Role name must be at least 2 characters"})
      .max(24, {message: "Role name must not exceed 24 characters"})
      .regex(/^[A-Za-z0-9\s\-_]+$/, {
        message: "Role name can only include letters, numbers, spaces, dashes and underscores",
      })
      .refine(
        (name) => {
          const normalizedName = name.toLowerCase().trim();
          return !existingRoles.some((role) => role.name.toLowerCase().trim() === normalizedName);
        },
        {
          message: "A role with this name already exists",
        },
      ),
    color: z.string().nonempty("Pick a color"),
    inheritFrom: z.string().optional(),
  });

const createEditRoleSchema = (existingRoles: ProjectRoleDb[], currentRole: ProjectRoleDb) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, {message: "Role name must be at least 2 characters"})
      .max(24, {message: "Role name must not exceed 24 characters"})
      .regex(/^[A-Za-z0-9\s\-_]+$/, {
        message: "Role name can only include letters, numbers, spaces, dashes and underscores",
      })
      .refine(
        (name) => {
          const normalizedName = name.toLowerCase().trim();
          return !existingRoles.some(
            (role) =>
              role.id !== currentRole.id && role.name.toLowerCase().trim() === normalizedName,
          );
        },
        {
          message: "A role with this name already exists",
        },
      ),
    color: z.string().nonempty("Pick a color"),
    inheritFrom: z.string().optional(),
  });

export type AddRoleFormData = z.infer<ReturnType<typeof createAddRoleSchema>>;
export type EditRoleFormData = z.infer<ReturnType<typeof createEditRoleSchema>>;

// ─────────────────────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────────────────────
function ColorSwatches({disabled = false}: {disabled?: boolean}) {
  const {watch, setValue} = useFormContext<{color: string}>();
  const selected = watch("color");

  return (
    <div className="flex flex-wrap gap-3">
      {COLOR_OPTIONS.map(({key, hex}) => {
        const isSelected = selected === key;

        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => setValue("color", key, {shouldValidate: true})}
            className={`size-6.5 rounded-full transition-transform duration-100 focus:outline-none ${
              isSelected ? "scale-110" : "hover:scale-105"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            style={{
              backgroundColor: hex,
              boxShadow: isSelected ? "0 0 0 2px #ffffff, 0 0 0 4px #3F3F46" : "none",
            }}
            aria-label={key}
          />
        );
      })}
    </div>
  );
}

function BadgePreview() {
  const {watch} = useFormContext<{name: string; color: string}>();
  const name = watch("name");
  const color = watch("color");

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm text-muted-foreground">Preview</p>
      <div className="flex items-center">
        <ProjectRoleBadge color={color as ProjectRoleBadgeColorKey}>
          {name || "Role"}
        </ProjectRoleBadge>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main reusable dialog component
// ─────────────────────────────────────────────────────────────
interface RoleDialogProps {
  mode: "add" | "edit";
  trigger?: React.ReactNode;
  existingRoles: ProjectRoleDb[];
  // For edit mode
  roleData?: ProjectRoleDb;
  // Callback for add mode
  onAddRole?: (data: AddRoleFormData) => void;
  // Callback for edit mode
  onEditRole?: (data: {id: string; name: string; color: string}) => void;
  // Controlled open state (optional)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function RoleDialog({
  mode,
  trigger,
  existingRoles,
  roleData,
  onAddRole,
  onEditRole,
  open,
  onOpenChange,
}: RoleDialogProps) {
  const isEditMode = mode === "edit" && roleData;
  const isOwnerOrMember =
    isEditMode && roleData && ["owner", "member"].includes(roleData.name.toLowerCase());

  const schema = React.useMemo(() => {
    if (isEditMode && roleData) {
      return createEditRoleSchema(existingRoles, roleData);
    }
    return createAddRoleSchema(existingRoles);
  }, [existingRoles, isEditMode, roleData]);

  const methods = useForm<AddRoleFormData | EditRoleFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: isEditMode
      ? {
          name: roleData?.name ?? "",
          color: roleData?.badge_color ?? "orange",
          inheritFrom: "Start from scratch",
        }
      : {name: "", color: "orange", inheritFrom: "Start from scratch"},
  });

  const {
    handleSubmit,
    formState: {isValid},
    reset,
  } = methods;

  // Build select options for add mode only (template inheritance)
  const templateOptions = React.useMemo(() => {
    return [
      {title: "Start from scratch"},
      ...existingRoles
        .filter((role) => role.name.toLowerCase() !== "owner")
        .map((role) => ({title: role.name})),
    ];
  }, [existingRoles]);

  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }

    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const submitAndClose = handleSubmit((data) => {
    if (isEditMode) {
      onEditRole?.({id: roleData!.id, name: data.name, color: data.color});
    } else {
      onAddRole?.(data);
      reset();
    }
    handleOpenChange(false);
  });

  // For input disabling rules
  const disableName = isOwnerOrMember;
  const disableTemplate = isEditMode;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md p-4 py-6">
        <DialogHeader className="pb-2">
          <DialogTitle>{isEditMode ? "Edit role" : "Add new role"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitAndClose();
            }}
            className="space-y-5">
            {/* name */}
            <div className="space-y-2">
              <p className="font-medium text-sm">Role title</p>
              <SimpleInput
                placeholder="e.g. Designer"
                {...methods.register("name")}
                error={methods.formState.errors.name}
                readOnly={disableName}
              />
            </div>

            {/* badge colour */}
            <div className="space-y-3">
              <p className="font-medium text-sm">Badge colour</p>
              <ColorSwatches />
            </div>

            {/* badge preview */}
            <BadgePreview />

            {/* permission template (add mode) */}
            <div className="space-y-2">
              <p className="font-medium text-sm">Permission Template - Inherit from</p>
              {disableTemplate ? (
                <div className="text-sm text-muted-foreground border rounded-lg px-3 py-2 bg-muted select-none">
                  {methods.watch("inheritFrom") || "N/A"}
                </div>
              ) : (
                <SelectInput
                  id="inheritFrom-select"
                  placeholder="Select a template"
                  name="inheritFrom"
                  className=""
                  options={templateOptions}
                  error={methods.formState.errors.inheritFrom}
                />
              )}
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button variant="outline" size="xs" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button size="xs" variant="secondary" type="submit" disabled={!isValid}>
                {isEditMode ? "Save changes" : "Add role"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
