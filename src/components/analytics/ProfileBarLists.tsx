import {UserRound, Wrench} from "lucide-react";
import React from "react";
import AnalyticsBarList from "./AnalyticsBarList";
import {User} from "@supabase/supabase-js";
import {useBarList} from "@/hooks/query/dashboard/bar-list";
import {toast} from "sonner";

const ProfileBarLists = ({user}: {user: User}) => {
  const userProfileId = user.id;

  const {
    data: roleData,
    isLoading: isRoleDataLoading,
    error: roleDataError,
  } = useBarList({
    id: userProfileId,
    type: "role_counts",
    table: "profile_visits",
  });

  const {
    data: skillsData,
    isLoading: isSkillsDataLoading,
    error: skillsDataError,
  } = useBarList({
    id: userProfileId,
    type: "skill_counts",
    table: "profile_visits",
  });

  if (skillsDataError || roleDataError) {
    toast.error("Error loading bar list data");
  }

  return (
    <div className="flex @max-[890px]:gap-[12px]  @max-[650px]:flex-col @max-[650px]:gap-[30px]  gap-[18px]">
      <AnalyticsBarList
        title="Role-Based Insights (All Time)"
        data={roleData}
        description="Track roles of users engaging with your project"
        icon={<UserRound size={15} className="text-foreground" />}
        isLoading={isRoleDataLoading}
        error={roleDataError}
      />
      <AnalyticsBarList
        title="Skills-Based Insights (All Time)"
        data={skillsData}
        description="Track skills of users engaging with your project"
        icon={<Wrench size={15} className="text-foreground" />}
        isLoading={isSkillsDataLoading}
        error={skillsDataError}
      />
    </div>
  );
};

export default ProfileBarLists;
