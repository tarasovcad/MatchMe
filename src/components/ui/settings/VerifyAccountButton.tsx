import {Button} from "@/components/shadcn/button";
import React from "react";
import {useFormContext} from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";

const VerifyAccountButton = ({name}: {name: string}) => {
  const {watch} = useFormContext();
  const isVerified = watch(name);

  return (
    <div className="flex justify-end items-center gap-2 h-9">
      {isVerified ? (
        <span>Verified</span>
      ) : (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="outline"
                  disabled
                  size="xs"
                  className="h-8.5 px-[30px] py-2 text-[13px]">
                  Verify Now
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={8} className="px-2 py-1 text-xs">
              Soon...
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default VerifyAccountButton;
