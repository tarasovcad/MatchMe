import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import {Filter, useFilterStore} from "@/store/filterStore";
import {X} from "lucide-react";
import React from "react";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";

const FilterPanel = ({pageKey}: {pageKey: string}) => {
  const {getFiltersForPage, removeFilter} = useFilterStore();
  const rawFilters = getFiltersForPage(pageKey);
  const filters = rawFilters.filter((f) => !(f.value === "search" || f.type === "globalSearch"));
  if (!filters?.length) return null;
  const getFilterDisplayValue = (filter: Filter) => {
    switch (filter.type) {
      case "searchInput":
        return filter.searchValue || "";
      case "globalSearch":
        return filter.searchValue || "";
      case "multiSelect":
        if (filter.value === "time_commitment") {
          const valueToTitle = new Map(timeCommitment.map((opt) => [opt.value, opt.title]));
          return filter.selectedOptions?.map((v) => valueToTitle.get(v) || v).join(", ") || "";
        }
        return filter.selectedOptions?.join(", ") || "";
      case "tagsSearch":
        return filter.selectedTags?.join(", ") || "";

      case "numberSelect":
        return Array.isArray(filter.selectedValue)
          ? filter.selectedValue.join(" - ")
          : filter.selectedValue?.toString() || "";
      default:
        return "";
    }
  };

  const renderTooltip = (filter: Filter, displayValue: string) => {
    const words = displayValue.split(" ");
    const shownWords = words.slice(0, 3).join(" ");
    const remainingCount = words.length - 3;
    const suffix = filter.title === "Age" ? " years old" : "";

    return remainingCount > 0 ? (
      <Tooltip>
        <TooltipTrigger>
          <span>{shownWords}</span>
          {remainingCount > 0 && ` +${remainingCount}`}
          {suffix && <span className="text-sm">{suffix}</span>}
        </TooltipTrigger>
        <TooltipContent sideOffset={10} className="px-2 py-1 text-xs">
          {displayValue}
          {suffix && <span>{suffix}</span>}
        </TooltipContent>
      </Tooltip>
    ) : (
      <div>
        <span>{shownWords}</span>
        {remainingCount > 0 && ` +${remainingCount}`}
        {suffix && <span className="text-sm">{suffix}</span>}
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex gap-2 overflow-y-auto ">
        {filters.map((filter) => {
          const displayValue = getFilterDisplayValue(filter);
          // if (!displayValue) return null;

          return (
            <div
              key={filter.value}
              className="relative flex items-center gap-1.5 ps-2 pe-7 border border-input rounded-[6px] ring-ring/50 w-fit h-7 font-medium text-foreground text-sm whitespace-nowrap">
              <span className="text-[13px] text-secondary">{filter.title}</span>{" "}
              {renderTooltip(filter, displayValue)}
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
