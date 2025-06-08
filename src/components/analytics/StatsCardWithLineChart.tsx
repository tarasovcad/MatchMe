import AnalyticsBadge from "@/components/analytics/AnalyticsBadge";
import React, {useEffect, useState} from "react";
import {Area, AreaChart, CartesianGrid, XAxis} from "recharts";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/shadcn/chart";

import {formatNumber} from "@/functions/formatNumber";
import {formatChartDate} from "@/functions/formatChartDate";
import {AnalyticsCardItem} from "@/types/analytics";
import AnalyticsCardList from "./AnalyticsCardList";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import {useDashboardStore} from "@/store/useDashboardStore";
import {getPreviousPeriodDate} from "@/functions/analytics/analyticsDataTransformation";

const Chart = ({
  data,
  firstKey,
  secondKey,
}: {
  data: AnalyticsCardItem;
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

  const {dateRange} = useDashboardStore();
  return (
    <ChartContainer config={data.chartConfig || {}} className="w-full h-[210px] aspect-auto">
      <AreaChart
        key={data.title}
        accessibilityLayer
        data={data.chartData || []}
        margin={{top: 20, right: 20, left: 0, bottom: 0}}>
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
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, item, index) => {
                const isSecondDate = name === secondKey;
                const date = isSecondDate
                  ? getPreviousPeriodDate(item.payload.date, dateRange)
                  : item.payload.date;

                const showTitle = index === 0;
                return (
                  <div className="flex flex-col gap-1.5 w-full">
                    {showTitle && (
                      <span className="font-medium text-foreground">{data.title} (UTC)</span>
                    )}
                    <div className="flex flex-1 justify-between items-center gap-2 leading-none">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="rounded-full w-2 h-2"
                          style={{
                            backgroundColor: isSecondDate
                              ? "hsl(var(--chart-gray))"
                              : "hsl(var(--chart-1))",
                          }}
                        />
                        <div className="gap-1.5 grid">
                          <span className="text-muted-foreground">
                            {formatChartDate(date, dateRange)}
                          </span>
                        </div>
                      </div>
                      {value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }}
            />
          }
        />
        <Area
          dataKey={firstKey}
          type="linear"
          fill="transparent"
          stroke="hsl(var(--chart-1))"
          stackId="a"
        />
        {secondKey && (
          <Area
            dataKey={secondKey}
            type="linear"
            fill="transparent"
            stroke="hsl(var(--chart-gray))"
            strokeDasharray="5 5"
            strokeWidth={1.5}
          />
        )}
      </AreaChart>
    </ChartContainer>
  );
};

const StatsCardWithLineChart = ({
  data,
  firstKey,
  secondKey,
  isLoading,
}: {
  data: AnalyticsCardItem[];
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
              {selectedData.shouldShowBadge && (
                <AnalyticsBadge
                  number={selectedData.analyticsNumber}
                  type={selectedData.type}
                  tooltipData={selectedData.tooltipData}
                />
              )}
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-[210px] text-foreground/50">
              <LoadingButtonCircle size={22} />
            </div>
          ) : (
            <Chart data={selectedData || []} firstKey={firstKey} secondKey={secondKey} />
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
                  {item.shouldShowBadge && (
                    <AnalyticsBadge
                      number={item.analyticsNumber}
                      type={item.type}
                      tooltipData={item.tooltipData}
                    />
                  )}
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
            <Chart data={selectedData || []} firstKey={firstKey} secondKey={secondKey} />
          )}
        </div>
      </div>
    </>
  );
};

export default StatsCardWithLineChart;
