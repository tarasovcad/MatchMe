"use client";
import React, {useState} from "react";
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
import {MatchMeUser} from "@/types/user/matchMeUser";
import {Option} from "@/components/shadcn/multiselect";

const SettingsClientPage = ({
  tab,
  profile,
  skills,
}: {
  tab: string | string[];
  profile: MatchMeUser;
  skills: Option[];
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const TabComponents = {
    account: AccountTab,
    security: SecurityTab,
  } as const;

  const SelectedComponent =
    TabComponents[tab as keyof typeof TabComponents] || AccountTab;

  const methods = useForm<SettingsAccountFormData>({
    resolver: zodResolver(settingsAccountValidationSchema),
    mode: "onChange",
    defaultValues: {
      name: profile.name,
      username: profile.username,
      age: profile.age || undefined,
    },
  });

  const onSubmit = async (data: SettingsAccountFormData) => {
    setIsLoading(true);
    try {
      await submitAccountForm(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <FormProvider {...methods}>
        <div className="flex flex-col gap-8 pb-24">
          <div className="flex flex-col gap-6 ">
            <PageTitle
              title="Settings"
              subtitle="Manage your detail and personal preferences here."
            />
            <SettingsTabs tab={tab} />
          </div>
          <SelectedComponent profile={profile} skills={skills} />
        </div>
        <SettingsMainButtonts isLoading={isLoading} />
      </FormProvider>
    </form>
  );
};

export default SettingsClientPage;
