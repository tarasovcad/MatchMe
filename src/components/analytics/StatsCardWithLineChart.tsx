import AnalyticsBadge from "@/components/analytics/AnalyticsBadge";
import React, {useEffect, useState} from "react";
import {TrendingUp} from "lucide-react";
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/shadcn/chart";

import {formatNumber} from "@/functions/formatNumber";
import {AnalyticsCardItem} from "@/types/analytics";
import AnalyticsCardList from "./AnalyticsCardList";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";

const Chart = ({
  data,
  label,
  firstKey,
  secondKey,
}: {
  data: AnalyticsCardItem;
  label: string;
  firstKey: string;
  secondKey?: string;
}) => {
  if (!data.chartData || data.chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-[210px] text-foreground/50">
        No chart data available
      </div>
    );
  }

  return (
    <ChartContainer config={data.chartConfig || {}} className="w-full h-[210px] aspect-auto">
      <AreaChart accessibilityLayer data={data.chartData || []}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={"preserveStartEnd"}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" labelKey={label} />}
        />
        {secondKey && (
          <Area
            dataKey={secondKey}
            type="natural"
            fill="transparent"
            fillOpacity={0.4}
            stroke="#C0C0C0"
            stackId="a"
          />
        )}
        <Area
          dataKey={firstKey}
          type="natural"
          // fill="transparent"
          fill="hsl(var(--chart-1))"
          fillOpacity={0.4}
          stroke="hsl(var(--chart-1))"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
};

const StatsCardWithLineChart = ({
  data,
  label,
  firstKey,
  secondKey,
  isLoading,
}: {
  data: AnalyticsCardItem[];
  label: string;
  firstKey: string;
  secondKey?: string;
  isLoading: boolean;
}) => {
  const [selectedMetric, setSelectedMetric] = useState(data[0].title);

  const selectedData = data.find((item) => item.title === selectedMetric) || data[0];
  return (
    <>
      <div className="@max-[800px]:hidden flex gap-8 px-6 py-4 border border-border rounded-[12px]">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-2">
            <h5 className="font-medium text-foreground/70 text-sm line-clamp-1 leading-4.5">
              {selectedData.title}
            </h5>
            <div className="flex items-start gap-1.5">
              <h4 className="font-medium text-[32px] text-foreground leading-[28px]">
                {formatNumber(selectedData.number)}
              </h4>
              <AnalyticsBadge number={selectedData.analyticsNumber} type={selectedData.type} />
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-[210px] text-foreground/50">
              <LoadingButtonCircle size={22} />
            </div>
          ) : (
            <Chart
              data={selectedData || []}
              label={label}
              firstKey={firstKey}
              secondKey={secondKey}
            />
          )}
        </div>

        {/* Right Column Cards */}
        <div className="flex flex-col justify-between gap-4 py-1.5 shrink-0">
          {data
            .filter((item) => item.title !== selectedMetric)
            .map((item) => (
              <div
                key={item.title}
                className="group flex flex-col gap-2 p-1 cursor-pointer"
                onClick={() => setSelectedMetric(item.title)}>
                <h5 className="font-medium text-foreground/70 group-hover:text-foreground/60 text-sm line-clamp-1 leading-4.5">
                  {item.title}
                </h5>
                <div className="flex items-start gap-1.5">
                  <h4 className="font-medium text-[28px] text-foreground group-hover:text-foreground/80 leading-[28px]">
                    {formatNumber(item.number)}
                  </h4>
                  <AnalyticsBadge number={item.analyticsNumber} type={item.type} />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="@min-[800px]:hidden border border-border rounded-[12px]">
        <AnalyticsCardList
          data={data}
          badgeDisplayment="top"
          displayInGraph
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
        />
        <div className="px-2.5 pt-2 border border-t-0 border-border rounded-[12px] rounded-t-none">
          {isLoading ? (
            <div className="flex justify-center items-center h-[210px] text-foreground/50">
              <LoadingButtonCircle size={22} />
            </div>
          ) : (
            <Chart
              data={selectedData || []}
              label={label}
              firstKey={firstKey}
              secondKey={secondKey}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default StatsCardWithLineChart;
