import ProfileAddToFavoriteBtn from "@/components/favourites/ProfileAddToFavoriteBtn";
import {Button} from "@/components/shadcn/button";
import MainGradient from "@/components/ui/Text";
import {getNameInitials} from "@/functions/getNameInitials";
import {CardMatchMeUser} from "@/types/user/matchMeUser";
import {BellRing, MessageCircle, Search, Star, Wrench} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Avatar from "boring-avatars";
import AuthGate from "@/components/other/AuthGate";

const ProfilesSinlgeCard = ({
  profile,
  userId,
  customButton,
}: {
  profile: CardMatchMeUser;
  userId: string | undefined | null;
  customButton?: React.ReactNode;
}) => {
  const imageLink =
    profile.profile_image && profile.profile_image.length > 0
      ? profile.profile_image[0].url
      : "/avatar/default-user-avatar.png";
  return (
    <div className="p-4 border border-border rounded-[12px]">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <Image
              src={imageLink}
              alt={`${profile.name} profile picture`}
              width={42}
              height={42}
              className="rounded-full min-h-[42px] object-cover shrink-0"
              unoptimized
            />

            <div>
              <Link href={`/profiles/${profile.username}`}>
                <h4 className="font-medium text-[18px] text-foreground/85  hover:text-foreground line-clamp-1 leading-[23px] transition-colors duration-300">
                  {profile.name}
                </h4>
              </Link>
              <p className="text-[13px] text-secondary line-clamp-1 leading-[17px]">
                {profile.public_current_role}
              </p>
            </div>
          </div>
          {/* <div className="flex items-center gap-1 text-secondary">
            <BellRing size={14} strokeWidth={2} aria-hidden="true" className="text-secondary" />
            <span className="text-[13px]">•</span>
            <span className="text-[15px]">5d</span>
          </div> */}
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
            <Star size={16} strokeWidth={2} className="shrink-0" />
            <span className="line-clamp-1">{profile.seniority_level}</span>
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
            <Button variant="outline" size="icon" className="h-[38px] w-[38px] shrink-0">
              <MessageCircle size="16" color="currentColor" strokeWidth={1.8} />
            </Button>
          </AuthGate>
        </div>
      </div>
    </div>
  );
};

export default ProfilesSinlgeCard;
