import React from "react";
import {Skeleton} from "@/components/shadcn/skeleton";

const ProjectOpenPositionsSkeleton = () => {
  return (
    <div className="@container w-full">
      <div className="flex flex-col gap-6 w-full">
        {Array.from({length: 6}, (_, index) => (
          <div key={index} className="relative">
            <div className="relative border border-border/70 rounded-[11px] p-4.5 bg-background flex flex-col gap-[10px]">
              <Skeleton className="h-5 w-3/4" />
              <div className=" h-[45.5px] flex flex-col gap-1">
                <Skeleton className="h-4 w-full flex-1" />
                <Skeleton className="h-4 w-full flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectOpenPositionsSkeleton;
