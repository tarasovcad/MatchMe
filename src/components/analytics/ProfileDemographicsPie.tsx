import React from "react";
import AnalyticsSectionHeader from "./AnalyticsSectionHeader";
import {ChevronDown, Globe} from "lucide-react";
import {Button} from "../shadcn/button";
import AnalyticsPieChart from "./AnalyticsPieChart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

const ProfileDemographicsPie = ({
  selectedDemographic,
  setSelectedDemographic,
  demographicData,
  isDemographicDataLoading,
  demographicDataError,
}: {
  selectedDemographic: string;
  setSelectedDemographic: (demographic: string) => void;
  demographicData: {
    label: string;
    count: number;
    percentage: number;
    relative: number;
    fill: string;
  }[];
  isDemographicDataLoading: boolean;
  demographicDataError: Error | null;
}) => {
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
    <div className="w-full border border-border rounded-[12px] p-[18px] relative max-w-[360px]">
      <AnalyticsSectionHeader
        title="Demographic Breakdown (All Time)"
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
  );
};

export default ProfileDemographicsPie;
