"use client";
import React from "react";
import SettingsMainButtonts from "@/components/(pages)/settings/SettingsMainButtonts";
import SettingsTabs from "@/components/(pages)/settings/SettingsTabs";
import PageTitle from "@/components/pages/PageTitle";
import {submitAccountForm} from "@/actions/settings/submitAccountForm";
import AccountTab from "@/components/(pages)/settings/AccountTab";
import SecurityTab from "@/components/(pages)/settings/SecurityTab";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  SettingsAccountFormData,
  settingsAccountValidationSchema,
} from "@/validation/settings/settingsAccountValidation";
import {SettingsSessionUser} from "@/types/user/settingsSesssionUser";
import {MatchMeUser} from "@/types/user/matchMeUser";

const SettingsClientPage = ({
  tab,
  profile,
}: {
  tab: string | string[];
  profile: MatchMeUser;
}) => {
  const TabComponents = {
    account: AccountTab,
    security: SecurityTab,
  } as const;
  const tabProps: SettingsSessionUser = {
    account: {profile},
    security: {profile},
  };
  const SelectedComponent =
    TabComponents[tab as keyof typeof TabComponents] || AccountTab;
  const selectedProps = tabProps[tab as keyof SettingsSessionUser] || {};

  const methods = useForm<SettingsAccountFormData>({
    resolver: zodResolver(settingsAccountValidationSchema),
    mode: "onChange",
    defaultValues: {
      name: profile.name,
      username: profile.username,
      age: profile.age || undefined,
    },
  });
  return (
    <form onSubmit={methods.handleSubmit(submitAccountForm)}>
      <FormProvider {...methods}>
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
      </FormProvider>
    </form>
  );
};

export default SettingsClientPage;
