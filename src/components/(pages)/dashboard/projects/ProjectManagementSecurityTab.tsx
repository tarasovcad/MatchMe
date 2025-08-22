"use client";

import {Project} from "@/types/projects/projects";
import {User} from "@supabase/supabase-js";
import React, {useEffect, useState} from "react";
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
import Alert from "@/components/ui/Alert";
import {canChangeSlug} from "@/functions/canChangeSlug";
import {useRouter} from "next/navigation";

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
  const [slugChanged, setSlugChanged] = useState(false);

  const slugChangeStatus = project.slug_changed_at
    ? canChangeSlug(project.slug_changed_at as Date)
    : {canChange: true, nextAvailableDate: null};

  const router = useRouter();

  const methods = useForm<ProjectSecurityFormData>({
    resolver: zodResolver(projectSecurityValidationSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  const watchedValues = useWatch({control: methods.control});

  useEffect(() => {
    const filteredInitial = {slug: initialValues.slug};
    const filteredWatch = {slug: watchedValues.slug};

    const hasSlugChanged = !isEqual(filteredWatch, filteredInitial);
    setSlugChanged(hasSlugChanged);

    setIsSaveDisabled(!hasSlugChanged || !methods.formState.isValid);
  }, [watchedValues, initialValues, methods.formState.isValid]);

  const onSubmit = async (data: ProjectSecurityFormData) => {
    setIsLoading(true);

    const toastId = toast.loading("Saving changes…");

    // Handle slug update (if needed)
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

      // Redirect to the new slug's security tab
      router.replace(`/dashboard/projects/${data.slug}?tab=security`);
    }

    toast.success("Changes saved successfully", {id: toastId});

    setIsLoading(false);
  };

  const handleSave = () => methods.handleSubmit(onSubmit)();

  const handleCancel = () => {
    methods.reset();
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={(e) => e.preventDefault()}>
      {!slugChangeStatus.canChange && (
        <Alert
          message={`Your next available change date is ${slugChangeStatus.nextAvailableDate}.`}
          title="Project slugs can only be changed once a month"
          type="warning"
        />
      )}
      {slugChanged && (
        <div className={!slugChangeStatus.canChange ? "mt-4" : ""}>
          <Alert
            title="Analytics Data Warning"
            message="Changing the project slug will result in the deletion of all analytics data associated with this project. This action cannot be undone."
            type="warning"
          />
        </div>
      )}
      <FormProvider {...methods}>
        <div className={!slugChangeStatus.canChange || slugChanged ? "mt-6" : ""}>
          {projectSecurityFormFields.map((section, index) => (
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
          ))}
        </div>
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
          isClearDisabled={!methods.formState.isDirty}
        />
      </motion.div>
    </motion.form>
  );
};

export default ProjectManagementSecurityTab;
