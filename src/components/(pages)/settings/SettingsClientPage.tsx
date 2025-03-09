"use client";
import React, {useEffect, useState} from "react";
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
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";

const SettingsClientPage = ({
  tab,
  profile,
}: {
  tab: string | string[];
  profile: MatchMeUser;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

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
      is_profile_public: profile.is_profile_public ?? false,
      is_profile_verified: profile.is_profile_verified ?? false,
      name: profile.name ?? "",
      username: profile.username ?? "",
      pronouns: profile.pronouns ?? "",
      age: profile.age ?? undefined,
      public_current_role: profile.public_current_role ?? "",
      looking_for: profile.looking_for ?? "",
      goals: profile.goals ?? "",
      tagline: profile.tagline ?? "",
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      work_availability: profile.work_availability ?? undefined,
      location_timezone: profile.location_timezone ?? "",
      languages: Array.isArray(profile.languages) ? profile.languages : [],
    },
  });

  const onSubmit = async (data: SettingsAccountFormData) => {
    setIsLoading(true);
    try {
      const processedData = {
        ...data,
        socialLinks: [
          {
            platform: data.social_links_1_platform,
            link: data.social_links_1,
          },
          {
            platform: data.social_links_2_platform,
            link: data.social_links_2,
          },
          {
            platform: data.social_links_3_platform,
            link: data.social_links_3,
          },
        ].filter((link) => link.platform && link.link),
      };
      await submitAccountForm(processedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div>
        <LoadingButtonCircle />
      </div>
    );
  }

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <FormProvider {...methods}>
        <div className="flex flex-col gap-8 pb-24">
          <div className="flex flex-col gap-6">
            <PageTitle
              title="Settings"
              subtitle="Manage your detail and personal preferences here."
            />
            <SettingsTabs tab={tab} />
          </div>
          <SelectedComponent profile={profile} />
        </div>
        <SettingsMainButtonts isLoading={isLoading} />
      </FormProvider>
    </form>
  );
};

export default SettingsClientPage;
