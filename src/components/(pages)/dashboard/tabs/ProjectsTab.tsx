import React from "react";
import AnalyticsCardList from "@/components/analytics/AnalyticsCardList";
import SimpleInput from "@/components/ui/form/SimpleInput";
import {Button} from "@/components/shadcn/button";
import {Filter} from "lucide-react";
import {CirclePlus} from "lucide-react";
import Link from "next/link";
import {AnalyticsCardListProps} from "@/types/analytics";

const ProjectsTab = () => {
  const analyticsData = [
    {title: "Projects Created", number: 16, type: "positive", analyticsNumber: 9},
    {title: "Projects Joined", number: 4, type: "negative", analyticsNumber: 1},
    {title: "Requests Sent & Received", number: 52, type: "positive", analyticsNumber: 23},
    {title: "Total Projects Joined", number: 4, type: "negative", analyticsNumber: 15},
  ] as AnalyticsCardListProps["data"];

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsCardList data={analyticsData} />
      <div className="@container">
        <div className="flex @max-[735px]:flex-col justify-between gap-8 @max-[735px]:gap-3 py-4">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-foreground text-xl whitespace-nowrap">
              All Projects Overview
            </h4>
            <div className="px-1 py-0.5 border border-border rounded-[5px] w-fit font-medium text-[10px] text-secondary leading-[13px]">
              3
            </div>
          </div>
          <div className="flex max-[480px]:flex-col justify-between items-center gap-3 max-[480px]:gap-2">
            <SimpleInput placeholder="Search projects..." className="" search />
            <div className="flex gap-3 max-[480px]:gap-2 max-[480px]:w-full">
              <Button size={"xs"} className="max-[480px]:w-full">
                <Filter size={16} strokeWidth={2} className="text-foreground/90" />
                Filter
              </Button>
              <Link href="/dashboard/projects/create">
                <Button size={"xs"} className="max-[480px]:w-full" variant={"secondary"}>
                  <CirclePlus size={16} strokeWidth={2} className="" />
                  Create Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTab;
