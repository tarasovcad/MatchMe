"use client";

import {Project} from "@/types/projects/projects";
import {User} from "@supabase/supabase-js";
import React, {useEffect, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {FormProvider, useForm, useWatch} from "react-hook-form";
import SettingsFormField from "@/components/ui/settings/SettingsFormField";
import {projectSecurityFormFields} from "@/data/forms/projects/projectSecurityFormFields";
import {
  ProjectSecurityFormData,
  projectSecurityValidationSchema,
} from "@/validation/project/projectSecurityValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {isEqual} from "lodash";
import {toast} from "sonner";
import {motion} from "framer-motion";
import {
  containerVariants,
  itemVariants,
  bottomSectionButtonsVariants,
} from "@/utils/other/variants";
import FormMainButtons from "@/components/ui/form/FormMainButtons";
import {submitProjectSecurityForm} from "@/actions/projects/submitProjectSecurityForm";
import {updateProjectRoles} from "@/actions/projects/updateProjectRoles";
import {Button} from "@/components/shadcn/button";
import {PlusIcon} from "lucide-react";
import SimpleInput from "@/components/ui/form/SimpleInput";
import PermissionManagement from "./PermissionManagement";
import type {ProjectRoleDb} from "@/actions/projects/projectsRoles";
import type {UpdatableRole} from "@/actions/projects/updateProjectRoles";

const ProjectManagementSecurityTab = ({
  user,
  project,
  onProjectUpdate,
}: {
  user: User;
  project: Project;
  onProjectUpdate?: React.Dispatch<React.SetStateAction<Project>>;
}) => {
  const [initialValues, setInitialValues] = useState<ProjectSecurityFormData>({
    slug: project.slug ?? "",
    newSlug: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  // Track modified roles coming from the PermissionManagement child component
  const [changedRoles, setChangedRoles] = useState<UpdatableRole[]>([]);
  // Used to force PermissionManagement to reset when the user presses "Cancel"
  const [resetRolesSignal, setResetRolesSignal] = useState(false);

  const queryClient = useQueryClient();

  const methods = useForm<ProjectSecurityFormData>({
    resolver: zodResolver(projectSecurityValidationSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  const watchedValues = useWatch({control: methods.control});

  useEffect(() => {
    const filteredInitial = {slug: initialValues.slug};
    const filteredWatch = {slug: watchedValues.slug};

    const slugChanged = !isEqual(filteredWatch, filteredInitial);
    const rolesChanged = changedRoles.length > 0;

    setIsSaveDisabled(!(slugChanged || rolesChanged) || !methods.formState.isValid);
  }, [watchedValues, initialValues, methods.formState.isValid, changedRoles]);

  const onSubmit = async (data: ProjectSecurityFormData) => {
    setIsLoading(true);

    const toastId = toast.loading("Saving changes…");

    // 1. Handle slug update (if needed)
    if (data.slug !== initialValues.slug) {
      const response = await submitProjectSecurityForm(project.id, data);

      if (response.error) {
        toast.error(response.message, {id: toastId});
        setIsLoading(false);
        return;
      }

      const updatedSlugChangedAt = response.slug_changed_at ?? new Date().toISOString();

      setInitialValues({slug: data.slug, newSlug: ""});
      methods.reset({slug: data.slug, newSlug: ""});

      // Update local project object with new slug
      const updatedProject = {
        ...project,
        slug: data.slug,
        slug_changed_at: updatedSlugChangedAt,
      } as Project;

      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
    }

    // 2. Handle roles update
    if (changedRoles.length > 0) {
      const rolesResponse = await updateProjectRoles(project.id, changedRoles);

      if (rolesResponse.error) {
        toast.error(rolesResponse.message, {id: toastId});
        setIsLoading(false);
        return;
      }

      await queryClient.invalidateQueries({queryKey: ["project-roles", project.id]});
    }

    toast.success("Changes saved successfully", {id: toastId});

    setChangedRoles([]);

    setIsLoading(false);
  };

  const handleSave = () => methods.handleSubmit(onSubmit)();

  const handleCancel = () => {
    methods.reset();
    setChangedRoles([]);
    setResetRolesSignal((prev) => !prev);
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={(e) => e.preventDefault()}>
      <FormProvider {...methods}>
        {/* {projectSecurityFormFields.map((section, index) => (
          <motion.div
            key={section.formTitle}
            variants={itemVariants}
            className={`flex flex-col gap-9 ${index !== 0 ? "border-t border-border pt-6" : ""}`}>
            <h4 className="font-semibold text-foreground text-xl">{section.formTitle}</h4>
            <motion.div variants={containerVariants} className="flex flex-col gap-6">
              {section.formData.map((formField) => (
                <motion.div key={formField.fieldTitle} variants={itemVariants}>
                  <SettingsFormField formField={formField} user={user} project={project} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))} */}
        {/* roles and permissions */}
        <motion.div variants={itemVariants} className={`flex flex-col gap-4.5`}>
          <motion.div variants={containerVariants} className="flex flex-col gap-6">
            <PermissionManagement
              projectId={project.id}
              onRolesChange={setChangedRoles}
              resetSignal={resetRolesSignal}
            />
          </motion.div>
        </motion.div>
      </FormProvider>

      {/* Bottom action buttons */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={bottomSectionButtonsVariants}
        className="right-0 bottom-0 left-0 z-[5] fixed flex justify-end items-center gap-[10px] bg-sidebar-background shadow-lg p-6 border-t border-border">
        <FormMainButtons
          isLoading={isLoading}
          handleSave={handleSave}
          handleCancel={handleCancel}
          isSaveDisabled={isSaveDisabled}
          isClearDisabled={!methods.formState.isDirty && changedRoles.length === 0}
        />
      </motion.div>
    </motion.form>
  );
};

export default ProjectManagementSecurityTab;
