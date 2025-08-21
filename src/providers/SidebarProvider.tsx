import React from "react";
import {SidebarInset} from "@/components/shadcn/sidebar";
import {SidebarProvider as SidebarShadcnProvider} from "@/components/shadcn/sidebar";
import {AppSidebar} from "@/components/ui/(sidebar)/AppSidebar";
import {createClient} from "@/utils/supabase/server";
import Navbar from "@/components/ui/(sidebar)/Navbar";

const SidebarProvider = async ({
  children,
  removePadding,
  bottomPadding,
}: {
  children: React.ReactNode;
  removePadding?: boolean;
  bottomPadding?: boolean;
}) => {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  return (
    <>
      <SidebarShadcnProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <Navbar />
          <div
            className={`${removePadding ? "" : "p-3 sm:p-4 md:p-6"} ${bottomPadding ? "pb-12 sm:pb-16 lg:pb-20" : ""}`}>
            {children}
          </div>
        </SidebarInset>
      </SidebarShadcnProvider>
    </>
  );
};

export default SidebarProvider;
