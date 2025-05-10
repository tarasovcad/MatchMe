import {TrendingDown, TrendingUp, Minus} from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import {getAnalyticsTooltipMessage} from "@/functions/analytics/getAnalyticsTooltipMessage";

interface AnalyticsBadgeProps {
  number: number;
  type: "positive" | "negative" | "neutral";
  tooltipData?: {
    metricName: string;
    currentValue: number;
    previousValue: number;
  };
}

const AnalyticsBadge = ({number, type, tooltipData}: AnalyticsBadgeProps) => {
  console.log("AnalyticsBadge props:", {number, type, tooltipData});

  const badge = (
    <div
      className="flex items-center gap-[3px] px-1 py-0.5 ring-border rounded-[5px] ring font-medium text-xs"
      style={{
        color: type === "positive" ? "#009E61" : type === "negative" ? "#FF3C4E" : "#6B7280",
      }}>
      {type === "positive" ? (
        <TrendingUp size={12} />
      ) : type === "negative" ? (
        <TrendingDown size={12} />
      ) : (
        <Minus size={12} />
      )}
      {number}%
    </div>
  );

  if (!tooltipData) {
    return badge;
  }

  const tooltipMessage = getAnalyticsTooltipMessage({
    ...tooltipData,
    percentageChange: number,
    changeType: type,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" align="center" className="px-2 py-1 max-w-[400px] text-xs">
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AnalyticsBadge;
