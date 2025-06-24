"use client";
import ProfileOtherButton from "@/components/(pages)/profiles/ProfileOtherButton";
import ProfileSocialLinks from "@/components/(pages)/profiles/ProfileSocialLinks";
import FollowUserButton from "@/components/follows/FollowUserButton";
import AuthGate from "@/components/other/AuthGate";
import {Button} from "@/components/shadcn/button";
import MainGradient from "@/components/ui/Text";
import {formatNumber} from "@/functions/formatNumber";
import {cn} from "@/lib/utils";
import Avatar from "boring-avatars";
import {Messages2} from "iconsax-react";
import Image from "next/image";
import React, {useState} from "react";
import {ChevronDownIcon, Plus} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {Project} from "@/types/projects/projects";
import PageFormField from "../profiles/ProfileFormField";
import {projectFormFields} from "@/data/forms/projects/projectFormFields";
import ProjectFormField from "./ProjectFormField";
import ProjectImageSlider from "./ProjectImageSlider";

const options = [
  {
    label: "Follow",
  },
  {
    label: "Join",
  },
];

const ProjectClient = ({
  project,
  skills,
}: {
  project: Project;
  skills: {name: string; image_url: string}[];
}) => {
  return (
    <>
      {/* Background Image */}
      <div
        className="bg-gray-200 dark:bg-gray-900 rounded-[6px] rounded-t-none w-full"
        style={{
          width: "100%",
          height: "clamp(130px, 20vw, 156px)",
        }}></div>

      <div className="@container flex flex-col gap-3 max-[950px]:gap-6 p-6 pt-0">
        <div className="flex flex-col gap-6">
          <div className="relative flex justify-between gap-28 max-[1130px]:gap-16">
            <ProjectButtons
              className="@max-[620px]:hidden top-0 right-0 absolute pt-[15px]"
              userSessionId="placeholder-user-id"
              profileId="placeholder-profile-id"
              isFollowing={false}
              isFollowingBack={false}
              username="placeholder-username"
              isFavorite={false}
            />
            <div className="flex max-[1130px]:flex-col gap-3 min-[1130px]:pt-[15px]">
              {/* Project Image/Avatar */}
              <div className="h-[60px] w-[60px] border-1 border-border rounded-[8px] shrink-0 flex items-center justify-center">
                <Image
                  width={40}
                  height={40}
                  className="h-[40px] w-[40px] object-cover"
                  src="/test.svg"
                  alt="Project"
                />
              </div>

              <div className="flex flex-col gap-3 ">
                {/* Project name and info */}
                <div className="flex flex-col gap-[6px]">
                  <div className="flex items-center gap-2">
                    <MainGradient as="h1" className="font-semibold text-[26px] leading-[26px]">
                      Glow
                    </MainGradient>
                    <Image
                      src="/svg/verified.svg"
                      alt="Verified"
                      width={18}
                      height={18}
                      className="w-4.5 h-auto shrink-0"
                      style={{width: "auto", height: "auto"}}
                    />
                  </div>
                  <p className="text-secondary text-sm">
                    Revolutionizing cancer diagnosis with AI-powered precision
                  </p>
                </div>
                {/* social links */}
                {/* <ProfileSocialLinks
                  user={{
                    social_links_1_platform: "github.com/",
                    social_links_1: "example",
                    social_links_2_platform: "linkedin.com/",
                    social_links_2: "in/example",
                    social_links_3_platform: "x.com/",
                    social_links_3: "example",
                  }}
                /> */}
              </div>
            </div>
            <div className="flex flex-col items-end gap-[30px] max-[1130px]:gap-[45px]">
              <ProjectNumbers
                className="max-[950px]:hidden pt-[75px] pr-[47px]"
                followers={1245}
                members={4}
                posts={89}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ProjectButtons
              className="@min-[620px]:hidden w-full"
              userSessionId="placeholder-user-id"
              profileId="placeholder-profile-id"
              isFollowing={false}
              isFollowingBack={false}
              username="placeholder-username"
              isFavorite={false}
            />
            <ProjectNumbers
              className="min-[950px]:hidden justify-between"
              followers={1245}
              members={4}
              posts={89}
            />
          </div>
        </div>
        {/* Main content section */}
        <div>
          <div className="flex flex-col gap-8 max-[990px]:gap-10">
            <ProjectImageSlider demo={project.demo} />
            <p className="text-muted-foreground text-sm">{project.description}</p>
            {projectFormFields.map((formField) => (
              <div key={formField.fieldTitle}>
                <ProjectFormField formField={formField} project={project} skills={skills} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const ProjectButtons = ({
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
  const [selectedIndex, setSelectedIndex] = useState("0");

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
            <Messages2
              size="18"
              color="currentColor"
              strokeWidth={2}
              className="max-[450px]:hidden stroke-2"
            />
            Message
          </Button>
        </AuthGate>
        <AuthGate userSessionId={userSessionId}>
          <div className="divide-primary-foreground/30 inline-flex divide-x rounded-md shadow-xs rtl:space-x-reverse">
            {options[Number(selectedIndex)].label === "Follow" ? (
              <FollowUserButton
                followingId={profileId || ""}
                isFollowing={isFollowing}
                isFollowingBack={isFollowingBack}
                userSessionId={userSessionId}
                username={username}
                buttonClassName="@max-[620px]:w-full  rounded-r-none"
              />
            ) : (
              <Button
                className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10 "
                variant="default">
                <Plus size={16} />
                Join
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10 "
                  size="icon"
                  variant="default"
                  aria-label="Options">
                  <ChevronDownIcon size={16} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="max-w-64 md:max-w-xs"
                side="bottom"
                sideOffset={4}
                align="end">
                <DropdownMenuRadioGroup value={selectedIndex} onValueChange={setSelectedIndex}>
                  {options.map((option, index) => (
                    <DropdownMenuRadioItem
                      key={option.label}
                      value={String(index)}
                      className="items-start [&>span]:pt-1.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{option.label}</span>
                        {/* <span className="text-muted-foreground text-xs">{option.description}</span> */}
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </AuthGate>
      </div>
    </div>
  );
};

const ProjectNumbers = ({
  className,
  followers,
  members,
  posts,
}: {
  className?: string;
  followers: number;
  members: number;
  posts: number;
}) => {
  return (
    <div className={cn("flex items-center gap-12", className)}>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">Followers</span>
        <MainGradient as="h3" className="font-semibold text-[26px] text-secondary leading-[34px]">
          {formatNumber(followers)}
        </MainGradient>
      </div>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">Members</span>
        <MainGradient as="h3" className="font-semibold text-[26px] text-secondary leading-[34px]">
          {formatNumber(members)}
        </MainGradient>
      </div>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">Posts</span>
        <MainGradient as="h3" className="font-semibold text-[26px] text-secondary leading-[34px]">
          {formatNumber(posts)}
        </MainGradient>
      </div>
    </div>
  );
};

export default ProjectClient;
