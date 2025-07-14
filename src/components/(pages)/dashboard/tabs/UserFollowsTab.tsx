import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import {User} from "@supabase/supabase-js";
import ProfilesSinlgeCard from "@/components/(pages)/profiles/ProfilesSinlgeCard";
import {motion} from "framer-motion";
import {cardVariants} from "@/utils/other/variants";
import InfiniteItemLoader from "../../InfiniteItemLoader";
import ProfilesSingleCardSkeleton from "../../profiles/ProfilesSingleCardSkeleton";
import {getUserFollows} from "@/actions/(follows)/getUserFollows";
import {getUserFavoritesProfiles} from "@/actions/profiles/profiles";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {useFollowCounts} from "@/hooks/query/dashboard/use-follows";
import {useState, useMemo} from "react";
import {useFilterStore} from "@/store/filterStore";
import {SerializableFilter} from "@/store/filterStore";
import SearchInputPage from "@/components/ui/form/SearchInputPage";

const UserFollowsTab = ({user}: {user: User}) => {
  const {data: followCounts, isLoading} = useFollowCounts(user.id);
  const [activeTab, setActiveTab] = useState("followers");
  const {getSerializableFilters} = useFilterStore();

  const tabs: Tab[] = [
    {
      value: "followers",
      label: "Followers",
      count: followCounts?.followers || 0,
    },
    {
      value: "following",
      label: "Following",
      count: followCounts?.following || 0,
    },
  ];

  const handleSearch = (value: string) => {
    console.log("Search:", value);
  };

  // Get current filters for the active tab
  const currentFilters = useMemo((): SerializableFilter[] => {
    const pageKey = `follows-${activeTab}`;
    return getSerializableFilters(pageKey);
  }, [activeTab, getSerializableFilters]);

  // Create fetchItems functions for each tab with search support
  const fetchFollowers = async (
    page: number,
    itemsPerPage: number,
    filters?: SerializableFilter[],
  ) => {
    return await getUserFollows(user.id, "followers", page, itemsPerPage, filters);
  };

  const fetchFollowing = async (
    page: number,
    itemsPerPage: number,
    filters?: SerializableFilter[],
  ) => {
    return await getUserFollows(user.id, "following", page, itemsPerPage, filters);
  };

  // Render function for each profile item
  const renderFollowItem = (
    profile: MatchMeUser & {isFavorite?: boolean},
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
    userId: string,
  ) => (
    <motion.div ref={isLast ? ref : null} key={profile.id} variants={cardVariants}>
      <ProfilesSinlgeCard
        profile={profile}
        userId={userId}
        isFavorite={profile.isFavorite || false}
      />
    </motion.div>
  );

  // Custom search input that uses the same component as InfiniteItemLoader
  const customSearchInput = (
    <SearchInputPage pageKey={`follows-${activeTab}`} loading={{initial: false, more: false}} />
  );

  return (
    <FilterableTabs
      tabs={tabs}
      defaultTab="followers"
      searchPlaceholder="Search users"
      onSearch={handleSearch}
      displayFilterButton={false}
      customSearchInput={customSearchInput}
      topPadding={false}
      onTabChange={setActiveTab}>
      {(currentActiveTab) => {
        return (
          <>
            {currentActiveTab === "followers" && (
              <InfiniteItemLoader
                key={`followers-${JSON.stringify(currentFilters)}`}
                userSession={user}
                fetchItems={fetchFollowers}
                fetchUserFavorites={getUserFavoritesProfiles}
                renderItem={renderFollowItem}
                renderSkeleton={() => <ProfilesSingleCardSkeleton />}
                type="profiles"
                itemsPerPage={15}
                displayFilterButton={false}
                displaySearch={false}
                pageKey={`follows-${currentActiveTab}`}
                cacheKey={`followers-${JSON.stringify(currentFilters)}`}
              />
            )}
            {currentActiveTab === "following" && (
              <InfiniteItemLoader
                key={`following-${JSON.stringify(currentFilters)}`}
                userSession={user}
                fetchItems={fetchFollowing}
                fetchUserFavorites={getUserFavoritesProfiles}
                renderItem={renderFollowItem}
                renderSkeleton={() => <ProfilesSingleCardSkeleton />}
                type="profiles"
                itemsPerPage={15}
                displayFilterButton={false}
                displaySearch={false}
                pageKey={`follows-${currentActiveTab}`}
                cacheKey={`following-${JSON.stringify(currentFilters)}`}
              />
            )}
          </>
        );
      }}
    </FilterableTabs>
  );
};

export default UserFollowsTab;
