import FilterableTabs, {Tab} from "@/components/ui/tabs/FilterableTabs";
import {User} from "@supabase/supabase-js";
import {useFollowers, useFollowing} from "@/hooks/query/follows/use-followers";
import ProfilesSinlgeCard from "@/components/(pages)/profiles/ProfilesSinlgeCard";
import {motion} from "framer-motion";
import {cardVariants} from "@/utils/other/variants";

const UserFollowsTab = ({user}: {user: User}) => {
  const followersQuery = useFollowers(user.id);
  const followingQuery = useFollowing(user.id);

  const followers = followersQuery.data || [];
  const following = followingQuery.data || [];

  const tabs: Tab[] = [
    {value: "followers", label: "Followers", count: followers.length},
    {value: "following", label: "Following", count: following.length},
  ];

  const handleSearch = (value: string) => {
    console.log("Search:", value);
    // TODO: Implement search functionality
  };

  const handleFilter = () => {
    console.log("Filter clicked");
    // TODO: Implement filter functionality
  };

  const renderTabContent = (activeTab: string) => {
    const isLoading =
      activeTab === "followers" ? followersQuery.isLoading : followingQuery.isLoading;
    const error = activeTab === "followers" ? followersQuery.error : followingQuery.error;
    const data = activeTab === "followers" ? followers : following;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <p className="text-muted-foreground p-4 text-center text-sm">
          Error loading {activeTab}: {error.message}
        </p>
      );
    }

    if (data.length === 0) {
      return <p className="text-muted-foreground p-4 text-center text-sm">No {activeTab} yet</p>;
    }

    return (
      <div className="grid gap-4 p-4">
        {data.map((profile, index) => (
          <motion.div
            key={profile.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{delay: index * 0.1}}>
            <ProfilesSinlgeCard
              profile={profile}
              userId={user.id}
              isFavorite={false} // TODO: Add favorite check if needed
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <FilterableTabs
      tabs={tabs}
      defaultTab="followers"
      searchPlaceholder="Search users"
      onSearch={handleSearch}
      topPadding={false}
      onFilter={handleFilter}>
      {renderTabContent}
    </FilterableTabs>
  );
};

export default UserFollowsTab;
