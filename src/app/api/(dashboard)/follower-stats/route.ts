import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";
import {calculateAnalyticsBadgeData} from "@/functions/analytics/calculateAnalyticsBadgeData";

type ChartDataPoint = {
  month: string;
  date: string;
  firstDate: number;
  secondDate?: number;
};

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const username = searchParams.get("username");
    const dateRange = searchParams.get("dateRange") ?? "Past 7 days";
    const compareDateRange = searchParams.get("compareDateRange") ?? "Previous Period";

    if (!username) {
      return NextResponse.json({error: "Username is required"}, {status: 400});
    }

    const supabase = await createClient();

    // Get user profile ID
    const {data: profileData, error: profileError} = await supabase
      .from("profiles")
      .select("id, created_at")
      .eq("username", username)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json(
        {error: "User profile not found", details: profileError?.message},
        {status: 404},
      );
    }

    const profileId = profileData.id;

    // Get date ranges for queries
    const currentRange = getDateRangeObject(dateRange);

    // Get current period followers
    const {data: currentFollowersData, error: currentError} = await supabase
      .from("follows")
      .select("created_at")
      .eq("following_id", profileId)
      .gte("created_at", currentRange.from.toISOString())
      .lte("created_at", currentRange.to.toISOString())
      .order("created_at", {ascending: true});

    if (currentError) {
      return NextResponse.json(
        {error: "Failed to fetch followers data", details: currentError.message},
        {status: 500},
      );
    }

    // Generate chart data
    const currentPeriodFollowers = currentFollowersData.length;
    const interval = getIntervalForDateRange(dateRange);
    const currentChartData = generateChartData(currentFollowersData, currentRange, interval);

    // Process comparison period if enabled
    let previousPeriodFollowers = 0;
    let comparisonChartData: ChartDataPoint[] = [];

    if (compareDateRange !== "Disabled" && dateRange !== "All Time") {
      const previousRange = getPreviousDateRange(dateRange, compareDateRange);

      // Fetch previous period followers
      const {data: previousFollowersData, error: previousError} = await supabase
        .from("follows")
        .select("created_at")
        .eq("following_id", profileId)
        .gte("created_at", previousRange.from.toISOString())
        .lte("created_at", previousRange.to.toISOString())
        .order("created_at", {ascending: true});

      if (!previousError && previousFollowersData) {
        previousPeriodFollowers = previousFollowersData.length;
        comparisonChartData = generateChartData(previousFollowersData, previousRange, interval);
      }
    }

    // Calculate badge data
    const badgeData = calculateAnalyticsBadgeData(
      currentPeriodFollowers,
      previousPeriodFollowers,
      compareDateRange,
    );

    // Merge chart data
    const mergedChartData = currentChartData.map((item, index) => ({
      ...item,
      secondDate: comparisonChartData[index]?.firstDate || 0,
    }));

    return NextResponse.json({
      chartData: mergedChartData,
      totalFollowers: currentPeriodFollowers || 0,
      previousPeriodFollowers: previousPeriodFollowers || 0,
      percentageChange: badgeData.percentageChange,
      changeType: badgeData.changeType,
      shouldShowBadge: badgeData.shouldShowBadge,
    });
  } catch (error) {
    console.error("Error fetching follower stats:", error);
    return NextResponse.json(
      {
        error: "Error fetching follower stats",
        message: error instanceof Error ? error.message : String(error),
        chartData: [],
      },
      {status: 500},
    );
  }
}

// Get date range object (from and to dates)
function getDateRangeObject(dateRange: string): {from: Date; to: Date} {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const ranges: Record<string, {from: Date; to: Date}> = {
    Today: {
      from: new Date(today),
      to: new Date(now),
    },
    "Last 24 hours": {
      from: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      to: new Date(now),
    },
    Yesterday: {
      from: new Date(today.setDate(today.getDate() - 1)),
      to: new Date(today.setHours(23, 59, 59, 999)),
    },
    "Past 7 days": {
      from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(now),
    },
    "Past 14 days": {
      from: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      to: new Date(now),
    },
    "Past 30 days": {
      from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(now),
    },
    "Past Quarter": {
      from: new Date(new Date().setMonth(now.getMonth() - 3)),
      to: new Date(now),
    },
    "Past Half Year": {
      from: new Date(new Date().setMonth(now.getMonth() - 6)),
      to: new Date(now),
    },
    "Past Year": {
      from: new Date(new Date().setFullYear(now.getFullYear() - 1)),
      to: new Date(now),
    },
    "All Time": {
      from: new Date(0),
      to: new Date(now),
    },
  };

  return ranges[dateRange] || ranges["Past 7 days"];
}

// Get interval for chart data based on date range
function getIntervalForDateRange(dateRange: string): "hour" | "day" | "month" {
  const intervals: Record<string, "hour" | "day" | "month"> = {
    Today: "hour",
    "Last 24 hours": "hour",
    Yesterday: "hour",
    "Past 7 days": "day",
    "Past 14 days": "day",
    "Past 30 days": "day",
    "Past Quarter": "day",
    "Past Half Year": "month",
    "Past Year": "month",
    "All Time": "month",
  };

  return intervals[dateRange] || "day";
}

// Generate chart data from followers data
function generateChartData(
  followers: {created_at: string}[],
  dateRange: {from: Date; to: Date},
  interval: "hour" | "day" | "month",
): ChartDataPoint[] {
  // Create time points based on interval
  const timePoints: Date[] = [];
  const current = new Date(dateRange.from);

  // Create formatted date buckets
  while (current <= dateRange.to) {
    timePoints.push(new Date(current));

    if (interval === "hour") current.setHours(current.getHours() + 1);
    else if (interval === "day") current.setDate(current.getDate() + 1);
    else current.setMonth(current.getMonth() + 1);
  }

  // Format dates for display
  const formatDate = (date: Date): string => {
    if (interval === "hour") {
      const hourDate = new Date(date);
      hourDate.setMinutes(0, 0, 0);
      return hourDate.toISOString();
    }
    if (interval === "day") return date.toISOString().split("T")[0];
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  // Count followers per time point
  const followerCounts = new Array(timePoints.length).fill(0);

  // Count followers in each bucket
  followers.forEach((follower) => {
    const followerDate = new Date(follower.created_at);
    for (let i = 0; i < timePoints.length - 1; i++) {
      if (followerDate >= timePoints[i] && followerDate < timePoints[i + 1]) {
        followerCounts[i]++;
        return;
      }
    }
    // Check last bucket
    if (timePoints.length > 0 && followerDate >= timePoints[timePoints.length - 1]) {
      followerCounts[timePoints.length - 1]++;
    }
  });

  // Create chart data objects
  return timePoints.map((point, index) => {
    const formattedPoint = formatDate(point);
    return {
      month: formattedPoint,
      date: formattedPoint,
      firstDate: followerCounts[index] || 0,
    };
  });
}

// Get previous date range for comparison
function getPreviousDateRange(dateRange: string, comparisonType: string): {from: Date; to: Date} {
  const currentRange = getDateRangeObject(dateRange);
  const now = new Date();

  if (comparisonType === "Previous Period") {
    const durationMs = currentRange.to.getTime() - currentRange.from.getTime();
    return {
      from: new Date(currentRange.from.getTime() - durationMs),
      to: new Date(currentRange.to.getTime() - durationMs),
    };
  }

  if (comparisonType === "Year Over Year") {
    return {
      from: new Date(new Date(currentRange.from).setFullYear(currentRange.from.getFullYear() - 1)),
      to: new Date(new Date(currentRange.to).setFullYear(currentRange.to.getFullYear() - 1)),
    };
  }

  // Default fallback
  return {
    from: new Date(now.setDate(now.getDate() - 14)),
    to: new Date(now.setDate(now.getDate() - 7)),
  };
}
