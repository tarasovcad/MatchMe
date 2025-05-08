import {ChartDataPoint, PostHogResponse} from "@/types/analytics";

export function transformPostHogData(data: PostHogResponse, dateRange?: string): ChartDataPoint[] {
  if (!data.result?.[0]?.data || !Array.isArray(data.result[0].data)) {
    return [];
  }

  const seriesData = data.result[0].data;
  const timePoints = data.result[0].days || [];

  return timePoints.map((timeString, index) => {
    return {
      month: timeString,
      date: timeString,
      firstDate: seriesData[index] || 0,
    };
  });
}
