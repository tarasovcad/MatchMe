import React, {useRef, useState} from "react";
import {ArrowRight, Filter as FilterIcon} from "lucide-react";
import {Button} from "@/components/shadcn/button";
import SimpleInput from "./form/SimpleInput";
import {Command, CommandGroup, CommandItem, CommandList} from "@/components/shadcn/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/popover";
import {MultiSelect, NumberSelect, SearchInput, TagsSearch} from "./FilterBtnComponents";
import {
  Filter,
  MultiSelectFilter,
  NumberSelectFilter,
  SearchInputFilter,
  TagsSearchFilter,
  useFilterStore,
} from "@/store/filterStore";
import {AnimatePresence, motion} from "framer-motion";

const TypeComponents = {
  multiSelect: MultiSelect,
  searchInput: SearchInput,
  tagsSearch: TagsSearch,
  numberSelect: NumberSelect,
};

const FilterButton = ({
  pageKey,
  data,
  className,
}: {
  pageKey: string;
  data: Filter[];
  className?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentSelected, setCurrentSelected] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const {addFilter, getFiltersForPage} = useFilterStore();

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      if (currentSelected === null) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    } else {
      setTimeout(() => {
        setCurrentSelected(null);
        setSearchQuery("");
      }, 200);
    }
  };

  const pageFilters = getFiltersForPage(pageKey);
  const selectedFilter = data?.find((item) => item.value === currentSelected);

  const getInitialSelectedOptions = () => {
    if (!selectedFilter) return [];

    const existingFilter = pageFilters.find((f) => f.value === selectedFilter.value);

    if (selectedFilter.type === "multiSelect") {
      return (existingFilter as MultiSelectFilter)?.selectedOptions || [];
    } else if (selectedFilter.type === "tagsSearch") {
      return (existingFilter as TagsSearchFilter)?.selectedTags || [];
    }
  };

  const getInitialNumberValues = () => {
    if (!selectedFilter || selectedFilter.type !== "numberSelect")
      return {single: 0, range: [0, 0]};

    const existingFilter = pageFilters.find(
      (f) => f.value === selectedFilter.value,
    ) as NumberSelectFilter;

    // If the existing filter has a selected value
    if (existingFilter?.selectedValue !== undefined) {
      // If it's an array, it's a range
      if (Array.isArray(existingFilter.selectedValue)) {
        return {
          single: 0,
          range: existingFilter.selectedValue as number[],
        };
      }
      // If it's a single number
      else {
        return {
          single: existingFilter.selectedValue as number,
          range: [0, 0],
        };
      }
    }

    return {single: 0, range: [0, 0]};
  };

  const handleFilterChange = (filterValue: string | string[] | number | number[]) => {
    if (selectedFilter) {
      // Create updated filter with new value
      let updatedFilter: Filter;

      switch (selectedFilter.type) {
        case "searchInput":
          updatedFilter = {
            ...selectedFilter,
            searchValue: String(filterValue),
          };
          break;
        case "multiSelect":
          updatedFilter = {
            ...selectedFilter,
            selectedOptions: Array.isArray(filterValue)
              ? (filterValue as string[])
              : [String(filterValue)],
          };
          break;
        case "tagsSearch":
          updatedFilter = {
            ...selectedFilter,
            selectedTags: Array.isArray(filterValue)
              ? (filterValue as string[])
              : [String(filterValue)],
          };
          break;
        case "numberSelect":
          updatedFilter = {
            ...selectedFilter,
            selectedValue: Array.isArray(filterValue)
              ? (filterValue as number[])
              : Number(filterValue),
          };
          break;
        default:
          updatedFilter = selectedFilter;
      }

      addFilter(pageKey, updatedFilter);
      setTimeout(() => {
        setCurrentSelected(null);
        setSearchQuery("");
      }, 200);
      setOpen(false);
    }
  };

  const renderComponentByType = () => {
    if (!selectedFilter) return null;

    const ComponentToRender = TypeComponents[selectedFilter.type as keyof typeof TypeComponents];

    const existingSearchValue =
      selectedFilter.type === "searchInput"
        ? (pageFilters.find((f) => f.value === selectedFilter.value) as SearchInputFilter)
            ?.searchValue || ""
        : "";

    const controlProps = {
      onApply: handleFilterChange,
      onClosePopover: () => setOpen(false),
      onCancel: () => {
        setCurrentSelected(null);
        setSearchQuery("");
      },
      inputRef: inputRef as React.RefObject<HTMLInputElement>,
    };

    return (
      <ComponentToRender
        title={selectedFilter.title}
        options={(selectedFilter as MultiSelectFilter).options}
        searchQuery={searchQuery}
        initialSelectedOptions={getInitialSelectedOptions()}
        defaultValue={existingSearchValue}
        initialValues={getInitialNumberValues()}
        {...controlProps}
      />
    );
  };

  const shouldShowSearchInput = () => {
    if (currentSelected === null) return true;

    return selectedFilter?.showSearchInput !== false;
  };

  // Filter the data items based on search query when no option is selected
  const filteredData = data.filter(
    (item) => searchQuery === "" || item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button size={"xs"} className="max-[480px]:w-full">
            <FilterIcon size={16} strokeWidth={2} className="text-foreground/90" />
            Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="p-0 rounded-[8px] min-w-[247px]">
          <Command>
            {shouldShowSearchInput() && (
              <div className="border-b border-border">
                <SimpleInput
                  placeholder="Search..."
                  type="search"
                  id="search"
                  search
                  className="focus-visible:border-0 border-none focus-visible:outline-none ring-0 focus-visible:ring-0"
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            <CommandList>
              {currentSelected === null ? (
                <CommandGroup className="p-1">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => {
                      if (item.showInFilterBtn) {
                        return (
                          <CommandItem
                            className="group flex justify-between items-center text-foreground/90"
                            key={item.value}
                            onMouseEnter={() => setHoveredItem(item.value)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onSelect={() => {
                              setCurrentSelected(item.value);
                              setSearchQuery("");
                              setTimeout(() => {
                                inputRef.current?.focus();
                              }, 0);
                            }}>
                            <div className="flex items-center gap-2">
                              <item.icon size={16} aria-hidden="true" />
                              {item.title}
                            </div>
                            <div className="relative flex h-4 w-4 items-center justify-center">
                              <AnimatePresence initial={false}>
                                {hoveredItem === item.value && (
                                  <motion.div
                                    key="arrow"
                                    initial={{opacity: 0, x: -6}}
                                    animate={{opacity: 1, x: 0}}
                                    exit={{opacity: 0, x: -6}}
                                    transition={{
                                      type: "spring",
                                      stiffness: 800,
                                      damping: 24,
                                      mass: 0.4,
                                    }}>
                                    <ArrowRight size={16} aria-hidden="true" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </CommandItem>
                        );
                      }
                    })
                  ) : (
                    <div className="px-2 py-1.5 text-muted-foreground text-sm">
                      No results found
                    </div>
                  )}
                </CommandGroup>
              ) : (
                renderComponentByType()
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterButton;
