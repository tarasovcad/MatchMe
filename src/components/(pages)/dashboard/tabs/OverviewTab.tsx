import ProfileStatsCard from "@/components/analytics/ProfileStatsCard";
import {User} from "@supabase/supabase-js";
import ProfileBarLists from "@/components/analytics/ProfileBarLists";
import ProfileDemographics from "@/components/analytics/ProfileDemographics";

const OverviewTab = ({user}: {user: User}) => {
  return (
    <div className="@container">
      <div className="flex flex-col gap-[18px] @max-[890px]:gap-[12px] ">
        <ProfileStatsCard user={user} />
        <ProfileDemographics user={user} />
        <ProfileBarLists user={user} />
      </div>
    </div>
  );
};

export default OverviewTab;
