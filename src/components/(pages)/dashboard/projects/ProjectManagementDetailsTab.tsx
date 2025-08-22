import {Project} from "@/types/projects/projects";
import {User} from "@supabase/supabase-js";
import React, {useEffect, useState} from "react";
import SettingsFormField from "@/components/ui/settings/SettingsFormField";
import {
  projectDetailsFormFields,
  projectDetailsFormFieldsTop,
} from "@/data/forms/projects/projectDetailsFormFields";
import {FormProvider, useForm, useWatch} from "react-hook-form";
import {
  ProjectCreationFormData,
  projectCreationValidationSchema,
} from "@/validation/project/projectCreationValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {isEqual} from "lodash";
import {submitProjectForm} from "@/actions/projects/submitProjectForm";
import {toast} from "sonner";
import {motion} from "framer-motion";
import {
  bottomSectionButtonsVariants,
  containerVariants,
  itemVariants,
} from "@/utils/other/variants";
import FormMainButtons from "@/components/ui/form/FormMainButtons";
import {cn} from "@/lib/utils";

const ProjectManagementDetailsTab = ({
  user,
  project,
  onProjectUpdate,
  readOnly = false,
}: {
  user: User;
  project: Project;
  onProjectUpdate?: React.Dispatch<React.SetStateAction<Project>>;
  readOnly?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isClearDisabled, setIsClearDisabled] = useState(true);
  const [initialValues, setInitialValues] = useState<ProjectCreationFormData>(() => ({
    is_project_public: project.is_project_public ?? false,
    // Step 1
    name: project.name ?? "",
    slug: project.slug ?? "",
    tagline: project.tagline ?? "",
    project_image: project.project_image ?? [],
    background_image: project.background_image ?? [],
    // Step 2
    description: project.description ?? "",
    why_join: project.why_join ?? "",
    project_website: project.project_website ?? "",
    category: project.category ?? "",
    current_stage: project.current_stage ?? "",
    expected_timeline: project.expected_timeline ?? "",
    target_audience: project.target_audience ?? "",
    demo: project.demo ?? [],
    // Step 3
    language_proficiency: Array.isArray(project.language_proficiency)
      ? project.language_proficiency
      : [],
    technology_stack: Array.isArray(project.technology_stack) ? project.technology_stack : [],
    // Step 4
    collaboration_model: project.collaboration_model ?? "",
    collaboration_style: project.collaboration_style ?? "",
    time_commitment: project.time_commitment ?? "",
    community_platforms: project.community_platforms
      ? Array.isArray(project.community_platforms)
        ? project.community_platforms
        : project.community_platforms.split(",").map((v) => v.trim())
      : [],
    // Step 5
    revenue_expectations: project.revenue_expectations ?? "",
    funding_investment: project.funding_investment ?? "",
    compensation_model: project.compensation_model ?? "",
    // Internal
    _slugLoading: false,
  }));

  // Helper to ignore internal fields and normalise values (currently only handles undefined/empty strings for simple consistency)
  const normalizeValue = (value: unknown) => {
    if (value === "") return undefined;
    return value;
  };

  const methods = useForm<ProjectCreationFormData>({
    resolver: zodResolver(projectCreationValidationSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  // Watch form values to detect changes & validation state
  const watchedValues = useWatch({control: methods.control});

  const {formState} = methods;

  useEffect(() => {
    // Detect any meaningful changes excluding internal helper fields (those that start with "_")
    const changedKeys: string[] = [];
    const hasFieldChanged = Object.keys(watchedValues).some((key) => {
      if (key.startsWith("_")) return false; // skip internal fields such as _slugLoading
      const formKey = key as keyof ProjectCreationFormData;
      const changed = !isEqual(
        normalizeValue(watchedValues[formKey]),
        normalizeValue(initialValues[formKey]),
      );
      if (changed) changedKeys.push(key);
      return changed;
    });

    // Extra check for image arrays – if they become populated/empty this should be considered a change
    const imageArraysChanged =
      ((!initialValues.project_image || initialValues.project_image.length === 0) &&
        watchedValues.project_image &&
        watchedValues.project_image.length > 0) ||
      ((!initialValues.background_image || initialValues.background_image.length === 0) &&
        watchedValues.background_image &&
        watchedValues.background_image.length > 0);

    const hasChanges = hasFieldChanged || imageArraysChanged;

    setIsSaveDisabled(!hasChanges || !formState.isValid);

    setIsClearDisabled(!hasChanges);
  }, [watchedValues, initialValues, formState.isValid]);

  const onSubmit = async (data: ProjectCreationFormData) => {
    setIsLoading(true);

    // Filter out unchanged values & skip internal keys
    const changedValues = Object.keys(data).reduce((acc, key) => {
      if (key.startsWith("_")) return acc; // ignore internal keys
      const formKey = key as keyof ProjectCreationFormData;
      if (!isEqual(data[formKey], initialValues[formKey])) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc as any)[formKey] = data[formKey];
      }
      return acc;
    }, {} as Partial<ProjectCreationFormData>);

    // If either image field changed – include both to avoid accidental nullification
    if (changedValues.project_image !== undefined || changedValues.background_image !== undefined) {
      changedValues.project_image = data.project_image;
      changedValues.background_image = data.background_image;
    }

    if (Object.keys(changedValues).length === 0) {
      setIsLoading(false);
      return;
    }

    const toastId = toast.loading("Updating project...");
    const response = await submitProjectForm(project.id, changedValues);

    if (response.error) {
      toast.error(response.message, {id: toastId});
      setIsLoading(false);
      return;
    }

    toast.success(response.message, {id: toastId});

    // Assess if project was auto-set private
    let finalData = data;
    if (response.projectSetToPrivate) {
      finalData = {...data, is_project_public: false};
      toast.warning("Your project was set to private because required fields are missing.");
    }

    // Update local state & reset form
    const newInitialValues = {...initialValues, ...finalData};
    setInitialValues(newInitialValues);
    methods.reset(newInitialValues);

    // Inform parent about updated project state
    if (onProjectUpdate) {
      onProjectUpdate({...project, ...finalData} as Project);
    }
    setIsLoading(false);
  };

  const handleSave = () => {
    methods.handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    methods.reset();
  };

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-9 max-[990px]:gap-8">
        <FormProvider {...methods}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6">
            <motion.div variants={itemVariants} className="border border-border rounded-[8px]">
              {projectDetailsFormFieldsTop.map((formField, index) => (
                <motion.div
                  key={formField.fieldTitle}
                  variants={itemVariants}
                  className={cn("px-[18px] py-3", index !== 0 && "border-t border-border")}>
                  <SettingsFormField
                    formField={formField}
                    project={project}
                    readOnlyOverride={readOnly}
                  />
                </motion.div>
              ))}
            </motion.div>
            {projectDetailsFormFields.map((section, index) => (
              <motion.div
                key={section.formTitle}
                variants={itemVariants}
                className={`flex flex-col gap-9 ${index !== 0 ? "border-t border-border pt-6" : ""}`}>
                <h4 className="font-semibold text-foreground text-xl">{section.formTitle}</h4>
                <motion.div variants={containerVariants} className="flex flex-col gap-6">
                  {section.formData.map((formField) => (
                    <motion.div key={formField.fieldTitle} variants={itemVariants}>
                      <SettingsFormField
                        formField={formField}
                        project={project}
                        readOnlyOverride={readOnly}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </FormProvider>
      </div>

      {/* Bottom action buttons */}
      {!readOnly && (
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
            isClearDisabled={isClearDisabled}
          />
        </motion.div>
      )}
    </motion.form>
  );
};

export default ProjectManagementDetailsTab;
