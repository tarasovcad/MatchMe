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
  const [totalCompareViews, setTotalCompareViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchViews = async () => {
      setIsLoading(true);
      const startTime = new Date();

      try {
        // Your API route already handles both primary and comparison data
        // You don't need to make a second API call
        const res = await fetch(
          `/api/profile-views?slug=${userUsername}&dateRange=${encodeURIComponent(dateRange)}&compareDateRange=${encodeURIComponent(compareDateRange)}`,
        );

        if (!res.ok) {
          console.error("Failed to fetch profile views:", res.status);
          throw new Error(`Failed to fetch profile views: ${res.status}`);
        }

        const data = await res.json();
        console.log(data);

        // Set the total views from primary data
        setTotalViews(data.totalViews || 0);

        // Set the views data with already merged data from API
        setViewsData(data.chartData);

        // If comparison was enabled, calculate total comparison views
        if (compareDateRange !== "Disabled" && data.comparisonChartData) {
          const totalCompare = data.comparisonChartData.reduce(
            (sum: number, item: ChartDataPoint) => sum + item.firstDate,
            0,
          );
          setTotalCompareViews(totalCompare);
        } else {
          // Reset comparison data when disabled
          setTotalCompareViews(0);
        }

        const endTime = new Date();
        console.log(`Fetched views in ${endTime.getTime() - startTime.getTime()}ms`);
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
      type: "positive",
      analyticsNumber: 12,
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
    },
    {
      title: "Posts Created",
      number: 163,
      type: "positive",
      analyticsNumber: 12,
    },
    {
      title: "Posts Likes",
      number: 6,
      type: "negative",
      analyticsNumber: 7,
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
