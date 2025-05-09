export function getPreviousPeriodDate(date: string, dateRange: string): string {
  const currentDate = new Date(date);

  switch (dateRange) {
    case "Today":
    case "Last 24 hours": {
      // Subtract 1 day
      currentDate.setDate(currentDate.getDate() - 1);
      return currentDate.toISOString();
    }
    case "Yesterday": {
      // Subtract 1 day
      currentDate.setDate(currentDate.getDate() - 1);
      return currentDate.toISOString();
    }
    case "Past 7 days": {
      // Subtract 7 days
      currentDate.setDate(currentDate.getDate() - 7);
      return currentDate.toISOString();
    }
    case "Past 14 days": {
      // Subtract 14 days
      currentDate.setDate(currentDate.getDate() - 14);
      return currentDate.toISOString();
    }
    case "Past 30 days": {
      // Subtract 30 days
      currentDate.setDate(currentDate.getDate() - 30);
      return currentDate.toISOString();
    }
    case "Past Quarter": {
      // Subtract 90 days
      currentDate.setDate(currentDate.getDate() - 90);
      return currentDate.toISOString();
    }
    case "Past Half Year": {
      // Subtract 6 months
      currentDate.setMonth(currentDate.getMonth() - 6);
      return currentDate.toISOString();
    }
    case "Past Year": {
      // Subtract 1 year
      currentDate.setFullYear(currentDate.getFullYear() - 1);
      return currentDate.toISOString();
    }
    case "All Time": {
      // Subtract 1 month for all time comparison
      currentDate.setMonth(currentDate.getMonth() - 1);
      return currentDate.toISOString();
    }
    default:
      return currentDate.toISOString();
  }
}
