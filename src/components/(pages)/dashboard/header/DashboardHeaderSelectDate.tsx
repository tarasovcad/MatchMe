import React, {useState} from "react";
import {Calendar, ChevronDown} from "lucide-react";
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

const DashboardHeaderSelectDate = ({className}: {className?: string}) => {
  const [open, setOpen] = useState(false);

  const chevronVariants = {
    up: {rotate: 180, transition: {duration: 0.2}},
    down: {rotate: 0, transition: {duration: 0.2}},
  };

  const {dateRange, setDateRange} = useDashboardStore();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size={"sm"} className={cn("h-[38px] px-3.5", className)}>
          <div className="flex items-center gap-2">
            <Calendar size={16} strokeWidth={2} className="@max-[422px]:hidden" />
            {dateRange}
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
                className={cn("cursor-pointer", dateRange === "Today" && "bg-accent")}
                onClick={() => setDateRange("Today")}>
                Today
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn("cursor-pointer", dateRange === "Yesterday" && "bg-accent")}
                onClick={() => setDateRange("Yesterday")}>
                Yesterday
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn("cursor-pointer", dateRange === "Past 7 days" && "bg-accent")}
                onClick={() => setDateRange("Past 7 days")}>
                Past 7 days
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn("cursor-pointer", dateRange === "Past 14 days" && "bg-accent")}
                onClick={() => setDateRange("Past 14 days")}>
                Past 14 days
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn("cursor-pointer", dateRange === "Past 30 days" && "bg-accent")}
                onClick={() => setDateRange("Past 30 days")}>
                Past 30 days
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn("cursor-pointer", dateRange === "Past Quarter" && "bg-accent")}
                onClick={() => setDateRange("Past Quarter")}>
                Past Quarter
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn("cursor-pointer", dateRange === "Past Half Year" && "bg-accent")}
                onClick={() => setDateRange("Past Half Year")}>
                Past Half Year
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn("cursor-pointer", dateRange === "Past Year" && "bg-accent")}
                onClick={() => setDateRange("Past Year")}>
                Past Year
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn("cursor-pointer", dateRange === "All Time" && "bg-accent")}
                onClick={() => setDateRange("All Time")}>
                All Time
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer",
                  dateRange === "Custom fixed date range..." && "bg-accent",
                )}
                onClick={() => setDateRange("Custom fixed date range...")}>
                Custom fixed date range...
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuGroup>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardHeaderSelectDate;
