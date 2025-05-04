import DashboardClientPage from "@/components/(pages)/dashboard/DashboardClientPage";
import SidebarProvider from "@/providers/SidebarProvider";
import {createClient} from "@/utils/supabase/server";
import React from "react";
interface PageProps {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

const DashboardPage = async ({searchParams}: PageProps) => {
  const params = await searchParams;
  const tab = params?.tab ?? "overview";

  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>User not logged in</div>;
  }

  return (
    <SidebarProvider>
      <DashboardClientPage tab={tab} user={user} />
    </SidebarProvider>
  );
};

export default DashboardPage;
