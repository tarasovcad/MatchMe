import {User} from "@supabase/supabase-js";
import AnalyticsSectionHeader from "./AnalyticsSectionHeader";
import {Percent} from "lucide-react";
import SankeyDiagram from "./SankeyDiagram";

const ProfileConversionRateFunnel = ({user}: {user: User}) => {
  return (
    <div className="border border-border rounded-[12px] p-[18px] @container relative w-full">
      <AnalyticsSectionHeader
        title="Conversion Rate Funnel"
        description="Track user progress from view to invite"
        icon={<Percent size={15} className="text-foreground" />}
      />
      <SankeyDiagram />
    </div>
  );
};

export default ProfileConversionRateFunnel;
