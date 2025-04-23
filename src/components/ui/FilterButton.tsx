import React, {useEffect, useRef, useState} from "react";
import {ArrowRight, Briefcase, Filter, Search, Wrench} from "lucide-react";
import {Button} from "@/components/shadcn/button";
import SimpleInput from "./form/SimpleInput";
import {Checkbox} from "../shadcn/checkbox";
import {Command, CommandGroup, CommandItem, CommandList} from "@/components/shadcn/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/popover";
import LoadingButtonCircle from "./LoadingButtonCirlce";
import {getSkillsForFilterBtn} from "@/actions/profiles/getSkillsForFilterBtn";
import {useSkillsStore} from "@/store/skillsCache";

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
    <CommandGroup className="p-1">
      {filteredOptions && filteredOptions.length > 0 ? (
        filteredOptions.map((opt) => (
          <CommandItem
            className="group flex items-center gap-2 [&_svg]:size-auto"
            key={opt.title}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
            <Checkbox className="group-hover:opacity-100 shadow-xs rounded-[4px] transition-opacity duration-100 ease-in-out" />
            {opt.title}
          </CommandItem>
        ))
      ) : (
        <div className="px-2 py-2 text-muted-foreground text-sm">No results found</div>
      )}
    </CommandGroup>
  );
};

const SearchInput = ({inputRef}: {inputRef: React.RefObject<HTMLInputElement>}) => {
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <div className="px-2 py-1.5">
      <SimpleInput placeholder="Search..." type="search" id="search" ref={inputRef} />
    </div>
  );
};

const TagsSearch = ({
  inputRef,
  searchQuery,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  searchQuery: string;
}) => {
  const [loading, setLoading] = useState(true);
  const {skills, lastSearchQuery, setSkills} = useSkillsStore();
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      setSkills([], "");
      setLoading(true);

      try {
        const response = await getSkillsForFilterBtn(searchQuery);
        setSkills(response, searchQuery);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
        setHasFetchedOnce(true);
      }
    };
    if (searchQuery !== lastSearchQuery) {
      setSkills([], "");
      setLoading(true);
    }

    if (skills.length > 0 && searchQuery === lastSearchQuery) {
      setLoading(false);
      console.log("Skipping fetch — already have results for this query");
    } else {
      const debounceTimer = setTimeout(fetchSkills, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <>
      {loading && (
        <div className="flex justify-around px-2 py-2 text-sm">
          <LoadingButtonCircle size={20} />
        </div>
      )}
      {!loading && skills.length > 0 && <MultiSelect options={skills} searchQuery={searchQuery} />}
      {!loading && skills.length > 0 && skills.length > 20 && (
        <div className="px-2 pb-2 text-muted-foreground text-sm text-center">
          Enter a specific skill to find relevant results
        </div>
      )}
      {!loading && hasFetchedOnce && skills.length === 0 && (
        <div className="px-2 py-2 text-muted-foreground text-sm">No results found</div>
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
    showSearchInput: false,
  },
  {
    title: "Lookling for",
    icon: Search,
    value: "lookingFor",
    type: "multiSelect",
    options: [{title: "Team Member"}, {title: "Co-Founder"}, {title: "Startups"}],
    showSearchInput: true,
  },
  {
    title: "Skills",
    icon: Wrench,
    value: "skills",
    type: "tagsSearch",
    options: [{title: "Team Member"}, {title: "Co-Founder"}, {title: "Startups"}],
    showSearchInput: true,
  },
];

const TypeComponents = {
  multiSelect: MultiSelect,
  searchInput: SearchInput,
  tagsSearch: TagsSearch,
};

const FilterButton = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentSelected, setCurrentSelected] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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

  const selectedFilter = data.find((item) => item.value === currentSelected);

  const renderComponentByType = () => {
    if (!selectedFilter) return null;

    const ComponentToRender = TypeComponents[selectedFilter.type as keyof typeof TypeComponents];

    return (
      <ComponentToRender
        options={selectedFilter.options}
        searchQuery={searchQuery}
        inputRef={inputRef as React.RefObject<HTMLInputElement>}
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
            <Filter size={16} strokeWidth={2} className="text-foreground/90" />
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
