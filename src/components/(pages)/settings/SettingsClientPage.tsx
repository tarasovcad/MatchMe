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
  skillsArray,
}: {
  tab: string | string[];
  profile: MatchMeUser;
  skillsArray: Option[];
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
      // skills: Array.isArray(profile.skills) ? profile.skills : [],
      skills: ["React", "Java"],
      work_availability: profile.work_availability ?? undefined,
      // location_timezone: profile.location_timezone ?? "",
      location_timezone: "Tokyo / Japan Standard Time (UTC +9)",
      // languages_spoken: profile.languages_spoken ?? "",
      languages: ["English", "German"],
      about_you: profile.about_you ?? "",
      personal_website: profile.personal_website ?? "",
      social_links_1_platform: "x.com/",
      social_links_1: "",
      social_links_2_platform: "github.com/",
      social_links_2: "",
      social_links_3_platform: "linkedin.com/",
      social_links_3: "",
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
          <SelectedComponent profile={profile} skillsArray={skillsArray} />
        </div>
        <SettingsMainButtonts isLoading={isLoading} />
      </FormProvider>
    </form>
  );
};

export default SettingsClientPage;
