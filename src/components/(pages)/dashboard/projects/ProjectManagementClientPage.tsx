"use client";
import React from "react";

import TabNavigation from "@/components/ui/form/TabNavigation";
import {User} from "@supabase/supabase-js";
import {Project} from "@/types/projects/projects";
import DashboardHeader from "../header/DashboardHeader";
import DashboardOverviewTab from "./DashboardOverviewTab";
import {dashboardProjectTabsData} from "@/data/tabs/dashboardProjectTabs";
import {useRouter} from "next/navigation";
import DashboardDetailsTab from "./DashboardDetailsTab";

const ProjectManagementClientPage = ({
  tab,
  user,
  project,
  userPermission,
}: {
  tab: string | string[];
  user: User;
  project: Project;
  userPermission: string;
}) => {
  const router = useRouter();

  const renderSelectedComponent = () => {
    switch (tab) {
      case "overview":
        return <DashboardDetailsTab user={user} project={project} />;
      case "details":
        return <DashboardDetailsTab user={user} project={project} />;
      case "analytics":
        return <div>Analytics</div>;
      case "team-members":
        return <div>Team Members</div>;
      case "applications":
        return <div>Applications</div>;
      default:
        return <DashboardOverviewTab user={user} project={project} />;
    }
  };

  return (
    <div className="@container flex flex-col gap-8 pb-24">
      <div className="flex flex-col gap-6">
        <DashboardHeader
          title="Project Overview"
          subtitle="Explore detailed analytics and manage your project team"
          currentTab={tab as string}
          hasArrow={true}
          onClick={() => router.push("/dashboard?tab=projects")}
        />
        <TabNavigation tabsData={dashboardProjectTabsData} activeTab={tab} />
      </div>

      <div>{renderSelectedComponent()}</div>
    </div>
  );
};

export default ProjectManagementClientPage;
