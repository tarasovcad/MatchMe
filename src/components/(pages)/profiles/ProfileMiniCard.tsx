import {Button} from "@/components/shadcn/button";
import {getNameInitials} from "@/functions/getNameInitials";
import {ProjectTeamMemberMinimal} from "@/types/user/matchMeUser";
import {Messages2} from "iconsax-react";
import React from "react";
import Image from "next/image";
import Avatar from "boring-avatars";
import Link from "next/link";
import FollowUserButton from "@/components/follows/FollowUserButton";
import {Pencil, UserPen} from "lucide-react";
import AuthGate from "@/components/other/AuthGate";

const ProfileMiniCard = ({
  member,
  customFollowButton,
  customSecondaryButton,
  userSessionId,
}: {
  member: ProjectTeamMemberMinimal;
  customFollowButton?: React.ReactNode;
  customSecondaryButton?: React.ReactNode;
  userSessionId?: string;
}) => {
  const imageLink =
    member.profile_image && member.profile_image.length > 0
      ? member.profile_image[0].url
      : "/avatar/default-user-avatar.png";
  return (
    <div
      key={member.user_id}
      className="w-full border border-border rounded-[12px] max-w-[362px] relative">
      <div className="p-[24px] relative z-5 flex flex-col gap-4">
        {/* name and role */}
        <div className="flex flex-col items-center gap-2.5 ">
          <Image
            src={imageLink}
            alt="team member"
            width={65}
            height={65}
            quality={100}
            unoptimized
            className="rounded-full object-cover w-[65px] h-[65px]"
          />

          <div className="flex flex-col gap-0.5 items-center">
            <Link href={`/profiles/${member.username}`}>
              <h4 className="font-medium  text-foreground/85  hover:text-foreground  text-[18px] leading-tight transition-colors duration-300">
                {member.name}
              </h4>
            </Link>
            {member.display_name ? (
              <p className="text-[15px] text-secondary flex items-center gap-1.5">
                {member.display_name}
              </p>
            ) : (
              <p className="text-[15px] text-secondary flex items-center gap-1.5 whitespace-nowrap">
                @{member.username}
              </p>
            )}
          </div>
        </div>
        {/* buttons*/}
        {userSessionId === member.user_id ? (
          <div className="flex items-center gap-1.5 justify-center px-5.5 ">
            <Link href={`/profiles/${member.username}`} className="w-full flex-">
              <Button size={"xs"} className="w-full flex-1" variant="secondary">
                View Profile
              </Button>
            </Link>
            <Link href={`/settings?tab=account`} className="w-full flex-1 bh">
              <Button size={"xs"} className="w-full flex-1">
                <UserPen size="16" color="currentColor" />
                Edit Profile
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 justify-center px-5.5">
            {customFollowButton ? (
              customFollowButton
            ) : (
              <AuthGate userSessionId={userSessionId}>
                <FollowUserButton
                  followingId={member.user_id}
                  isFollowing={!!member.isFollowing}
                  isFollowingBack={!!member.isFollowingBack}
                  username={member.username}
                  userSessionId={userSessionId}
                  size="xs"
                  buttonClassName="flex-1 "
                  simpleStyle
                  followVariant="secondary"
                />
              </AuthGate>
            )}
            {customSecondaryButton ? (
              customSecondaryButton
            ) : (
              <AuthGate userSessionId={userSessionId}>
                <Button variant="outline" size="xs" className="flex-1 ">
                  <Messages2 size="16" color="currentColor" strokeWidth={3} />
                  Message
                </Button>
              </AuthGate>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileMiniCard;
