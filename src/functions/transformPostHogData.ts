import {ChartDataPoint, PostHogResponse} from "@/types/analytics";

export function transformPostHogData(data: PostHogResponse, dateRange?: string): ChartDataPoint[] {
  if (!data.result?.[0]?.data || !Array.isArray(data.result[0].data)) {
    return [];
  }

  const seriesData = data.result[0].data;
  const timePoints = data.result[0].days || []; // Use days array for time points
  const isHourly = data.result[0].filter.interval === "hour";

  if (dateRange === "Today" || dateRange === "Yesterday") {
    const today = new Date();

    // Create an array of 24 hours in the user's local timezone
    const completeHourlyData: ChartDataPoint[] = [];

    // Start from midnight (00:00) in user's local timezone
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    // Create entry for each hour
    for (let hour = 0; hour < 24; hour++) {
      const hourDate = new Date(startOfDay);
      hourDate.setHours(hour);

      // Find if we have data for this hour
      const matchingTimeIndex = timePoints.findIndex((timeString) => {
        const utcDate = new Date(timeString);
        const localDate = new Date(utcDate.getTime());
        return localDate.getHours() === hour;
      });

      const value = matchingTimeIndex !== -1 ? seriesData[matchingTimeIndex] : 0;

      completeHourlyData.push({
        month: hourDate.toLocaleString("en-US", {hour: "2-digit", minute: "2-digit"}),
        date: hourDate.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        firstDate: value,
      });
    }

    return completeHourlyData;
  }

  // For other date ranges, convert UTC to local time and format accordingly
  return timePoints.map((timeString, index) => {
    // Parse the UTC date string
    const utcDate = new Date(`${timeString}T12:00:00Z`);

    // Convert to local time (browser's timezone)
    const localTime = new Date(utcDate.getTime());

    // Format the label based on whether it's hourly or daily data
    const formattedLabel = isHourly
      ? localTime.toLocaleString("en-US", {hour: "2-digit", minute: "2-digit"})
      : localTime.toLocaleString("en-US", {month: "short", day: "numeric"});

    // More detailed date format for tooltip
    const formattedDate = localTime.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      month: formattedLabel,
      date: formattedDate,
      firstDate: seriesData[index] || 0,
    };
  });
}
