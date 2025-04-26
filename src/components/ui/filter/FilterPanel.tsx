import {Filter, useFilterStore} from "@/store/filterStore";
import {X} from "lucide-react";
import React from "react";

const FilterPanel = ({pageKey}: {pageKey: string}) => {
  const {getFiltersForPage, removeFilter} = useFilterStore();
  const filters = getFiltersForPage(pageKey);

  const getFilterDisplayValue = (filter: Filter) => {
    switch (filter.type) {
      case "searchInput":
        return filter.searchValue || "";
      case "multiSelect":
        return filter.selectedOptions?.join(", ") || "";
      case "tagsSearch":
        return filter.selectedTags?.join(", ") || "";
      case "numberSelect":
        return filter.selectedValue?.toString() || "";
      default:
        return "";
    }
  };
  if (!filters || filters.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-y-auto">
      {filters.map((filter) => {
        const displayValue = getFilterDisplayValue(filter);
        if (!displayValue) return null;

        return (
          <div
            key={filter.value}
            className={`h-7 relative border border-input rounded-[6px] font-medium text-sm ps-2 pe-7 flex items-center text-foreground ring-ring/50 w-fit gap-1.5 whitespace-nowrap`}>
            <span className="text-[13px] text-secondary">{filter.title}</span>{" "}
            <span>{displayValue}</span>
            <button
              className="absolute -inset-y-px flex p-0 focus-visible:border-ring rounded-e-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 size-7 text-muted-foreground hover:text-foreground transition-colors cursor-pointer -end-px"
              onClick={() => removeFilter(pageKey, filter.value)}>
              <X className="m-auto size-4" />
            </button>
          </div>
        );
      })}
      {/* <div
        className={`h-7 relative border border-input rounded-[6px] font-medium text-sm ps-2 pe-7 flex items-center text-foreground ring-ring/50 w-fit gap-1.5 whitespace-nowrap`}>
        <span className="text-[13px] text-secondary">Current Role</span> <span>Full Stack </span>
        <button className="absolute -inset-y-px flex p-0 focus-visible:border-ring rounded-e-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 size-7 text-muted-foreground hover:text-foreground transition-colors cursor-pointer -end-px">
          <X className="m-auto size-4" />
        </button>
      </div> */}
    </div>
  );
};

export default FilterPanel;
