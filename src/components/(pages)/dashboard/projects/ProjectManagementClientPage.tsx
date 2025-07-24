"use client";
import React, {useState} from "react";

import TabNavigation from "@/components/ui/form/TabNavigation";
import {User} from "@supabase/supabase-js";
import {Project} from "@/types/projects/projects";
import DashboardHeader from "../header/DashboardHeader";
import DashboardOverviewTab from "./DashboardOverviewTab";
import {dashboardProjectTabsData} from "@/data/tabs/dashboardProjectTabs";
import {useRouter} from "next/navigation";
import ProjectManagementDetailsTab from "./ProjectManagementDetailsTab";
import Alert from "@/components/ui/Alert";
import {canMakePublic} from "@/functions/canMakePublic";
import ProjectManagementSecurityTab from "./ProjectManagementSecurityTab";
import {canChangeUsername} from "@/functions/canChangeUsername";
import {canChangeSlug} from "@/functions/canChangeSlug";
import ProjectManagementTeamMembers from "./ProjectManagementTeamMembers";

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

  // Local state so we can update project attributes after edits without page refresh
  const [projectState, setProjectState] = useState<Project>(project);

  const {canMakePublic: canMakeProjectPublic} = canMakePublic(projectState);

  const renderSelectedComponent = () => {
    switch (tab) {
      case "overview":
        return <DashboardOverviewTab user={user} project={projectState} />;
      case "details":
        return (
          <ProjectManagementDetailsTab
            user={user}
            project={projectState}
            onProjectUpdate={setProjectState}
          />
        );
      case "analytics":
        return <div>Analytics</div>;
      case "team-members":
        return <ProjectManagementTeamMembers project={projectState} user={user} />;
      case "applications":
        return <div>Applications</div>;
      case "security":
        return (
          <ProjectManagementSecurityTab
            user={user}
            project={projectState}
            onProjectUpdate={setProjectState}
          />
        );
      default:
        return <DashboardOverviewTab user={user} project={projectState} />;
    }
  };

  const slugChangeStatus = projectState.slug_changed_at
    ? canChangeSlug(projectState.slug_changed_at as Date)
    : {canChange: true, nextAvailableDate: null};

  return (
    <div className="@container flex flex-col gap-8 pb-24">
      {tab === "details" && !canMakeProjectPublic && (
        <Alert
          title="Your project is incomplete!"
          message="To make your project public, you need to fill in all required details."
          type="warning"
        />
      )}
      {tab === "security" && !slugChangeStatus.canChange && (
        <Alert
          message={`Your next available change date is ${slugChangeStatus.nextAvailableDate}.`}
          title="Project slugs can only be changed once a month"
          type="warning"
        />
      )}
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
