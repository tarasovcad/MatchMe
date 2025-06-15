import React, {useState} from "react";
import AnalyticsSectionHeader from "./AnalyticsSectionHeader";
import {ChevronDown, Globe} from "lucide-react";
import {Button} from "../shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {SingleBar, SingleBarSkeleton} from "./AnalyticsBarList";
import {motion} from "framer-motion";
import {containerVariants} from "@/utils/other/analyticsVariants";
import AnalyticsBarListDialog from "./AnalyticsBarListDialog";
import {cn} from "@/lib/utils";
import WorldMap from "./WorldMap";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";

const ProfileDemographicsList = ({
  selectedDemographicList,
  setSelectedDemographicList,
  data,
  isLoading,
  error,
}: {
  selectedDemographicList: string;
  setSelectedDemographicList: (demographic: string) => void;
  data: {
    label: string;
    count: number;
    percentage: number;
    relative: number;
  }[];
  isLoading: boolean;
  error: Error | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const fakeMapData = [
    {
      label: "United States",
      count: 1250,
      percentage: 35.2,
      relative: 100,
    },
    {
      label: "Canada",
      count: 890,
      percentage: 25.1,
      relative: 71.2,
    },
    {
      label: "United Kingdom",
      count: 650,
      percentage: 18.3,
      relative: 52.0,
    },
    {
      label: "Germany",
      count: 420,
      percentage: 11.8,
      relative: 33.6,
    },
    {
      label: "France",
      count: 380,
      percentage: 10.7,
      relative: 30.4,
    },
    {
      label: "Australia",
      count: 320,
      percentage: 9.0,
      relative: 25.6,
    },
    {
      label: "Japan",
      count: 280,
      percentage: 7.9,
      relative: 22.4,
    },
    {
      label: "Brazil",
      count: 240,
      percentage: 6.8,
      relative: 19.2,
    },
    {
      label: "India",
      count: 210,
      percentage: 5.9,
      relative: 16.8,
    },
    {
      label: "Netherlands",
      count: 180,
      percentage: 5.1,
      relative: 14.4,
    },
    {
      label: "Sweden",
      count: 150,
      percentage: 4.2,
      relative: 12.0,
    },
    {
      label: "Spain",
      count: 130,
      percentage: 3.7,
      relative: 10.4,
    },
    {
      label: "Italy",
      count: 120,
      percentage: 3.4,
      relative: 9.6,
    },
    {
      label: "South Korea",
      count: 95,
      percentage: 2.7,
      relative: 7.6,
    },
    {
      label: "Mexico",
      count: 85,
      percentage: 2.4,
      relative: 6.8,
    },
    {
      label: "Norway",
      count: 70,
      percentage: 2.0,
      relative: 5.6,
    },
    {
      label: "Denmark",
      count: 60,
      percentage: 1.7,
      relative: 4.8,
    },
    {
      label: "Belgium",
      count: 45,
      percentage: 1.3,
      relative: 3.6,
    },
    {
      label: "Switzerland",
      count: 40,
      percentage: 1.1,
      relative: 3.2,
    },
    {
      label: "Finland",
      count: 35,
      percentage: 1.0,
      relative: 2.8,
    },
  ];

  const handleDemographicChange = (demographic: string) => {
    setSelectedDemographicList(demographic);
  };
  const maxItems = 14;

  return (
    <div
      className={cn(
        "w-full border border-border rounded-[12px] p-[18px]  @container relative max-h-[615px]",
        data?.length > maxItems && "mb-[17px]",
      )}>
      <AnalyticsSectionHeader
        title="Global View Distribution"
        description="See the geographic locations of users viewing your profile"
        icon={<Globe size={15} className="text-foreground" />}
        button={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="xs"
                className="h-[34px] w-full  rounded-[8px] text-sm @min-[370px]:max-w-[138px]">
                {selectedDemographicList}
                <ChevronDown
                  size={16}
                  className="ml-1.5 transition-transform duration-300 ease-in-out"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDemographicChange("Map")}>
                Map
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDemographicChange("Counties")}>
                Counties
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDemographicChange("Regions")}>
                Regions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDemographicChange("Cities")}>
                Cities
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDemographicChange("Languages")}>
                Languages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDemographicChange("Timezones")}>
                Timezones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      {selectedDemographicList === "Map" ? (
        <div className="w-full mt-[18px]">
          {isLoading || error ? (
            <div className="flex justify-center items-center h-[577px] text-foreground/50">
              <LoadingButtonCircle size={22} />
            </div>
          ) : (
            <WorldMap data={fakeMapData} height={577} />
          )}
        </div>
      ) : (
        <>
          {!isLoading && !error && data && data.length > maxItems && (
            <>
              <AnalyticsBarListDialog
                title="Global View Distribution"
                data={data}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <Button
                  size="xs"
                  className="h-[34px] w-[100px] rounded-[8px] "
                  variant="outline"
                  onClick={() => setIsOpen(true)}>
                  View More
                </Button>
              </div>
            </>
          )}
          <motion.div
            className={cn(
              "w-full flex flex-col gap-1.5 mt-[18px] relative",
              data?.length > maxItems && "mb-[2px]",
            )}
            variants={isLoading ? {hidden: {}, visible: {}} : containerVariants}
            initial="hidden"
            animate="visible"
            style={
              !isLoading && !error && data && data.length > maxItems
                ? {
                    maskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(0,0,0,0.3) 90%, rgba(0,0,0,0.05) 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(0,0,0,0.3) 90%, rgba(0,0,0,0.05) 100%)",
                  }
                : undefined
            }>
            {isLoading || error
              ? Array.from({length: maxItems}, (_, index) => (
                  <SingleBarSkeleton key={`skeleton-${index}`} />
                ))
              : data?.slice(0, maxItems).map((item) => {
                  return <SingleBar key={item.label + item.percentage} item={item} />;
                })}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ProfileDemographicsList;
