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
import {itemDropdownVariants, menuVariants} from "@/utils/other/variants";
import AnalyticsBarListDialog from "./AnalyticsBarListDialog";
import {cn} from "@/lib/utils";
import WorldMap from "./WorldMap";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import EmptyState from "./EmptyState";

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
    flag?: string;
    image?: string;
  }[];
  isLoading: boolean;
  error: Error | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const chevronVariants = {
    up: {rotate: 180, transition: {duration: 0.2}},
    down: {rotate: 0, transition: {duration: 0.2}},
  };

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
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="xs"
                className="h-[34px] w-full  rounded-[8px] text-sm @min-[370px]:max-w-[138px]">
                {selectedDemographicList}
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
                  <DropdownMenuItem onClick={() => handleDemographicChange("Map")}>
                    Map
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleDemographicChange("Counties")}>
                    Counties
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleDemographicChange("Regions")}>
                    Regions
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleDemographicChange("Cities")}>
                    Cities
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleDemographicChange("Languages")}>
                    Languages
                  </DropdownMenuItem>
                </motion.div>
                <motion.div variants={itemDropdownVariants}>
                  <DropdownMenuItem onClick={() => handleDemographicChange("Timezones")}>
                    Timezones
                  </DropdownMenuItem>
                </motion.div>
              </motion.div>
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
        <div className="h-[577px]">
          {data && data.length === 0 ? (
            <div className="flex items-center justify-center w-full h-full">
              <EmptyState />
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
                  : data?.slice(0, maxItems).map((item, index) => {
                      return (
                        <SingleBar
                          key={`${item.label}-${item.count}-${item.percentage}-${index}`}
                          item={item}
                        />
                      );
                    })}
              </motion.div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDemographicsList;
