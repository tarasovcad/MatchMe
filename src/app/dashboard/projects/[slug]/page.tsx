import DashboardClientPage from "@/components/(pages)/dashboard/DashboardClientPage";
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

const ProjectManagement = async ({params, searchParams}: PageProps) => {
  const {slug} = await params;
  const searchParamsData = await searchParams;
  const tab = searchParamsData?.tab ?? "overview";

  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if project exists and user has access to it
  const accessResult = await checkProjectAccess(slug, user.id);
  if (!accessResult) {
    notFound();
  }
  const {projectData, userPermission, isOwner} = accessResult;

  return (
    <SidebarProvider>
      <ProjectManagementClientPage
        tab={tab as string}
        user={user}
        project={projectData}
        userPermission={projectData.userPermission}
      />
    </SidebarProvider>
  );
};

export default ProjectManagement;
