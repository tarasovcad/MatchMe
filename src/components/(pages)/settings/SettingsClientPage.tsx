"use client";
import React, {useEffect, useState} from "react";
import SettingsMainButtons from "@/components/(pages)/settings/SettingsMainButtons";
import SettingsTabs from "@/components/(pages)/settings/SettingsTabs";
import PageTitle from "@/components/pages/PageTitle";
import AccountTab from "@/components/(pages)/settings/AccountTab";
import SecurityTab from "@/components/(pages)/settings/SecurityTab";
import {MatchMeUser} from "@/types/user/matchMeUser";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import {motion} from "framer-motion";
import {
  bottomSectionButtonsVariants,
  containerVariants,
  itemVariants,
} from "@/utils/other/variants";

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
    return <div></div>;
  }

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      onSubmit={(e) => e.preventDefault()}>
      <motion.div
        variants={containerVariants}
        className="flex flex-col gap-8 pb-24">
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <PageTitle
            title="Settings"
            subtitle="Manage your details and personal preferences here."
          />
          <SettingsTabs tab={tab} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <SelectedComponent
            profile={profile}
            setIsLoading={setIsLoading}
            setHandleSave={setHandleSave}
            setHandleCancel={setHandleCancel}
            setIsDisabled={setIsDisabled}
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={bottomSectionButtonsVariants}
        className="right-0 bottom-0 left-0 z-[5] fixed flex justify-end items-center gap-[10px] bg-sidebar-background shadow-lg p-6 border-t border-border">
        <SettingsMainButtons
          isLoading={isLoading}
          handleSave={handleSave}
          handleCancel={handleCancel}
          isDisabled={isDisabled}
        />
      </motion.div>
    </motion.form>
  );
};

export default SettingsClientPage;
