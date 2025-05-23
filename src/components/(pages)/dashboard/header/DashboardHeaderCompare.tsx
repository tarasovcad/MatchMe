import React, {useState} from "react";
import {Calendar, ChevronDown, Scale} from "lucide-react";
import {Button} from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {motion} from "framer-motion";
import {itemDropdownVariants, menuVariants} from "@/utils/other/variants";
import {cn} from "@/lib/utils";
import {useDashboardStore} from "@/store/useDashboardStore";

const DashboardHeaderCompare = ({className}: {className?: string}) => {
  const [open, setOpen] = useState(false);

  const chevronVariants = {
    up: {rotate: 180, transition: {duration: 0.2}},
    down: {rotate: 0, transition: {duration: 0.2}},
  };

  const {compareDateRange, setCompareDateRange} = useDashboardStore();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size={"sm"} className={cn("h-[38px] px-3.5", className)}>
          <div className="flex items-center gap-2">
            <Scale size={16} strokeWidth={2} className="@max-[422px]:hidden" />
            {compareDateRange}
          </div>
          <motion.div initial="down" animate={open ? "up" : "down"} variants={chevronVariants}>
            <ChevronDown size={16} strokeWidth={2} className="opacity-90" />
          </motion.div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="center" sideOffset={4}>
        <motion.div
          initial="closed"
          animate="open"
          variants={menuVariants}
          className="space-y-2 rounded-lg min-w-[160px]">
          <DropdownMenuGroup>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn("cursor-pointer", compareDateRange === "Disabled" && "bg-accent")}
                onClick={() => setCompareDateRange("Disabled")}>
                Disabled
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer",
                  compareDateRange === "Previous Period" && "bg-accent",
                )}
                onClick={() => setCompareDateRange("Previous Period")}>
                Previous Period
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer",
                  compareDateRange === "Year Over Year" && "bg-accent",
                )}
                onClick={() => setCompareDateRange("Year Over Year")}>
                Year Over Year
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuGroup>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardHeaderCompare;
