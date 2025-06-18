"use client";

import {User} from "@supabase/supabase-js";
import React from "react";
import AnalyticsSectionHeader from "./AnalyticsSectionHeader";
import {Activity} from "lucide-react";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/shadcn/chart";
import {useProfileEventsBar} from "@/hooks/query/dashboard/analytics-visits";
import {useDashboardStore} from "@/store/useDashboardStore";
import {useMemo} from "react";
import {toast} from "sonner";
import {formatChartDate} from "@/functions/formatChartDate";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import AnalyticsBadge from "./AnalyticsBadge";

// Data structure for chart
type ChartDataPoint = {
  date: string;
  message: number;
  follow: number;
  unfollow: number;
  save_to_favourites: number;
  report: number;
  share: number;
  block: number;
  // Previous period data
  prev_message: number;
  prev_follow: number;
  prev_unfollow: number;
  prev_save_to_favourites: number;
  prev_report: number;
  prev_share: number;
  prev_block: number;
};

// Fallback data when no real data is available
const fallbackData = [
  {
    date: "No Data",
    message: 0,
    follow: 0,
    unfollow: 0,
    save_to_favourites: 0,
    report: 0,
    share: 0,
    block: 0,
    prev_message: 0,
    prev_follow: 0,
    prev_unfollow: 0,
    prev_save_to_favourites: 0,
    prev_report: 0,
    prev_share: 0,
    prev_block: 0,
  },
];

const chartConfig: ChartConfig = {
  message: {
    label: "Messages",
  },
  follow: {
    label: "Follows",
  },
  unfollow: {
    label: "Unfollows",
  },
  save_to_favourites: {
    label: "Saved",
  },
  report: {
    label: "Reports",
  },
  share: {
    label: "Shares",
  },
  block: {
    label: "Blocks",
  },
};

const colors = {
  message: "#A072EE",
  follow: "#B0A8F0",
  unfollow: "#5F55C5",
  save_to_favourites: "#8899FF",
  report: "#C2BFFF",
  share: "#7E88B3",
  block: "#4A42A3",
};

const ProfileEventsBar = ({user}: {user: User}) => {
  const userUsername = user.user_metadata.username;
  const {dateRange, compareDateRange} = useDashboardStore();

  const statsParams = useMemo(
    () => ({
      username: userUsername,
      dateRange,
      compareDateRange,
    }),
    [userUsername, dateRange, compareDateRange],
  );

  const {
    data: profileEventsBarData,
    isLoading,
    error: profileEventsBarError,
  } = useProfileEventsBar(statsParams);

  if (profileEventsBarError) {
    toast.error(profileEventsBarError.message, {
      description: "Please try again later",
    });
  }

  const chartData = profileEventsBarData?.chartData || fallbackData;

  const legendData = Object.keys(chartConfig).map((key) => {
    const total = chartData.reduce(
      (sum: number, day: ChartDataPoint) => sum + (day[key as keyof ChartDataPoint] as number),
      0,
    );
    return {
      key,
      label: chartConfig[key as keyof typeof chartConfig].label,
      total,
      color: colors[key as keyof typeof colors],
    };
  });

  return (
    <div className="w-full border border-border rounded-[12px] p-[18px] @container relative">
      <AnalyticsSectionHeader
        title="Profile Events"
        description="See the events that have happened on your profile"
        icon={<Activity size={15} className="text-foreground" />}
      />

      <div className="w-full mt-[18px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px] text-foreground/50">
            <LoadingButtonCircle size={22} />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 10,
                left: -20,
              }}
              barCategoryGap="10%"
              maxBarSize={40}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={"preserveStartEnd"}
                tickFormatter={(date) => {
                  return formatChartDate(date, dateRange);
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                content={({active, payload, label}) => {
                  if (!active || !payload?.length) return null;

                  // Get all current period items (non-prev_ keys)
                  const allCurrentItems = payload.filter(
                    (item) => !item.dataKey?.toString().startsWith("prev_"),
                  );

                  // Check if any item has a value > 0
                  const hasNonZeroValues = allCurrentItems.some(
                    (item) => item.value && Number(item.value) > 0,
                  );

                  // If there are non-zero values, show only those with values > 0
                  // If all values are 0, show all items with their 0 values
                  const itemsToShow = hasNonZeroValues
                    ? allCurrentItems.filter((item) => item.value && Number(item.value) > 0)
                    : allCurrentItems;

                  return (
                    <div className="border-border/50 bg-background grid min-w-[12rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                      <div className="font-medium text-foreground">
                        {formatChartDate(label, dateRange)}
                      </div>

                      <div className="gap-1.5 grid">
                        {itemsToShow.map((item, index) => (
                          <div key={index} className="flex w-full flex-wrap items-center gap-2">
                            <div className="flex flex-1 justify-between items-center gap-2 leading-none">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="rounded-full w-2 h-2 shrink-0"
                                  style={{
                                    backgroundColor: item.color,
                                  }}
                                />
                                <span className="text-muted-foreground">
                                  {chartConfig[item.dataKey as keyof typeof chartConfig]?.label ||
                                    item.dataKey}
                                </span>
                              </div>
                              <span className="font-mono font-medium tabular-nums text-foreground">
                                {item.value || 0}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              {/* Previous period bars (outlined) */}
              <Bar
                dataKey="prev_message"
                stackId="b"
                fill="transparent"
                stroke={colors.message}
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <Bar
                dataKey="prev_follow"
                stackId="b"
                fill="transparent"
                stroke={colors.follow}
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <Bar
                dataKey="prev_unfollow"
                stackId="b"
                fill="transparent"
                stroke={colors.unfollow}
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <Bar
                dataKey="prev_save_to_favourites"
                stackId="b"
                fill="transparent"
                stroke={colors.save_to_favourites}
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <Bar
                dataKey="prev_report"
                stackId="b"
                fill="transparent"
                stroke={colors.report}
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <Bar
                dataKey="prev_share"
                stackId="b"
                fill="transparent"
                stroke={colors.share}
                strokeWidth={2}
                strokeDasharray="3 3"
              />
              <Bar
                dataKey="prev_block"
                stackId="b"
                fill="transparent"
                stroke={colors.block}
                strokeWidth={2}
                strokeDasharray="3 3"
              />

              {/* Current period bars (filled) */}
              <Bar dataKey="message" stackId="a" fill={colors.message} />
              <Bar dataKey="follow" stackId="a" fill={colors.follow} />
              <Bar dataKey="unfollow" stackId="a" fill={colors.unfollow} />
              <Bar dataKey="save_to_favourites" stackId="a" fill={colors.save_to_favourites} />
              <Bar dataKey="report" stackId="a" fill={colors.report} />
              <Bar dataKey="share" stackId="a" fill={colors.share} />
              <Bar dataKey="block" stackId="a" fill={colors.block} />
            </BarChart>
          </ChartContainer>
        )}

        {/* Legend */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Event Types</span>
            <span>Current / Previous / Percentage</span>
          </div>
          <ul className="divide-y divide-border text-[14px] font-medium">
            {legendData.map((item) => {
              const prevTotal = chartData.reduce(
                (sum: number, day: ChartDataPoint) =>
                  sum + (day[`prev_${item.key}` as keyof ChartDataPoint] as number),
                0,
              );

              const calculatePercentageChange = (current: number, previous: number) => {
                if (previous === 0) {
                  return current > 0 ? 100 : 0;
                }
                return Math.round(((current - previous) / previous) * 100);
              };

              const percentageChange = calculatePercentageChange(item.total, prevTotal);
              const getChangeType = (change: number): "positive" | "negative" | "neutral" => {
                if (change > 0) return "positive";
                if (change < 0) return "negative";
                return "neutral";
              };

              return (
                <li key={item.key} className="relative flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="flex items-center space-x-1">
                      <span
                        className="size-2.5 shrink-0 rounded-sm"
                        style={{backgroundColor: item.color}}
                        aria-hidden={true}
                      />
                      <span
                        className="size-2.5 shrink-0 rounded-sm border-2 border-dashed"
                        style={{borderColor: item.color}}
                        aria-hidden={true}
                      />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium tabular-nums text-foreground">
                      {item.total.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium tabular-nums text-muted-foreground">
                      {prevTotal.toLocaleString()}
                    </span>
                    <AnalyticsBadge
                      number={Math.abs(percentageChange)}
                      type={getChangeType(percentageChange)}
                      tooltipData={{
                        metricName: String(item.label),
                        currentValue: item.total,
                        previousValue: prevTotal,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-sm bg-foreground" />
              <span>Current Period</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-sm border border-dashed border-foreground" />
              <span>Previous Period</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEventsBar;
