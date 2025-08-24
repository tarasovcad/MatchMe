import {Button} from "@/components/shadcn/button";
import AlertComponent from "@/components/ui/dialog/AlertComponent";
import {CircleX, Save} from "lucide-react";
import React from "react";
import LoadingButtonCircle from "../LoadingButtonCirlce";

interface FormMainButtonsProps {
  isLoading: boolean;
  handleSave: () => void;
  handleCancel: () => void;
  isSaveDisabled?: boolean;
  isClearDisabled?: boolean;
  isDisabled?: boolean;
}

const FormMainButtons = ({
  isLoading,
  handleSave,
  handleCancel,
  isSaveDisabled,
  isClearDisabled,
  isDisabled = false,
}: FormMainButtonsProps) => {
  const saveDisabled = isSaveDisabled !== undefined ? isSaveDisabled : isDisabled;
  const clearDisabled = isClearDisabled !== undefined ? isClearDisabled : isDisabled;

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
          disabled={isLoading || clearDisabled}
          className="dark:bg-sidebar-background px-[20px]">
          <CircleX size={16} />
          Cancel
        </Button>
      </AlertComponent>

      <Button
        variant={"secondary"}
        className="px-[25px] w-full max-w-[165.5px] transition-colors duration-300 ease-in-out"
        disabled={isLoading || saveDisabled}
        onClick={handleSave}>
        {isLoading ? (
          <LoadingButtonCircle size={16} className="text-white dark:text-foreground/80" />
        ) : (
          <Save size={16} />
        )}
        Save Changes
      </Button>
    </>
  );
};

export default FormMainButtons;
