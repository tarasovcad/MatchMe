import {PostHogDateRange} from "@/types/analytics";
import {mapDateRangeToPostHog} from "./mapDateRangeToPostHog";

export function getComparisonDateRange(
  dateRange: string,
  comparisonType: string,
): PostHogDateRange | null {
  if (comparisonType === "Previous Period") {
    switch (dateRange) {
      case "Today":
        return {
          date_from: "-1dStart", // Yesterday start
          date_to: "-1dEnd", // Yesterday end
          interval: "hour",
        };
      case "Yesterday":
        return {
          date_from: "-2dStart", // Day before yesterday start
          date_to: "-2dEnd", // Day before yesterday end
          interval: "hour",
        };
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
      case "Today":
        // Same day last year
        return {
          date_from: `${lastYear}-${now.getMonth() + 1}-${now.getDate()}`,
          interval: "hour",
        };
      case "Yesterday": {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          date_from: `${lastYear}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`,
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
