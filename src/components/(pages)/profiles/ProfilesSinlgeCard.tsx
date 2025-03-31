import ProfileAddToFavoriteBtn from "@/components/favourites/ProfileAddToFavoriteBtn";
import {Button} from "@/components/shadcn/button";
import MainGradient from "@/components/ui/Text";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {BellRing, Languages, Search, Wrench} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProfilesSinlgeCard = ({
  profile,
  userId,
  isFavorite,
}: {
  profile: MatchMeUser;
  userId: string | undefined | null;
  isFavorite: boolean;
}) => {
  return (
    <div className="p-6 max-[1200px]:p-6 max-[1335px]:p-4 border border-border rounded-[12px]">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-1">
          <div className="flex items-center gap-3">
            <Image
              src={profile.image}
              alt={`${profile.name} profile picture`}
              width={45}
              height={45}
              className="rounded-full"
              unoptimized
            />
            <div>
              <Link href={`/profiles/${profile.username}`}>
                <MainGradient
                  as="h4"
                  className="font-medium text-[18px] hover:text-foreground/50 line-clamp-1 leading-[23px] transition-colors duration-300">
                  {profile.name}
                </MainGradient>
              </Link>
              <p className="text-[13px] text-secondary line-clamp-1 leading-[17px]">
                {profile.public_current_role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-secondary">
            <BellRing
              size={14}
              strokeWidth={2}
              aria-hidden="true"
              className="text-secondary"
            />
            <span className="text-[13px]">•</span>
            <span className="text-[15px]">5d</span>
          </div>
        </div>
        <p className="text-[14px] text-secondary">{profile.tagline}</p>
        <div className="flex flex-col gap-1 text-[14px] text-secondary">
          <div className="flex items-center gap-2">
            <Wrench size={16} strokeWidth={2} className="shrink-0" />
            <span className="line-clamp-1">
              {" "}
              {Array.isArray(profile?.skills)
                ? profile?.skills.join(", ")
                : profile?.skills}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Search size={16} strokeWidth={2} className="shrink-0" />
            <span>{profile.looking_for}</span>
          </div>
          <div className="flex items-center gap-2">
            <Languages size={16} strokeWidth={2} className="shrink-0" />
            <span className="line-clamp-1">
              {Array.isArray(profile?.languages)
                ? profile?.languages.join(", ")
                : profile?.languages}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[10px] pt-3">
          <Link href={`/profiles/${profile.username}`} className="w-full">
            <Button variant={"secondary"} className="w-full">
              View Profile
            </Button>
          </Link>
          <ProfileAddToFavoriteBtn
            userId={userId}
            favoriteUserId={profile.id}
            isFavorite={isFavorite}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilesSinlgeCard;
