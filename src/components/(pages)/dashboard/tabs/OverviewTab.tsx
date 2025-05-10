import ProfileStatsCard from "@/components/analytics/ProfileStatsCard";
import {User} from "@supabase/supabase-js";

const OverviewTab = ({user}: {user: User}) => {
  return (
    <div>
      <ProfileStatsCard user={user} />
    </div>
  );
};

export default OverviewTab;
