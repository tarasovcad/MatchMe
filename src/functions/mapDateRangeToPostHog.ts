import {PostHogDateRange} from "@/types/analytics";

export function mapDateRangeToPostHog(dateRange: string): PostHogDateRange {
  switch (dateRange) {
    case "Today":
      return {
        date_from: "dStart",
        date_to: "dEnd",
        interval: "hour",
      };
    case "Yesterday":
      return {
        date_from: "-1dStart", // Start of yesterday
        date_to: "-1dEnd", // End of yesterday
        interval: "hour",
      };
    case "Past 7 days":
      return {date_from: "-7d", interval: "day"};
    case "Past 14 days":
      return {date_from: "-14d", interval: "day"};
    case "Past 30 days":
      return {date_from: "-30d", interval: "day"};
    case "Past Quarter":
      return {date_from: "-90d", interval: "day"};
    case "Past Half Year":
      return {date_from: "-180d", interval: "day"};
    case "Past Year":
      return {date_from: "-365d", interval: "day"};
    case "All Time":
      return {date_from: "all", interval: "day"};
    default:
      return {date_from: "-7d", interval: "day"};
  }
}
