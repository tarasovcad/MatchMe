import {PostHogDateRange} from "@/types/analytics";

export function mapDateRangeToPostHog(dateRange: string): PostHogDateRange {
  // Get current UTC timestamp
  const now = new Date();
  const utcNow = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds(),
    ),
  );

  switch (dateRange) {
    case "Today": {
      const utcToday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
      );

      return {
        date_from: utcToday.toISOString(),
        interval: "hour",
      };
    }
    case "24 hours": {
      return {
        date_from: "-1d",
        interval: "hour",
      };
    }
    case "Yesterday": {
      const utcYesterday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0, 0),
      );

      const utcYesterdayEnd = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 23, 59, 59, 999),
      );

      return {
        date_from: utcYesterday.toISOString(),
        date_to: utcYesterdayEnd.toISOString(),
        interval: "hour",
      };
    }
    case "Past 7 days": {
      const sevenDaysAgo = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7, 0, 0, 0, 0),
      );
      return {
        date_from: sevenDaysAgo.toISOString(),
        date_to: utcNow.toISOString(),
        interval: "day",
      };
    }
    case "Past 14 days": {
      const fourteenDaysAgo = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 14, 0, 0, 0, 0),
      );
      return {
        date_from: fourteenDaysAgo.toISOString(),
        date_to: utcNow.toISOString(),
        interval: "day",
      };
    }
    case "Past 30 days": {
      const thirtyDaysAgo = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30, 0, 0, 0, 0),
      );
      return {
        date_from: thirtyDaysAgo.toISOString(),
        date_to: utcNow.toISOString(),
        interval: "day",
      };
    }
    case "Past Quarter":
      return {date_from: "-90d", interval: "day"};
    case "Past Half Year":
      return {date_from: "-180d", interval: "month"};
    case "Past Year":
      return {date_from: "-365d", interval: "month"};
    case "All Time":
      return {date_from: "all", interval: "month"};
    default:
      return {date_from: "-7d", interval: "day"};
  }
}
