import {TrendingDown, TrendingUp} from "lucide-react";
import React from "react";

const AnalyticsBadge = ({number, type}: {number: number; type: "positive" | "negative"}) => {
  return (
    <div
      className="flex items-center gap-[3px] px-1 py-0.5 ring-border rounded-[5px] ring font-medium text-xs"
      style={{color: type === "positive" ? "#009E61" : "#FF3C4E"}}>
      {type === "positive" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {number}%
    </div>
  );
};

export default AnalyticsBadge;
