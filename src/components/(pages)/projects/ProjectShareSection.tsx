import {Link, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6} from "lucide-react";
import React, {useState, useEffect} from "react";
import {FiFacebook, FiLinkedin} from "react-icons/fi";
import {FaWhatsapp} from "react-icons/fa";
import {TbBrandReddit} from "react-icons/tb";
import {FaDev} from "react-icons/fa";
import {DiHackernews} from "react-icons/di";
import {FaXTwitter} from "react-icons/fa6";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";

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

const RandomDiceButton = ({tooltipText}: {tooltipText: string}) => {
  const [isRolling, setIsRolling] = useState(false);

  const handleClick = () => {
    setIsRolling(true);
    setTimeout(() => setIsRolling(false), 500);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="cursor-pointer hover:-translate-y-1 transition-transform duration-200 text-foregroud/60 hover:text-foreground/90"
          onClick={handleClick}>
          <AnimatedDice size={16} isRolling={isRolling} />
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

const ProjectShareSection = () => {
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
                  <div className="cursor-pointer hover:-translate-y-1 transition-transform duration-200 ">
                    <Link
                      size={16}
                      className="text-foregroud/60 hover:text-foreground/90 transition-colors duration-200"
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
              <RandomDiceButton tooltipText="Random Project" />
              <div className="w-[1px] h-[16px] bg-border"></div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-secondary pr-[12px]">Share:</span>
              <div className="flex shrink-0 items-center gap-3 ">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                      <FaXTwitter className="text-foregroud/60 hover:text-foreground/70 transition-colors duration-200 shrink-0 size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1">
                    <span>Share on X (Twitter)</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                      <FiFacebook className="text-foregroud/60 hover:text-foreground/90 transition-colors duration-200 shrink-0 size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1">
                    <span>Share on Facebook</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                      <FaWhatsapp className="text-foregroud/60 hover:text-foreground/90 transition-colors duration-200 shrink-0 size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1">
                    <span>Share on WhatsApp</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                      <FiLinkedin className="text-foregroud/60 hover:text-foreground/90 transition-colors duration-200 shrink-0 size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1">
                    <span>Share on LinkedIn</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                      <TbBrandReddit className="text-foregroud/60 hover:text-foreground/90 transition-colors duration-200 shrink-0 size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1">
                    <span>Share on Reddit</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                      <DiHackernews className="text-foregroud/60 hover:text-foreground/90 transition-colors duration-200 shrink-0 size-4.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1">
                    <span>Share on Hacker News</span>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer hover:-translate-y-1 transition-transform duration-200">
                      <FaDev className="text-foregroud/60 hover:text-foreground/90 transition-colors duration-200 shrink-0 size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1">
                    <span>Share on Dev.to</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ProjectShareSection;
