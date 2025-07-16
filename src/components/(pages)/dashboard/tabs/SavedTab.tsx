import {User} from "@supabase/supabase-js";
import React from "react";
import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import {motion} from "framer-motion";
import {cardVariants} from "@/utils/other/variants";
import InfiniteItemLoader from "../../InfiniteItemLoader";
import ProfilesSingleCardSkeleton from "../../profiles/ProfilesSingleCardSkeleton";
import {getUserSavedProfiles} from "@/actions/(favorites)/getUserSavedProfiles";
import {useState, useMemo} from "react";
import {useFilterStore} from "@/store/filterStore";
import {SerializableFilter} from "@/store/filterStore";
import SearchInputPage from "@/components/ui/form/SearchInputPage";
import {useInfiniteItems} from "@/hooks/useInfiniteItems";
import {MiniCardMatchMeUser} from "@/types/user/matchMeUser";
import {useSavedCounts} from "@/hooks/query/dashboard/use-saved";
import ProfileMiniCard from "../../profiles/ProfileMiniCard";

const SavedTab = ({user}: {user: User}) => {
  // Only profiles favourites implemented for now
  const [activeTab, setActiveTab] = useState("profiles");

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
      disabled: true, // Not implemented yet
    },
    {
      value: "posts",
      label: "Posts",
      disabled: true, // Not implemented yet
    },
  ];

  const {getSerializableFilters} = useFilterStore();

  // Get current filters for the active tab
  const currentFilters = useMemo((): SerializableFilter[] => {
    const pageKey = `saved-${activeTab}`;
    return getSerializableFilters(pageKey);
  }, [activeTab, getSerializableFilters]);

  // Fetch function for saved profiles
  const fetchSavedProfiles = async (
    page: number,
    itemsPerPage: number,
    filters?: SerializableFilter[],
  ) => {
    return await getUserSavedProfiles(user.id, page, itemsPerPage, filters);
  };

  // Use the infinite items hook to get loading states
  const savedProfilesQuery = useInfiniteItems<MiniCardMatchMeUser>({
    type: "profiles",
    userId: user.id,
    itemsPerPage: 15,
    serializableFilters: activeTab === "profiles" ? currentFilters : [],
    fetchItems: fetchSavedProfiles,
  });

  // Get loading states for search bar
  const currentLoadingStates = useMemo(() => {
    return {
      initial: savedProfilesQuery.isLoadingInitial,
      more: savedProfilesQuery.isLoadingMore,
    };
  }, [savedProfilesQuery.isLoadingInitial, savedProfilesQuery.isLoadingMore]);

  // Render function for profile item
  const renderSavedProfileItem = (
    profile: MiniCardMatchMeUser & {isFavorite?: boolean},
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
  ) => (
    <motion.div ref={isLast ? ref : null} key={profile.id} variants={cardVariants}>
      <ProfileMiniCard profile={profile} />
    </motion.div>
  );

  // Custom search input with loading indicators
  const customSearchInput = (
    <SearchInputPage pageKey={`saved-${activeTab}`} loading={currentLoadingStates} />
  );

  return (
    <FilterableTabs
      tabs={tabs}
      defaultTab="profiles"
      searchPlaceholder="Search saved users"
      displayFilterButton={false}
      customSearchInput={customSearchInput}
      topPadding={false}
      onTabChange={setActiveTab}>
      {(currentActiveTab) => (
        <>
          {currentActiveTab === "profiles" && (
            <InfiniteItemLoader
              key={`saved-profiles-${JSON.stringify(currentFilters)}`}
              userSession={user}
              fetchItems={fetchSavedProfiles}
              renderItem={renderSavedProfileItem}
              renderSkeleton={() => <ProfilesSingleCardSkeleton />}
              type="profiles"
              itemsPerPage={15}
              displayFilterButton={false}
              displaySearch={false}
              pageKey={`saved-${currentActiveTab}`}
              cacheKey={`saved-profiles-${JSON.stringify(currentFilters)}`}
            />
          )}
          {currentActiveTab !== "profiles" && (
            <div className="py-10 text-center text-secondary">Coming soon</div>
          )}
        </>
      )}
    </FilterableTabs>
  );
};

export default SavedTab;
