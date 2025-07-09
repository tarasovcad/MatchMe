"use client";
import {getAllProfiles, getUserFavoritesProfiles} from "@/actions/profiles/profiles";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {cardVariants} from "@/utils/other/variants";
import {motion} from "framer-motion";
import React from "react";
import InfiniteItemLoader from "../InfiniteItemLoader";
import ProfilesSingleCardSkeleton from "./ProfilesSingleCardSkeleton";
import ProfilesSinlgeCard from "./ProfilesSinlgeCard";
import {User} from "@supabase/supabase-js";
import {profileFiltersData} from "@/data/filter/profileFiltersData";

const ProfilesClientPage = ({userSession}: {userSession: User | null}) => {
  const renderProfileItem = (
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

  return (
    <InfiniteItemLoader
      userSession={userSession}
      fetchItems={getAllProfiles}
      fetchUserFavorites={getUserFavoritesProfiles}
      renderItem={renderProfileItem}
      renderSkeleton={() => <ProfilesSingleCardSkeleton />}
      filtersData={profileFiltersData}
      pageDescription="Explore profiles of skilled individuals who share your vision. Join forces with
          like-minded creators and turn bold ideas into success stories."
      pageTitle="Find Your Perfect Match"
      type="profiles"
      itemsPerPage={15}
    />
  );
};

export default ProfilesClientPage;
