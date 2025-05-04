export function mapDateRangeToPostHog(dateRange: string) {
  switch (dateRange) {
    case "Today":
      return {date_from: "today"};
    case "Yesterday":
      return {date_from: "yesterday"};
    case "Last 24 hours":
      return {date_from: "-24h"};
    case "Past 7 days":
      return {date_from: "-7d"};
    case "Past 14 days":
      return {date_from: "-14d"};
    case "Past 30 days":
      return {date_from: "-30d"};
    case "Past Quarter":
      return {date_from: "-90d"};
    case "Past Half Year":
      return {date_from: "-180d"};
    case "Past Year":
      return {date_from: "-365d"};
    case "All Time":
      return {date_from: "all"};
    default:
      return {date_from: "-7d"};
  }
}
