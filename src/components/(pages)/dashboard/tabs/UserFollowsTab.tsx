import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import {User} from "@supabase/supabase-js";
import {motion} from "framer-motion";
import {cardVariants} from "@/utils/other/variants";
import InfiniteItemLoader from "../../InfiniteItemLoader";
import {getUserFollows, UserWithFollowStatus} from "@/actions/(follows)/getUserFollows";
import {useFollowCounts} from "@/hooks/query/dashboard/use-follows";
import {useState, useMemo, useCallback} from "react";
import {useFilterStore} from "@/store/filterStore";
import {SerializableFilter} from "@/store/filterStore";
import SearchInputPage from "@/components/ui/form/SearchInputPage";
import FollowUserButton from "@/components/follows/FollowUserButton";
import AuthGate from "@/components/other/AuthGate";
import ProfileMiniCard from "../../profiles/ProfileMiniCard";
import ProfileMiniCardSkeleton from "../../profiles/ProfileMiniCardSkeleton";

const UserFollowsTab = ({user}: {user: User}) => {
  const {data: followCounts} = useFollowCounts(user.id);
  const [activeTab, setActiveTab] = useState("followers");
  const {getSerializableFilters, removeFilter} = useFilterStore();
  const [loading, setLoading] = useState<{initial: boolean; more: boolean}>({
    initial: false,
    more: false,
  });

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

  const currentFilters = useMemo((): SerializableFilter[] => {
    const pageKey = `follows-${activeTab}`;
    return getSerializableFilters(pageKey);
  }, [activeTab, getSerializableFilters]);

  const fetchItems = useCallback(
    async (page: number, itemsPerPage: number, filters?: SerializableFilter[]) => {
      const isInitial = page === 1;
      setLoading((prev) => ({...prev, [isInitial ? "initial" : "more"]: true}));
      try {
        return await getUserFollows(
          user.id,
          activeTab as "followers" | "following" | "mutual",
          page,
          itemsPerPage,
          filters,
        );
      } finally {
        setLoading((prev) => ({...prev, [isInitial ? "initial" : "more"]: false}));
      }
    },
    [activeTab, user.id],
  );

  const handleTabChange = (nextTab: string) => {
    removeFilter(`follows-${activeTab}`, "search");
    removeFilter(`follows-${nextTab}`, "search");
    setActiveTab(nextTab);
  };

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
          member={{...profile, user_id: profile.id}}
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

  const customSearchInput = (
    <SearchInputPage
      key={`follows-${activeTab}`}
      pageKey={`follows-${activeTab}`}
      loading={loading}
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
      onTabChange={handleTabChange}>
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
          syncFiltersWithUrl={false}
        />
      )}
    </FilterableTabs>
  );
};

export default UserFollowsTab;
