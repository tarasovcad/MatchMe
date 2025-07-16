import {Button} from "@/components/shadcn/button";
import {getNameInitials} from "@/functions/getNameInitials";
import {MiniCardMatchMeUser} from "@/types/user/matchMeUser";
import {Messages2} from "iconsax-react";
import React from "react";
import Image from "next/image";
import Avatar from "boring-avatars";
import Link from "next/link";

const ProfileMiniCard = ({
  profile,
  customFollowButton,
  customSecondaryButton,
}: {
  profile: MiniCardMatchMeUser;
  customFollowButton?: React.ReactNode;
  customSecondaryButton?: React.ReactNode;
}) => {
  return (
    <div
      key={profile.id}
      className="w-full border border-border rounded-[12px] max-w-[362px] relative">
      <div className="p-[24px] relative z-5 flex flex-col gap-4">
        {/* name and role */}
        <div className="flex flex-col items-center gap-2.5 ">
          {profile.profile_image ? (
            <Image
              src={profile.profile_image[0].url}
              alt="team member"
              width={65}
              height={65}
              quality={100}
              unoptimized
              className="rounded-full object-cover w-[65px] h-[65px]"
            />
          ) : (
            <div className="border-3 border-background rounded-full max-w-[65px] max-h-[65px]">
              <Avatar
                name={getNameInitials(profile.name)}
                width={65}
                height={65}
                variant="beam"
                className="rounded-full"
              />
            </div>
          )}
          <div className="flex flex-col gap-0.5 items-center">
            <Link href={`/profiles/${profile.username}`}>
              <h4 className="font-medium text-foreground/80 text-[18px] leading-tight hover:text-foreground/70 transition-colors duration-300">
                {profile.name}
              </h4>
            </Link>
            <p className="text-[15px] text-secondary flex items-center gap-1.5 whitespace-nowrap">
              @{profile.username}
            </p>
          </div>
        </div>
        {/* buttons*/}
        <div className="flex items-center gap-1.5 justify-center">
          {customFollowButton ? (
            customFollowButton
          ) : (
            <Button variant="secondary" size="xs" className="flex-1 max-w-[126px]">
              Follow
            </Button>
          )}
          {customSecondaryButton ? (
            customSecondaryButton
          ) : (
            <Button variant="outline" size="xs" className="flex-1 max-w-[126px]">
              <Messages2 size="16" color="currentColor" strokeWidth={3} />
              Message
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileMiniCard;
