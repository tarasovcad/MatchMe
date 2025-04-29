import DashboardClientPage from "@/components/(pages)/dashboard/DashboardClientPage";
import SidebarProvider from "@/providers/SidebarProvider";
import React from "react";
interface PageProps {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

const DashboardPage = async ({searchParams}: PageProps) => {
  const params = await searchParams;
  const tab = params?.tab ?? "overview";

  return (
    <SidebarProvider>
      <DashboardClientPage tab={tab} />
    </SidebarProvider>
  );
};

export default DashboardPage;
