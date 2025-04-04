import {
  getUserProfile,
  getUserStats,
  isUserFavorite,
} from "@/actions/profiles/singleUserProfile";
import ProfileFormField from "@/components/(pages)/profiles/ProfileFormField";
import ProfileOtherButton from "@/components/(pages)/profiles/ProfileOtherButton";
import ProfileSocialLinks from "@/components/(pages)/profiles/ProfileSocialLinks";
import FollowUserButton from "@/components/follows/FollowUserButton";
import {Button} from "@/components/shadcn/button";
import MainGradient from "@/components/ui/Text";
import {profileFormFields} from "@/data/forms/profile/profileFormFields";
import {formatNumber} from "@/functions/formatNumber";
import {getNameInitials} from "@/functions/getNameInitials";
import {cn} from "@/lib/utils";
import SidebarProvider from "@/providers/SidebarProvider";
import {createClient} from "@/utils/supabase/server";
import Avatar from "boring-avatars";
import {Messages2} from "iconsax-react";
import Image from "next/image";
import React from "react";

const UserSinglePage = async ({
  params,
}: {
  params: Promise<{username: string}>;
}) => {
  const startTime = Date.now();
  const supabase = await createClient();
  const {username} = await params;
  const {data: userSession} = await supabase.auth.getUser();
  const userSessionId = userSession?.user?.id;

  const user = await getUserProfile(username);
  console.log(user);
  if (!user) {
    return <div>User not found.</div>;
  }

  const [statsData, isFavorite] = await Promise.all([
    getUserStats(user.id, userSessionId, user),
    userSessionId
      ? isUserFavorite(userSessionId, user.id)
      : Promise.resolve(false),
  ]);

  const {followerCount, followingCount, skills, isFollowing, isFollowingBack} =
    statsData;

  console.log("Time taken to fetch user:", Date.now() - startTime);

  return (
    <SidebarProvider removePadding>
      <Image
        src={"/test.png"}
        unoptimized
        alt={user.name}
        width={0}
        height={0}
        sizes="100vw"
        className="rounded-[6px] rounded-t-none w-full"
        style={{width: "100%", height: "156px"}}
      />

      <div className="flex flex-col gap-9 p-6 pt-0 responsive-container">
        <div className="flex flex-col gap-6">
          <div className="relative flex justify-between gap-3">
            <UserButtons
              className="max-[620px]:hidden top-0 right-0 absolute pt-[15px]"
              isFollowing={isFollowing}
              userSessionId={userSessionId}
              profileId={user.id}
              isFollowingBack={isFollowingBack}
              username={username}
              isFavorite={isFavorite}
            />
            <div className="flex max-[1130px]:flex-col gap-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={125}
                  height={125}
                  className="-mt-9 border-4 border-background rounded-full shrink-0"
                  style={{
                    width: "clamp(100px, 10vw, 125px)",
                    height: "clamp(100px, 10vw, 125px)",
                  }}
                  unoptimized
                />
              ) : (
                <Avatar
                  name={getNameInitials(user.name)}
                  width={125}
                  height={125}
                  className="-mt-9 border-4 border-background rounded-full shrink-0"
                  style={{
                    width: "clamp(100px, 10vw, 125px)",
                    height: "clamp(100px, 10vw, 125px)",
                  }}
                  variant="beam"
                />
              )}
              <div className="flex flex-col gap-3 min-[1130px]:pt-[15px]">
                {/* name and verified */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MainGradient as="h1" className="font-semibold text-[26px]">
                      {user.name}
                    </MainGradient>
                    {user.is_profile_verified && (
                      <Image
                        src="/svg/verified.svg"
                        alt="Verified"
                        width={18}
                        height={18}
                        className="shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-secondary text-sm">{user.tagline}</p>
                </div>
                {/* social links */}
                <ProfileSocialLinks user={user} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-[30px] max-[1130px]:gap-[45px]">
              <UserNumbers
                className="max-[950px]:hidden pt-[75px] pr-[47px]"
                followerCount={followerCount}
                followingCount={followingCount}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <UserButtons
              className="min-[620px]:hidden w-full"
              isFollowing={isFollowing}
              userSessionId={userSessionId}
              profileId={user.id}
              isFollowingBack={isFollowingBack}
              username={username}
              isFavorite={isFavorite}
            />
            <UserNumbers
              className="min-[950px]:hidden justify-between"
              followerCount={followerCount}
              followingCount={followingCount}
            />
          </div>
        </div>
        {/* main section */}
        <div>
          <div className="flex flex-col gap-8 max-[990px]:gap-10">
            {profileFormFields.map((formField) => (
              <div key={formField.fieldTitle}>
                <ProfileFormField
                  formField={formField}
                  user={user}
                  skills={skills}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const UserButtons = ({
  className,
  userSessionId,
  profileId,
  isFollowing,
  isFollowingBack,
  username,
  isFavorite,
}: {
  className?: string;
  userSessionId: string | undefined;
  profileId: string | undefined;
  isFollowing: boolean;
  isFollowingBack?: boolean;
  username: string;
  isFavorite: boolean;
}) => {
  if (userSessionId !== profileId) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 max-[620px] max-[360px]:gap-1",
          className,
        )}>
        <ProfileOtherButton
          userId={userSessionId}
          profileId={profileId ?? ""}
          isFavorite={isFavorite}
        />
        <div className="flex items-center gap-[10px] max-[360px]:gap-1 max-[620px]:w-full">
          <Button
            size={"default"}
            className="max-[620px]:order-2 max-[620px]:w-full">
            <Messages2
              size="18"
              color="currentColor"
              strokeWidth={2}
              className="max-[450px]:hidden stroke-2"
            />
            Message
          </Button>
          <FollowUserButton
            followingId={profileId || ""}
            isFollowing={isFollowing}
            isFollowingBack={isFollowingBack}
            username={username}
          />
        </div>
      </div>
    );
  }
};

const UserNumbers = ({
  className,
  followerCount,
  followingCount,
}: {
  className?: string;
  followerCount: number;
  followingCount: number;
}) => {
  return (
    <div className={cn("flex items-center gap-12 ", className)}>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">
          Followers
        </span>
        <MainGradient
          as="h3"
          className="font-semibold text-[26px] text-secondary leading-[34px]">
          {formatNumber(followerCount)}
        </MainGradient>
      </div>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">
          Following
        </span>
        <MainGradient
          as="h3"
          className="font-semibold text-[26px] text-secondary leading-[34px]">
          {formatNumber(followingCount)}
        </MainGradient>
      </div>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">Posts</span>
        <MainGradient
          as="h3"
          className="font-semibold text-[26px] text-secondary leading-[34px]">
          5
        </MainGradient>
      </div>
    </div>
  );
};

export default UserSinglePage;
