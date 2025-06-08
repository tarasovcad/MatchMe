import AnalyticsBarList from "@/components/analytics/AnalyticsBarList";
import ProfileStatsCard from "@/components/analytics/ProfileStatsCard";
import {UserRound} from "lucide-react";
import {User} from "@supabase/supabase-js";
import ProfileBarLists from "@/components/analytics/ProfileBarLists";

const OverviewTab = ({user}: {user: User}) => {
  return (
    <div className="@container">
      <div className="flex flex-col gap-[18px] @max-[890px]:gap-[12px] ">
        <ProfileStatsCard user={user} />
        <ProfileBarLists user={user} />
      </div>
    </div>
  );
};

export default OverviewTab;
