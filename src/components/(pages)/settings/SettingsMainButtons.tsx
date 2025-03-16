import {Button} from "@/components/shadcn/button";
import AlertComponent from "@/components/ui/dialog/AlertComponent";
import {CircleX, Save} from "lucide-react";
import React from "react";

const SettingsMainButtons = ({
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
    <div className="right-0 bottom-0 left-0 fixed flex justify-end items-center gap-[10px] bg-sidebar-background shadow-lg p-6 border-t border-border">
      <AlertComponent
        title="Reset Form"
        description="Are you sure you want to clear all entered information? This will reset all fields to their default values."
        cancelButtonText="Cancel"
        confirmButtonText="Reset"
        onCancel={handleCancel}>
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
    </div>
  );
};

export default SettingsMainButtons;
