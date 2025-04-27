import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import {Filter, useFilterStore} from "@/store/filterStore";
import {X} from "lucide-react";
import React from "react";

const FilterPanel = ({pageKey}: {pageKey: string}) => {
  const {getFiltersForPage, removeFilter} = useFilterStore();
  const filters = getFiltersForPage(pageKey);

  console.log(filters);
  const getFilterDisplayValue = (filter: Filter) => {
    switch (filter.type) {
      case "searchInput":
        return filter.searchValue || "";
      case "multiSelect":
        return filter.selectedOptions?.join(", ") || "";
      case "tagsSearch":
        return filter.selectedTags?.join(", ") || "";

      case "numberSelect":
        if (Array.isArray(filter.selectedValue)) {
          return filter.selectedValue.join(" - ");
        }
        return filter.selectedValue?.toString() || "";
      default:
        return "";
    }
  };
  if (!filters || filters.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex gap-2 overflow-y-auto">
        {filters.map((filter) => {
          const displayValue = getFilterDisplayValue(filter);
          if (!displayValue) return null;

          const words = displayValue.split(" ");
          const shownWords = words.slice(0, 3).join(" ");
          const remainingCount = words.length - 3;

          return (
            <div
              key={filter.value}
              className="relative flex items-center gap-1.5 ps-2 pe-7 border border-input rounded-[6px] ring-ring/50 w-fit h-7 font-medium text-foreground text-sm whitespace-nowrap">
              <span className="text-[13px] text-secondary">{filter.title}</span>{" "}
              <Tooltip>
                <TooltipTrigger>
                  <span>{shownWords}</span>
                  <span>{remainingCount > 0 && ` +${remainingCount}`}</span>
                  {filter.title === "Availability" && <span className="text-sm"> hours</span>}
                  {filter.title === "Age" && <span className="text-sm"> years old</span>}
                </TooltipTrigger>
                <TooltipContent sideOffset={10} className="px-2 py-1 text-xs">
                  {displayValue}
                  {filter.title === "Availability" && <span> hours</span>}
                  {filter.title === "Age" && <span> years old</span>}
                </TooltipContent>
              </Tooltip>
              <button
                className="absolute -inset-y-px flex p-0 focus-visible:border-ring rounded-e-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 size-7 text-muted-foreground hover:text-foreground transition-colors cursor-pointer -end-px"
                onClick={() => removeFilter(pageKey, filter.value)}>
                <X className="m-auto size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default FilterPanel;
