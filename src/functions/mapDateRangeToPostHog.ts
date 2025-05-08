import {PostHogDateRange} from "@/types/analytics";

export function mapDateRangeToPostHog(dateRange: string): PostHogDateRange {
  switch (dateRange) {
    case "Today": {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();
      return {
        date_from: todayISOString,

        interval: "hour",
      };
    }
    case "Yesterday": {
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
