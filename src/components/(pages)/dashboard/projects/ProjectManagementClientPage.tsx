"use client";
import React, {useState} from "react";
import TabNavigation from "@/components/ui/form/TabNavigation";
import {User} from "@supabase/supabase-js";
import {Project} from "@/types/projects/projects";
import DashboardHeader from "../header/DashboardHeader";
import {dashboardProjectTabsData} from "@/data/tabs/dashboardProjectTabs";
import {useRouter} from "next/navigation";
import ProjectManagementDetailsTab from "./ProjectManagementDetailsTab";
import ProjectManagementSecurityTab from "./ProjectManagementSecurityTab";
import ProjectManagementTeamMembers from "./ProjectManagementTeamMembers";
import ProjectManagementRequests from "./ProjectManagementRequests";
import ProjectManagementOpenPositions from "./ProjectManagementOpenPositions";
import AccessDeniedSection from "@/components/other/AccessDeniedSection";
import ProjectManagementRolesPermissionsTab from "./ProjectManagementRolesPermissionsTab";
import ProjectManagementFollowersTab from "./ProjectManagementFollowersTab";

// Reusable permissions hook
type PermissionAction = "view" | "create" | "update" | "delete" | "notification";
const usePermissions = (
  userPermissions?: Record<string, Record<string, boolean>> | null,
  resolveResourceName?: (key: string) => string | undefined,
) => {
  const can = (action: PermissionAction, resourceKey: string) => {
    const resourceName = resolveResourceName ? resolveResourceName(resourceKey) : undefined;
    if (!userPermissions || !resourceName) return true;
    return userPermissions[resourceName]?.[action] === true;
  };

  const canViewTab = (tabKey: string, isOwner: boolean) => {
    if (tabKey === "security") return isOwner;
    return can("view", tabKey);
  };

  return {can, canViewTab};
};

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

  const [projectState, setProjectState] = useState<Project>(project);

  const resourceMap: Record<string, string> = {
    details: "Project Details",
    "team-members": "Members",
    "open-positions": "Open Positions",
    requests: "Invitations",
    analytics: "Analytics",
    followers: "Followers",
    "roles-permissions": "Roles & Permissions",
    applications: "Applications",
  };

  const {can, canViewTab} = usePermissions(userPermissions, (key) => resourceMap[key]);

  const currentTabKey = typeof tab === "string" ? tab : Array.isArray(tab) ? tab[0] : "";
  const currentTabTitle =
    dashboardProjectTabsData.find((t) => t.query === currentTabKey)?.title ||
    resourceMap[currentTabKey] ||
    currentTabKey;

  // Per-subtab view permissions inside Requests
  const canViewInvitations = can("view", "requests");
  const canViewApplications = can("view", "applications");
  const canViewRequestsTab = canViewInvitations || canViewApplications;

  const canViewCurrentTab =
    currentTabKey === "requests" ? canViewRequestsTab : canViewTab(currentTabKey, isOwner);

  const canUpdateProjectDetails = can("update", "details");
  const canUpdateRolesPermissions = can("update", "roles-permissions");
  const canCreateRolesPermissions = can("create", "roles-permissions");
  const canDeleteRolesPermissions = can("delete", "roles-permissions");
  const canUpdateInvitations = can("update", "requests");
  const canUpdateApplications = can("update", "applications");

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
        return (
          <ProjectManagementRequests
            project={projectState}
            user={user}
            canUpdateInvitations={canUpdateInvitations}
            canUpdateApplications={canUpdateApplications}
            canViewInvitations={canViewInvitations}
            canViewApplications={canViewApplications}
          />
        );
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
        return (
          <ProjectManagementRolesPermissionsTab
            user={user}
            project={projectState}
            readOnly={!canUpdateRolesPermissions}
            canCreate={canCreateRolesPermissions}
            canUpdate={canUpdateRolesPermissions}
            canDelete={canDeleteRolesPermissions}
          />
        );
      case "followers":
        return <ProjectManagementFollowersTab project={projectState} user={user} />;
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
      const permissionAllows = t.query === "requests" ? canViewRequestsTab : can("view", t.query);
      const ownerAllows = t.query === "security" ? isOwner : true;
      return {
        ...t,
        disabled: !(permissionAllows && ownerAllows),
      };
    });

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
        <TabNavigation tabsData={computedTabs} activeTab={tab} />
      </div>

      <div>{renderSelectedComponent()}</div>
    </div>
  );
};

export default ProjectManagementClientPage;
