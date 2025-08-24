import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import {Button} from "@/components/shadcn/button";

const TransferOwnershipButton = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Button
              size={"xs"}
              disabled
              className="flex items-center gap-2 rounded-[8px] text-destructive hover:text-destructive/90 cursor-pointer">
              Transfer Ownership
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent sideOffset={6} side="bottom">
          <p>This feature is not available yet</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TransferOwnershipButton;
