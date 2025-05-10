import StatsCardWithLineChart from "@/components/analytics/StatsCardWithLineChart";
import {ChartConfig} from "@/components/shadcn/chart";
import {useDashboardStore} from "@/store/useDashboardStore";
import {AnalyticsCardItem} from "@/types/analytics";
import {User} from "@supabase/supabase-js";
import {useEffect, useState} from "react";

const ProfileStatsCard = ({user}: {user: User}) => {
  const userUsername = user.user_metadata.username;
  const {dateRange, compareDateRange} = useDashboardStore();
  const [viewsData, setViewsData] = useState(null);
  const [uniqueVisitorsData, setUniqueVisitorsData] = useState(null);
  const [totalViews, setTotalViews] = useState(0);
  const [totalUniqueVisitors, setTotalUniqueVisitors] = useState(0);
  const [previousPeriodViews, setPreviousPeriodViews] = useState(0);
  const [previousPeriodVisitors, setPreviousPeriodVisitors] = useState(0);
  const [viewsPercentageChange, setViewsPercentageChange] = useState(0);
  const [uniqueVisitorsPercentageChange, setUniqueVisitorsPercentageChange] = useState(0);
  const [viewsChangeType, setViewsChangeType] = useState<"positive" | "negative" | "neutral">(
    "neutral",
  );
  const [uniqueVisitorsChangeType, setUniqueVisitorsChangeType] = useState<
    "positive" | "negative" | "neutral"
  >("neutral");
  const [shouldShowViewsBadge, setShouldShowViewsBadge] = useState(false);
  const [shouldShowVisitorsBadge, setShouldShowVisitorsBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/profile-stats?slug=${userUsername}&dateRange=${encodeURIComponent(dateRange)}&compareDateRange=${encodeURIComponent(compareDateRange)}`,
        );
        if (!res.ok) {
          console.error("Failed to fetch profile stats:", res.status);
          throw new Error(`Failed to fetch profile stats: ${res.status}`);
        }
        const data = await res.json();

        // Set views data
        setTotalViews(data.views.totalViews || 0);
        setPreviousPeriodViews(data.views.previousPeriodViews || 0);
        setViewsData(data.views.chartData);
        setViewsPercentageChange(data.views.percentageChange || 0);
        setViewsChangeType(data.views.changeType || "neutral");
        setShouldShowViewsBadge(data.views.shouldShowBadge);

        // Set unique visitors data
        setTotalUniqueVisitors(data.uniqueVisitors.totalVisitors || 0);
        setPreviousPeriodVisitors(data.uniqueVisitors.previousPeriodVisitors || 0);
        setUniqueVisitorsData(data.uniqueVisitors.chartData);
        setUniqueVisitorsPercentageChange(data.uniqueVisitors.percentageChange || 0);
        setUniqueVisitorsChangeType(data.uniqueVisitors.changeType || "neutral");
        setShouldShowVisitorsBadge(data.uniqueVisitors.shouldShowBadge);
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [dateRange, compareDateRange, userUsername]);

  const data: AnalyticsCardItem[] = [
    {
      title: "Total Views",
      number: totalViews || 0,
      type: viewsChangeType,
      analyticsNumber: viewsPercentageChange,
      shouldShowBadge: shouldShowViewsBadge,
      tooltipData: shouldShowViewsBadge
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
      title: "Unique Visitors",
      number: totalUniqueVisitors || 0,
      type: uniqueVisitorsChangeType,
      analyticsNumber: uniqueVisitorsPercentageChange,
      shouldShowBadge: shouldShowVisitorsBadge,
      tooltipData: shouldShowVisitorsBadge
        ? {
            metricName: "Unique visitors",
            currentValue: totalUniqueVisitors,
            previousValue: previousPeriodVisitors,
          }
        : undefined,
      chartData: uniqueVisitorsData || [],
      chartConfig: {
        views: {
          label: "Unique Visitors",
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
      shouldShowBadge: true,
    },
    {
      title: "Profile Interactions",
      number: 163,
      type: "positive",
      analyticsNumber: 12,
      shouldShowBadge: true,
    },
  ];

  return (
    <StatsCardWithLineChart
      data={data}
      firstKey="firstDate"
      isLoading={isLoading}
      secondKey={
        compareDateRange !== "Disabled" && dateRange !== "All Time" ? "secondDate" : undefined
      }
    />
  );
};

export default ProfileStatsCard;
