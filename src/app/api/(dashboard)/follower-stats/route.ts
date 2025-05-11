import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";
import {calculateAnalyticsBadgeData} from "@/functions/analytics/calculateAnalyticsBadgeData";

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
    const currentRangeDate = getDateFromRange(dateRange);

    const {data: profileData, error: profileError} = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json(
        {error: "User profile not found", details: profileError?.message},
        {status: 404},
      );
    }

    const profileId = profileData.id;

    const {data: currentFollowersData, error: currentError} = await supabase
      .from("follows")
      .select("created_at")
      .eq("following_id", profileId)
      .gte("created_at", currentRangeDate.toISOString())
      .order("created_at", {ascending: true});

    console.log(currentFollowersData, "currentFollowersData");
    if (currentError) {
      return NextResponse.json(
        {error: "Failed to fetch followers data", details: currentError.message},
        {status: 500},
      );
    }

    const currentPeriodFollowers = currentFollowersData.length;
    const interval = getIntervalForDateRange(dateRange);
    const timePoints = generateTimePoints(dateRange, interval);

    // Group followers by time intervals for chart data
    const followersByInterval = groupFollowersByInterval(
      currentFollowersData,
      timePoints,
      interval,
    );

    // Create chart data points
    const chartData = timePoints.map((point, index) => {
      const formattedPoint = formatTimePoint(point, interval);
      return {
        month: formattedPoint,
        date: formattedPoint,
        firstDate: followersByInterval[index] || 0,
      };
    });

    // Handle comparison period if requested
    let previousPeriodFollowers = 0;
    let comparisonChartData: Array<{month: string; date: string; firstDate: number}> = [];

    if (compareDateRange !== "Disabled" && dateRange !== "All Time") {
      const previousRangeDate = getPreviousDateRange(dateRange, compareDateRange);

      // Get comparison period followers
      const {data: previousFollowersData, error: previousError} = await supabase
        .from("follows")
        .select("created_at")
        .eq("following_id", profileId)
        .gte("created_at", previousRangeDate.from.toISOString())
        .lt("created_at", previousRangeDate.to.toISOString())
        .order("created_at", {ascending: true});

      if (!previousError && previousFollowersData) {
        previousPeriodFollowers = previousFollowersData.length;

        // Generate comparison time points
        const comparisonTimePoints = generateTimePoints(
          dateRange,
          interval,
          previousRangeDate.from,
          previousRangeDate.to,
        );

        // Group comparison followers by time intervals
        const comparisonFollowersByInterval = groupFollowersByInterval(
          previousFollowersData,
          comparisonTimePoints,
          interval,
        );

        // Create comparison chart data
        comparisonChartData = comparisonTimePoints.map((point, index) => {
          const formattedPoint = formatTimePoint(point, interval);
          return {
            month: formattedPoint,
            date: formattedPoint,
            firstDate: comparisonFollowersByInterval[index] || 0,
          };
        });
      }
    }

    // Calculate badge data
    const badgeData = calculateAnalyticsBadgeData(
      currentPeriodFollowers,
      previousPeriodFollowers,
      compareDateRange,
    );

    // Merge chart data with comparison data
    const mergedChartData = chartData.map((item, index) => {
      return {
        ...item,
        secondDate: comparisonChartData[index]?.firstDate || 0,
      };
    });

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

// Simplified date helper functions
function getDateFromRange(dateRange: string): Date {
  const now = new Date();
  const dates: Record<string, Date> = {
    Today: new Date(now.setHours(0, 0, 0, 0)),
    "Last 24 hours": new Date(now.getTime() - 24 * 60 * 60 * 1000),
    Yesterday: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      return yesterday;
    })(),
    "Past 7 days": new Date(now.setDate(now.getDate() - 7)),
    "Past 14 days": new Date(now.setDate(now.getDate() - 14)),
    "Past 30 days": new Date(now.setDate(now.getDate() - 30)),
    "Past Quarter": new Date(now.setMonth(now.getMonth() - 3)),
    "Past Half Year": new Date(now.setMonth(now.getMonth() - 6)),
    "Past Year": new Date(now.setFullYear(now.getFullYear() - 1)),
    "All Time": new Date(0), // January 1, 1970
  };

  return dates[dateRange] || dates["Past 7 days"]; // Default to Past 7 days
}

// Simplified interval helper
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

  return intervals[dateRange] || "day"; // Default to day
}

// Generate time points based on date range and interval
function generateTimePoints(
  dateRange: string,
  interval: "hour" | "day" | "month",
  startDate?: Date,
  endDate?: Date,
): Date[] {
  const timePoints: Date[] = [];
  const now = new Date();
  let start = startDate || getDateFromRange(dateRange);
  let end = endDate || now;

  // Special case for Today - generate full 24 hours
  if (dateRange === "Today" && !startDate && !endDate) {
    // Start from 00:00 today
    start = new Date(now);
    start.setHours(0, 0, 0, 0);

    // End at 23:59 today
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  }

  // Special case for Yesterday - generate full 24 hours
  if (dateRange === "Yesterday" && !startDate && !endDate) {
    // Start from 00:00 yesterday
    start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    // End at 23:59 yesterday
    end = new Date(now);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
  }

  // For "All Time", limit to last 2 years
  if (dateRange === "All Time" && !startDate) {
    start = new Date(now);
    start.setFullYear(start.getFullYear() - 2);
  }

  // Add points based on interval
  const increment: Record<string, (d: Date) => void> = {
    hour: (d: Date) => d.setHours(d.getHours() + 1),
    day: (d: Date) => d.setDate(d.getDate() + 1),
    month: (d: Date) => d.setMonth(d.getMonth() + 1),
  };

  const currentPoint = new Date(start);
  while (currentPoint <= end) {
    timePoints.push(new Date(currentPoint));
    increment[interval](currentPoint);
  }

  return timePoints;
}

// Format time point for display
function formatTimePoint(date: Date, interval: "hour" | "day" | "month"): string {
  const formats: Record<string, (d: Date) => string> = {
    hour: (d: Date) => d.toISOString(),
    day: (d: Date) => d.toISOString().split("T")[0],
    month: (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
  };

  return formats[interval](date);
}

// Simplified previous date range helper
function getPreviousDateRange(dateRange: string, comparisonType: string): {from: Date; to: Date} {
  const now = new Date();
  const currentRangeDate = getDateFromRange(dateRange);

  if (comparisonType === "Previous Period") {
    const periods: Record<string, {from: Date; to: Date}> = {
      Today: (() => {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return {from: yesterday, to: yesterdayEnd};
      })(),
      "Last 24 hours": {
        from: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        to: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      Yesterday: (() => {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        twoDaysAgo.setHours(0, 0, 0, 0);
        const twoDaysAgoEnd = new Date(twoDaysAgo);
        twoDaysAgoEnd.setHours(23, 59, 59, 999);
        return {from: twoDaysAgo, to: twoDaysAgoEnd};
      })(),
      "Past 7 days": {
        from: new Date(now.setDate(now.getDate() - 14)),
        to: new Date(now.setDate(now.getDate() + 7)),
      },
      "Past 14 days": {
        from: new Date(now.setDate(now.getDate() - 28)),
        to: new Date(now.setDate(now.getDate() + 14)),
      },
      "Past 30 days": {
        from: new Date(now.setDate(now.getDate() - 60)),
        to: new Date(now.setDate(now.getDate() + 30)),
      },
    };

    if (periods[dateRange]) {
      return periods[dateRange];
    }

    // Default case - calculate based on current range
    const diffDays = (now.getTime() - currentRangeDate.getTime()) / (1000 * 60 * 60 * 24);
    const fromDate = new Date(now);
    fromDate.setDate(fromDate.getDate() - diffDays * 2);
    return {from: fromDate, to: currentRangeDate};
  }

  if (comparisonType === "Year Over Year") {
    const diffDays = (now.getTime() - currentRangeDate.getTime()) / (1000 * 60 * 60 * 24);
    const fromDate = new Date(now);
    fromDate.setFullYear(fromDate.getFullYear() - 1);
    fromDate.setDate(fromDate.getDate() - diffDays);

    const toDate = new Date(currentRangeDate);
    toDate.setFullYear(toDate.getFullYear() - 1);

    return {from: fromDate, to: toDate};
  }

  // Default fallback
  return {
    from: new Date(now.setDate(now.getDate() - 14)),
    to: new Date(now.setDate(now.getDate() - 7)),
  };
}

// Simplified follower grouping by time intervals
function groupFollowersByInterval(
  followers: {created_at: string}[],
  timePoints: Date[],
  interval: "hour" | "day" | "month",
): number[] {
  // Initialize array with zeros
  const followerCounts = new Array(timePoints.length).fill(0);

  if (timePoints.length === 0) return followerCounts;

  // Add followers to appropriate time bucket
  followers.forEach((follower) => {
    const followerDate = new Date(follower.created_at);

    // Find the right time bucket
    for (let i = 0; i < timePoints.length - 1; i++) {
      if (followerDate >= timePoints[i] && followerDate < timePoints[i + 1]) {
        followerCounts[i]++;
        return; // Once found, skip the rest
      }
    }

    // Check if follower belongs to the last bucket
    if (followerDate >= timePoints[timePoints.length - 1]) {
      followerCounts[timePoints.length - 1]++;
    }
  });

  return followerCounts;
}
