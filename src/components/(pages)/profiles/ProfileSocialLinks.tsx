import {Button} from "@/components/shadcn/button";
import React from "react";
import Image from "next/image";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {socialLinks} from "@/data/forms/(settings)/socialLinks";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";

const ProfileSocialLinks = ({user}: {user: MatchMeUser}) => {
  const socialData = [
    {platform: user.social_links_1_platform, link: user.social_links_1},
    {platform: user.social_links_2_platform, link: user.social_links_2},
    {platform: user.social_links_3_platform, link: user.social_links_3},
  ];
  const userSocialLinks = socialData
    .map(({platform, link}) => {
      const socialEntry = socialLinks.find(({title}) => title === platform) ?? {
        title: "Unknown",
        image: null,
        name: "Unknown",
      };

      return {
        link,
        title: socialEntry.title,
        image: socialEntry.image,
        name: socialEntry.name,
      };
    })
    .filter(({link}) => link);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center gap-1">
        {userSocialLinks.map(({link, image, title, name}) => {
          const socialLink = `https://${title}${link}`;
          return (
            <Tooltip key={title}>
              <TooltipTrigger>
                <Link
                  href={socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-500">
                  <Button size={"icon"} className="p-[5.5px] w-9 h-9" asChild>
                    <Image
                      src={image ?? ""}
                      alt={title}
                      width={16}
                      height={16}
                      quality={100}
                      unoptimized={true}
                      className="shrink-0 "
                    />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="px-2 py-1 text-sm" sideOffset={5}>
                {name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default ProfileSocialLinks;
