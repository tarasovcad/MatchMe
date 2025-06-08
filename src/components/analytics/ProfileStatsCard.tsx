import StatsCardWithLineChart from "@/components/analytics/StatsCardWithLineChart";
import {ChartConfig} from "@/components/shadcn/chart";
import {
  useFollowerStats,
  useProfileInteractions,
  useUniqueVisitors,
  useViewsStats,
} from "@/hooks/query/dashboard/use-stats";
import {useDashboardStore} from "@/store/useDashboardStore";
import {AnalyticsCardItem} from "@/types/analytics";
import {User} from "@supabase/supabase-js";
import {useMemo} from "react";
import {toast} from "sonner";

const ProfileStatsCard = ({user}: {user: User}) => {
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
    data: viewsData,
    isLoading: isViewsLoading,
    error: viewsError,
  } = useViewsStats(statsParams);

  const {
    data: followersData,
    isLoading: isFollowersLoading,
    error: followersError,
  } = useFollowerStats(statsParams);

  const {
    data: visitorsData,
    isLoading: isVisitorsLoading,
    error: visitorsError,
  } = useUniqueVisitors(statsParams);

  const {
    data: profileInteractionsData,
    isLoading: isProfileInteractionsLoading,
    error: profileInteractionsError,
  } = useProfileInteractions(statsParams);

  if (viewsError) {
    toast.error(viewsError.message, {
      description: "Please try again later",
    });
  }

  if (followersError) {
    toast.error(followersError.message, {
      description: "Please try again later",
    });
  }

  if (visitorsError) {
    toast.error(visitorsError.message, {
      description: "Please try again later",
    });
  }

  if (profileInteractionsError) {
    toast.error(profileInteractionsError.message, {
      description: "Please try again later",
    });
  }

  const isLoading =
    isViewsLoading || isFollowersLoading || isVisitorsLoading || isProfileInteractionsLoading;

  const metrics = useMemo(
    () => ({
      views: {
        total: viewsData?.totalViews || 0,
        previousPeriod: viewsData?.previousPeriodViews || 0,
        percentageChange: viewsData?.percentageChange || 0,
        changeType: viewsData?.changeType || "neutral",
        shouldShowBadge: viewsData?.shouldShowBadge || false,
        chartData: viewsData?.chartData || [],
      },
      visitors: {
        total: visitorsData?.totalUniqueVisitors || 0,
        previousPeriod: visitorsData?.previousPeriodUniqueVisitors || 0,
        percentageChange: visitorsData?.percentageChange || 0,
        changeType: visitorsData?.changeType || "neutral",
        shouldShowBadge: visitorsData?.shouldShowBadge || false,
        chartData: visitorsData?.chartData || [],
      },
      followers: {
        total: followersData?.totalFollowers || 0,
        previousPeriod: followersData?.previousPeriodFollowers || 0,
        percentageChange: followersData?.percentageChange || 0,
        changeType: followersData?.changeType || "neutral",
        shouldShowBadge: followersData?.shouldShowBadge || false,
        chartData: followersData?.chartData || [],
      },
      profileInteractions: {
        total: profileInteractionsData?.totalInteractions || 0,
        previousPeriod: profileInteractionsData?.previousPeriodInteractions || 0,
        percentageChange: profileInteractionsData?.percentageChange || 0,
        changeType: profileInteractionsData?.changeType || "neutral",
        shouldShowBadge: profileInteractionsData?.shouldShowBadge || false,
        chartData: profileInteractionsData?.chartData || [],
      },
    }),
    [viewsData, visitorsData, followersData, profileInteractionsData],
  );

  const data: AnalyticsCardItem[] = [
    {
      title: "Total Views",
      number: metrics.views.total,
      type: metrics.views.changeType,
      analyticsNumber: metrics.views.percentageChange,
      shouldShowBadge: metrics.views.shouldShowBadge,
      tooltipData: metrics.views.shouldShowBadge
        ? {
            metricName: "Page views",
            currentValue: metrics.views.total,
            previousValue: metrics.views.previousPeriod,
          }
        : undefined,
      chartData: metrics.views.chartData,
      chartConfig: {
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
      number: metrics.visitors.total,
      type: metrics.visitors.changeType,
      analyticsNumber: metrics.visitors.percentageChange,
      shouldShowBadge: metrics.visitors.shouldShowBadge,
      tooltipData: metrics.visitors.shouldShowBadge
        ? {
            metricName: "Unique visitors",
            currentValue: metrics.visitors.total,
            previousValue: metrics.visitors.previousPeriod,
          }
        : undefined,
      chartData: metrics.visitors.chartData,
      chartConfig: {
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
      number: metrics.followers.total,
      type: metrics.followers.changeType,
      analyticsNumber: metrics.followers.percentageChange,
      shouldShowBadge: metrics.followers.shouldShowBadge,
      tooltipData: metrics.followers.shouldShowBadge
        ? {
            metricName: "Followers gained",
            currentValue: metrics.followers.total,
            previousValue: metrics.followers.previousPeriod,
          }
        : undefined,
      chartData: metrics.followers.chartData,
      chartConfig: {
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
      title: "Profile Interactions",
      number: metrics.profileInteractions.total,
      type: metrics.profileInteractions.changeType,
      analyticsNumber: metrics.profileInteractions.percentageChange,
      shouldShowBadge: metrics.profileInteractions.shouldShowBadge,
      tooltipData: metrics.profileInteractions.shouldShowBadge
        ? {
            metricName: "Profile interactions",
            currentValue: metrics.profileInteractions.total,
            previousValue: metrics.profileInteractions.previousPeriod,
          }
        : undefined,
      chartData: metrics.profileInteractions.chartData,
      chartConfig: {
        firstDate: {
          label: "First Date",
          color: "hsl(var(--chart-1))",
        },
      } satisfies ChartConfig,
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
