import {Button} from "@/components/shadcn/button";
import AlertComponent from "@/components/ui/dialog/AlertComponent";
import {CircleX, Save} from "lucide-react";
import React from "react";

const FormMainButtons = ({
  isLoading,
  handleSave,
  handleCancel,
  isDisabled = false,
}: {
  isLoading: boolean;
  handleSave: () => void;
  handleCancel: () => void;
  isDisabled?: boolean;
}) => {
  return (
    <>
      <AlertComponent
        title="Reset Form"
        description="Are you sure you want to clear all entered information? This will reset all fields to their default values."
        cancelButtonText="Cancel"
        confirmButtonText="Reset"
        onConfirm={handleCancel}>
        <Button
          variant={"outline"}
          type="button"
          disabled={isLoading || isDisabled}
          className="dark:bg-sidebar-background px-[20px]">
          <CircleX size={16} />
          Cancel
        </Button>
      </AlertComponent>

      <Button
        variant={"secondary"}
        className="px-[25px] w-full max-w-[165.5px] transition-colors duration-300 ease-in-out"
        disabled={isLoading || isDisabled}
        isLoading={isLoading}
        onClick={handleSave}>
        <Save size={16} />
        Save Changes
      </Button>
    </>
  );
};

export default FormMainButtons;
