import StatsCardWithLineChart from "@/components/analytics/StatsCardWithLineChart";
import {ChartConfig} from "@/components/shadcn/chart";
import {useDashboardStore} from "@/store/useDashboardStore";
import {AnalyticsCardItem} from "@/types/analytics";
import {User} from "@supabase/supabase-js";
import {useEffect, useState} from "react";

const ProfileStatsCard = ({user}: {user: User}) => {
  const userUsername = user.user_metadata.username;
  const {dateRange, compareDateRange, hydrated} = useDashboardStore();
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
  // Follower stats
  const [followersData, setFollowersData] = useState(null);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [previousPeriodFollowers, setPreviousPeriodFollowers] = useState(0);
  const [followersPercentageChange, setFollowersPercentageChange] = useState(0);
  const [followersChangeType, setFollowersChangeType] = useState<
    "positive" | "negative" | "neutral"
  >("neutral");
  const [shouldShowFollowersBadge, setShouldShowFollowersBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch profile stats
        const profileStatsResponse = await fetch(
          `/api/profile-stats?slug=${userUsername}&dateRange=${encodeURIComponent(dateRange)}&compareDateRange=${encodeURIComponent(compareDateRange)}`,
        );

        // Fetch follower stats
        const followerStatsResponse = await fetch(
          `/api/follower-stats?username=${userUsername}&dateRange=${encodeURIComponent(dateRange)}&compareDateRange=${encodeURIComponent(compareDateRange)}`,
        );

        if (!profileStatsResponse.ok) {
          console.error("Failed to fetch profile stats:", profileStatsResponse.status);
          throw new Error(`Failed to fetch profile stats: ${profileStatsResponse.status}`);
        }

        const profileData = await profileStatsResponse.json();

        // Set views data
        setTotalViews(profileData.views.totalViews || 0);
        setPreviousPeriodViews(profileData.views.previousPeriodViews || 0);
        setViewsData(profileData.views.chartData);
        setViewsPercentageChange(profileData.views.percentageChange || 0);
        setViewsChangeType(profileData.views.changeType || "neutral");
        setShouldShowViewsBadge(profileData.views.shouldShowBadge);

        // Set unique visitors data
        setTotalUniqueVisitors(profileData.uniqueVisitors.totalVisitors || 0);
        setPreviousPeriodVisitors(profileData.uniqueVisitors.previousPeriodVisitors || 0);
        setUniqueVisitorsData(profileData.uniqueVisitors.chartData);
        setUniqueVisitorsPercentageChange(profileData.uniqueVisitors.percentageChange || 0);
        setUniqueVisitorsChangeType(profileData.uniqueVisitors.changeType || "neutral");
        setShouldShowVisitorsBadge(profileData.uniqueVisitors.shouldShowBadge);

        const followerData = await followerStatsResponse.json();
        setFollowersData(followerData.chartData || []);
        setTotalFollowers(followerData.totalFollowers || 0);
        setPreviousPeriodFollowers(followerData.previousPeriodFollowers || 0);
        setFollowersPercentageChange(followerData.percentageChange || 0);
        setFollowersChangeType(followerData.changeType || "neutral");
        setShouldShowFollowersBadge(followerData.shouldShowBadge);
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
      number: totalFollowers || 0,
      type: followersChangeType,
      analyticsNumber: followersPercentageChange,
      shouldShowBadge: shouldShowFollowersBadge,
      tooltipData: shouldShowFollowersBadge
        ? {
            metricName: "Followers gained",
            currentValue: totalFollowers,
            previousValue: previousPeriodFollowers,
          }
        : undefined,
      chartData: followersData || [],
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
