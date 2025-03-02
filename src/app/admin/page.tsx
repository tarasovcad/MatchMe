import {getUserRole} from "@/actions/(auth)/getUserRole";
import React from "react";
import {redirect} from "next/navigation";
import SetSkills from "@/admin/pages/SetSkills";
import SidebarProvider from "@/providers/SidebarProvider";

const Page = async () => {
  const userRole = await getUserRole();

  if (userRole === "error" || userRole === "null" || userRole !== "admin") {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <SetSkills />
    </SidebarProvider>
  );
};

export default Page;
