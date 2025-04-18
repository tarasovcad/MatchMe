import CreateProject from "@/components/(pages)/dashboard/create-project/CreateProject";
import SidebarProvider from "@/providers/SidebarProvider";
import React from "react";

const page = () => {
  return (
    <SidebarProvider>
      <CreateProject />
    </SidebarProvider>
  );
};

export default page;
