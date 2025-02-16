import React from "react";
import {SidebarInset} from "@/components/shadcn/sidebar";
import {SidebarProvider as SidebarShadcnProvider} from "@/components/shadcn/sidebar";
import {AppSidebar} from "@/components/ui/(sidebar)/AppSidebar";
import {createClient} from "@/utils/supabase/server";
import Navbar from "@/components/ui/(sidebar)/Navbar";

const SidebarProvider = async ({children}: {children: React.ReactNode}) => {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>User not logged in</div>;
  }

  return (
    <div>
      <SidebarShadcnProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <Navbar />
          <div className="p-6">{children}</div>
        </SidebarInset>
      </SidebarShadcnProvider>
    </div>
  );
};

export default SidebarProvider;
