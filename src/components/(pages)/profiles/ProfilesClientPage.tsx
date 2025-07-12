"use client";
import {getAllProfiles, getUserFavoritesProfiles} from "@/actions/profiles/profiles";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {cardVariants, pageHeaderVariants, pageContainerVariants} from "@/utils/other/variants";
import {motion} from "framer-motion";
import React from "react";
import InfiniteItemLoader from "../InfiniteItemLoader";
import ProfilesSingleCardSkeleton from "./ProfilesSingleCardSkeleton";
import ProfilesSinlgeCard from "./ProfilesSinlgeCard";
import {User} from "@supabase/supabase-js";
import {profileFiltersData} from "@/data/filter/profileFiltersData";
import MainGradient, {SecGradient} from "@/components/ui/Text";
import NewItemsCounter from "@/components/ui/NewItemsCounter";

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
    <motion.div initial="hidden" animate="visible" variants={pageContainerVariants}>
      {/* Header Section */}
      <motion.div
        className="flex flex-col justify-center items-center gap-2.5 py-14"
        variants={pageHeaderVariants}>
        <NewItemsCounter
          table="profiles"
          itemType={{
            singular: "person",
            plural: "people",
          }}
        />
        <MainGradient
          as="h1"
          className="font-semibold text-3xl sm:text-4xl lg:text-5xl text-center">
          Find Your Perfect Match
        </MainGradient>
        <SecGradient
          as="h2"
          className="px-3 max-w-[742px] text-[15px] sm:text-[16px] lg:text-[18px] text-center">
          Explore profiles of skilled individuals who share your vision. Join forces with
          like-minded creators and turn bold ideas into success stories.
        </SecGradient>
      </motion.div>

      {/* Infinite Item Loader */}
      <InfiniteItemLoader
        userSession={userSession}
        fetchItems={getAllProfiles}
        fetchUserFavorites={getUserFavoritesProfiles}
        renderItem={renderProfileItem}
        renderSkeleton={() => <ProfilesSingleCardSkeleton />}
        filtersData={profileFiltersData}
        type="profiles"
        itemsPerPage={15}
      />
    </motion.div>
  );
};

export default ProfilesClientPage;
