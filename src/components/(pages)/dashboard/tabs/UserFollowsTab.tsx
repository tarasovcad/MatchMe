import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import {User} from "@supabase/supabase-js";
import ProfilesSinlgeCard from "@/components/(pages)/profiles/ProfilesSinlgeCard";
import {motion} from "framer-motion";
import {cardVariants} from "@/utils/other/variants";
import InfiniteItemLoader from "../../InfiniteItemLoader";
import ProfilesSingleCardSkeleton from "../../profiles/ProfilesSingleCardSkeleton";
import {getUserFollows, UserWithFollowStatus} from "@/actions/(follows)/getUserFollows";
import {getUserFavoritesProfiles} from "@/actions/profiles/profiles";
import {useFollowCounts} from "@/hooks/query/dashboard/use-follows";
import {useState, useMemo} from "react";
import {useFilterStore} from "@/store/filterStore";
import {SerializableFilter} from "@/store/filterStore";
import SearchInputPage from "@/components/ui/form/SearchInputPage";
import FollowUserButton from "@/components/follows/FollowUserButton";
import {useInfiniteItems} from "@/hooks/useInfiniteItems";
import AuthGate from "@/components/other/AuthGate";

const UserFollowsTab = ({user}: {user: User}) => {
  const {data: followCounts} = useFollowCounts(user.id);

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
    {
      value: "mutual",
      label: "Mutual",
      count: followCounts?.mutual || 0,
    },
  ];

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

  const fetchMutual = async (
    page: number,
    itemsPerPage: number,
    filters?: SerializableFilter[],
  ) => {
    return await getUserFollows(user.id, "mutual", page, itemsPerPage, filters);
  };

  // Use the infinite items hook to get loading states
  const followersQuery = useInfiniteItems({
    type: "profiles",
    userId: user.id,
    itemsPerPage: 15,
    serializableFilters: activeTab === "followers" ? currentFilters : [],
    fetchItems: fetchFollowers,
    fetchUserFavorites: getUserFavoritesProfiles,
  });

  const followingQuery = useInfiniteItems({
    type: "profiles",
    userId: user.id,
    itemsPerPage: 15,
    serializableFilters: activeTab === "following" ? currentFilters : [],
    fetchItems: fetchFollowing,
    fetchUserFavorites: getUserFavoritesProfiles,
  });

  const mutualQuery = useInfiniteItems({
    type: "profiles",
    userId: user.id,
    itemsPerPage: 15,
    serializableFilters: activeTab === "mutual" ? currentFilters : [],
    fetchItems: fetchMutual,
    fetchUserFavorites: getUserFavoritesProfiles,
  });

  // Get current loading states based on active tab
  const currentLoadingStates = useMemo(() => {
    let query;
    if (activeTab === "followers") {
      query = followersQuery;
    } else if (activeTab === "following") {
      query = followingQuery;
    } else {
      query = mutualQuery;
    }
    return {
      initial: query.isLoadingInitial,
      more: query.isLoadingMore,
    };
  }, [
    activeTab,
    followersQuery.isLoadingInitial,
    followersQuery.isLoadingMore,
    followingQuery.isLoadingInitial,
    followingQuery.isLoadingMore,
    mutualQuery.isLoadingInitial,
    mutualQuery.isLoadingMore,
  ]);

  // Render function for each profile item
  const renderFollowItem = (
    profile: UserWithFollowStatus & {isFavorite?: boolean},
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
    userId: string,
  ) => {
    // Determine follow states based on updated follow status flags
    const isFollowing = profile.isFollowedBy ?? false; // Does the current user follow this profile?
    const isFollowingBack = profile.isFollowingBack ?? false; // Does the profile follow the current user?

    return (
      <motion.div ref={isLast ? ref : null} key={profile.id} variants={cardVariants}>
        <ProfilesSinlgeCard
          profile={profile}
          userId={userId}
          isFavorite={profile.isFavorite || false}
          customButton={
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
                buttonClassName="@max-[620px]:w-full"
              />
            </AuthGate>
          }
        />
      </motion.div>
    );
  };

  // Custom search input that uses the actual loading states
  const customSearchInput = (
    <SearchInputPage pageKey={`follows-${activeTab}`} loading={currentLoadingStates} />
  );

  return (
    <FilterableTabs
      tabs={tabs}
      defaultTab="followers"
      searchPlaceholder="Search users"
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
            {currentActiveTab === "mutual" && (
              <InfiniteItemLoader
                key={`mutual-${JSON.stringify(currentFilters)}`}
                userSession={user}
                fetchItems={fetchMutual}
                fetchUserFavorites={getUserFavoritesProfiles}
                renderItem={renderFollowItem}
                renderSkeleton={() => <ProfilesSingleCardSkeleton />}
                type="profiles"
                itemsPerPage={15}
                displayFilterButton={false}
                displaySearch={false}
                pageKey={`follows-${currentActiveTab}`}
                cacheKey={`mutual-${JSON.stringify(currentFilters)}`}
              />
            )}
          </>
        );
      }}
    </FilterableTabs>
  );
};

export default UserFollowsTab;
