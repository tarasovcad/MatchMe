type ChartDataPoint = {
  month: string;
  date: string;
  firstDate: number;
  secondDate?: number;
};

export function transformFollowerDataForChart(
  followsData: Array<{id: string; created_at: string}>,
  startDate: string,
  endDate: string,
  granularity: "hour" | "day" | "month",
) {
  const chartData: ChartDataPoint[] = [];
  const timePoints: Date[] = [];
  let formattedDate: string = "";

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (granularity === "hour") {
    // Generate 24 hour points for the start date
    for (let i = 0; i < 24; i++) {
      const point = new Date(start);
      point.setUTCHours(i, 0, 0, 0);
      timePoints.push(point);
    }
  } else if (granularity === "day") {
    // Generate daily points from start to end date
    const currentDate = new Date(start);
    while (currentDate < end) {
      timePoints.push(new Date(currentDate));
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
  } else if (granularity === "month") {
    // Generate monthly points from start to end date
    const currentDate = new Date(start);
    currentDate.setUTCDate(1); // Set to first day of the month
    currentDate.setUTCHours(0, 0, 0, 0);

    while (currentDate < end) {
      timePoints.push(new Date(currentDate));
      // Move to first day of next month
      currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
    }
  }

  // Count followers for each time point
  timePoints.forEach((timePoint, index) => {
    const nextTimePoint = index < timePoints.length - 1 ? timePoints[index + 1] : end;

    // Count followers in this time period
    const followersInPeriod = followsData.filter((follow) => {
      const followDate = new Date(follow.created_at);
      return followDate >= timePoint && followDate < nextTimePoint;
    }).length;

    // Format the date based on granularity
    if (granularity === "hour") {
      formattedDate = timePoint.toISOString().slice(0, 13) + ":00:00.000Z";
    } else if (granularity === "day") {
      formattedDate = timePoint.toISOString().slice(0, 10) + "T00:00:00.000Z";
    } else if (granularity === "month") {
      formattedDate = timePoint.toISOString().slice(0, 7) + "-01T00:00:00.000Z";
    }

    chartData.push({
      month: formattedDate,
      date: formattedDate,
      firstDate: followersInPeriod,
    });
  });

  return chartData;
}

// Function to determine chart granularity based on date range
export function getChartGranularity(dateRange: string): "hour" | "day" | "month" {
  switch (dateRange) {
    case "Today":
    case "Yesterday":
    case "Last 24 hours":
      return "hour";
    case "Past 7 days":
    case "Past 14 days":
    case "Past 30 days":
      return "day";
    default:
      return "month";
  }
}

export function getDateRange(range: string, profileCreatedAt: string) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  switch (range) {
    case "Today":
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
    case "Yesterday": {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday.toISOString(),
        end: today.toISOString(),
      };
    }

    case "Last 24 hours": {
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: last24Hours.toISOString(),
        end: now.toISOString(),
      };
    }

    case "Past 7 days": {
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: sevenDaysAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "Past 14 days": {
      const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      return {
        start: fourteenDaysAgo.toISOString(),
        end: now.toISOString(),
      };
    }

    case "Past 30 days": {
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: thirtyDaysAgo.toISOString(),
        end: now.toISOString(),
      };
    }

    case "Past Quarter": {
      const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      return {
        start: quarterAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "Past Half Year": {
      const halfYearAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
      return {
        start: halfYearAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "Past Year": {
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      return {
        start: yearAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "All Time":
      return {
        start: new Date(profileCreatedAt).toISOString(),
        end: now.toISOString(),
      };

    default:
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
  }
}
