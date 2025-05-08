import {PostHogDateRange} from "@/types/analytics";
import {mapDateRangeToPostHog} from "@/functions/mapDateRangeToPostHog";

export function getComparisonDateRange(
  dateRange: string,
  comparisonType: string,
): PostHogDateRange | null {
  if (comparisonType === "Previous Period") {
    switch (dateRange) {
      case "Today": {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayISOString = yesterday.toISOString();
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        const yesterdayEndISOString = yesterdayEnd.toISOString();
        return {
          date_from: yesterdayISOString,
          date_to: yesterdayEndISOString,
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
      case "Past 7 days":
        return {date_from: "-14d", date_to: "-8d", interval: "day"};
      case "Past 14 days":
        return {date_from: "-28d", date_to: "-15d", interval: "day"};
      case "Past 30 days":
        return {date_from: "-60d", date_to: "-31d", interval: "day"};
      case "Past Quarter":
        return {date_from: "-180d", date_to: "-91d", interval: "day"};
      case "Past Half Year":
        return {date_from: "-360d", date_to: "-181d", interval: "day"};
      case "Past Year":
        return {date_from: "-730d", date_to: "-366d", interval: "day"};
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
      default:
        return null;
    }
  }

  return null;
}
