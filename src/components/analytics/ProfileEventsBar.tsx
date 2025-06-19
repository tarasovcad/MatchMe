"use client";

import {User} from "@supabase/supabase-js";
import React from "react";
import AnalyticsSectionHeader from "./AnalyticsSectionHeader";
import {Activity} from "lucide-react";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {ChartContainer, ChartTooltip, ChartConfig} from "@/components/shadcn/chart";
import {useProfileEventsBar} from "@/hooks/query/dashboard/analytics-visits";
import {useDashboardStore} from "@/store/useDashboardStore";
import {useMemo} from "react";
import {toast} from "sonner";
import {formatChartDate} from "@/functions/formatChartDate";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import AnalyticsBadge from "./AnalyticsBadge";
import {motion} from "motion/react";
import EmptyState from "./EmptyState";

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

const eventKeys = Object.keys(chartConfig) as Array<keyof typeof chartConfig>;

// Shared utilities
const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
};

const getChangeType = (change: number): "positive" | "negative" | "neutral" => {
  if (change > 0) return "positive";
  if (change < 0) return "negative";
  return "neutral";
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

  const chartData = profileEventsBarData?.chartData || [];

  const hasData =
    chartData.length > 0 &&
    chartData.some(
      (dataPoint: ChartDataPoint) =>
        dataPoint.date !== "No Data" &&
        eventKeys.some((key) => (dataPoint[key as keyof ChartDataPoint] as number) > 0),
    );

  const legendData = eventKeys.map((key) => {
    const total = chartData.reduce(
      (sum: number, day: ChartDataPoint) => sum + (day[key as keyof ChartDataPoint] as number),
      0,
    );
    return {
      key,
      label: chartConfig[key as keyof typeof chartConfig]?.label || key,
      total,
      color: colors[key as keyof typeof colors],
    };
  });

  return (
    <div className="w-full border border-border rounded-[12px] p-[18px] pb-[10px]  @container relative">
      <AnalyticsSectionHeader
        title="Profile Activity"
        description="Track engagement and interactions on your profile"
        icon={<Activity size={15} className="text-foreground" />}
      />

      <div className="w-full mt-[18px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-[350px] text-foreground/50">
            <LoadingButtonCircle size={22} />
          </div>
        ) : hasData ? (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
                        {formatChartDate(label, dateRange)} (UTC)
                      </div>

                      <div className="gap-1.5 grid">
                        {itemsToShow.map((item, index) => {
                          // Find corresponding previous period value
                          const prevDataKey = `prev_${item.dataKey}`;
                          const prevItem = payload.find((p) => p.dataKey === prevDataKey);
                          const prevValue = prevItem?.value ? Number(prevItem.value) : 0;
                          const currentValue = item.value ? Number(item.value) : 0;

                          // Format value based on whether previous data exists
                          const displayValue =
                            prevValue > 0
                              ? `${currentValue} / ${prevValue}`
                              : currentValue.toString();

                          return (
                            <div key={index} className="flex w-full flex-wrap items-center gap-2">
                              <div className="flex flex-1 justify-between items-center gap-2 leading-none">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="size-2.5 shrink-0 rounded-sm"
                                    style={{backgroundColor: item.color}}
                                    aria-hidden={true}
                                  />
                                  <span className="text-muted-foreground">
                                    {chartConfig[item.dataKey as keyof typeof chartConfig]?.label ||
                                      item.dataKey}
                                  </span>
                                </div>
                                <span className="font-mono font-medium tabular-nums text-foreground">
                                  {displayValue}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              {/* Previous period bars (outlined) */}
              {eventKeys.map((key) => (
                <Bar
                  key={`prev_${key}`}
                  dataKey={`prev_${key}`}
                  stackId="b"
                  fill="transparent"
                  stroke={colors[key as keyof typeof colors]}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              ))}

              {/* Current period bars (filled) */}
              {eventKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={colors[key as keyof typeof colors]}
                />
              ))}
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex justify-center items-center h-[350px] text-foreground/50">
            <EmptyState />
          </div>
        )}

        {/* Legend */}
        {isLoading ? (
          <ProfileEventsBarSkeleton compareDateRange={compareDateRange} />
        ) : (
          <motion.div
            className="mt-6"
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              delay: 0.2,
            }}>
            <motion.div
              className="flex items-center justify-between text-xs text-muted-foreground mb-2"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.3, duration: 0.2}}>
              <span>Event Types</span>

              {compareDateRange !== "Disabled" ? (
                <span>Current / Previous / Percentage</span>
              ) : (
                <span>Current / Previous</span>
              )}
            </motion.div>
            <ul className="divide-y divide-border text-[14px] font-medium">
              {legendData.map((item, index) => {
                const prevTotal = chartData.reduce(
                  (sum: number, day: ChartDataPoint) =>
                    sum + (day[`prev_${item.key}` as keyof ChartDataPoint] as number),
                  0,
                );

                const percentageChange = calculatePercentageChange(item.total, prevTotal);

                return (
                  <motion.li
                    key={item.key}
                    className="relative flex items-center justify-between py-2"
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                      delay: 0.3 + index * 0.05,
                    }}>
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="flex items-center space-x-1">
                        <motion.span
                          className="size-2.5 shrink-0 rounded-sm"
                          style={{backgroundColor: item.color}}
                          aria-hidden={true}
                          initial={{scale: 0}}
                          animate={{scale: 1}}
                          transition={{
                            duration: 0.15,
                            delay: 0.35 + index * 0.05,
                            type: "spring",
                            stiffness: 200,
                          }}
                        />
                        {compareDateRange !== "Disabled" && (
                          <motion.span
                            className="size-2.5 shrink-0 rounded-sm border-2 border-dashed"
                            style={{borderColor: item.color}}
                            aria-hidden={true}
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            transition={{
                              duration: 0.15,
                              delay: 0.375 + index * 0.05,
                              type: "spring",
                              stiffness: 200,
                            }}
                          />
                        )}
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.span
                        className="font-medium tabular-nums text-foreground"
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{
                          duration: 0.15,
                          delay: 0.4 + index * 0.05,
                        }}>
                        {item.total.toLocaleString()}
                      </motion.span>
                      <span className="text-muted-foreground">/</span>
                      <motion.span
                        className="font-medium tabular-nums text-muted-foreground"
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{
                          duration: 0.15,
                          delay: 0.425 + index * 0.05,
                        }}>
                        {prevTotal.toLocaleString()}
                      </motion.span>
                      {compareDateRange !== "Disabled" && (
                        <motion.div
                          initial={{opacity: 0, scale: 0.8}}
                          animate={{opacity: 1, scale: 1}}
                          transition={{
                            duration: 0.15,
                            delay: 0.45 + index * 0.05,
                          }}>
                          <AnalyticsBadge
                            number={Math.abs(percentageChange)}
                            type={getChangeType(percentageChange)}
                            tooltipData={{
                              metricName: String(item.label),
                              currentValue: item.total,
                              previousValue: prevTotal,
                            }}
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
            {compareDateRange !== "Disabled" && (
              <motion.div
                className="mt-3 flex items-center gap-4 text-xs text-muted-foreground"
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{
                  duration: 0.2,
                  delay: 0.4 + legendData.length * 0.05,
                }}>
                <motion.div
                  className="flex items-center gap-1.5"
                  initial={{opacity: 0, x: -10}}
                  animate={{opacity: 1, x: 0}}
                  transition={{
                    duration: 0.15,
                    delay: 0.45 + legendData.length * 0.05,
                  }}>
                  <motion.div
                    className="size-2 rounded-sm bg-foreground"
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    transition={{
                      duration: 0.1,
                      delay: 0.5 + legendData.length * 0.05,
                      type: "spring",
                      stiffness: 300,
                    }}
                  />
                  <span>Current Period</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-1.5"
                  initial={{opacity: 0, x: -10}}
                  animate={{opacity: 1, x: 0}}
                  transition={{
                    duration: 0.15,
                    delay: 0.5 + legendData.length * 0.05,
                  }}>
                  <motion.div
                    className="size-2 rounded-sm border border-dashed border-foreground"
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    transition={{
                      duration: 0.1,
                      delay: 0.55 + legendData.length * 0.05,
                      type: "spring",
                      stiffness: 300,
                    }}
                  />
                  <span>Previous Period</span>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const ProfileEventsBarSkeleton = ({compareDateRange}: {compareDateRange: string}) => {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-20" />
        {compareDateRange !== "Disabled" ? (
          <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-36" />
        ) : (
          <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-24" />
        )}
      </div>
      <ul className="divide-y divide-border text-[14px] font-medium">
        {Array.from({length: 7}, (_, index) => (
          <li key={`skeleton-${index}`} className="relative flex items-center justify-between py-2">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="flex items-center space-x-1">
                <div className="size-2.5 shrink-0 rounded-sm bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
                {compareDateRange !== "Disabled" && (
                  <div className="size-2.5 shrink-0 rounded-sm border-2 border-dashed border-gray-100 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
                )}
              </div>
              <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-8" />
              <div className="h-1 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-1" />
              <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-8" />
              {compareDateRange !== "Disabled" && (
                <div className="h-5 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-10" />
              )}
            </div>
          </li>
        ))}
      </ul>
      {compareDateRange !== "Disabled" && (
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
            <div className="h-3 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-20" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-sm border border-dashed border-gray-100 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
            <div className="h-3 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-24" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEventsBar;
