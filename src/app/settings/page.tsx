import SettingsTabs from "@/components/(pages)/settings/SettingsTabs";
import PageTitle from "@/components/pages/PageTitle";
import SidebarProvider from "@/providers/SidebarProvider";
import React from "react";

interface PageProps {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

const SettingsPage = async ({searchParams}: PageProps) => {
  let {tab} = await searchParams;
  tab = tab ? tab : "account";
  return (
    <SidebarProvider>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <PageTitle
            title="Settings"
            subtitle="Manage your detail and personal preferences here."
          />
          <SettingsTabs tab={tab} />
        </div>
        <div>123</div>
      </div>
    </SidebarProvider>
  );
};

export default SettingsPage;
