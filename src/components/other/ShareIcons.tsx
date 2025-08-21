import React from "react";
import Link from "next/link";
import {FaXTwitter, FaWhatsapp, FaDev} from "react-icons/fa6";
import {FiFacebook, FiLinkedin} from "react-icons/fi";
import {TbBrandReddit} from "react-icons/tb";
import {DiHackernews} from "react-icons/di";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import {toast} from "sonner";

interface ShareIconsProps {
  size?: number;
  contentUrl: string;
  contentName: string;
  contentTagline: string;
  contentType: "project" | "profile" | "post";
  className?: string;
}

const ShareIcons = ({
  size = 16,
  contentUrl,
  contentName,
  contentTagline,
  contentType,
  className = "",
}: ShareIconsProps) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const typeNoun =
    contentType === "project" ? "project" : contentType === "profile" ? "profile" : "post";

  const getTwitterUrl = () => {
    const leading =
      contentType === "project"
        ? `Just launched my ${typeNoun} "${contentName}" - ${contentTagline}!`
        : contentType === "profile"
          ? `Check out my ${typeNoun}: ${contentName} - ${contentTagline}`
          : `New ${typeNoun}: ${contentName} - ${contentTagline}`;
    const text = `${leading} Check it out:`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(contentUrl)}`;
  };

  const getLinkedInUrl = () => {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(contentUrl)}`;
  };

  const getFacebookUrl = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(contentUrl)}`;
  };

  const getWhatsAppUrl = () => {
    const text = `Check out this ${typeNoun}: ${contentName} - ${contentTagline}`;
    return `https://wa.me/?text=${encodeURIComponent(text + " " + contentUrl)}`;
  };

  const getRedditUrl = () => {
    const title = `${contentName} - ${contentTagline}`;
    return `https://reddit.com/submit?url=${encodeURIComponent(contentUrl)}&title=${encodeURIComponent(title)}`;
  };

  const getHackerNewsUrl = () => {
    const title = `${contentName} - ${contentTagline}`;
    return `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(contentUrl)}&t=${encodeURIComponent(title)}`;
  };

  const shareToDevTo = () => {
    const text = `Check out this ${typeNoun}: ${contentName} - ${contentTagline}\n${contentUrl}`;
    copyToClipboard(text);
  };

  const socialPlatforms = [
    {
      icon: FaXTwitter,
      href: getTwitterUrl(),
      tooltip: "Share on X (Twitter)",
      hoverColor: "hover:text-black",
    },
    {
      icon: FiFacebook,
      href: getFacebookUrl(),
      tooltip: "Share on Facebook",
      hoverColor: "hover:text-blue-700",
    },
    {
      icon: FaWhatsapp,
      href: getWhatsAppUrl(),
      tooltip: "Share on WhatsApp",
      hoverColor: "hover:text-green-500",
    },
    {
      icon: FiLinkedin,
      href: getLinkedInUrl(),
      tooltip: "Share on LinkedIn",
      hoverColor: "hover:text-blue-600",
    },
    {
      icon: TbBrandReddit,
      href: getRedditUrl(),
      tooltip: "Share on Reddit",
      hoverColor: "hover:text-orange-500",
    },
    {
      icon: DiHackernews,
      href: getHackerNewsUrl(),
      tooltip: "Share on Hacker News",
      hoverColor: "hover:text-orange-600",
    },
    {
      icon: FaDev,
      onClick: shareToDevTo,
      tooltip: "Share on Dev.to",
      hoverColor: "hover:text-purple-500",
    },
  ];

  return (
    <TooltipProvider>
      <div className={`flex shrink-0 items-center gap-3 ${className}`}>
        {socialPlatforms.map((platform, index) => {
          const IconComponent = platform.icon;

          // Special case for Dev.to which uses onClick instead of Link
          if (platform.onClick) {
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    onClick={platform.onClick}
                    className={`cursor-pointer hover:-translate-y-1 transition-all duration-200 text-foreground/60 ${platform.hoverColor}`}>
                    <IconComponent
                      size={size}
                      className="shrink-0 transition-colors duration-200"
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1">
                  <span>{platform.tooltip}</span>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Link
                  href={platform.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`cursor-pointer hover:-translate-y-1 transition-all duration-200 text-foreground/60 ${platform.hoverColor}`}>
                  <IconComponent size={size} className="shrink-0 transition-colors duration-200" />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="px-2 py-1">
                <span>{platform.tooltip}</span>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default ShareIcons;
