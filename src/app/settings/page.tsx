import SettingsTabs from "@/components/(pages)/settings/SettingsTabs";
import PageTitle from "@/components/pages/PageTitle";
import SidebarProvider from "@/providers/SidebarProvider";
import React from "react";

const page = () => {
  return (
    <SidebarProvider>
      <div className="flex flex-col gap-6">
        <PageTitle
          title="Settings"
          subtitle="Manage your detail and personal preferences here."
        />
        <SettingsTabs />
      </div>
    </SidebarProvider>
  );
};

export default page;
