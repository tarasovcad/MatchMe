import ProfileAddToFavoriteBtn from "@/components/favourites/ProfileAddToFavoriteBtn";
import {Button} from "@/components/shadcn/button";
import MainGradient from "@/components/ui/Text";
import {getNameInitials} from "@/functions/getNameInitials";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {BellRing, Languages, Search, Wrench} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Avatar from "boring-avatars";
import AuthGate from "@/components/other/AuthGate";

const ProfilesSinlgeCard = ({
  profile,
  userId,
  isFavorite,
  customButton,
}: {
  profile: MatchMeUser;
  userId: string | undefined | null;
  isFavorite: boolean;
  customButton?: React.ReactNode;
}) => {
  return (
    <div className="p-4 border border-border rounded-[12px]">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            {profile.profile_image && profile.profile_image.length > 0 ? (
              <Image
                src={profile.profile_image[0].url}
                alt={`${profile.name} profile picture`}
                width={42}
                height={42}
                className="rounded-full min-h-[42px] object-cover shrink-0"
                unoptimized
              />
            ) : (
              <Avatar
                name={getNameInitials(profile.name)}
                size={42}
                className="rounded-full shrink-0"
                variant="beam"
              />
            )}

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
            <BellRing size={14} strokeWidth={2} aria-hidden="true" className="text-secondary" />
            <span className="text-[13px]">•</span>
            <span className="text-[15px]">5d</span>
          </div>
        </div>
        <p className="text-[14px] text-secondary line-clamp-1">{profile.tagline}</p>
        <div className="flex flex-col gap-1 text-[14px] text-secondary">
          <div className="flex items-center gap-2">
            <Wrench size={16} strokeWidth={2} className="shrink-0" />
            <span className="line-clamp-1">
              {" "}
              {Array.isArray(profile?.skills) ? profile?.skills.join(", ") : profile?.skills}
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
          {customButton ? (
            customButton
          ) : (
            <Link href={`/profiles/${profile.username}`} className="w-full">
              <Button variant={"secondary"} className="w-full">
                View Profile
              </Button>
            </Link>
          )}

          <AuthGate userSessionId={userId}>
            <ProfileAddToFavoriteBtn
              userId={userId}
              favoriteUserId={profile.id}
              isFavorite={isFavorite}
            />
          </AuthGate>
        </div>
      </div>
    </div>
  );
};

export default ProfilesSinlgeCard;
