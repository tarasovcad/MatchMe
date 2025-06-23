import {cn} from "@/lib/utils";
import React from "react";

const AnalyticsSectionHeader = ({
  title,
  description,
  icon,
  button,
  className,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  button?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 @max-[455px]:gap-3 @max-[455px]:flex-col @max-[455px]:items-start",
        className,
      )}>
      <div className="flex flex-col gap-[3px]">
        <div className="flex items-center gap-1.5 ">
          <div className="size-[25px] border border-border rounded-[5px] flex items-center justify-center">
            {icon}
          </div>
          <h6 className="text-foreground text-[16px] font-medium">{title}</h6>
        </div>

        <p className="text-secondary text-xs font-medium">{description}</p>
      </div>
      {button}
    </div>
  );
};

export default AnalyticsSectionHeader;
