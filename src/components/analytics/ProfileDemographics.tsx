import {User} from "@supabase/supabase-js";
import React, {useState} from "react";

import {
  useAnalyticsDemographics,
  useAnalyticsVisits,
} from "@/hooks/query/dashboard/analytics-visits";
import ProfileDemographicsPie from "./ProfileDemographicsPie";
import ProfileDemographicsList from "./ProfileDemographicsList";

const ProfileDemographics = ({user}: {user: User}) => {
  const userProfileId = user.id;
  const userUsername = user.user_metadata.username;

  const [selectedDemographic, setSelectedDemographic] = useState<string>("age_distribution");
  const [selectedDemographicList, setSelectedDemographicList] = useState<string>("country");

  const {
    data: demographicData,
    isLoading: isDemographicDataLoading,
    error: demographicDataError,
  } = useAnalyticsVisits({
    id: userProfileId,
    type: selectedDemographic,
    table: "profile_visits",
  });

  const {
    data: demographicsListData,
    isLoading: isDemographicsListDataLoading,
    error: demographicsListDataError,
  } = useAnalyticsDemographics({
    id: userProfileId,
    type: selectedDemographicList,
    table: "profiles",
    dateRange: "All Time",
    username: userUsername,
  });

  console.log(demographicsListData);
  console.log(demographicData);
  return (
    <div className="flex @max-[890px]:gap-[12px] @max-[650px]:flex-col @max-[650px]:gap-[30px]  gap-[18px]">
      <ProfileDemographicsPie
        selectedDemographic={selectedDemographic}
        setSelectedDemographic={setSelectedDemographic}
        demographicData={demographicData}
        isDemographicDataLoading={isDemographicDataLoading}
        demographicDataError={demographicDataError}
      />
      <ProfileDemographicsList
        selectedDemographicList={selectedDemographicList}
        setSelectedDemographicList={setSelectedDemographicList}
        data={demographicsListData?.data}
        isLoading={isDemographicsListDataLoading}
        error={demographicsListDataError}
      />
    </div>
  );
};

export default ProfileDemographics;
