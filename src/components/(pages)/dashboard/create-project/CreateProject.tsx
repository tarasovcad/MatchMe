"use client";
import PageTitle from "@/components/pages/PageTitle";
import {projectCreationFormFields} from "@/data/forms/create-project/projectCreationFormFields";
import {redirect} from "next/navigation";
import React, {useState} from "react";
import CreateProjectFormField from "./CreateProjectFormField";
import {FormProvider, useForm} from "react-hook-form";
import {
  ProjectCreationFormData,
  projectCreationValidationSchema,
} from "@/validation/project/projectCreationValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {User} from "@supabase/supabase-js";
import FormMainButtons from "@/components/ui/form/FormMainButtons";
import {toast} from "sonner";
import {createProject} from "@/actions/dashboard/create-project/createProject";
import Alert from "@/components/ui/Alert";

const MAX_PROJECTS = 3;

const CreateProject = ({projectCount}: {projectCount: number}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<ProjectCreationFormData>({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    project_image: "",
    project_image_metadata: null,
    background_image: "",
    background_image_metadata: null,
    current_stage: "",
    category: "",
    why_join: "",
    language_proficiency: [],
    technology_stack: [],
  });

  const hasReachedLimit = projectCount >= MAX_PROJECTS;

  const methods = useForm<ProjectCreationFormData>({
    resolver: zodResolver(projectCreationValidationSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  const onSubmit = async (data: ProjectCreationFormData) => {
    if (hasReachedLimit) {
      toast.error(`You cannot create more than ${MAX_PROJECTS} projects`);
      console.log(`You cannot create more than ${MAX_PROJECTS} projects`);
      return;
    }
    setIsLoading(true);
    try {
      const response = await createProject(data);
      if (response.error) {
        console.log("Error creating project:", response.error);
        toast.error(response.error);
        setIsLoading(false);
        return;
      }
      toast.success(response.message);

      // if (response.error === false) {
      //   router.push("/dashboard?tab=projects");
      // }
    } catch (error) {
      console.log("error", error);
    }
    setIsLoading(false);
  };

  const handleSave = () => {
    if (hasReachedLimit) {
      toast.error(`You cannot create more than ${MAX_PROJECTS} projects`);
      console.log(`You cannot create more than ${MAX_PROJECTS} projects`);
      return;
    }
    methods.handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    methods.reset();
  };

  return (
    <div>
      <form className="flex flex-col gap-8 pb-24" onSubmit={(e) => e.preventDefault()}>
        {hasReachedLimit && (
          <Alert
            title="Project Limit Reached"
            message={`You have reached the limit of ${MAX_PROJECTS} projects`}
            type="warning"
          />
        )}
        <PageTitle
          title="Create Project"
          hasArrow
          subtitle="Track your followers, posts, and projects all in one place"
          onClick={() => redirect("/dashboard?tab=projects")}
        />
        <FormProvider {...methods}>
          {projectCreationFormFields.map((formFields, index) => (
            <div
              key={formFields.formTitle}
              className={`flex flex-col gap-9 max-[990px]:gap-8 ${
                index !== 0 && "border-t border-border pt-6"
              }`}>
              <h4 className="font-semibold text-foreground text-xl">{formFields.formTitle}</h4>
              <div className="flex flex-col gap-6">
                {formFields.formData.map((formField) => (
                  <div key={formField.fieldTitle}>
                    <CreateProjectFormField formField={formField} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </FormProvider>
      </form>
      <div className="right-0 bottom-0 left-0 z-[5] fixed flex justify-end items-center gap-[10px] bg-sidebar-background shadow-lg p-6 border-t border-border">
        <FormMainButtons
          isLoading={isLoading}
          handleSave={handleSave}
          handleCancel={handleCancel}
          isDisabled={hasReachedLimit}
        />
      </div>
    </div>
  );
};

export default CreateProject;
