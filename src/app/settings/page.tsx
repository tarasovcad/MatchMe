import AccountTab from "@/components/(pages)/settings/AccountTab";
import SecurityTab from "@/components/(pages)/settings/SecurityTab";
import SettingsMainButtonts from "@/components/(pages)/settings/SettingsMainButtonts";
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

  const TabComponents = {
    account: AccountTab,
    security: SecurityTab,
  } as const;

  const SelectedComponent =
    TabComponents[tab as keyof typeof TabComponents] || AccountTab;

  return (
    <SidebarProvider>
      <div className="flex flex-col gap-8 pb-24 ">
        <div className="flex flex-col gap-6 ">
          <PageTitle
            title="Settings"
            subtitle="Manage your detail and personal preferences here."
          />
          <SettingsTabs tab={tab} />
        </div>
        <SelectedComponent />
      </div>
      <SettingsMainButtonts />
    </SidebarProvider>
  );
};

export default SettingsPage;
