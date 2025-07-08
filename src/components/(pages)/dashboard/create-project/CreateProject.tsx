"use client";
import PageTitle from "@/components/pages/PageTitle";
import {projectCreationFormFields} from "@/data/forms/create-project/projectCreationFormFields";
import {redirect, useRouter} from "next/navigation";
import React, {useState} from "react";
import CreateProjectFormField from "./CreateProjectFormField";
import {FormProvider, useForm} from "react-hook-form";
import {
  ProjectCreationFormData,
  projectCreationValidationSchema,
} from "@/validation/project/projectCreationValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import Alert from "@/components/ui/Alert";
import CreateProjectFormButtons from "./CreateProjectFormButtons";
import {useSidebar} from "@/components/shadcn/sidebar";
import {AnimatePresence, motion} from "framer-motion";
import ProjectSuccessStep from "./ProjectSuccessStep";

const MAX_PROJECTS = 3;

const stepRequiredFields = {
  1: ["name", "slug", "tagline"],
  2: ["description", "category", "current_stage"],
  3: ["language_proficiency", "technology_stack"],
  4: ["collaboration_model", "engagement_model", "availability"],
  5: ["revenue_expectations", "funding_investment", "compensation_model"],
};

const CreateProject = ({projectCount}: {projectCount: number}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const totalSteps = projectCreationFormFields.length;
  const hasReachedLimit = projectCount >= MAX_PROJECTS;
  const {state: sidebarState, isMobile} = useSidebar();

  const methods = useForm<ProjectCreationFormData>({
    resolver: zodResolver(projectCreationValidationSchema),
    mode: "onChange",
    defaultValues: {
      // 1 step
      name: "",
      slug: "",
      tagline: "",
      project_image: "",
      background_image: "",
      // 2 step
      description: "",
      why_join: "",
      project_website: "",
      category: "",
      current_stage: "",
      target_audience: "",
      demo: [],
      // 3 step
      language_proficiency: [],
      technology_stack: [],
      // 4 step
      collaboration_model: "",
      engagement_model: "",
      working_hours: "",
      availability: "",
      community_platforms: [],
      // 5 step
      revenue_expectations: "",
      funding_investment: "",
      compensation_model: "",

      _slugLoading: false,
    },
  });

  const {
    formState: {errors},
    watch,
    trigger,
  } = methods;

  // Watch all form values to check if required fields are filled
  const watchedValues = watch();

  // Check if current step is valid
  const isCurrentStepValid = async () => {
    const fieldsToValidate = stepRequiredFields[currentStep as keyof typeof stepRequiredFields];
    if (!fieldsToValidate) return true;

    // Trigger validation for current step fields
    const result = await trigger(fieldsToValidate as (keyof ProjectCreationFormData)[]);
    return result;
  };

  // Check if there are any errors for current step
  const hasCurrentStepErrors = () => {
    const fieldsToCheck = stepRequiredFields[currentStep as keyof typeof stepRequiredFields];
    if (!fieldsToCheck) return false;

    return fieldsToCheck.some((fieldName) => {
      return errors[fieldName as keyof typeof errors];
    });
  };

  // Check if all required fields for current step are filled and valid
  const canContinueToNextStep = () => {
    const fieldsToCheck = stepRequiredFields[currentStep as keyof typeof stepRequiredFields];
    if (!fieldsToCheck) return true;

    // Check if slug is currently loading (disable button during validation)
    const isSlugLoading = watchedValues._slugLoading === true;
    if (isSlugLoading) return false;

    // Check if all required fields have values
    const allFieldsFilled = fieldsToCheck.every((fieldName) => {
      const value = watchedValues[fieldName as keyof ProjectCreationFormData];
      return value && value.toString().trim() !== "";
    });

    // Check if there are no errors for current step (including custom slug errors)
    const noErrors = !hasCurrentStepErrors();

    return allFieldsFilled && noErrors;
  };

  const handleNext = async () => {
    const isValid = await isCurrentStepValid();
    if (isValid && !hasCurrentStepErrors()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log("Form submitted with data:", methods.getValues());

    setIsLoading(true);

    // Simulate API call with 3 seconds loading
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsLoading(false);

    // Wait 1 second before showing success step
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setCurrentStep(6); // Move to success step
  };

  // Get current step data
  const currentStepData = projectCreationFormFields[currentStep - 1];

  // Success step content
  const renderSuccessStep = () => <ProjectSuccessStep projectData={methods.getValues()} />;

  return (
    <div>
      <form
        className={`flex flex-col gap-8  ${isSubmitted ? "" : "pb-24"}`}
        onSubmit={(e) => e.preventDefault()}>
        {hasReachedLimit && (
          <Alert
            title="Project Limit Reached"
            message={`You have reached the limit of ${MAX_PROJECTS} projects`}
            type="warning"
          />
        )}

        <FormProvider {...methods}>
          {/* Display success step or current step */}
          {isSubmitted ? (
            renderSuccessStep()
          ) : (
            <div className="flex flex-col gap-9 max-[990px]:gap-8">
              <div className="flex flex-col items-start gap-[22px]">
                <div className="border border-border rounded-[18px] py-1.5 px-2 flex items-center gap-1 font-medium text-sm">
                  {Array.from({length: totalSteps}).map((_, index) => {
                    const stepNumber = index + 1;
                    const isActive = currentStep === stepNumber;

                    return (
                      <div key={index} className="relative">
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              layoutId="step-background"
                              className="absolute inset-0 bg-primary rounded-full"
                              initial={false}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                duration: 0.3,
                              }}
                            />
                          )}
                        </AnimatePresence>

                        <motion.div
                          className={`relative z-10 flex items-center justify-center rounded-full font-medium transition-colors duration-200 ${
                            isActive
                              ? "text-white text-[15px] px-[9px] py-[2.5px]"
                              : "size-[23px] text-foreground/80"
                          }`}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                            duration: 0.2,
                          }}>
                          {isActive ? `Step ${stepNumber}` : stepNumber}
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="font-semibold text-foreground/90 text-[22px]">
                    {currentStepData.formTitle}
                  </h4>
                  <p className="text-muted-foreground text-[15px]">
                    {currentStepData.formDescription}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {currentStepData.formData.map((formField) => (
                  <div key={formField.fieldTitle}>
                    <CreateProjectFormField formField={formField} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </FormProvider>
      </form>

      {/* Only show buttons if not submitted */}
      {!isSubmitted && (
        <div
          className={`right-0 bottom-0 ${!isMobile && sidebarState === "expanded" ? "pl-[calc(256px+24px)]" : !isMobile && sidebarState === "collapsed" ? "pl-[calc(48px+24px)]" : ""} left-0 z-[5] fixed flex justify-between items-center gap-[10px] bg-sidebar-background shadow-lg p-6 border-t border-border`}>
          <CreateProjectFormButtons
            isLoading={isLoading}
            currentStep={currentStep}
            totalSteps={totalSteps}
            handleNext={handleNext}
            handleBack={handleBack}
            handleSubmit={handleSubmit}
            canContinue={canContinueToNextStep()}
          />
        </div>
      )}
    </div>
  );
};

export default CreateProject;
