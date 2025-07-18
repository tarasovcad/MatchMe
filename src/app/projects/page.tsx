import ProjectsClientPage from "@/components/(pages)/projects/ProjectsClientPage";
import SidebarProvider from "@/providers/SidebarProvider";
import {createClient} from "@/utils/supabase/server";
import React from "react";

const ProjectsPage = async () => {
  const supabase = await createClient();
  const {data: userSession} = await supabase.auth.getUser();
  return (
    <SidebarProvider>
      <ProjectsClientPage userSession={userSession.user} />
    </SidebarProvider>
  );
};

export default ProjectsPage;
