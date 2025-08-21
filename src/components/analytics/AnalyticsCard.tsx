import React from "react";
import AnalyticsBadge from "./AnalyticsBadge";
import {cn} from "@/lib/utils";
import {formatNumber} from "@/functions/formatNumber";
import {motion} from "framer-motion";

interface AnalyticsCardProps {
  title: string;
  number: number;
  type?: "positive" | "negative" | "neutral";
  analyticsNumber?: number;
  tooltipData?: {
    metricName: string;
    currentValue: number;
    previousValue: number;
  };
  shouldShowBadge?: boolean;
  badgeDisplayment?: "top" | "bottom";
  cardClassName?: string;
  displayInGraph?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const AnalyticsCard = ({
  title,
  number,
  type,
  analyticsNumber,
  tooltipData,
  shouldShowBadge = true,
  badgeDisplayment = "bottom",
  cardClassName,
  displayInGraph = false,
  isSelected = false,
  onClick,
}: AnalyticsCardProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-1.5 p-4 pl-4.5  w-full whitespace-nowrap min-w-[220px]",
        displayInGraph
          ? "first:rounded-tl-[12px] last:rounded-tr-[12px] bg-black/3 border-b border-border border-r "
          : "min-[1174px]:rounded-[12px] max-[1174px]:border-r-0 max-[1174px]:first:rounded-l-[12px] max-[1174px]:last:rounded-r-[12px] max-[1174px]:last:border-r max-[1174px]:bg-black/3 border border-border",
        onClick && "cursor-pointer",
        cardClassName,
      )}
      onClick={onClick}>
      <div className="flex justify-between items-center gap-1.5 h-[20px]">
        <h5 className="font-medium text-foreground/70 text-sm line-clamp-1 leading-4.5">{title}</h5>
        {shouldShowBadge && analyticsNumber && type && (
          <div className={cn("flex-shrink-0", badgeDisplayment === "bottom" && "hidden")}>
            <AnalyticsBadge number={analyticsNumber} type={type} tooltipData={tooltipData} />
          </div>
        )}
      </div>
      <h4 className="font-medium text-[28px] text-foreground leading-9">{formatNumber(number)}</h4>
      {shouldShowBadge && analyticsNumber && type && (
        <div className={cn("flex items-center gap-[3px]", badgeDisplayment === "top" && "hidden")}>
          <AnalyticsBadge number={analyticsNumber} type={type} tooltipData={tooltipData} />
          <p className="text-secondary text-xs">vs last month</p>
        </div>
      )}

      {isSelected && (
        <motion.div
          layoutId="analytics-card-underline"
          className="bottom-0 left-0 absolute bg-primary w-full h-[2px]"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
    </div>
  );
};

export default AnalyticsCard;
