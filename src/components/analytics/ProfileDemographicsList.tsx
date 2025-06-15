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
            <WorldMap data={data} height={577} />
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
