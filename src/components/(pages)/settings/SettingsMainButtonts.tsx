import {Button} from "@/components/shadcn/button";
import {CircleX, Save} from "lucide-react";
import React from "react";

const SettingsMainButtonts = ({isLoading}: {isLoading: boolean}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0  p-6 shadow-lg flex justify-end items-center border-t border-border bg-sidebar-background gap-[10px]">
      <Button
        variant={"outline"}
        type="button"
        className="px-[20px] dark:bg-sidebar-background">
        <CircleX size={16} />
        Cancel
      </Button>
      <Button
        // type="submit"
        variant={"secondary"}
        className="px-[25px] max-w-[165.5px] w-full transition-colors duration-300 ease-in-out"
        disabled={isLoading}
        isLoading={isLoading}>
        <Save size={16} />
        Save Changes
      </Button>
    </div>
  );
};

export default SettingsMainButtonts;
