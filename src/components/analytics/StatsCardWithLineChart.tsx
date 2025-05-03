import AnalyticsBadge from "@/components/analytics/AnalyticsBadge";
import React, {useEffect, useState} from "react";
import {TrendingUp} from "lucide-react";
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/shadcn/chart";
const chartData = [
  {month: "January", desktop: 186, mobile: 80},
  {month: "February", desktop: 305, mobile: 200},
  {month: "March", desktop: 237, mobile: 120},
  {month: "April", desktop: 73, mobile: 190},
  {month: "May", desktop: 209, mobile: 130},
  {month: "June", desktop: 214, mobile: 140},
];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const StatsCardWithLineChart = () => {
  return (
    <div className="flex gap-8 px-6 py-4 border border-border rounded-[12px]">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col gap-2">
          <h5 className="font-medium text-foreground/70 text-sm line-clamp-1 leading-4.5">
            Total Views
          </h5>
          <div className="flex items-start gap-1.5">
            <h4 className="font-medium text-[32px] text-foreground leading-[28px]">17,461</h4>
            <AnalyticsBadge number={12} type={"positive"} />
          </div>
        </div>
        <ChartContainer config={chartConfig} className="w-full h-[210px] aspect-auto">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="mobile"
              type="natural"
              fill="transparent"
              fillOpacity={0.4}
              stroke="#C0C0C0"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="transparent"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </div>
      {/* Right Column Cards */}
      <div className="flex flex-col justify-between gap-4 py-1.5 shrink-0">
        {/* Card 1 */}
        <div className="group flex flex-col gap-2 p-1 cursor-pointer">
          <h5 className="font-medium text-foreground/70 group-hover:text-foreground/60 text-sm line-clamp-1 leading-4.5">
            Followers Gained
          </h5>
          <div className="flex items-start gap-1.5">
            <h4 className="font-medium text-[28px] text-foreground group-hover:text-foreground/80 leading-[28px]">
              53
            </h4>
            <AnalyticsBadge number={6} type={"positive"} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="group flex flex-col gap-2 p-1 cursor-pointer">
          <h5 className="font-medium text-foreground/70 group-hover:text-foreground/60 text-sm line-clamp-1 leading-4.5">
            Posts Created
          </h5>
          <div className="flex items-start gap-1.5">
            <h4 className="font-medium text-[28px] text-foreground group-hover:text-foreground/80 leading-[28px]">
              163
            </h4>
            <AnalyticsBadge number={12} type={"positive"} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="group flex flex-col gap-2 p-1 cursor-pointer">
          <h5 className="font-medium text-foreground/70 group-hover:text-foreground/60 text-sm line-clamp-1 leading-4.5">
            Posts Likes
          </h5>
          <div className="flex items-start gap-1.5">
            <h4 className="font-medium text-[28px] text-foreground group-hover:text-foreground/80 leading-[28px]">
              6
            </h4>
            <AnalyticsBadge number={7} type={"negative"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCardWithLineChart;
