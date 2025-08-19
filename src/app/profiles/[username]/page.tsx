import {getUserProfileBundle} from "@/actions/profiles/singleUserProfile";
import {trackProfileVisit} from "@/actions/profiles/trackProfileVisit";
import ContentShareSection from "@/components/(pages)/other/ContentShareSection";
import KeywordTagList from "@/components/(pages)/other/KeywordTagList";
import BackgroundImageViewer from "@/components/(pages)/profiles/BackgroundImageViewer";
import ProfileFormField from "@/components/(pages)/profiles/ProfileFormField";
import ImageViewer from "@/components/ui/ImageViewer";
import ProfileOtherButton from "@/components/(pages)/profiles/ProfileOtherButton";
import ProfileProjectsList from "@/components/(pages)/profiles/ProfileProjectsList";
import ProfileSocialLinks from "@/components/(pages)/profiles/ProfileSocialLinks";
import FollowUserButton from "@/components/follows/FollowUserButton";
import AuthGate from "@/components/other/AuthGate";
import {Button} from "@/components/shadcn/button";
import MainGradient from "@/components/ui/Text";
import {profileFormFields} from "@/data/forms/profile/profileFormFields";
import {formatNumber} from "@/functions/formatNumber";
import {cn} from "@/lib/utils";
import SidebarProvider from "@/providers/SidebarProvider";
import {createClient} from "@/utils/supabase/server";
import {Messages2} from "iconsax-react";
import Image from "next/image";
import React from "react";
import type {Metadata} from "next";
import {getUserProfile} from "@/actions/profiles/singleUserProfile";
import {notFound} from "next/navigation";
import {UserPen} from "lucide-react";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{username: string}>;
}): Promise<Metadata> {
  const {username} = await params;

  try {
    const user = await getUserProfile(username);

    if (!user) {
      return {
        title: "User not found | MatchMe",
        description: "This profile does not exist.",
        robots: {index: false, follow: false},
        alternates: {canonical: `https://matchme.me/profiles/${username}`},
      };
    }

    const titleBase = user.tagline ? `${user.name} – ${user.tagline}` : `${user.name} – Profile`;
    const title = `${titleBase} | MatchMe`;
    const rawDescription = user.tagline || user.about_you || "View profile on MatchMe.";
    const description =
      rawDescription.length > 160 ? `${rawDescription.slice(0, 157)}...` : rawDescription;
    const url = `https://matchme.me/profiles/${username}`;
    const keywords = [...(user.skills ?? []), ...(user.tags ?? [])]
      .filter(Boolean)
      .slice(0, 12)
      .join(", ");
    const ogImage =
      Array.isArray(user.profile_image) && user.profile_image[0]?.url
        ? user.profile_image[0].url
        : "/logo/full_logo.svg";

    return {
      title,
      description,
      keywords,
      alternates: {canonical: url},
      openGraph: {
        title,
        description,
        url,
        type: "profile",
        images: [ogImage],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: "Profile | MatchMe",
      description: "Explore profiles on MatchMe.",
      alternates: {canonical: `https://matchme.me/profiles/${username}`},
    };
  }
}

const UserSinglePage = async ({params}: {params: Promise<{username: string}>}) => {
  const {username} = await params;

  let bundle;
  let userSessionId: string | undefined;

  try {
    const supabase = await createClient();
    const {data: userSession} = await supabase.auth.getUser();
    userSessionId = userSession?.user?.id;

    bundle = await getUserProfileBundle(username, userSessionId, supabase);
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMITED") {
      return (
        <div className="mx-auto p-4 container">
          <h1 className="font-bold text-xl">Too many requests</h1>
          <p>Please wait a minute and try again.</p>
        </div>
      );
    }
    console.error("Error rendering user profile:", e);
    return (
      <div className="mx-auto p-4 container">
        <h1 className="font-bold text-xl">Something went wrong</h1>
        <p>We encountered an error while loading this profile. Please try again later.</p>
      </div>
    );
  }

  // Handle user not found outside of try-catch to allow notFound() to work
  if (!bundle) {
    notFound();
  }

  const {user, stats, follow, favorite, projects} = bundle;

  // track profile visit
  if (userSessionId && userSessionId !== user.id) {
    await trackProfileVisit(userSessionId, user.id);
  }

  const {followerCount, followingCount, skills} = stats;
  const {isFollowing, isFollowingBack} = follow;

  const profileImageUrl =
    Array.isArray(user.profile_image) && user.profile_image[0]?.url
      ? user.profile_image[0].url
      : undefined;
  const sameAs = [
    user.personal_website,
    user.social_links_1,
    user.social_links_2,
    user.social_links_3,
  ].filter(Boolean) as string[];

  return (
    <SidebarProvider removePadding>
      <BackgroundImageViewer
        backgroundImage={user.background_image}
        name={user.name}
        className="bg-gray-200 rounded-[6px] rounded-t-none w-full object-cover"
        style={{
          width: "100%",
          height: "clamp(130px, 20vw, 156px)",
        }}
      />

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: user.name,
              url: `https://matchme.me/profiles/${username}`,
              image: profileImageUrl,
              description: user.about_you || user.tagline || user.dream || undefined,
              knowsAbout: [
                ...((user.tags ?? []) as string[]),
                ...(skills || []).map((s) => s.name),
              ].slice(0, 20),
              sameAs,
            },
          }),
        }}
      />

      <div className="@container flex flex-col gap-3 max-[950px]:gap-6 p-6 pt-0">
        <div className="flex flex-col gap-6">
          <div className="relative flex justify-between gap-28 max-[1130px]:gap-16">
            <UserButtons
              className="@max-[620px]:hidden top-0 right-0 absolute pt-[15px]"
              isFollowing={isFollowing}
              userSessionId={userSessionId}
              profileId={user.id}
              isFollowingBack={isFollowingBack}
              username={username}
              isFavorite={favorite}
            />
            <div className="flex max-[1130px]:flex-col gap-3">
              <ImageViewer
                image={user.profile_image}
                name={user.name}
                fallbackImage="/avatar/default-user-avatar.png"
                width={125}
                height={125}
                className="-mt-9 border-4 border-background rounded-full shrink-0 "
                style={{
                  width: "clamp(100px, 10vw, 125px)",
                  height: "clamp(100px, 10vw, 125px)",
                }}
                type="profile"
              />
              <div className="flex flex-col gap-3 min-[1130px]:pt-[15px]">
                {/* name and verified */}
                <div className="flex flex-col gap-[6px]">
                  <div className="flex items-center gap-2">
                    <MainGradient as="h1" className="font-semibold text-[26px] leading-[26px]">
                      {user.name}
                    </MainGradient>
                    {user.is_profile_verified && (
                      <Image
                        src="/svg/verified.svg"
                        alt="Verified"
                        width={18}
                        height={18}
                        className="w-auto h-auto shrink-0"
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
              className="@min-[620px]:hidden w-full"
              isFollowing={isFollowing}
              userSessionId={userSessionId}
              profileId={user.id}
              isFollowingBack={isFollowingBack}
              username={username}
              isFavorite={favorite}
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
                <ProfileFormField formField={formField} user={user} skills={skills} />
              </div>
            ))}
            <ProfileProjectsList projects={projects} userId={userSessionId ?? ""} />
            <KeywordTagList tags={user.tags ?? []} type="profiles" />
            <ContentShareSection
              contentType="profile"
              contentUrl={`https://matchme.me/profiles/${username}`}
              contentName={user.name}
              contentTagline={user.tagline ?? ""}
            />
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
      <div className={cn("flex items-center gap-3 max-[620px] max-[360px]:gap-1", className)}>
        <AuthGate userSessionId={userSessionId}>
          <ProfileOtherButton
            userId={userSessionId}
            profileId={profileId ?? ""}
            isFavorite={isFavorite}
            buttonClassName="@max-[620px]:order-2"
          />
        </AuthGate>

        <div className="flex items-center gap-[10px] max-[360px]:gap-1 @max-[620px]:w-full">
          <AuthGate userSessionId={userSessionId}>
            <Button size={"default"} className="@max-[620px]:order-2 @max-[620px]:w-full">
              <Messages2 size="16" color="currentColor" className="max-[450px]:hidden" />
              Message
            </Button>
          </AuthGate>
          <AuthGate userSessionId={userSessionId}>
            <FollowUserButton
              followingId={profileId || ""}
              isFollowing={isFollowing}
              isFollowingBack={isFollowingBack}
              userSessionId={userSessionId}
              username={username}
              buttonClassName="@max-[620px]:w-full"
            />
          </AuthGate>
        </div>
      </div>
    );
  } else {
    return (
      <div className={cn("flex items-center gap-3 max-[620px] max-[360px]:gap-1", className)}>
        <Link href={`/settings?tab=account`} className="w-full">
          <Button size={"default"} className="@max-[620px]:order-2 @max-[620px]:w-full">
            <UserPen size="16" color="currentColor" className="max-[450px]:hidden" />
            Edit Profile
          </Button>
        </Link>
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
        <span className="text-[13px] text-secondary leading-[16px]">Followers</span>
        <MainGradient as="h3" className="font-semibold text-[26px] text-secondary leading-[34px]">
          {formatNumber(followerCount)}
        </MainGradient>
      </div>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">Following</span>
        <MainGradient as="h3" className="font-semibold text-[26px] text-secondary leading-[34px]">
          {formatNumber(followingCount)}
        </MainGradient>
      </div>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">Posts</span>
        <MainGradient as="h3" className="font-semibold text-[26px] text-secondary leading-[34px]">
          0
        </MainGradient>
      </div>
    </div>
  );
};

export default UserSinglePage;
