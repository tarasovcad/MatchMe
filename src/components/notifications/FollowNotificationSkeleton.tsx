import React from "react";
import {Skeleton} from "@/components/shadcn/skeleton";

export default function FollowNotificationSkeleton() {
  return (
    <div className="flex items-start gap-2 p-1.5 py-2.5 text-sm border-b border-border last:border-b-0 px-3">
      <Skeleton className="h-7.5 w-7.5 rounded-full shrink-0" />

      <div className="w-full text-secondary flex flex-col gap-1.5">
        <Skeleton className="h-4.5 w-[60%]" />

        <div className="flex justify-between items-center gap-2 text-xs">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
    </div>
  );
}
