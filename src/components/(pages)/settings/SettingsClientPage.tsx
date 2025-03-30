"use client";
import React, {useEffect, useState} from "react";
import SettingsMainButtons from "@/components/(pages)/settings/SettingsMainButtons";
import SettingsTabs from "@/components/(pages)/settings/SettingsTabs";
import PageTitle from "@/components/pages/PageTitle";
import AccountTab from "@/components/(pages)/settings/AccountTab";
import SecurityTab from "@/components/(pages)/settings/SecurityTab";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {motion} from "framer-motion";
import {
  bottomSectionButtonsVariants,
  containerVariants,
  itemVariants,
} from "@/utils/other/variants";
import {User} from "@supabase/supabase-js";
import Alert from "@/components/ui/Alert";
import {canChangeUsername} from "@/functions/canChangeUsername";
import {canUserMakeProfilePublic} from "@/functions/canUserMakeProfilePublic";

const SettingsClientPage = ({
  tab,
  profile,
  user,
}: {
  tab: string | string[];
  profile: MatchMeUser;
  user: User;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [handleSave, setHandleSave] = useState<() => void>(() => {});
  const [handleCancel, setHandleCancel] = useState<() => void>(() => {});
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div></div>;
  }
  console.log(isDisabled, "isDisabled");

  const usernameChangeStatus = profile?.username_changed_at
    ? canChangeUsername(profile.username_changed_at)
    : {canChange: true, nextAvailableDate: null};

  const {canMakeProfilePublic} = canUserMakeProfilePublic(profile);

  const renderSelectedComponent = () => {
    const commonProps = {
      profile,
      setIsLoading,
      setHandleSave,
      setHandleCancel,
      setIsDisabled,
    };

    switch (tab) {
      case "account":
        return <AccountTab {...commonProps} />;
      case "security":
        return <SecurityTab {...commonProps} user={user} />;
      default:
        return <AccountTab {...commonProps} />;
    }
  };

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      onSubmit={(e) => e.preventDefault()}>
      <motion.div
        variants={containerVariants}
        className="flex flex-col gap-8 pb-24">
        {tab === "security" && !usernameChangeStatus.canChange && (
          <Alert
            message={`Your next available change date is ${usernameChangeStatus.nextAvailableDate}.`}
            title="Usernames can only be changed once a month"
            type="warning"
          />
        )}
        {tab === "account" && !canMakeProfilePublic && (
          <Alert
            message="To make your profile public, you need to fill in all required details and provide more information about yourself."
            title="Your profile is incomplete!"
            type="warning"
          />
        )}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <PageTitle
            title="Settings"
            subtitle="Manage your details and personal preferences here."
          />
          <SettingsTabs tab={tab} user={user} />
        </motion.div>

        <motion.div variants={itemVariants}>
          {renderSelectedComponent()}
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
