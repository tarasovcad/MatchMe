import {ChevronDown, Map, Monitor, Route, UserRound, Wrench} from "lucide-react";
import React, {useState} from "react";
import AnalyticsBarList from "./AnalyticsBarList";
import {User} from "@supabase/supabase-js";

import {toast} from "sonner";
import {
  useAnalyticsProfilePath,
  useAnalyticsDevice,
  useAnalyticsVisits,
} from "@/hooks/query/dashboard/analytics-visits";
import {useDashboardStore} from "@/store/useDashboardStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {Button} from "../shadcn/button";
import {motion} from "framer-motion";
import {itemDropdownVariants, menuVariants} from "@/utils/other/variants";

const ProfileBarLists = ({user}: {user: User}) => {
  const userProfileId = user.id;
  const userUsername = user.user_metadata.username;
  const {dateRange} = useDashboardStore();

  const [dropdownOpenProfilePath, setDropdownOpenProfilePath] = useState(false);
  const [dropdownOpenDevice, setDropdownOpenDevice] = useState(false);
  const [selectedProfilePath, setSelectedProfilePath] = useState("Referrers");
  const [selectedDeviceType, setSelectedDeviceType] = useState("Device type");

  const handleProfilePathChange = (path: string) => {
    setSelectedProfilePath(path);
  };

  const handleDeviceTypeChange = (type: string) => {
    setSelectedDeviceType(type);
  };

  const chevronVariants = {
    up: {rotate: 180, transition: {duration: 0.2}},
    down: {rotate: 0, transition: {duration: 0.2}},
  };

  const {
    data: roleData,
    isLoading: isRoleDataLoading,
    error: roleDataError,
  } = useAnalyticsVisits({
    id: userProfileId,
    type: "role_counts",
    table: "profile_visits",
  });

  const {
    data: skillsData,
    isLoading: isSkillsDataLoading,
    error: skillsDataError,
  } = useAnalyticsVisits({
    id: userProfileId,
    type: "skill_counts",
    table: "profile_visits",
  });

  const {
    data: profilePathData,
    isLoading: isProfilePathDataLoading,
    error: profilePathDataError,
  } = useAnalyticsProfilePath({
    id: userProfileId,
    type: selectedProfilePath,
    table: "profiles",
    dateRange: dateRange,
    username: userUsername,
  });

  const {
    data: deviceData,
    isLoading: isDeviceDataLoading,
    error: deviceDataError,
  } = useAnalyticsDevice({
    id: userProfileId,
    type: selectedDeviceType,
    table: "profiles",
    dateRange: dateRange,
    username: userUsername,
  });

  if (skillsDataError || roleDataError || profilePathDataError) {
    console.log(skillsDataError, roleDataError, profilePathDataError);
    toast.error("Error loading bar list data");
  }

  return (
    <div className="grid grid-cols-2 @max-[890px]:gap-[12px] @max-[650px]:grid-cols-1 gap-[18px]">
      <AnalyticsBarList
        title="User Journey Analytics"
        data={profilePathData?.data}
        description="Monitor how users navigate through your content"
        icon={<Route size={15} className="text-foreground" />}
        isLoading={isProfilePathDataLoading}
        error={profilePathDataError}
        button={
          <DropdownMenu open={dropdownOpenProfilePath} onOpenChange={setDropdownOpenProfilePath}>
            <DropdownMenuTrigger asChild>
              <Button
                size="xs"
                className="h-[34px] w-full  rounded-[8px] text-sm @min-[370px]:max-w-[138px]">
                {selectedProfilePath}
                <motion.div
                  initial="down"
                  animate={dropdownOpenProfilePath ? "up" : "down"}
                  variants={chevronVariants}>
                  <ChevronDown size={16} className="ml-1.5" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <motion.div initial="closed" animate="open" variants={menuVariants}>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleProfilePathChange("Referrers")}>
                    Referrers
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleProfilePathChange("Entry path")}>
                    Entry path
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleProfilePathChange("End path")}>
                    End path
                  </DropdownMenuItem>
                </motion.div>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <AnalyticsBarList
        title="Device Analytics"
        data={deviceData?.data}
        description="Track device type of users engaging with your project"
        icon={<Monitor size={15} className="text-foreground" />}
        isLoading={isDeviceDataLoading}
        error={deviceDataError}
        button={
          <DropdownMenu open={dropdownOpenDevice} onOpenChange={setDropdownOpenDevice}>
            <DropdownMenuTrigger asChild>
              <Button
                size="xs"
                className="h-[34px] w-full  rounded-[8px] text-sm @min-[370px]:max-w-[138px]">
                {selectedDeviceType}
                <motion.div
                  initial="down"
                  animate={dropdownOpenDevice ? "up" : "down"}
                  variants={chevronVariants}>
                  <ChevronDown size={16} className="ml-1.5" />
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <motion.div initial="closed" animate="open" variants={menuVariants}>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleDeviceTypeChange("Device type")}>
                    Device type
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleDeviceTypeChange("Browser")}>
                    Browser
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleDeviceTypeChange("OS")}>
                    OS
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleDeviceTypeChange("Viewport")}>
                    Viewport
                  </DropdownMenuItem>
                </motion.div>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
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
