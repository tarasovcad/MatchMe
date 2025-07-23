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
import type {ProjectRoleDb} from "@/actions/projects/projectsRoles";

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
    // Optional permission template to inherit from (role name)
    inheritFrom: z.string().optional(),
  });

export type AddRoleFormData = z.infer<ReturnType<typeof createAddRoleSchema>>;

const COLOR_OPTIONS = [
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

function ColorSwatches() {
  const {watch, setValue} = useFormContext<AddRoleFormData>();
  const selected = watch("color");

  return (
    <div className="flex flex-wrap gap-3">
      {COLOR_OPTIONS.map(({key, hex}) => {
        const isSelected = selected === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => setValue("color", key, {shouldValidate: true})}
            className={`size-6.5 rounded-full transition-transform duration-100 focus:outline-none ${
              isSelected ? "scale-110" : "hover:scale-105"
            }`}
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

interface AddRoleDialogProps {
  trigger?: React.ReactNode;
  onAddRole: (data: AddRoleFormData) => void;
  existingRoles: ProjectRoleDb[];
}

export default function AddRoleDialog({trigger, onAddRole, existingRoles}: AddRoleDialogProps) {
  const addRoleSchema = React.useMemo(() => createAddRoleSchema(existingRoles), [existingRoles]);

  const methods = useForm<AddRoleFormData>({
    resolver: zodResolver(addRoleSchema),
    mode: "onChange",
    defaultValues: {name: "", color: "orange", inheritFrom: "Start from scratch"},
  });

  const {
    handleSubmit,
    formState: {isValid},
    reset,
  } = methods;

  const submitAndClose = handleSubmit((data) => {
    onAddRole(data);
    reset();
  });

  // Build select options: default scratch + existing roles
  const templateOptions = React.useMemo(
    () => [
      {title: "Start from scratch"},
      ...existingRoles
        .filter((role) => role.name.toLowerCase() !== "owner")
        .map((role) => ({title: role.name})),
    ],
    [existingRoles],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="xs" variant="secondary">
            Add Role
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-4 py-6">
        <DialogHeader className="pb-2">
          <DialogTitle>Add new role</DialogTitle>
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
              />
            </div>

            <div className="space-y-3">
              <p className="font-medium text-sm">Badge colour</p>
              <ColorSwatches />
            </div>

            {/* permission template */}
            <div className="space-y-2">
              <p className="font-medium text-sm">Permission Template - Inherit from</p>
              <SelectInput
                id="inheritFrom-select"
                placeholder="Select a template"
                name="inheritFrom"
                className=""
                options={templateOptions}
                error={methods.formState.errors.inheritFrom}
              />
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button variant="outline" size="xs" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button size="xs" variant="secondary" type="submit" disabled={!isValid}>
                Add role
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
