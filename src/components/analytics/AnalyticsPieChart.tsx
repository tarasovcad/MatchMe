"use client";
import React from "react";
import {Label, Pie, PieChart} from "recharts";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/shadcn/chart";
import {motion} from "motion/react";

export const PieChartSkeleton = () => {
  return (
    <motion.div
      className="w-full"
      initial={{opacity: 0, scale: 0.9}}
      animate={{opacity: 1, scale: 1}}
      transition={{duration: 0.5, ease: "easeOut"}}>
      {/* Chart skeleton */}
      <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center">
        <div className="relative">
          {/* Outer ring skeleton */}
          <div className="w-[200px] h-[200px] rounded-full border-8 border-gray-100 animate-pulse" />
          {/* Inner circle skeleton */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full bg-background border-8 border-gray-50 flex flex-col items-center justify-center">
            {/* Center text skeleton */}
            <div className="h-8 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-16 mb-2" />
            <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-24" />
          </div>
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-16" />
          <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-24" />
        </div>
        <ul className="divide-y divide-border text-[14px] font-medium">
          {Array.from({length: 5}, (_, index) => (
            <li
              key={`skeleton-${index}`}
              className="relative flex items-center justify-between py-2">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="size-2.5 shrink-0 rounded-sm bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
                <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-20" />
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-8" />
                <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-10" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const AnalyticsPieChart = ({
  data,
  isLoading,
  error,
  title,
  chartTitle,
}: {
  data: {label: string; count: number; percentage: number; relative: number; fill: string}[];
  isLoading: boolean;
  error: Error | null;
  title: string;
  chartTitle: string;
}) => {
  const totalCount = data?.reduce((acc, curr) => acc + curr.count, 0);

  if (isLoading || error) {
    return <PieChartSkeleton />;
  }

  return (
    <motion.div
      className="w-full"
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.6, ease: "easeOut"}}>
      <motion.div
        initial={{opacity: 0, scale: 0.8, rotateY: -15}}
        animate={{opacity: 1, scale: 1, rotateY: 0}}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.2,
        }}>
        <ChartContainer config={{}} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={75}
              outerRadius={100}
              stroke="hsl(var(--background))"
              strokeWidth={data.length > 1 ? 2 : 0}>
              <Label
                content={({viewBox}) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold">
                          {totalCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground">
                          {chartTitle}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{opacity: 0, y: 30}}
        animate={{opacity: 1, y: 0}}
        transition={{
          duration: 0.6,
          ease: "easeOut",
          delay: 0.4,
        }}>
        <motion.p
          className="flex items-center justify-between text-xs text-muted-foreground mb-2"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.6, duration: 0.4}}>
          <span>{title}</span>
          <span>Count / Percentage</span>
        </motion.p>
        <ul className="divide-y divide-border text-[14px] font-medium">
          {data?.map((item, index) => (
            <motion.li
              key={item.label}
              className="relative flex items-center justify-between py-2"
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: 0.6 + index * 0.1,
              }}>
              <div className="flex items-center space-x-2.5 truncate ">
                <motion.span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{backgroundColor: item.fill}}
                  aria-hidden={true}
                  initial={{scale: 0}}
                  animate={{scale: 1}}
                  transition={{
                    duration: 0.3,
                    delay: 0.7 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.span
                  className="font-medium tabular-nums text-foreground"
                  initial={{opacity: 0, scale: 0.8}}
                  animate={{opacity: 1, scale: 1}}
                  transition={{
                    duration: 0.3,
                    delay: 0.8 + index * 0.1,
                  }}>
                  {item.count.toLocaleString()}
                </motion.span>
                <motion.span
                  className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
                  initial={{opacity: 0, scale: 0.8}}
                  animate={{opacity: 1, scale: 1}}
                  transition={{
                    duration: 0.3,
                    delay: 0.9 + index * 0.1,
                  }}>
                  {item.percentage}%
                </motion.span>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsPieChart;
