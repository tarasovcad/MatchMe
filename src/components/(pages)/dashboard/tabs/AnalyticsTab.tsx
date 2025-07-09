import ProfileStatsCard from "@/components/analytics/ProfileStatsCard";
import {User} from "@supabase/supabase-js";
import ProfileBarLists from "@/components/analytics/ProfileBarLists";
import ProfileDemographics from "@/components/analytics/ProfileDemographics";
import ProfileEventsBar from "@/components/analytics/ProfileEventsBar";
import ProfileWeeklyHeatmap from "@/components/analytics/ProfileWeeklyHeatmap";
import ProfileConversionRateFunnel from "@/components/analytics/ProfileConversionRateFunnel";

const AnalyticsTab = ({user}: {user: User}) => {
  return (
    <div className="@container">
      <div className="flex flex-col gap-[18px] @max-[890px]:gap-[12px] ">
        <ProfileStatsCard user={user} />
        <ProfileConversionRateFunnel user={user} />
        <div className="flex @max-[890px]:gap-[12px] @max-[650px]:flex-col @max-[650px]:gap-[30px]  gap-[18px]">
          <ProfileWeeklyHeatmap user={user} />
        </div>

        <ProfileEventsBar user={user} />
        <ProfileDemographics user={user} />
        <ProfileBarLists user={user} />
      </div>
    </div>
  );
};

export default AnalyticsTab;
