import React, {useRef, useState} from "react";
import {ArrowRight, Briefcase, Filter, Search} from "lucide-react";

import {Button} from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import SimpleInput from "./form/SimpleInput";
import {Checkbox} from "../shadcn/checkbox";

const MultiSelect = ({
  options,
  searchQuery,
}: {
  options?: Array<{title: string}>;
  searchQuery: string;
}) => {
  const filteredOptions = options?.filter((opt) =>
    opt.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <>
      {filteredOptions && filteredOptions.length > 0 ? (
        filteredOptions.map((opt) => (
          <DropdownMenuItem
            className="group flex items-center gap-2 [&_svg]:size-auto"
            key={opt.title}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
            <Checkbox className="group-hover:opacity-100 shadow-xs rounded-[4px] transition-opacity duration-100 ease-in-out" />
            {opt.title}
          </DropdownMenuItem>
        ))
      ) : (
        <div className="px-2 py-1.5 text-muted-foreground text-sm">No results found</div>
      )}
    </>
  );
};

const data = [
  {
    title: "Current Role",
    icon: Briefcase,
    value: "currentRole",
    type: "searchInput",
    showSearchInput: true,
  },
  {
    title: "Lookling for",
    icon: Search,
    value: "lookingFor",
    type: "multiSelect",
    options: [{title: "Team Member"}, {title: "Co-Founder"}, {title: "Startups"}],
    showSearchInput: true,
  },
];

const TypeComponents = {
  multiSelect: MultiSelect,
};

const FilterButton = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentSelected, setCurrentSelected] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else {
      setTimeout(() => {
        setCurrentSelected(null);
        setSearchQuery("");
      }, 200);
    }
  };

  const selectedFilter = data.find((item) => item.value === currentSelected);

  const renderComponentByType = () => {
    if (!selectedFilter) return null;

    const ComponentToRender = TypeComponents[selectedFilter.type as keyof typeof TypeComponents];

    return <ComponentToRender options={selectedFilter.options} searchQuery={searchQuery} />;
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
      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button size={"xs"} className="max-[480px]:w-full">
            <Filter size={16} strokeWidth={2} className="text-foreground/90" />
            Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-0 rounded-[8px] min-w-[247px]">
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
          <div className="p-1">
            {currentSelected === null && (
              <>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    return (
                      <DropdownMenuItem
                        className="group flex justify-between items-center gap-2"
                        key={item.value}
                        onMouseEnter={(e) => {
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
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
                          className="opacity-0 group-hover:opacity-100 transition duration-150 ease-in-out"
                          aria-hidden="true"
                        />
                      </DropdownMenuItem>
                    );
                  })
                ) : (
                  <div className="px-2 py-1.5 text-muted-foreground text-sm">No results found</div>
                )}
              </>
            )}
            {selectedFilter && renderComponentByType()}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FilterButton;
