import AnalyticsBarList from "@/components/analytics/AnalyticsBarList";
import ProfileStatsCard from "@/components/analytics/ProfileStatsCard";
import {UserRound} from "lucide-react";
import {User} from "@supabase/supabase-js";

const OverviewTab = ({user}: {user: User}) => {
  return (
    <div className="flex flex-col gap-[18px]">
      <ProfileStatsCard user={user} />
      <div className="flex gap-[18px]">
        <AnalyticsBarList
          title="Role-Based Insights"
          description="Track roles of users engaging with your project"
          icon={<UserRound size={15} className="text-foreground" />}
        />
        <AnalyticsBarList
          title="Role-Based Insights"
          description="Track roles of users engaging with your project"
          icon={<UserRound size={15} className="text-foreground" />}
        />
      </div>
    </div>
  );
};

export default OverviewTab;
