"use client";
import {Link, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6} from "lucide-react";
import React, {useState, useEffect} from "react";
import ShareIcons from "@/components/other/ShareIcons";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {useRandomEntity, RandomWhereFilter} from "@/hooks/query/use-random-entity";

interface ProjectShareSectionProps {
  contentUrl: string;
  contentName: string;
  contentTagline: string;
  contentType: "project" | "profile" | "post";
  excludeProjectId?: string;
  excludeUsername?: string;
}

const AnimatedDice = ({size = 16, isRolling = false}: {size?: number; isRolling?: boolean}) => {
  const [currentDice, setCurrentDice] = useState(1);
  const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setCurrentDice(Math.floor(Math.random() * 6) + 1);
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setCurrentDice(Math.floor(Math.random() * 6) + 1);
      }, 500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isRolling]);

  const DiceIcon = diceIcons[currentDice - 1];

  return (
    <DiceIcon
      size={size}
      className={`transition-transform duration-100 ${isRolling ? "animate-spin" : ""}`}
    />
  );
};

const RandomDiceButton = ({
  tooltipText,
  onClick,
  isLoading,
}: {
  tooltipText: string;
  onClick: () => void;
  isLoading: boolean;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="cursor-pointer hover:-translate-y-1 transition-transform duration-200 text-foreground/60 hover:text-foreground/90"
          onClick={onClick}
          aria-label={tooltipText}
          role="button"
          tabIndex={0}>
          <AnimatedDice size={16} isRolling={isLoading} />
        </div>
      </TooltipTrigger>
      <TooltipContent className="px-2 py-1">
        <div className="flex items-center gap-1.5">
          <span>{tooltipText}</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

const ContentShareSection = ({
  contentUrl,
  contentName,
  contentTagline,
  contentType,
  excludeProjectId,
  excludeUsername,
}: ProjectShareSectionProps) => {
  const router = useRouter();

  const typeLabel =
    contentType === "project" ? "Project" : contentType === "profile" ? "Profile" : "Post";

  const projectWhere: RandomWhereFilter[] = [{column: "is_project_public", value: true}];
  if (excludeProjectId) projectWhere.push({column: "id", op: "neq", value: excludeProjectId});

  const profileWhere: RandomWhereFilter[] = [{column: "is_profile_public", value: true}];
  if (excludeUsername) profileWhere.push({column: "username", op: "neq", value: excludeUsername});

  const projectRandom = useRandomEntity({
    table: "projects",
    selectColumns: ["id", "slug"],
    where: projectWhere,
    buildHref: (row) => `/projects/${row.slug}`,
  });

  const profileRandom = useRandomEntity({
    table: "profiles",
    selectColumns: ["username"],
    where: profileWhere,
    buildHref: (row) => `/profiles/${row.username}`,
  });

  const isPending = projectRandom.isPending || profileRandom.isPending;

  const goRandom = async () => {
    if (contentType === "project") {
      const {href} = await projectRandom.mutateAsync();
      router.push(href);
    } else if (contentType === "profile") {
      const {href} = await profileRandom.mutateAsync();
      router.push(href);
    } else {
      // Extend here for other content types (e.g., posts, docs)
      throw new Error("Unsupported content type");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className={`flex flex-col justify-between items-start gap-3`}>
      <div className={`flex flex-col gap-[1px] w-full`}>
        <p className="font-medium text-foreground text-base">Share:</p>
      </div>
      <TooltipProvider>
        <div className="w-full flex flex-wrap gap-2 ">
          <div className="border border-border rounded-[8px] px-[13px] py-[9px] text-foreground/80 flex items-center gap-2 max-h-[36px]">
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="cursor-pointer hover:-translate-y-1 transition-transform duration-200 "
                    onClick={() => copyToClipboard(contentUrl)}>
                    <Link
                      size={16}
                      className="text-foreground/60 hover:text-foreground/90 transition-colors duration-200"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1">
                  <div className="flex items-center gap-1">
                    <span>Copy Link</span>
                    <kbd className="text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      C
                    </kbd>
                  </div>
                </TooltipContent>
              </Tooltip>
              <RandomDiceButton
                tooltipText={`Random ${typeLabel}`}
                onClick={() => {
                  void goRandom();
                }}
                isLoading={isPending}
              />
              <div className="w-[1px] h-[16px] bg-border"></div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-secondary pr-[12px]">Share:</span>
              <ShareIcons
                size={16}
                contentUrl={contentUrl}
                contentName={contentName}
                contentTagline={contentTagline}
                contentType={contentType}
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ContentShareSection;
