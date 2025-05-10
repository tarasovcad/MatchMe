import StatsCardWithLineChart from "@/components/analytics/StatsCardWithLineChart";
import {ChartConfig} from "@/components/shadcn/chart";
import {useDashboardStore} from "@/store/useDashboardStore";
import {AnalyticsCardItem, ChartDataPoint} from "@/types/analytics";
import {User} from "@supabase/supabase-js";
import {useEffect, useState} from "react";

const OverviewTab = ({user}: {user: User}) => {
  const userUsername = user.user_metadata.username;
  const {dateRange, compareDateRange} = useDashboardStore();
  const [viewsData, setViewsData] = useState(null);
  const [totalViews, setTotalViews] = useState(0);
  const [previousPeriodViews, setPreviousPeriodViews] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [changeType, setChangeType] = useState<"positive" | "negative" | "neutral">("neutral");
  const [shouldShowBadge, setShouldShowBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchViews = async () => {
      setIsLoading(true);

      try {
        const res = await fetch(
          `/api/profile-views?slug=${userUsername}&dateRange=${encodeURIComponent(dateRange)}&compareDateRange=${encodeURIComponent(compareDateRange)}`,
        );

        if (!res.ok) {
          console.error("Failed to fetch profile views:", res.status);
          throw new Error(`Failed to fetch profile views: ${res.status}`);
        }

        const data = await res.json();
        console.log(data);

        setTotalViews(data.totalViews || 0);
        setPreviousPeriodViews(data.previousPeriodViews || 0);
        setViewsData(data.chartData);
        setPercentageChange(data.percentageChange || 0);
        setChangeType(data.changeType || "neutral");
        setShouldShowBadge(data.shouldShowBadge);
      } catch (error) {
        console.error("Error fetching profile views:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchViews();
  }, [dateRange, compareDateRange, userUsername]);

  const data: AnalyticsCardItem[] = [
    {
      title: "Total Views",
      number: totalViews || 0,
      type: changeType,
      analyticsNumber: percentageChange,
      shouldShowBadge,
      tooltipData: shouldShowBadge
        ? {
            metricName: "Page views",
            currentValue: totalViews,
            previousValue: previousPeriodViews,
          }
        : undefined,
      chartData: viewsData || [],
      chartConfig: {
        views: {
          label: "Total Views",
        },
        firstDate: {
          label: "First Date",
          color: "hsl(var(--chart-1))",
        },
        secondDate: {
          label: "Second Date",
          color: "hsl(var(--chart-2))",
        },
      } satisfies ChartConfig,
    },
    {
      title: "Followers Gained",
      number: 53,
      type: "positive",
      analyticsNumber: 6,
      shouldShowBadge: false,
    },
    {
      title: "Posts Created",
      number: 163,
      type: "positive",
      analyticsNumber: 12,
      shouldShowBadge: false,
    },
    {
      title: "Posts Likes",
      number: 6,
      type: "negative",
      analyticsNumber: 7,
      shouldShowBadge: false,
    },
  ];

  return (
    <div>
      <StatsCardWithLineChart
        data={data}
        firstKey="firstDate"
        isLoading={isLoading}
        secondKey={
          compareDateRange !== "Disabled" && dateRange !== "All Time" ? "secondDate" : undefined
        }
      />
    </div>
  );
};

export default OverviewTab;
