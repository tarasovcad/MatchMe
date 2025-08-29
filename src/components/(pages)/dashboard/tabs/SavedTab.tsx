import {User} from "@supabase/supabase-js";
import React from "react";
import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import {motion} from "framer-motion";
import {cardVariants} from "@/utils/other/variants";
import InfiniteItemLoader from "../../InfiniteItemLoader";
import ProfilesSingleCardSkeleton from "../../profiles/ProfilesSingleCardSkeleton";
import {getUserSavedProfiles} from "@/actions/(favorites)/getUserSavedProfiles";
import {useState, useMemo, useCallback} from "react";
import {useFilterStore} from "@/store/filterStore";
import {SerializableFilter} from "@/store/filterStore";
import SearchInputPage from "@/components/ui/form/SearchInputPage";
// import {useInfiniteItems} from "@/hooks/useInfiniteItems"; // Removed to avoid double fetching
import {MiniCardMatchMeUser} from "@/types/user/matchMeUser";
import {useSavedCounts} from "@/hooks/query/dashboard/use-saved";
import ProfileMiniCard from "../../profiles/ProfileMiniCard";
import {getUserSavedProjects} from "@/actions/(favorites)/getUserSavedProjects";
import {Project} from "@/types/projects/projects";
import ProjectSingleCard from "@/components/(pages)/projects/ProjectSingleCard";
import {getUserSavedOpenPositions} from "@/actions/(favorites)/getUserSavedOpenPositions";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";
import ProjectOpenPositionCard from "@/components/(pages)/projects/ProjectOpenPositionCard";
import ProjectOpenPositionsSkeleton from "../../projects/ProjectOpenPositionsSkeleton";
import FollowUserButton from "@/components/follows/FollowUserButton";
import AuthGate from "@/components/other/AuthGate";

type SavedItemType = MiniCardMatchMeUser | Project | ProjectOpenPosition;

const SavedTab = ({user}: {user: User}) => {
  const [activeTab, setActiveTab] = useState("profiles");
  const [loading, setLoading] = useState<{initial: boolean; more: boolean}>({
    initial: false,
    more: false,
  });

  const {data: savedCounts} = useSavedCounts(user.id);

  const tabs: Tab[] = [
    {
      value: "profiles",
      label: "Profiles",
      count: savedCounts?.profiles || 0,
    },
    {
      value: "projects",
      label: "Projects",
      count: savedCounts?.projects || 0,
    },
    {
      value: "open-positions",
      label: "Open Positions",
      count: savedCounts?.openPositions || 0,
    },
    {
      value: "posts",
      label: "Posts",
      disabled: true, // Not implemented yet
    },
  ];

  const {getSerializableFilters, removeFilter} = useFilterStore();

  // Get current filters for the active tab only
  const currentFilters = useMemo((): SerializableFilter[] => {
    const pageKey = `saved-${activeTab}`;
    return getSerializableFilters(pageKey);
  }, [activeTab, getSerializableFilters]);

  // Single fetch function that switches based on active tab
  const fetchItems = useCallback(
    async (
      page: number,
      itemsPerPage: number,
      filters?: SerializableFilter[],
    ): Promise<SavedItemType[]> => {
      const isInitial = page === 1;
      setLoading((prev) => ({...prev, [isInitial ? "initial" : "more"]: true}));
      try {
        switch (activeTab) {
          case "profiles":
            return await getUserSavedProfiles(user.id, page, itemsPerPage, filters);
          case "projects":
            return await getUserSavedProjects(user.id, page, itemsPerPage, filters);
          case "open-positions":
            return await getUserSavedOpenPositions(user.id, page, itemsPerPage, filters);
          default:
            return [];
        }
      } finally {
        setLoading((prev) => ({...prev, [isInitial ? "initial" : "more"]: false}));
      }
    },
    [activeTab, user.id],
  );

  const handleTabChange = (nextTab: string) => {
    removeFilter(`saved-${activeTab}`, "search");
    removeFilter(`saved-${nextTab}`, "search");
    setActiveTab(nextTab);
  };

  const renderSavedProfileItem = (
    profile: MiniCardMatchMeUser & {
      isFavorite?: boolean;
      isFollowedBy?: boolean;
      isFollowingBack?: boolean;
    },
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
  ) => {
    const isFollowing = profile.isFollowedBy ?? false;
    const isFollowingBack = profile.isFollowingBack ?? false;

    return (
      <motion.div ref={isLast ? ref : null} key={profile.id} variants={cardVariants}>
        <ProfileMiniCard
          member={{...profile, user_id: profile.id}}
          userSessionId={user.id}
          customFollowButton={
            <AuthGate userSessionId={user.id}>
              <FollowUserButton
                followingId={profile.id}
                isFollowing={isFollowing}
                isFollowingBack={isFollowingBack}
                userSessionId={user.id}
                username={profile.username}
                simpleStyle={true}
                hideIcons={true}
                followVariant={"secondary"}
                unfollowVariant={"outline"}
                size="xs"
                buttonClassName="flex-1 max-w-[126px]"
              />
            </AuthGate>
          }
        />
      </motion.div>
    );
  };

  const renderSavedProjectItem = (
    project: Project,
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
    userId?: string,
  ) => {
    return (
      <motion.div ref={isLast ? ref : null} key={project.id} variants={cardVariants}>
        <ProjectSingleCard project={project} userId={userId} />
      </motion.div>
    );
  };

  const renderSavedOpenPositionItem = (
    openPosition: ProjectOpenPosition,
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
    userId?: string,
  ) => {
    return (
      <motion.div ref={isLast ? ref : null} key={openPosition.id} variants={cardVariants}>
        <ProjectOpenPositionCard
          openPosition={openPosition}
          userId={userId}
          allowFirstStep={false}
          firstStepLink={`/projects/${openPosition.project_slug}`}
        />
      </motion.div>
    );
  };

  const renderItem = useCallback(
    (
      item: SavedItemType,
      isLast: boolean,
      ref: ((node: HTMLDivElement) => void) | null,
      userId?: string,
    ) => {
      switch (activeTab) {
        case "profiles":
          return renderSavedProfileItem(item as MiniCardMatchMeUser, isLast, ref);
        case "projects":
          return renderSavedProjectItem(item as Project, isLast, ref, userId);
        case "open-positions":
          return renderSavedOpenPositionItem(item as ProjectOpenPosition, isLast, ref, userId);
        default:
          return null;
      }
    },
    [activeTab],
  );

  const renderSkeleton = useCallback(() => {
    switch (activeTab) {
      case "profiles":
      case "projects":
        return <ProfilesSingleCardSkeleton />;
      case "open-positions":
        return <ProjectOpenPositionsSkeleton />;
      default:
        return <ProfilesSingleCardSkeleton />;
    }
  }, [activeTab]);

  // Custom search input with loading indicators
  const customSearchInput = (
    <SearchInputPage
      key={`saved-${activeTab}`}
      pageKey={`saved-${activeTab}`}
      loading={loading}
      searchFilterType={activeTab === "open-positions" ? "openPositionsSearch" : "globalSearch"}
    />
  );

  return (
    <FilterableTabs
      tabs={tabs}
      defaultTab="profiles"
      displayFilterButton={false}
      customSearchInput={customSearchInput}
      topPadding={false}
      onTabChange={handleTabChange}>
      {(currentActiveTab) => (
        <InfiniteItemLoader
          key={`saved-${currentActiveTab}`}
          userSession={user}
          fetchItems={fetchItems}
          renderItem={renderItem}
          renderSkeleton={renderSkeleton}
          type={currentActiveTab as "profiles" | "projects" | "open-positions"}
          itemsPerPage={15}
          displayFilterButton={false}
          displaySearch={false}
          pageKey={`saved-${currentActiveTab}`}
          cacheKey={`saved-${currentActiveTab}`}
          itemsContainerClassName={
            currentActiveTab === "open-positions" ? "flex flex-col gap-6 w-full" : undefined
          }
          syncFiltersWithUrl={false}
        />
      )}
    </FilterableTabs>
  );
};

export default SavedTab;
