import SidebarProvider from "@/providers/SidebarProvider";
import {createClient} from "@/utils/supabase/server";
import {checkProjectAccess} from "@/actions/projects/projects";
import {notFound, redirect} from "next/navigation";
import React from "react";
import ProjectManagementClientPage from "@/components/(pages)/dashboard/projects/ProjectManagementClientPage";

interface PageProps {
  params: Promise<{slug: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

const allowedTabs = new Set([
  "details",
  "team-members",
  "open-positions",
  "requests",
  "analytics",
  "followers",
  "security",
]);

const normalizeTab = (value: string | string[] | undefined) => {
  const t = Array.isArray(value) ? value[0] : value || "details";
  return allowedTabs.has(t) ? t : "details";
};

const ProjectManagement = async ({params, searchParams}: PageProps) => {
  const {slug} = await params;
  const searchParamsData = await searchParams;
  const tab = normalizeTab(searchParamsData?.tab);

  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if project exists and user has access to it (returns null for not found/unauthorized)
  const accessResult = await checkProjectAccess(slug, user.id);
  if (!accessResult) {
    notFound();
  }

  const {projectData, permissions} = accessResult;
  return (
    <SidebarProvider>
      <ProjectManagementClientPage
        tab={tab as string}
        user={user}
        project={projectData}
        userPermissions={permissions}
      />
    </SidebarProvider>
  );
};

export default ProjectManagement;
