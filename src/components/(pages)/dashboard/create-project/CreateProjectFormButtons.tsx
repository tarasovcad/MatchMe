import {Button} from "@/components/shadcn/button";
import {ArrowLeft} from "lucide-react";
import React from "react";

const CreateProjectFormButtons = ({
  isLoading,
  handleNext,
  handleBack,
  handleSubmit,
  currentStep,
  totalSteps,
  canContinue,
}: {
  isLoading: boolean;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: () => void;
  currentStep: number;
  totalSteps: number;
  canContinue: boolean;
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <>
      <Button
        variant={"outline"}
        type="button"
        disabled={isLoading || currentStep === 1}
        onClick={handleBack}
        className="dark:bg-sidebar-background px-[20px]">
        <ArrowLeft size={16} />
        Go Back
      </Button>

      <Button
        variant={"secondary"}
        className="px-[25px] w-full max-w-[165.5px] transition-colors duration-300 ease-in-out"
        disabled={isLoading || !canContinue}
        isLoading={isLoading}
        onClick={isLastStep ? handleSubmit : handleNext}>
        {isLastStep ? "Submit" : "Save and Continue"}
      </Button>
    </>
  );
};

export default CreateProjectFormButtons;
