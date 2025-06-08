"use client";
import React from "react";
import {Label, Pie, PieChart} from "recharts";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/shadcn/chart";

const chartData = [
  {label: "18-24", count: 275, percentage: 275, relative: 275, fill: "hsl(var(--chart-1))"},
  {label: "25-34", count: 200, percentage: 200, relative: 200, fill: "hsl(var(--chart-2))"},
  {label: "35-44", count: 150, percentage: 150, relative: 150, fill: "hsl(var(--chart-3))"},
  {label: "45-54", count: 100, percentage: 100, relative: 100, fill: "hsl(var(--chart-4))"},
  {label: "55+", count: 50, percentage: 50, relative: 50, fill: "hsl(var(--chart-5))"},
];

const AnalyticsPieChart = () => {
  const totalCount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, []);

  const chartDataWithPercentages = React.useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      percentage: ((item.count / totalCount) * 100).toFixed(1),
    }));
  }, [totalCount]);

  return (
    <div className="w-full">
      <ChartContainer config={{}} className="mx-auto aspect-square max-h-[250px]">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartDataWithPercentages}
            dataKey="count"
            nameKey="label"
            innerRadius={75}
            outerRadius={100}
            stroke="hsl(var(--background))"
            strokeWidth={2}>
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
                        Age Distribution
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="mt-6">
        <p className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Age Range</span>
          <span>Count / Percentage</span>
        </p>
        <ul className="divide-y divide-border text-[14px] font-medium">
          {chartDataWithPercentages.map((item) => (
            <li key={item.label} className="relative flex items-center justify-between py-2 ">
              <div className="flex items-center space-x-2.5 truncate ">
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{backgroundColor: item.fill}}
                  aria-hidden={true}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium tabular-nums text-foreground">
                  {item.count.toLocaleString()}
                </span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                  {item.percentage}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsPieChart;
