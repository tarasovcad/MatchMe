import {Link, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6} from "lucide-react";
import React, {useState, useEffect} from "react";
import ShareIcons from "@/components/other/ShareIcons";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";

interface ProjectShareSectionProps {
  projectUrl: string;
  projectName: string;
  projectTagline: string;
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
          className="cursor-pointer hover:-translate-y-1 transition-transform duration-200 text-foreground/60 hover:text-foreground/90"
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

const ProjectShareSection = ({
  projectUrl,
  projectName,
  projectTagline,
}: ProjectShareSectionProps) => {
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
              <RandomDiceButton tooltipText="Random Project" />
              <div className="w-[1px] h-[16px] bg-border"></div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-secondary pr-[12px]">Share:</span>
              <ShareIcons
                size={16}
                projectUrl={projectUrl}
                projectName={projectName}
                projectTagline={projectTagline}
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ProjectShareSection;
