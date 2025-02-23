import {submitAccountForm} from "@/actions/settings/submitAccountForm";
import AccountTab from "@/components/(pages)/settings/AccountTab";
import SecurityTab from "@/components/(pages)/settings/SecurityTab";
import SettingsMainButtonts from "@/components/(pages)/settings/SettingsMainButtonts";
import SettingsTabs from "@/components/(pages)/settings/SettingsTabs";
import PageTitle from "@/components/pages/PageTitle";
import SidebarProvider from "@/providers/SidebarProvider";
import {SettingsSessionUser} from "@/types/user/settingsSesssionUser";
import {createClient} from "@/utils/supabase/server";
import React from "react";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  SettingsAccountFormData,
  settingsAccountValidationSchema,
} from "@/validation/settings/settingsAccountValidation";
interface PageProps {
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

const SettingsPage = async ({searchParams}: PageProps) => {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>User not logged in</div>;
  }

  const {email, user_metadata} = user;
  const {username, name, image} = user_metadata;

  let {tab} = await searchParams;
  tab = tab ? tab : "account";

  const TabComponents = {
    account: AccountTab,
    security: SecurityTab,
  } as const;

  const tabProps: SettingsSessionUser = {
    account: {username, name, image},
    security: {email},
  };

  const SelectedComponent =
    TabComponents[tab as keyof typeof TabComponents] || AccountTab;

  const selectedProps = tabProps[tab as keyof SettingsSessionUser] || {};

  return (
    <SidebarProvider>
      <form action={submitAccountForm}>
        <div className="flex flex-col gap-8 pb-24">
          <div className="flex flex-col gap-6 ">
            <PageTitle
              title="Settings"
              subtitle="Manage your detail and personal preferences here."
            />
            <SettingsTabs tab={tab} />
          </div>
          <SelectedComponent {...selectedProps} />
        </div>
        <SettingsMainButtonts />
      </form>
    </SidebarProvider>
  );
};

export default SettingsPage;
