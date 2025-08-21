"use client";

import React from "react";
import {CommandGroup, CommandItem} from "@/components/shadcn/command";
import {Skeleton} from "@/components/shadcn/skeleton";
import {cn} from "@/lib/utils";

interface ClassNames {
  groupHeading: string;
  stickyHeading: string;
  itemBase: string;
}

interface SearchResultsSkeletonProps {
  section: string;
  count?: number;
  classNames: ClassNames;
}

const SearchResultsSkeleton = ({section, count = 6, classNames}: SearchResultsSkeletonProps) => {
  switch (section) {
    case "profiles": {
      return (
        <CommandGroup
          heading="Profiles"
          className={cn(classNames.groupHeading, classNames.stickyHeading)}>
          {Array.from({length: count}).map((_, idx) => (
            <CommandItem key={`profiles-skeleton-${idx}`} className={classNames.itemBase}>
              <div className="flex items-start gap-2 w-full">
                <Skeleton className="h-7.5 w-7.5 rounded-full shrink-0" />
                <div className="w-full text-secondary flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 text-start">
                    <Skeleton className="h-4.5 w-[40%] max-w-[140px]" />
                    {/* <Skeleton className="h-4 w-4 rounded-sm" /> */}
                  </div>
                  <Skeleton className="h-3.5 w-24" />
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      );
    }
    default:
      return null;
  }
};

export default SearchResultsSkeleton;
