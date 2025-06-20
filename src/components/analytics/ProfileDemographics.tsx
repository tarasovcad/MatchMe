import {User} from "@supabase/supabase-js";
import React, {useEffect, useState} from "react";

import {
  useAnalyticsDemographics,
  useAnalyticsVisits,
} from "@/hooks/query/dashboard/analytics-visits";
import ProfileDemographicsPie from "./ProfileDemographicsPie";
import ProfileDemographicsList from "./ProfileDemographicsList";
import {useDashboardStore} from "@/store/useDashboardStore";
import {toast} from "sonner";

const ProfileDemographics = ({user}: {user: User}) => {
  const userProfileId = user.id;
  const userUsername = user.user_metadata.username;
  const {dateRange} = useDashboardStore();
  const [selectedDemographic, setSelectedDemographic] = useState<string>("age_distribution");
  const [selectedDemographicList, setSelectedDemographicList] = useState<string>("Map");

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
    dateRange: dateRange,
    username: userUsername,
  });

  useEffect(() => {
    const errors = [
      {error: demographicDataError, name: "demographicDataError"},
      {error: demographicsListDataError, name: "demographicsListDataError"},
    ];

    errors.forEach(({error, name}) => {
      if (error) {
        console.log(error, name);
        toast.error(error.message);
      }
    });
  }, [demographicDataError, demographicsListDataError]);

  return (
    <div className="flex @max-[890px]:gap-[12px] @max-[800px]:flex-col @max-[650px]:gap-[30px]  gap-[18px]">
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
