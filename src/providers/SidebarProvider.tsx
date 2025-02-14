import React from "react";
import {SidebarInset} from "@/components/shadcn/sidebar";
import {SidebarProvider as SidebarShadcnProvider} from "@/components/shadcn/sidebar";
import {AppSidebar} from "@/components/ui/app-sidebar";
import {createClient} from "@/utils/supabase/server";

const SidebarProvider = async ({children}: {children: React.ReactNode}) => {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>User not logged in</div>;
  }

  return (
    <SidebarShadcnProvider>
      <AppSidebar user={user} />
      <SidebarInset className="p-6">{children}</SidebarInset>
    </SidebarShadcnProvider>
  );
};

export default SidebarProvider;
