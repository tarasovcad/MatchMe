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
import ProjectManagementTeamMembers from "./ProjectManagementTeamMembers";
import ProjectManagementRequests from "./ProjectManagementRequests";
import ProjectManagementOpenPositions from "./ProjectManagementOpenPositions";
import AccessDeniedSection from "@/components/other/AccessDeniedSection";
import ProjectManagementRolesPermissionsTab from "./ProjectManagementRolesPermissionsTab";

const ProjectManagementClientPage = ({
  tab,
  user,
  project,
  userPermissions,
  isOwner = false,
}: {
  tab: string | string[];
  user: User;
  project: Project;
  userPermissions?: Record<string, Record<string, boolean>> | null;
  isOwner?: boolean;
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
    "roles-permissions": "Roles & Permissions",
  };

  const currentTabKey = typeof tab === "string" ? tab : Array.isArray(tab) ? tab[0] : "";
  const currentTabTitle =
    dashboardProjectTabsData.find((t) => t.query === currentTabKey)?.title ||
    resourceMap[currentTabKey] ||
    currentTabKey;

  const canViewCurrentTab = (() => {
    // Owner-only access for Security tab
    if (currentTabKey === "security") return isOwner;

    const resource = resourceMap[currentTabKey];
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
      return <AccessDeniedSection tabName={currentTabTitle} projectId={project.id} />;
    switch (tab) {
      case "details":
        return (
          <ProjectManagementDetailsTab
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
      case "roles-permissions":
        return <ProjectManagementRolesPermissionsTab user={user} project={projectState} />;
      case "followers":
        return <div>Followers</div>;
      default:
        return (
          <ProjectManagementDetailsTab
            project={projectState}
            onProjectUpdate={setProjectState}
            readOnly={!canUpdateProjectDetails}
          />
        );
    }
  };

  // Map tabs to permission resource names and owner-only gating
  const computedTabs = dashboardProjectTabsData
    .filter((t) => {
      // Hide security tab for non-owners
      if (t.query === "security" && !isOwner) return false;
      return true;
    })
    .map((t) => {
      const resource = resourceMap[t.query];
      const permissionAllows =
        userPermissions && resource ? userPermissions[resource]?.view === true : true;
      const ownerAllows = t.query === "security" ? isOwner : true;
      return {
        ...t,
        disabled: resource ? !(permissionAllows && ownerAllows) : !ownerAllows ? true : false,
      };
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
