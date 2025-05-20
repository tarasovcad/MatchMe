import {PostHogDateRange} from "@/types/analytics";
import {mapDateRangeToPostHog} from "@/functions/mapDateRangeToPostHog";

export function getComparisonDateRange(
  dateRange: string,
  comparisonType: string,
): PostHogDateRange | null {
  if (comparisonType === "Previous Period") {
    switch (dateRange) {
      case "Today": {
        const now = new Date();
        const yesterday = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0, 0),
        );
        const yesterdayEnd = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 23, 59, 59, 999),
        );
        return {
          date_from: yesterday.toISOString(),
          date_to: yesterdayEnd.toISOString(),
          interval: "hour",
        };
      }
      case "Yesterday": {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        twoDaysAgo.setHours(0, 0, 0, 0);
        const twoDaysAgoISOString = twoDaysAgo.toISOString();
        const twoDaysAgoEnd = new Date(twoDaysAgo);
        twoDaysAgoEnd.setHours(23, 59, 59, 999);
        const twoDaysAgoEndISOString = twoDaysAgoEnd.toISOString();
        return {
          date_from: twoDaysAgoISOString,
          date_to: twoDaysAgoEndISOString,
          interval: "hour",
        };
      }
      case "Past 7 days": {
        const now = new Date();
        const twoWeeksAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 14, 0, 0, 0, 0),
        );
        const oneWeekAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7, 0, 0, 0, 0),
        );
        return {
          date_from: twoWeeksAgo.toISOString(),
          date_to: oneWeekAgo.toISOString(),
          interval: "day",
        };
      }
      case "Past 14 days": {
        const now = new Date();
        const fourWeeksAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 28, 0, 0, 0, 0),
        );
        const twoWeeksAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 14, 0, 0, 0, 0),
        );
        return {
          date_from: fourWeeksAgo.toISOString(),
          date_to: twoWeeksAgo.toISOString(),
          interval: "day",
        };
      }
      case "Past 30 days": {
        const now = new Date();
        const sixtyDaysAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 60, 0, 0, 0, 0),
        );
        const thirtyDaysAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30, 0, 0, 0, 0),
        );
        return {
          date_from: sixtyDaysAgo.toISOString(),
          date_to: thirtyDaysAgo.toISOString(),
          interval: "day",
        };
      }
      case "Past Quarter": {
        const now = new Date();
        const sixMonthsAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, now.getUTCDate(), 0, 0, 0, 0),
        );
        const threeMonthsAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, now.getUTCDate(), 0, 0, 0, 0),
        );
        return {
          date_from: sixMonthsAgo.toISOString(),
          date_to: threeMonthsAgo.toISOString(),
          interval: "day",
        };
      }
      case "Past Half Year": {
        const now = new Date();
        const oneYearAgo = new Date(
          Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
        );
        const sixMonthsAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, now.getUTCDate(), 0, 0, 0, 0),
        );
        return {
          date_from: oneYearAgo.toISOString(),
          date_to: sixMonthsAgo.toISOString(),
          interval: "month",
        };
      }
      case "Past Year": {
        const now = new Date();
        const twoYearsAgo = new Date(
          Date.UTC(now.getUTCFullYear() - 2, now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
        );
        const oneYearAgo = new Date(
          Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
        );
        return {
          date_from: twoYearsAgo.toISOString(),
          date_to: oneYearAgo.toISOString(),
          interval: "month",
        };
      }
      case "Last 24 hours": {
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

        return {
          date_from: twoDaysAgo.toISOString(),
          date_to: oneDayAgo.toISOString(),
          interval: "hour",
        };
      }
      default:
        return {date_from: "-14d", date_to: "-8d", interval: "day"};
    }
  } else if (comparisonType === "Year Over Year") {
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    switch (dateRange) {
      case "Today": {
        // Same day last year
        const lastYearToday = new Date();
        lastYearToday.setFullYear(lastYear);
        lastYearToday.setHours(0, 0, 0, 0);
        const lastYearTodayISOString = lastYearToday.toISOString();
        const lastYearTodayEnd = new Date(lastYearToday);
        lastYearTodayEnd.setHours(23, 59, 59, 999);
        const lastYearTodayEndISOString = lastYearTodayEnd.toISOString();
        return {
          date_from: lastYearTodayISOString,
          date_to: lastYearTodayEndISOString,
          interval: "hour",
        };
      }
      case "Yesterday": {
        const lastYearYesterday = new Date();
        lastYearYesterday.setFullYear(lastYear);
        lastYearYesterday.setDate(lastYearYesterday.getDate() - 1);
        lastYearYesterday.setHours(0, 0, 0, 0);
        const lastYearYesterdayISOString = lastYearYesterday.toISOString();
        const lastYearYesterdayEnd = new Date(lastYearYesterday);
        lastYearYesterdayEnd.setHours(23, 59, 59, 999);
        const lastYearYesterdayEndISOString = lastYearYesterdayEnd.toISOString();
        return {
          date_from: lastYearYesterdayISOString,
          date_to: lastYearYesterdayEndISOString,
          interval: "hour",
        };
      }
      case "Past 7 days":
      case "Past 14 days":
      case "Past 30 days":
      case "Past Quarter":
      case "Past Half Year":
        // Same period but a year ago
        return {
          date_from: `-1y${mapDateRangeToPostHog(dateRange).date_from}`,
          interval: mapDateRangeToPostHog(dateRange).interval,
        };
      case "Past Year":
        // Previous year
        return {
          date_from: `-2y-365d`,
          interval: "day",
        };
      case "Last 24 hours": {
        // Same 24 hour period but a year ago
        const now = new Date();
        const oneYearAgo = new Date(now.getTime());
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const twentyFourHoursAgo = new Date(oneYearAgo.getTime() - 24 * 60 * 60 * 1000);

        return {
          date_from: twentyFourHoursAgo.toISOString(),
          date_to: oneYearAgo.toISOString(),
          interval: "hour",
        };
      }
      default:
        return null;
    }
  }

  return null;
}
