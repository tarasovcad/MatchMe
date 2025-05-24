export function formatChartDate(date: string, dateRange: string): string {
  // Create date object with UTC time
  const dateObj = new Date(date);

  switch (dateRange) {
    case "All Time":
    case "Past Year":
    case "Past Half Year": {
      // Format as "May 2025"
      return dateObj.toLocaleString("en-US", {month: "short", year: "numeric", timeZone: "UTC"});
    }
    case "Past Quarter":
    case "Past 30 days":
    case "Past 14 days":
    case "Past 7 days": {
      // Format as "07 Apr 2025", using UTC to avoid date shifting
      return dateObj.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
    }
    case "Last 24 hours":
    case "Yesterday":
    case "Today": {
      // Format as "07 Apr 11:00", using UTC
      return dateObj.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      });
    }
    default:
      return dateObj.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
  }
}
