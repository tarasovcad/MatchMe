import {
  getAllProfiles,
  getUserFavoritesProfiles,
} from "@/actions/profiles/profiles";
import ProfilesSinlgeCard from "@/components/(pages)/profiles/ProfilesSinlgeCard";
import {Button} from "@/components/shadcn/button";
import SimpleInput from "@/components/ui/SimpleInput";
import MainGradient, {SecGradient} from "@/components/ui/Text";
import SidebarProvider from "@/providers/SidebarProvider";
import {createClient} from "@/utils/supabase/server";
import {ChevronDown, PanelBottomClose} from "lucide-react";
import React from "react";

const ProfilesPage = async () => {
  const supabase = await createClient();
  const startTime = new Date();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const profiles = await getAllProfiles();

  // Filter out current user's profile that is logged in
  const filteredProfiles = profiles.filter((profile) => profile.id !== userId);

  // Get favorites
  const favorites = userId ? await getUserFavoritesProfiles(userId) : [];

  const favoritesSet = new Set(favorites);
  const profilesWithFavorites = filteredProfiles.map((profile) => ({
    ...profile,
    isFavorite: favoritesSet.has(profile.id),
  }));

  const endTime = new Date();
  console.log(
    `Fetched profiles in ${endTime.getTime() - startTime.getTime()}ms`,
  );
  return (
    <SidebarProvider>
      <div>
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
          <MainGradient as="h1" className="font-semibold text-5xl text-center">
            Find Your Perfect Match
          </MainGradient>
          <SecGradient
            as="h2"
            className="max-w-[742px] text-[18px] text-center">
            Explore profiles of skilled individuals who share your vision. Join
            forces with like-minded creators and turn bold ideas into success
            stories.
          </SecGradient>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-3">
            <SimpleInput
              placeholder="Search..."
              type="search"
              id="search"
              search
            />
            <div className="flex gap-3">
              <Button size={"xs"}>
                Order by
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className="text-foreground/90"
                />
              </Button>
              <Button size={"xs"}>
                Show Filters
                <PanelBottomClose
                  size={16}
                  strokeWidth={2}
                  className="text-foreground/90"
                />
              </Button>
            </div>
          </div>
          <div className="gap-6 max-[1200px]:gap-6 max-[1280px]:gap-4 grid grid-cols-3 max-[1200px]:grid-cols-2">
            {profilesWithFavorites?.map((profile) => {
              return (
                <ProfilesSinlgeCard
                  profile={profile}
                  userId={userId}
                  isFavorite={profile.isFavorite}
                  key={profile.id}
                />
              );
            })}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProfilesPage;
