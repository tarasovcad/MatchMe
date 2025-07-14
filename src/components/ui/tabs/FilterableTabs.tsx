import {motion, AnimatePresence} from "framer-motion";
import {useState, ReactNode} from "react";
import SimpleInput from "@/components/ui/form/SimpleInput";
import {Button} from "@/components/shadcn/button";
import {Filter} from "lucide-react";
import {cn} from "@/lib/utils";

export interface Tab {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

interface FilterableTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  onTabChange?: (activeTab: string) => void;
  displayFilterButton?: boolean;
  disableSearch?: boolean | ((activeTab: string) => boolean);
  disableFilter?: boolean | ((activeTab: string) => boolean);
  children: (activeTab: string) => ReactNode;
  className?: string;
  topPadding?: boolean;
  customSearchInput?: ReactNode;
}

export default function FilterableTabs({
  tabs,
  defaultTab,
  searchPlaceholder = "Search",
  onSearch,
  onFilter,
  displayFilterButton = false,
  disableSearch = false,
  disableFilter = false,
  children,
  customSearchInput,
  topPadding = true,
  className = "",
  onTabChange,
}: FilterableTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value || "");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(event.target.value);
  };

  const handleFilterClick = () => {
    onFilter?.();
  };

  const isSearchDisabled =
    typeof disableSearch === "function" ? disableSearch(activeTab) : disableSearch;
  const isFilterDisabled =
    typeof disableFilter === "function" ? disableFilter(activeTab) : disableFilter;

  return (
    <div className={`@container ${className}`}>
      <div
        className={cn(
          "flex @max-[735px]:flex-col justify-between gap-8 @max-[735px]:gap-3 pb-4",
          topPadding && "py-4",
        )}>
        <div className={cn("flex items-start w-fit", topPadding && "pt-2")}>
          <div className="h-auto rounded-none bg-transparent p-0 relative flex">
            {tabs.map((tab, index) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  onTabChange?.(tab.value);
                }}
                disabled={tab.disabled}
                className={`relative rounded-none border-b border-border py-3 transition-colors duration-200 cursor-pointer flex items-center disabled:pointer-events-none disabled:opacity-50 ${
                  index === 0 ? "px-0 pr-2" : "px-4.5"
                } ${activeTab === tab.value ? "bg-transparent shadow-none" : ""}
                `}>
                <motion.span
                  className="relative z-10 text-[15px] flex items-center font-medium"
                  initial={{opacity: 0.7}}
                  animate={{opacity: activeTab === tab.value ? 1 : 0.7}}
                  transition={{duration: 0.2}}>
                  {tab.label}

                  {tab.count !== undefined && (
                    <div className="px-1 py-0.5 border border-border rounded-[5px] w-fit font-medium text-[10px] text-secondary leading-[13px] ml-1.5">
                      {tab.count}
                    </div>
                  )}
                </motion.span>

                {/* Animated underline indicator */}
                {activeTab === tab.value && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                    layoutId="activeTab"
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "flex max-[480px]:flex-col justify-between items-center gap-3 max-[480px]:gap-2",
            !displayFilterButton && "max-w-[344px] w-full",
          )}>
          {customSearchInput ? (
            customSearchInput
          ) : (
            <SimpleInput
              placeholder={searchPlaceholder}
              className={cn(!displayFilterButton && "w-full")}
              search
              disabled={isSearchDisabled}
              onChange={handleSearchChange}
            />
          )}
          {displayFilterButton && (
            <div className="flex gap-3 max-[480px]:gap-2 max-[480px]:w-full">
              <Button
                size={"xs"}
                className="max-[480px]:w-full"
                disabled={isFilterDisabled}
                onClick={handleFilterClick}>
                <Filter size={16} strokeWidth={2} className="text-foreground/90" />
                Filter
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        <motion.div
          key={activeTab}
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: -20}}
          transition={{duration: 0.15, ease: "easeInOut"}}
          className="w-full pt-2">
          {children(activeTab)}
        </motion.div>
      </div>
    </div>
  );
}
