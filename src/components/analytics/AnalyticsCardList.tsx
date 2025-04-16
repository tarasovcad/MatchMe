import React from "react";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";

export interface AnalyticsCardListProps {
  data: {
    title: string;
    number: number;
    type: "positive" | "negative";
    analyticsNumber: number;
  }[];
}

const AnalyticsCardList = ({data}: AnalyticsCardListProps) => {
  return (
    <div className="flex items-center min-[1174px]:gap-3 max-[1174px]:overflow-x-auto">
      {data.map((item, index) => (
        <AnalyticsCard
          key={index}
          title={item.title}
          number={item.number}
          type={item.type}
          analyticsNumber={item.analyticsNumber}
        />
      ))}
    </div>
  );
};

export default AnalyticsCardList;
