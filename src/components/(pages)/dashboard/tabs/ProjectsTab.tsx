import React from "react";
import AnalyticsCardList from "@/components/analytics/AnalyticsCardList";
import SimpleInput from "@/components/ui/form/SimpleInput";
import {Button} from "@/components/shadcn/button";
import {Filter, Loader2} from "lucide-react";
import {CirclePlus} from "lucide-react";
import Link from "next/link";
import {AnalyticsCardListProps} from "@/types/analytics";
import {User} from "@supabase/supabase-js";
import {useUserProjects} from "@/hooks/query/dashboard/use-user-projects";
import ProjectDashboardSingleCard from "../../projects/ProjectDashboardSingleCard";

const ProjectsTab = ({user}: {user: User}) => {
  // Fetch user projects using Tanstack Query
  const {data: userProjects, isLoading, error} = useUserProjects(user.id);
  const analyticsData = [
    {title: "Projects Created", number: 12},
    {title: "Active Projects", number: 4},
    //  Success percentage showing your effectiveness and follow-through
    {title: "Completion Rate", number: "85%"},
    // number of memebrs across all projects aka Network size and collaboration reach across all projects
    {title: "Total Collaborators", number: 28},
  ] as AnalyticsCardListProps["data"];

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsCardList
        data={analyticsData}
        cardClassName="min-[1174px]:rounded-[10px] cursor-default"
      />
      <div className="@container">
        <div className="flex @max-[735px]:flex-col justify-between gap-8 @max-[735px]:gap-3 py-4">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-foreground text-xl whitespace-nowrap">
              All Projects Overview
            </h4>
            <div className="px-1 py-0.5 border border-border rounded-[5px] w-fit font-medium text-[10px] text-secondary leading-[13px]">
              {isLoading ? "..." : userProjects?.length || 0}
            </div>
          </div>
          <div className="flex max-[480px]:flex-col justify-between items-center gap-3 max-[480px]:gap-2">
            <SimpleInput placeholder="Search projects..." className="" search />
            <div className="flex gap-3 max-[480px]:gap-2 max-[480px]:w-full">
              {/* <Button size={"xs"} className="max-[480px]:w-full">
                <Filter size={16} strokeWidth={2} className="text-foreground/90" />
                Filter
              </Button> */}
              <Link href="/dashboard/projects/create">
                <Button size={"xs"} className="max-[480px]:w-full" variant={"secondary"}>
                  <CirclePlus size={16} strokeWidth={2} className="" />
                  Create Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            userProjects?.map((project) => (
              <ProjectDashboardSingleCard key={project.id} project={project} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsTab;
