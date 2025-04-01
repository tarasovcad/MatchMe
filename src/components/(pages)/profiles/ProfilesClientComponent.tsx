"use client";
import React, {useState, useEffect} from "react";
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

const ProfilesClientComponent = ({userSession}: {userSession: User | null}) => {
  const [profiles, setProfiles] = useState<
    (MatchMeUser & {isFavorite: boolean})[]
  >([]);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setIsLoading(true);
    const startTime = new Date();

    const currentUserId = userSession?.id || "";
    setUserId(currentUserId);

    const allProfiles = await getAllProfiles(currentUserId);
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

    setProfiles(profilesWithFavorites);

    const endTime = new Date();
    console.log(
      `Fetched profiles in ${endTime.getTime() - startTime.getTime()}ms`,
    );
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-2.5 py-14">
        <div className="flex items-center gap-1.5 px-3 py-[5px] border border-border rounded-full">
          <div className="relative flex justify-center items-center w-2.5 h-2.5">
            <div className="bg-primary rounded-full w-2 h-2"></div>
            <div className="top-0 left-0 absolute bg-primary/50 rounded-full w-2.5 h-2.5 animate-ping"></div>
          </div>
          <MainGradient as="span" className="font-medium text-xs text-center">
            3 new people added
          </MainGradient>
        </div>
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
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex max-[480px]:flex-col justify-between items-center gap-3 max-[480px]:gap-2">
          <SimpleInput
            placeholder="Search..."
            type="search"
            id="search"
            search
          />
          <div className="flex gap-3 max-[480px]:gap-2 max-[480px]:w-full">
            <Button size={"xs"} className="max-[480px]:w-full">
              Order by
              <ChevronDown
                size={16}
                strokeWidth={2}
                className="text-foreground/90"
              />
            </Button>
            <Button size={"xs"} className="max-[480px]:w-full">
              Show Filters
              <PanelBottomClose
                size={16}
                strokeWidth={2}
                className="text-foreground/90"
              />
            </Button>
          </div>
        </div>
        <div className="container-query-parent">
          <div className="gap-6 container-grid grid grid-cols-3">
            {isLoading ? (
              <div>
                <LoadingButtonCircle size={16} />
              </div>
            ) : (
              <>
                {profiles?.map((profile) => {
                  return (
                    <ProfilesSinlgeCard
                      profile={profile}
                      userId={userId}
                      isFavorite={profile.isFavorite}
                      key={profile.id}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilesClientComponent;
