import {Button} from "@/components/shadcn/button";
import React from "react";
import Image from "next/image";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {socialLinks} from "@/data/forms/(settings)/socialLinks";
import Link from "next/link";

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
      };

      return {
        link,
        title: socialEntry.title,
        image: socialEntry.image,
      };
    })
    .filter(({link}) => link);

  return (
    <div className="flex items-center gap-1">
      {userSocialLinks.map(({link, image, title}) => {
        const socialLink = `https://${title}${link}`;
        return (
          <Link
            key={title}
            href={socialLink}
            target="_blank"
            rel="noopener noreferrer">
            <Button size={"icon"} className="p-[5px]" asChild>
              <Image
                src={image ?? ""}
                alt={title}
                width={24}
                height={24}
                className="shrink-0"
              />
            </Button>
          </Link>
        );
      })}
    </div>
  );
};

export default ProfileSocialLinks;
