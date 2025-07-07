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

interface ShareIconsProps {
  size?: number;
  projectUrl: string;
  projectName: string;
  projectTagline: string;
  className?: string;
}

const ShareIcons = ({
  size = 16,
  projectUrl,
  projectName,
  projectTagline,
  className = "",
}: ShareIconsProps) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const getTwitterUrl = () => {
    const text = `Just launched my project "${projectName}" - ${projectTagline}! Check it out:`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(projectUrl)}`;
  };

  const getLinkedInUrl = () => {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`;
  };

  const getFacebookUrl = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`;
  };

  const getWhatsAppUrl = () => {
    const text = `Check out this project: ${projectName} - ${projectTagline}`;
    return `https://wa.me/?text=${encodeURIComponent(text + " " + projectUrl)}`;
  };

  const getRedditUrl = () => {
    const title = `${projectName} - ${projectTagline}`;
    return `https://reddit.com/submit?url=${encodeURIComponent(projectUrl)}&title=${encodeURIComponent(title)}`;
  };

  const getHackerNewsUrl = () => {
    const title = `${projectName} - ${projectTagline}`;
    return `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(projectUrl)}&t=${encodeURIComponent(title)}`;
  };

  const shareToDevTo = () => {
    // Dev.to doesn't have a direct share URL, so we'll copy the link with a message
    const text = `Check out this project: ${projectName} - ${projectTagline}\n${projectUrl}`;
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
