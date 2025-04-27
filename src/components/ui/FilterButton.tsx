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
  SearchInputFilter,
  TagsSearchFilter,
  useFilterStore,
} from "@/store/filterStore";

const TypeComponents = {
  multiSelect: MultiSelect,
  searchInput: SearchInput,
  tagsSearch: TagsSearch,
  numberSelect: NumberSelect,
};

const FilterButton = ({pageKey, data}: {pageKey: string; data: Filter[]}) => {
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

  const handleFilterChange = (filterValue: string | string[] | number) => {
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
            selectedValue:
              typeof filterValue === "number" ? filterValue : parseInt(String(filterValue)),
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
    <div>
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
                    filteredData.map((item) => (
                      <CommandItem
                        className="group flex justify-between items-center"
                        key={item.value}
                        onMouseEnter={() => setHoveredItem(item.value)}
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
                        <ArrowRight
                          size={16}
                          className={`${
                            hoveredItem === item.value
                              ? "opacity-80"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                          aria-hidden="true"
                        />
                      </CommandItem>
                    ))
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
