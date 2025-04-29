import React from "react";
import AnalyticsBadge from "./AnalyticsBadge";

const AnalyticsCard = ({
  title,
  number,
  type,
  analyticsNumber,
}: {
  title: string;
  number: number;
  type: "positive" | "negative";
  analyticsNumber: number;
}) => {
  return (
    <div
      className={`
        flex flex-col gap-1.5 p-4 pl-4.5 border border-border w-full whitespace-nowrap
        min-w-[205px]
        min-[1174px]:rounded-[12px]
        max-[1174px]:border-r-0 max-[1174px]:first:rounded-l-[12px] max-[1174px]:last:rounded-r-[12px] max-[1174px]:last:border-r
        max-[1174px]:bg-black/3
      `}>
      <h5 className="font-medium text-foreground/70 text-sm line-clamp-1 leading-4.5">{title}</h5>
      <h4 className="font-medium text-[28px] text-foreground leading-9">{number}</h4>
      <div className="flex items-center gap-[3px]">
        <AnalyticsBadge number={analyticsNumber} type={type} />
        <p className="text-secondary text-xs">vs last month</p>
      </div>
    </div>
  );
};

export default AnalyticsCard;
