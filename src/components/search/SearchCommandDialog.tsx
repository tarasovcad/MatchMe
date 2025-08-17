"use client";

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
  Settings as SettingsIcon,
  BarChart3,
  Bell,
  Inbox,
  MessageCircle,
  MoreHorizontal,
  Users,
  Folder,
  FolderOpen,
  Search,
  Mail,
  FolderPlus,
  Star,
  AtSign,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/command";
import {cn} from "@/lib/utils";
import {useSearchProfiles} from "@/hooks/query/use-search-profiles";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import {SearchProfileResult} from "@/actions/profiles/searchProfiles";
import {useRouter} from "next/navigation";
import {RecentItem, useRecentItems} from "@/hooks/query/use-recent-items";
import QuickActionsGrid from "@/components/search/QuickActionsGrid";
import SectionsChips from "@/components/search/SectionsChips";
import RecentItems from "@/components/search/RecentItems";
import SearchFooter from "@/components/search/SearchFooter";
import SearchResults from "@/components/search/SearchResults";
import {
  QuickActionSection,
  GROUP_HEADING_CLASSES,
  STICKY_HEADING_CLASSES,
  ITEM_BASE_CLASSES,
} from "@/components/search/shared";
import {useRandomEntity} from "@/hooks/query/use-random-entity";
import AnimatedDice from "@/components/ui/AnimatedDice";
import {AnimatePresence, motion} from "framer-motion";

const SECTIONS: QuickActionSection[] = [
  {id: "profiles", title: "Profiles", icon: Users},
  {id: "projects", title: "Projects", icon: FolderOpen},
  {id: "notifications", title: "Notifications", icon: Bell},
  {id: "inbox", title: "Inbox", icon: MessageCircle},
  {id: "other", title: "Other", icon: MoreHorizontal},
];

interface SearchCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxHeight?: string;
}

export const SearchCommandDialog = ({
  open,
  onOpenChange,
  maxHeight = "400px",
}: SearchCommandDialogProps) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState<string>("");
  const router = useRouter();

  // Debounce input like SearchInputPage
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      onOpenChange(false);
    },
    [router, onOpenChange],
  );

  const {
    items: recentItems,
    addProfile,
    addSearchQuery,
    remove: removeRecent,
  } = useRecentItems({
    section: selectedSection ?? "global",
    maxItems: 12,
  });

  const liveTrimmedValue = useMemo(() => searchValue.trim(), [searchValue]);
  const trimmedSearchValue = useMemo(() => debouncedSearchValue.trim(), [debouncedSearchValue]);
  const isDebouncingSearch =
    selectedSection === "profiles" &&
    liveTrimmedValue.length >= 2 &&
    debouncedSearchValue !== searchValue;

  const {data: searchResults = [], isLoading: isSearching} = useSearchProfiles(
    trimmedSearchValue,
    selectedSection === "profiles" && trimmedSearchValue.length >= 2,
  );

  const handleSectionClick = useCallback((sectionId: string) => {
    setSelectedSection(sectionId);
    setSearchValue("");
    setDebouncedSearchValue("");
  }, []);

  const handleRecentItemSelect = useCallback(
    (item: RecentItem) => {
      if (item.type === "profile") navigate(`/profiles/${item.username}`);
      else setSearchValue(item.text || "");
    },
    [navigate],
  );

  const handleRecentItemDelete = useCallback(
    (item: RecentItem) => {
      removeRecent(item.id);
    },
    [removeRecent],
  );

  const showOnlyRecentItems = liveTrimmedValue.length < 2;

  const {mutateAsync: goRandomProfileAsync, isPending: isRandomProfilePending} = useRandomEntity({
    table: "profiles",
    selectColumns: ["username"],
    where: [{column: "is_profile_public", value: true}],
    buildHref: (row) => `/profiles/${row.username}`,
  });

  type QuickAction = {
    id: string;
    label: string;
    icon: React.ElementType;
    bg: string;
    onSelect: () => void | Promise<void>;
  };

  const actions = useMemo<QuickAction[]>(() => {
    switch (selectedSection) {
      case "profiles":
        return [
          {
            id: "browse-all-profiles",
            label: "Browse all profiles",
            icon: Users,
            bg: "bg-violet-500",
            onSelect: () => navigate("/profiles"),
          },
          {
            id: "random-profile",
            label: "Random profile",
            icon: () => <AnimatedDice size={16} isRolling={isRandomProfilePending} />,
            bg: "bg-fuchsia-500",
            onSelect: async () => {
              const {href} = await goRandomProfileAsync();
              navigate(href);
            },
          },
          {
            id: "my-favorites",
            label: "My saved profiles",
            icon: Star,
            bg: "bg-amber-500",
            onSelect: () => navigate("/dashboard?tab=saved"),
          },
        ];

      case "projects":
        return [
          {
            id: "create-project",
            label: "Create project",
            icon: FolderPlus,
            bg: "bg-emerald-500",
            onSelect: () => navigate("/dashboard/projects/create"),
          },
          {
            id: "my-projects",
            label: "My projects",
            icon: Folder,
            bg: "bg-sky-500",
            onSelect: () => navigate("/dashboard?tab=projects"),
          },
          {
            id: "browse-projects",
            label: "Browse all projects",
            icon: FolderOpen,
            bg: "bg-indigo-500",
            onSelect: () => navigate("/projects"),
          },
        ];

      case "notifications":
        return [
          {
            id: "view-notifications",
            label: "View all notifications",
            icon: Bell,
            bg: "bg-pink-500",
            onSelect: () => navigate("/dashboard?tab=overview#notifications"),
          },
          {
            id: "mentions-tags",
            label: "Mentions & Tags",
            icon: AtSign,
            bg: "bg-purple-500",
            onSelect: () => navigate("/dashboard?tab=overview#mentions-tags"),
          },
          {
            id: "follower-activity",
            label: "Follower activity",
            icon: Users,
            bg: "bg-blue-500",
            onSelect: () => navigate("/dashboard?tab=overview#follower-activity"),
          },
        ];

      case "inbox":
        return [
          {
            id: "open-inbox",
            label: "Open inbox",
            icon: Inbox,
            bg: "bg-teal-500",
            onSelect: () => navigate("/dashboard?tab=overview#inbox"),
          },
          {
            id: "compose-message",
            label: "Compose message",
            icon: Mail,
            bg: "bg-rose-500",
            onSelect: () => navigate("/profiles"),
          },
        ];

      default:
        return [
          {
            id: "open-settings",
            label: "Settings",
            icon: SettingsIcon,
            bg: "bg-green-500",
            onSelect: () => navigate("/settings"),
          },
          {
            id: "open-dashboard",
            label: "Dashboard",
            icon: BarChart3,
            bg: "bg-gray-500",
            onSelect: () => navigate("/dashboard"),
          },
        ];
    }
  }, [selectedSection, navigate, isRandomProfilePending, goRandomProfileAsync]);

  return (
    <div
      className="search-command-dialog"
      style={{"--dialog-height": maxHeight} as React.CSSProperties & {[key: string]: string}}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .search-command-dialog [data-radix-dialog-content] {
            max-width: var(--dialog-width) !important;
            width: 95vw !important;
          }
          @media (min-width: 640px) {
            .search-command-dialog [data-radix-dialog-content] {
              width: var(--dialog-width) !important;
            }
          }
        `,
        }}
      />
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Search MatchMe"
        description="Search for profiles, projects, and more">
        <CommandInput
          placeholder="Type a command or search..."
          className="w-full py-3 h-auto rounded-b-none shadow-none "
          value={searchValue}
          onValueChange={setSearchValue}
        />

        <CommandList className="relative" style={{maxHeight: maxHeight}}>
          {selectedSection && (
            <SectionsChips
              sections={SECTIONS}
              selectedSection={selectedSection}
              onClick={handleSectionClick}
            />
          )}

          <>
            {!selectedSection && (
              <div key="quick-actions">
                <QuickActionsGrid sections={SECTIONS} onSelect={handleSectionClick} />
              </div>
            )}

            {selectedSection && (
              <div key={`section-${selectedSection}`}>
                {showOnlyRecentItems && (
                  <>
                    <RecentItems
                      items={recentItems}
                      sectionType={selectedSection}
                      onSelect={handleRecentItemSelect}
                      onDelete={handleRecentItemDelete}
                    />

                    <CommandGroup heading="Actions" className={GROUP_HEADING_CLASSES}>
                      {actions.map((action) => (
                        <CommandItem
                          key={action.id}
                          className={ITEM_BASE_CLASSES}
                          value={`${selectedSection}-action-${action.id}`}
                          onSelect={() => action.onSelect()}>
                          <div className="flex items-center gap-2 w-full">
                            <div
                              className={cn(
                                "h-7 w-7 rounded-md flex items-center justify-center text-white",
                                action.bg,
                              )}>
                              <action.icon size={16} />
                            </div>
                            <span className="text-sm text-foreground">{action.label}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {!showOnlyRecentItems && selectedSection === "profiles" && (
                  <motion.div layout>
                    <AnimatePresence mode="wait">
                      {isSearching || isDebouncingSearch ? (
                        <motion.div
                          key="loading"
                          initial={{opacity: 0}}
                          animate={{opacity: 1}}
                          exit={{opacity: 0}}
                          transition={{duration: 0.15}}>
                          <div className="flex items-center justify-center py-6">
                            <LoadingButtonCircle size={22} />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="results"
                          initial={{opacity: 0}}
                          animate={{opacity: 1}}
                          exit={{opacity: 0}}
                          transition={{duration: 0.15}}>
                          <div key="search-item">
                            <CommandGroup
                              heading=" "
                              className="!px-0 pt-0 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1">
                              <CommandItem
                                className={ITEM_BASE_CLASSES}
                                value={`search-for-${liveTrimmedValue}`}
                                onSelect={async () => {
                                  await addSearchQuery(liveTrimmedValue);
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
                          </div>

                          {searchResults.length === 0 && (
                            <div className="py-9 pt-[28px] text-center text-sm">
                              No results found
                            </div>
                          )}

                          <div key="search-results">
                            <SearchResults
                              section={selectedSection ?? ""}
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
                                navigate(`/profiles/${user.username}`);
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            )}
          </>

          <SearchFooter />
        </CommandList>
      </CommandDialog>
    </div>
  );
};
