import React, {useState} from "react";
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
import {motion} from "framer-motion";
import {itemDropdownVariants, menuVariants} from "@/utils/other/variants";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const chevronVariants = {
    up: {rotate: 180, transition: {duration: 0.2}},
    down: {rotate: 0, transition: {duration: 0.2}},
  };

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

  const fallbackData =
    getDemographicDisplayName(selectedDemographic) === "Age Group"
      ? [
          {
            label: "25-34",
            count: 0,
            percentage: 0,
            relative: 0,
            fill: "hsl(var(--chart-1))",
          },
          {
            label: "18-24",
            count: 0,
            percentage: 0,
            relative: 0,
            fill: "hsl(var(--chart-2))",
          },
          {
            label: "35-44",
            count: 0,
            percentage: 0,
            relative: 0,
            fill: "hsl(var(--chart-3))",
          },
          {
            label: "45-54",
            count: 0,
            percentage: 0,
            relative: 0,
            fill: "hsl(var(--chart-4))",
          },
          {
            label: "55+",
            count: 0,
            percentage: 0,
            relative: 0,
            fill: "hsl(var(--chart-5))",
          },
        ]
      : [
          {
            label: "She/Her",
            count: 0,
            percentage: 0,
            relative: 0,
            fill: "hsl(var(--chart-1))",
          },
          {
            label: "He/Him",
            count: 0,
            percentage: 0,
            relative: 0,
            fill: "hsl(var(--chart-2))",
          },
          {
            label: "They/Them",
            count: 0,
            percentage: 0,
            relative: 0,
            fill: "hsl(var(--chart-3))",
          },
        ];

  return (
    <div className="w-full border border-border rounded-[12px] p-[18px] relative @min-[800px]:max-w-[360px] ">
      <AnalyticsSectionHeader
        title="Demographic Breakdown (All Time)"
        description="Break down user demographics for better insights"
        icon={<Globe size={15} className="text-foreground" />}
        className="gap-3 items-start flex-col"
        button={
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="xs"
                className="h-[34px] w-full  rounded-[8px] text-sm @min-[370px]:max-w-[138px]">
                {getDemographicDisplayName(selectedDemographic)}
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
                  <DropdownMenuItem onClick={() => handleDemographicChange("age_distribution")}>
                    Age Group
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleDemographicChange("pronoun_counts")}>
                    Pronouns
                  </DropdownMenuItem>
                </motion.div>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <AnalyticsPieChart
        data={demographicData}
        fallbackData={fallbackData}
        isLoading={isDemographicDataLoading}
        error={demographicDataError}
        title={getDemographicDisplayName(selectedDemographic)}
        chartTitle={getDemographicChartTitle(selectedDemographic)}
      />
    </div>
  );
};

export default ProfileDemographicsPie;
