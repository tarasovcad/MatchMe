"use client";
import React, {useState, useEffect, useRef, useCallback} from "react";
import {motion} from "framer-motion";
import {
  getAllProfiles,
  getUserFavoritesProfiles,
} from "@/actions/profiles/profiles";
import ProfilesSinlgeCard from "@/components/(pages)/profiles/ProfilesSinlgeCard";
import {Button} from "@/components/shadcn/button";
import SimpleInput from "@/components/ui/SimpleInput";
import MainGradient, {SecGradient} from "@/components/ui/Text";
import {ChevronDown, PanelBottomClose} from "lucide-react";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import {User} from "@supabase/supabase-js";
import {MatchMeUser} from "@/types/user/matchMeUser";
import ProfilesSingleCardSkeleton from "./ProfilesSingleCardSkeleton";
import ProfilesFilterPopup from "./ProfilesFilterPopup";
import ProfilesOrderBy from "./ProfilesOrderBy";
import {ProfileQueryParams} from "@/types/profiles/sortProfiles";

const ProfilesClientComponent = ({userSession}: {userSession: User | null}) => {
  const [profiles, setProfiles] = useState<
    (MatchMeUser & {isFavorite: boolean})[]
  >([]);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showNextPageSkeletons, setShowNextPageSkeletons] = useState(false);
  const profilesPerPage = 10;
  const observer = useRef<IntersectionObserver | null>(null);
  const [queryParams, setQueryParams] = useState<ProfileQueryParams>({
    sort: {
      field: null,
      direction: null,
    },
    filters: {
      age: {
        min: null,
        max: null,
      },
      skills: [],
      languages: [],
    },
  });

  const lastProfileRef = useCallback(
    (node: HTMLDivElement) => {
      // Don't observe when there's no more data or when loading
      if (isLoading || loadingMore || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            // Show skeleton loading cards immediately
            setShowNextPageSkeletons(true);
            // Trigger next page fetch
            setPage((prevPage) => prevPage + 1);
          }
        },
        {
          // Start Fetcing when element is 500px away from viewport
          rootMargin: "0px 0px 500px 0px", // 500px bottom margin
          threshold: 0.1, // Trigger when 10% of the element is visible
        },
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadingMore],
  );

  useEffect(() => {
    if (!hasMore && observer.current) {
      observer.current.disconnect();
    }
  }, [hasMore]);

  useEffect(() => {
    fetchProfiles();
  }, [page]);

  const fetchProfiles = async () => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }

    const currentUserId = userSession?.id || "";
    if (page === 1) setUserId(currentUserId);

    try {
      const allProfiles = await getAllProfiles(page, profilesPerPage);

      if (allProfiles.length === 0) {
        setHasMore(false);
        return;
      }

      const filteredProfiles = allProfiles.filter(
        (profile) => profile.id !== currentUserId,
      );

      const favorites = currentUserId
        ? await getUserFavoritesProfiles(currentUserId)
        : [];
      const favoritesSet = new Set(favorites);

      const profilesWithFavorites = filteredProfiles.map((profile) => ({
        ...profile,
        isFavorite: favoritesSet.has(profile.id),
      }));

      // Update profiles with new data
      setProfiles((prev) =>
        page === 1
          ? profilesWithFavorites
          : [...prev, ...profilesWithFavorites],
      );

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setShowNextPageSkeletons(false);
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const renderSkeletonCards = () => {
    return Array(profilesPerPage)
      .fill(null)
      .map((_, index) => (
        <motion.div key={`skeleton-${index}`} variants={profileCardVariants}>
          <ProfilesSingleCardSkeleton />
        </motion.div>
      ));
  };

  // Animation variants
  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const headerVariants = {
    hidden: {opacity: 0, y: -20},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const newPeopleVariants = {
    hidden: {scale: 0.8, opacity: 0},
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const controlsVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const profileCardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div
        className="flex flex-col justify-center items-center gap-2.5 py-14"
        variants={headerVariants}>
        <motion.div
          className="flex items-center gap-1.5 px-3 py-[5px] border border-border rounded-full"
          variants={newPeopleVariants}>
          <div className="relative flex justify-center items-center w-2.5 h-2.5">
            <div className="bg-primary rounded-full w-2 h-2"></div>
            <div className="top-0 left-0 absolute bg-primary/50 rounded-full w-2.5 h-2.5 animate-ping"></div>
          </div>
          <MainGradient as="span" className="font-medium text-xs text-center">
            3 new people added
          </MainGradient>
        </motion.div>
        <MainGradient
          as="h1"
          className="font-semibold text-3xl sm:text-4xl lg:text-5xl text-center">
          Find Your Perfect Match
        </MainGradient>
        <SecGradient
          as="h2"
          className="px-3 max-w-[742px] text-[15px] sm:text-[16px] lg:text-[18px] text-center">
          Explore profiles of skilled individuals who share your vision. Join
          forces with like-minded creators and turn bold ideas into success
          stories.
        </SecGradient>
      </motion.div>
      <motion.div className="flex flex-col gap-4" variants={controlsVariants}>
        <motion.div
          className="flex max-[480px]:flex-col justify-between items-center gap-3 max-[480px]:gap-2"
          variants={controlsVariants}>
          <SimpleInput
            placeholder="Search..."
            type="search"
            id="search"
            search
          />
          <div className="flex gap-3 max-[480px]:gap-2 max-[480px]:w-full">
            <ProfilesOrderBy
              setQueryParams={setQueryParams}
              queryParams={queryParams}
            />
            <ProfilesFilterPopup />
          </div>
        </motion.div>
        <div className="container-query-parent">
          <div className="gap-6 container-grid grid grid-cols-3">
            {profiles.map((profile, index) => {
              if (profiles.length === index + 1) {
                return (
                  <motion.div
                    ref={lastProfileRef}
                    key={profile.id}
                    variants={profileCardVariants}>
                    <ProfilesSinlgeCard
                      profile={profile}
                      userId={userId}
                      isFavorite={profile.isFavorite}
                    />
                  </motion.div>
                );
              } else {
                return (
                  <motion.div key={profile.id} variants={profileCardVariants}>
                    <ProfilesSinlgeCard
                      profile={profile}
                      userId={userId}
                      isFavorite={profile.isFavorite}
                    />
                  </motion.div>
                );
              }
            })}
            {/* Skeleton cards for next page */}
            {showNextPageSkeletons && !isLoading && renderSkeletonCards()}

            {/* Initial loading state */}
            {isLoading && renderSkeletonCards()}
          </div>

          {(isLoading || loadingMore) && (
            <div className="flex justify-center col-span-3 py-4">
              <LoadingButtonCircle size={2} />
            </div>
          )}
          {loadingMore && (
            <div className="flex justify-center col-span-3 py-4">
              <LoadingButtonCircle size={22} />
            </div>
          )}
        </div>
        {!isLoading && !loadingMore && !hasMore && profiles.length > 0 && (
          <motion.div
            className="py-4 text-foreground/70 text-center"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}>
            No more profiles to load
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProfilesClientComponent;
