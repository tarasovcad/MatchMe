import {User} from "@supabase/supabase-js";
import React from "react";
import AnalyticsSectionHeader from "./AnalyticsSectionHeader";
import {ChevronDown, Globe, UserRound} from "lucide-react";
import {Button} from "../shadcn/button";
import AnalyticsPieChart from "./AnalyticsPieChart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

const ProfileDemographics = ({user}: {user: User}) => {
  return (
    <div className="flex @max-[890px]:gap-[12px]  @max-[650px]:flex-col @max-[650px]:gap-[30px]  gap-[18px]">
      <div className="w-full border border-border rounded-[12px] p-[18px] relative max-w-[320px]">
        <AnalyticsSectionHeader
          title="Demographic Breakdown"
          description="Break down user demographics for better insights"
          icon={<Globe size={15} className="text-foreground" />}
          className="gap-3 items-start flex-col"
          button={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="xs"
                  className="h-[34px] w-full  rounded-[8px] text-sm @min-[370px]:max-w-[138px]">
                  Age Group
                  <ChevronDown
                    size={16}
                    className="ml-1.5 transition-transform duration-300 ease-in-out"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Age Group</DropdownMenuItem>
                <DropdownMenuItem>Gender</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
        <AnalyticsPieChart />
      </div>
    </div>
  );
};

export default ProfileDemographics;
