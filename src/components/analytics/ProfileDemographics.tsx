import {User} from "@supabase/supabase-js";
import React, {useState} from "react";
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
import {useAnalyticsVisits} from "@/hooks/query/dashboard/analytics-visits";

const ProfileDemographics = ({user}: {user: User}) => {
  const userProfileId = user.id;

  const [selectedDemographic, setSelectedDemographic] = useState<string>("age_distribution");

  const {
    data: demographicData,
    isLoading: isDemographicDataLoading,
    error: demographicDataError,
  } = useAnalyticsVisits({
    id: userProfileId,
    type: selectedDemographic,
    table: "profile_visits",
  });

  console.log(demographicData);

  const handleDemographicChange = (demographic: string) => {
    setSelectedDemographic(demographic);
  };

  const getDemographicDisplayName = (demographic: string) => {
    switch (demographic) {
      case "age_distribution":
        return "Age Group";
      case "pronoun_counts":
        return "Pronouns";
      default:
        return "Age Group";
    }
  };

  const getDemographicChartTitle = (demographic: string) => {
    switch (demographic) {
      case "age_distribution":
        return "Age Distribution";
      case "pronoun_counts":
        return "Pronoun Distribution";
      default:
        return "Age Distribution";
    }
  };

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
                  {getDemographicDisplayName(selectedDemographic)}
                  <ChevronDown
                    size={16}
                    className="ml-1.5 transition-transform duration-300 ease-in-out"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDemographicChange("age_distribution")}>
                  Age Group
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDemographicChange("pronoun_counts")}>
                  Pronouns
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
        <AnalyticsPieChart
          data={demographicData}
          isLoading={isDemographicDataLoading}
          error={demographicDataError}
          title={getDemographicDisplayName(selectedDemographic)}
          chartTitle={getDemographicChartTitle(selectedDemographic)}
        />
      </div>
    </div>
  );
};

export default ProfileDemographics;
