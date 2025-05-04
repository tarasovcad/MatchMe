import StatsCardWithLineChart from "@/components/analytics/StatsCardWithLineChart";
import {ChartConfig} from "@/components/shadcn/chart";
import {useDashboardStore} from "@/store/useDashboardStore";
import {AnalyticsCardItem, ChartDataPoint} from "@/types/analytics";
import {User} from "@supabase/supabase-js";
import {useEffect, useState} from "react";

const OverviewTab = ({user}: {user: User}) => {
  const userUsername = user.user_metadata.username;
  const {dateRange} = useDashboardStore();
  const [viewsData, setViewsData] = useState(null);
  const [totalViews, setTotalViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchViews = async () => {
      setIsLoading(true);
      const startTime = new Date();

      try {
        const res = await fetch(
          `/api/profile-views?slug=${userUsername}&dateRange=${encodeURIComponent(dateRange)}`,
        );

        if (!res.ok) {
          console.error("Failed to fetch profile views:", res.status);
          throw new Error(`Failed to fetch profile views: ${res.status}`);
        }

        const data = await res.json();
        console.log(data);
        const total = data.chartData.reduce(
          (sum: number, item: ChartDataPoint) => sum + item.firstDate,
          0,
        );

        setViewsData(data.chartData);
        setTotalViews(total);

        const endTime = new Date();
        console.log(`Fetched views in ${endTime.getTime() - startTime.getTime()}ms`);
      } catch (error) {
        console.error("Error fetching profile views:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchViews();
  }, [dateRange, userUsername]);

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
        label="views"
        firstKey="firstDate"
        isLoading={isLoading}
      />
    </div>
  );
};

export default OverviewTab;
