"use client";
import React, {useEffect, useState} from "react";
import SettingsMainButtons from "@/components/(pages)/settings/SettingsMainButtons";
import SettingsTabs from "@/components/(pages)/settings/SettingsTabs";
import PageTitle from "@/components/pages/PageTitle";
import AccountTab from "@/components/(pages)/settings/AccountTab";
import SecurityTab from "@/components/(pages)/settings/SecurityTab";
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
  const [handleSave, setHandleSave] = useState<() => void>(() => {});
  const [handleCancel, setHandleCancel] = useState<() => void>(() => {});
  const [isDisabled, setIsDisabled] = useState(false);

  const TabComponents = {
    account: AccountTab,
    security: SecurityTab,
  } as const;

  const SelectedComponent =
    TabComponents[tab as keyof typeof TabComponents] || AccountTab;

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
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-8 pb-24">
        <div className="flex flex-col gap-6">
          <PageTitle
            title="Settings"
            subtitle="Manage your detail and personal preferences here."
          />
          <SettingsTabs tab={tab} />
        </div>
        <SelectedComponent
          profile={profile}
          setIsLoading={setIsLoading}
          setHandleSave={setHandleSave}
          setHandleCancel={setHandleCancel}
          setIsDisabled={setIsDisabled}
        />
      </div>
      <SettingsMainButtons
        isLoading={isLoading}
        handleSave={handleSave}
        handleCancel={handleCancel}
        isDisabled={isDisabled}
      />
    </form>
  );
};

export default SettingsClientPage;
