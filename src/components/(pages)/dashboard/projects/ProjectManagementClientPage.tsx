"use client";
import React, {useState} from "react";
import TabNavigation from "@/components/ui/form/TabNavigation";
import {User} from "@supabase/supabase-js";
import {Project} from "@/types/projects/projects";
import DashboardHeader from "../header/DashboardHeader";
import {dashboardProjectTabsData} from "@/data/tabs/dashboardProjectTabs";
import {useRouter} from "next/navigation";
import ProjectManagementDetailsTab from "./ProjectManagementDetailsTab";
import Alert from "@/components/ui/Alert";
import {canMakePublic} from "@/functions/canMakePublic";
import ProjectManagementSecurityTab from "./ProjectManagementSecurityTab";
import {canChangeSlug} from "@/functions/canChangeSlug";
import ProjectManagementTeamMembers from "./ProjectManagementTeamMembers";
import ProjectManagementRequests from "./ProjectManagementRequests";
import ProjectManagementOpenPositions from "./ProjectManagementOpenPositions";
import AccessDeniedSection from "@/components/other/AccessDeniedSection";

const ProjectManagementClientPage = ({
  tab,
  user,
  project,
  userPermissions,
}: {
  tab: string | string[];
  user: User;
  project: Project;
  userPermissions?: Record<string, Record<string, boolean>> | null;
}) => {
  const router = useRouter();

  // Local state so we can update project attributes after edits without page refresh
  const [projectState, setProjectState] = useState<Project>(project);

  const {canMakePublic: canMakeProjectPublic} = canMakePublic(projectState);

  const resourceMap: Record<string, string> = {
    details: "Project Details",
    "team-members": "Members",
    "open-positions": "Open Positions",
    requests: "Invitations",
    analytics: "Analytics",
    followers: "Followers",
    security: "Roles & Permissions",
  };

  const canViewCurrentTab = (() => {
    const current = typeof tab === "string" ? tab : Array.isArray(tab) ? tab[0] : "";
    const resource = resourceMap[current];
    if (!resource) return true;
    if (!userPermissions) return true; // default allow if no permissions provided
    return userPermissions[resource]?.view === true;
  })();

  // Compute update permission for Project Details
  const canUpdateProjectDetails = (() => {
    const resource = resourceMap["details"];
    if (!userPermissions || !resource) return true;
    return userPermissions[resource]?.update === true;
  })();

  const renderSelectedComponent = () => {
    if (!canViewCurrentTab)
      return <AccessDeniedSection tabName={resourceMap[tab as string]} projectId={project.id} />;
    switch (tab) {
      case "details":
        return (
          <ProjectManagementDetailsTab
            user={user}
            project={projectState}
            onProjectUpdate={setProjectState}
            readOnly={!canUpdateProjectDetails}
          />
        );
      case "analytics":
        return <div>Analytics</div>;
      case "team-members":
        return <ProjectManagementTeamMembers project={projectState} user={user} />;
      case "requests":
        return <ProjectManagementRequests project={projectState} user={user} />;
      case "open-positions":
        return <ProjectManagementOpenPositions project={projectState} user={user} />;
      case "security":
        return (
          <ProjectManagementSecurityTab
            user={user}
            project={projectState}
            onProjectUpdate={setProjectState}
          />
        );
      case "followers":
        return <div>Followers</div>;
      default:
        return (
          <ProjectManagementDetailsTab
            user={user}
            project={projectState}
            onProjectUpdate={setProjectState}
          />
        );
    }
  };

  const slugChangeStatus = projectState.slug_changed_at
    ? canChangeSlug(projectState.slug_changed_at as Date)
    : {canChange: true, nextAvailableDate: null};

  // Map tabs to permission resource names
  const computedTabs = dashboardProjectTabsData.map((t) => {
    const resource = resourceMap[t.query];
    const canView = userPermissions && resource ? userPermissions[resource]?.view === true : true;
    return {...t, disabled: resource ? !canView : false};
  });

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
        <TabNavigation tabsData={computedTabs} activeTab={tab} />
      </div>

      <div>{renderSelectedComponent()}</div>
    </div>
  );
};

export default ProjectManagementClientPage;
