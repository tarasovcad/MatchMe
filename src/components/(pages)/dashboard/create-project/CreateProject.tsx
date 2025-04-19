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

const CreateProject = () => {
  const [initialValues, setInitialValues] = useState<ProjectCreationFormData>({
    name: "",
    slug: "",
  });

  const methods = useForm<ProjectCreationFormData>({
    resolver: zodResolver(projectCreationValidationSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  return (
    <div className="flex flex-col gap-8">
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
    </div>
  );
};

export default CreateProject;
