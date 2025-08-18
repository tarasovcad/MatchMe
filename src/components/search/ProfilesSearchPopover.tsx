"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger, PopoverAnchor} from "@/components/shadcn/popover";
import SimpleInput from "@/components/ui/form/SimpleInput";
import {useSearchProfiles} from "@/hooks/query/use-search-profiles";
import {Command, CommandGroup, CommandItem, CommandList} from "@/components/shadcn/command";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import {Search} from "lucide-react";
import {cn} from "@/lib/utils";
import {RecentItem, useRecentItems} from "@/hooks/query/use-recent-items";
import SearchResults from "@/components/search/SearchResults";
import RecentItems from "@/components/search/RecentItems";
import SearchFooter from "@/components/search/SearchFooter";
import {
  GROUP_HEADING_CLASSES,
  ITEM_BASE_CLASSES,
  STICKY_HEADING_CLASSES,
} from "@/components/search/shared";
import {useRouter} from "next/navigation";
import {SearchProfileResult} from "@/actions/profiles/searchProfiles";
import {useRandomEntity} from "@/hooks/query/use-random-entity";
import AnimatedDice from "@/components/ui/AnimatedDice";
import SearchResultsSkeleton from "@/components/search/SearchResultsSkeleton";
import {useFilterStore} from "@/store/filterStore";

interface ProfilesSearchPopoverProps {
  className?: string;
  placeholder?: string;
  pageKey?: string;
}

export default function ProfilesSearchPopover({
  className,
  placeholder = "Search...",
  pageKey = "profiles",
}: ProfilesSearchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const {addFilter, removeFilter, getFiltersForPage} = useFilterStore();

  // Initialize input from existing globalSearch filter to reflect URL/search state
  useEffect(() => {
    const filters = getFiltersForPage(pageKey);
    const searchFilter = filters.find((f) => f.type === "globalSearch" && f.value === "search");
    if (searchFilter && (searchFilter as {searchValue?: string}).searchValue) {
      const sv = (searchFilter as {searchValue?: string}).searchValue || "";
      if (sv) {
        setSearchValue(sv);
        setDebouncedSearchValue(sv);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchValue(searchValue), 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const liveTrimmedValue = useMemo(() => searchValue.trim(), [searchValue]);
  const trimmedSearchValue = useMemo(() => debouncedSearchValue.trim(), [debouncedSearchValue]);

  const isDebouncingSearch = liveTrimmedValue.length >= 2 && debouncedSearchValue !== searchValue;

  const {data: searchResults = [], isLoading: isSearching} = useSearchProfiles(
    trimmedSearchValue,
    open && trimmedSearchValue.length >= 2,
  );

  const {
    items: recentItems,
    addProfile,
    addSearchQuery,
    remove: removeRecent,
  } = useRecentItems({section: "profiles", maxItems: 12});

  const handleRecentItemSelect = useCallback(
    (item: RecentItem) => {
      if (item.type === "profile") {
        router.push(`/profiles/${item.username}`);
        setOpen(false);
      } else {
        setSearchValue(item.text || "");
      }
    },
    [router],
  );

  const handleRecentItemDelete = useCallback(
    (item: RecentItem) => {
      removeRecent(item.id);
    },
    [removeRecent],
  );

  const showOnlyRecentItems = liveTrimmedValue.length < 2;

  const closeIfFocusLeavesBoth = () => {
    setTimeout(() => {
      const active = document.activeElement;
      const isInInput = !!(inputRef.current && inputRef.current.contains(active as Node));
      const isInContent = !!(contentRef.current && contentRef.current.contains(active as Node));
      if (!isInInput && !isInContent) setOpen(false);
    }, 0);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={cn("w-full", className)}>
          <SimpleInput
            placeholder={placeholder}
            className={cn(
              "transition-all duration-300 ease-in-out ring-0 focus-visible:ring-0 focus-visible:ring-offset-0  focus-visible:border-border  ",
              open && "rounded-b-none border-b-transparent focus-visible:border-b-transparent",
            )}
            type="search"
            id="profiles-search"
            search={true}
            loadingPlacement="left"
            showKbd={false}
            readOnly={false}
            value={searchValue}
            autoComplete="off"
            onFocus={() => setOpen(true)}
            onBlur={closeIfFocusLeavesBoth}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Escape") {
                setOpen(false);
                (e.currentTarget as HTMLInputElement).blur();
              }
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
            ref={inputRef as unknown as React.Ref<HTMLInputElement>}
            showClearButton={!!searchValue}
            onClear={() => {
              setSearchValue("");
              setDebouncedSearchValue("");
              removeFilter(pageKey, "search");
            }}
            loading={isSearching || isDebouncingSearch}
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        ref={contentRef as unknown as React.Ref<HTMLDivElement>}
        className="p-0 border-border w-full min-w-[var(--radix-popper-anchor-width)] rounded-t-none"
        align="start"
        sideOffset={-1}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
        onInteractOutside={(e) => {
          // Don't close when interacting with the input/anchor
          if (inputRef.current && inputRef.current.contains(e.target as Node)) {
            e.preventDefault();
            inputRef.current.focus();
            return;
          }
          setOpen(false);
        }}
        onBlur={closeIfFocusLeavesBoth}>
        <Command shouldFilter={false}>
          <CommandList className="relative">
            {showOnlyRecentItems && (
              <RecentItems
                items={recentItems}
                sectionType="profiles"
                onSelect={handleRecentItemSelect}
                onDelete={handleRecentItemDelete}
              />
            )}

            {!showOnlyRecentItems && (
              <>
                {isSearching || isDebouncingSearch ? (
                  <SearchResultsSkeleton
                    section="profiles"
                    classNames={{
                      groupHeading: GROUP_HEADING_CLASSES,
                      stickyHeading: STICKY_HEADING_CLASSES,
                      itemBase: ITEM_BASE_CLASSES,
                    }}
                  />
                ) : (
                  <>
                    <CommandGroup
                      heading=" "
                      className="!px-0 pt-0 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1">
                      <CommandItem
                        className={ITEM_BASE_CLASSES}
                        value={`search-for-${liveTrimmedValue}`}
                        onSelect={async () => {
                          await addSearchQuery(liveTrimmedValue);
                          addFilter(pageKey, {
                            type: "globalSearch",
                            value: "search",
                            title: "Search",
                            searchValue: liveTrimmedValue,
                            icon: Search,
                            showInFilterBtn: false,
                          });
                          setOpen(false);
                        }}>
                        <div className="flex items-center gap-2 w-full">
                          <Search size={16} className="text-muted-foreground/80" />
                          <span className="text-sm text-foreground">
                            Search for &ldquo;
                            <span className="font-medium">{liveTrimmedValue}</span>
                            &rdquo;
                          </span>
                        </div>
                      </CommandItem>
                    </CommandGroup>

                    {searchResults.length === 0 && (
                      <div className="py-9 pt-[28px] text-center text-sm">No results found</div>
                    )}

                    <SearchResults
                      section="profiles"
                      items={searchResults}
                      classNames={{
                        groupHeading: GROUP_HEADING_CLASSES,
                        stickyHeading: STICKY_HEADING_CLASSES,
                        itemBase: ITEM_BASE_CLASSES,
                      }}
                      onProfileSelect={async (user: SearchProfileResult) => {
                        await addProfile({
                          name: user.name,
                          username: user.username,
                          imageUrl: user.profile_image?.[0]?.url || "",
                        });
                        setOpen(false);
                        router.push(`/profiles/${user.username}`);
                      }}
                    />
                  </>
                )}
              </>
            )}

            <SearchFooter />
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
