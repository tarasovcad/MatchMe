import PageTitle from "@/components/pages/PageTitle";
import {Button} from "@/components/shadcn/button";
import React from "react";
import DashboardHeaderSelectDate from "./DashboardHeaderSelectDate";
import DashboardHeaderCompare from "./DashboardHeaderCompare";
import {CloudDownload} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
const DashboardHeader = () => {
  return (
    <div className="@container">
      <div className="flex @max-[800px]:flex-col justify-between @min-[800px]:items-center @max-[800px]:gap-6">
        <PageTitle
          title="Dashboard Overview"
          subtitle="Track your followers, posts, and projects all in one place"
        />
        <div className="flex @max-[360px]:flex-col gap-1.5">
          <div className="flex gap-1.5 @max-[530px]:w-full">
            <DashboardHeaderSelectDate className="@max-[530px]:w-full" />
            <DashboardHeaderCompare className="@max-[530px]:w-full" />
          </div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" className="@max-[360px]:w-full shrink-0">
                  <CloudDownload size={16} strokeWidth={2} className="opacity-90" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8} className="px-2 py-1 text-xs">
                Export your data to CSV
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
