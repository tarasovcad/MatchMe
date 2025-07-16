import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import {User} from "@supabase/supabase-js";
import {motion} from "framer-motion";
import {cardVariants} from "@/utils/other/variants";
import InfiniteItemLoader from "../../InfiniteItemLoader";
import {getUserFollows, UserWithFollowStatus} from "@/actions/(follows)/getUserFollows";
import {useFollowCounts} from "@/hooks/query/dashboard/use-follows";
import {useState, useMemo} from "react";
import {useFilterStore} from "@/store/filterStore";
import {SerializableFilter} from "@/store/filterStore";
import SearchInputPage from "@/components/ui/form/SearchInputPage";
import FollowUserButton from "@/components/follows/FollowUserButton";
import {useInfiniteItems} from "@/hooks/useInfiniteItems";
import AuthGate from "@/components/other/AuthGate";
import ProfileMiniCard from "../../profiles/ProfileMiniCard";
import ProfileMiniCardSkeleton from "../../profiles/ProfileMiniCardSkeleton";

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

  // Create fetch function for the active tab
  const fetchItems = async (page: number, itemsPerPage: number, filters?: SerializableFilter[]) => {
    return await getUserFollows(
      user.id,
      activeTab as "followers" | "following" | "mutual",
      page,
      itemsPerPage,
      filters,
    );
  };

  // Use the infinite items hook for loading states
  const query = useInfiniteItems({
    type: "profiles",
    userId: user.id,
    itemsPerPage: 15,
    serializableFilters: currentFilters,
    fetchItems,
    cacheKey: `follows-${activeTab}`,
  });

  // Render function for each profile item
  const renderFollowItem = (
    profile: UserWithFollowStatus,
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
  ) => {
    const isFollowing = profile.isFollowedBy ?? false;
    const isFollowingBack = profile.isFollowingBack ?? false;

    return (
      <motion.div ref={isLast ? ref : null} key={profile.id} variants={cardVariants}>
        <ProfileMiniCard
          profile={profile}
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

  // Custom search input
  const customSearchInput = (
    <SearchInputPage
      pageKey={`follows-${activeTab}`}
      loading={{
        initial: query.isLoadingInitial || (query.isFetching && !query.isLoadingMore),
        more: query.isLoadingMore,
      }}
    />
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
      {(currentActiveTab) => (
        <InfiniteItemLoader
          key={`${currentActiveTab}-${JSON.stringify(currentFilters)}`}
          userSession={user}
          fetchItems={fetchItems}
          renderItem={renderFollowItem}
          renderSkeleton={() => <ProfileMiniCardSkeleton />}
          type="profiles"
          itemsPerPage={15}
          displayFilterButton={false}
          displaySearch={false}
          pageKey={`follows-${currentActiveTab}`}
          cacheKey={`follows-${currentActiveTab}`}
        />
      )}
    </FilterableTabs>
  );
};

export default UserFollowsTab;
