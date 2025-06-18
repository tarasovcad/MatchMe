import {User} from "@supabase/supabase-js";

import AnalyticsSectionHeader from "./AnalyticsSectionHeader";
import {Calendar, ChevronDown} from "lucide-react";
import WeeklyHeatmap from "./WeeklyHeatmap";
import {Button} from "../shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import {motion} from "framer-motion";
import {useState} from "react";
import {itemDropdownVariants, menuVariants} from "@/utils/other/variants";
import {useProfileHeatmap} from "@/hooks/query/dashboard/analytics-visits";
import {useDashboardStore} from "@/store/useDashboardStore";

const ProfileWeeklyHeatmap = ({user}: {user: User}) => {
  const userUsername = user.user_metadata.username;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedHeatmapType, setSelectedHeatmapType] = useState("Visitors");
  const {dateRange} = useDashboardStore();
  const chevronVariants = {
    up: {rotate: 180, transition: {duration: 0.2}},
    down: {rotate: 0, transition: {duration: 0.2}},
  };

  const {
    data: heatmapData,
    isLoading: isHeatmapDataLoading,
    error: heatmapDataError,
  } = useProfileHeatmap({
    username: userUsername,
    type: selectedHeatmapType,
    dateRange: dateRange,
  });

  return (
    <div className="border border-border rounded-[12px] p-[18px] pb-[10px]  @container relative w-full max-w-[495px]">
      <AnalyticsSectionHeader
        title="Weekly Engagement Heatmap"
        description="Track user activity by day and time"
        icon={<Calendar size={15} className="text-foreground" />}
        button={
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="xs"
                className="h-[34px] w-full  rounded-[8px] text-sm @min-[370px]:max-w-[138px]">
                {selectedHeatmapType}
                <motion.div
                  initial="down"
                  animate={dropdownOpen ? "up" : "down"}
                  variants={chevronVariants}>
                  <ChevronDown size={16} className="ml-1.5" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <motion.div initial="closed" animate="open" variants={menuVariants}>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => setSelectedHeatmapType("Visitors")}>
                    Visitors
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => setSelectedHeatmapType("Views")}>
                    Views
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => setSelectedHeatmapType("Sessions")}>
                    Sessions
                  </DropdownMenuItem>
                </motion.div>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <WeeklyHeatmap
        selectedHeatmapType={selectedHeatmapType}
        data={heatmapData}
        isLoading={isHeatmapDataLoading}
        error={heatmapDataError || undefined}
      />
    </div>
  );
};

export default ProfileWeeklyHeatmap;
