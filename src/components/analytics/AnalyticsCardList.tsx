import React from "react";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import {cn} from "@/lib/utils";

export interface AnalyticsCardListProps {
  data: {
    title: string;
    number: number;
    type: "positive" | "negative";
    analyticsNumber: number;
    chartData?: [];
  }[];
  badgeDisplayment?: "top" | "bottom";
  className?: string;
  cardClassName?: string;
  displayInGraph?: boolean;
  selectedMetric?: string;
  setSelectedMetric?: (metric: string) => void;
}

const AnalyticsCardList = ({
  data,
  badgeDisplayment,
  className,
  cardClassName,
  displayInGraph,
  selectedMetric,
  setSelectedMetric,
}: AnalyticsCardListProps) => {
  return (
    <div
      className={cn(
        "flex items-center min-[1174px]:gap-3 max-[1174px]:overflow-x-auto scrollbar-hide ",
        displayInGraph && "min-[1174px]:gap-0",

        className,
      )}>
      {data.map((item, index) => (
        <AnalyticsCard
          key={index}
          title={item.title}
          number={item.number}
          type={item.type}
          analyticsNumber={item.analyticsNumber}
          badgeDisplayment={badgeDisplayment}
          cardClassName={cardClassName}
          displayInGraph={displayInGraph}
          isSelected={selectedMetric === item.title}
          onClick={() => setSelectedMetric && setSelectedMetric(item.title)}
        />
      ))}
    </div>
  );
};

export default AnalyticsCardList;
