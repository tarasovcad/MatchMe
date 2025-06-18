import {PostHogResponse} from "@/types/analytics";
import {normalizePostHogTimestamp} from "./analyticsDataTransformation";

// Heatmap data structure
export interface HeatmapDataPoint {
  day: string;
  dayIndex: number;
  hour: number;
  intensity: number;
}

export function transformPostHogDataToHeatmap(
  postHogResponse: PostHogResponse,
  dateRange: string,
): HeatmapDataPoint[] {
  if (!postHogResponse?.result?.[0]?.data || !Array.isArray(postHogResponse.result[0].data)) {
    return generateEmptyHeatmapData();
  }

  const seriesData = postHogResponse.result[0].data;
  const timePoints = postHogResponse.result[0].days || [];

  // Determine if this is a single day range (Today, Yesterday)
  const isSingleDayRange = ["Today", "Yesterday"].includes(dateRange);

  // Create a map to store aggregated data by day and hour
  const aggregationMap = new Map<string, number[]>();

  // Process each data point
  timePoints.forEach((timeString, index) => {
    const timestamp = new Date(normalizePostHogTimestamp(timeString));
    const dayOfWeek = timestamp.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = timestamp.getUTCHours();
    const value = seriesData[index] || 0;

    // Convert Sunday (0) to 6, and shift others down by 1 (Monday = 0, Sunday = 6)
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const key = `${dayIndex}-${hour}`;

    if (!aggregationMap.has(key)) {
      aggregationMap.set(key, []);
    }
    aggregationMap.get(key)!.push(value);
  });

  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const heatmapData: HeatmapDataPoint[] = [];

  // Generate heatmap data for each day and hour
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${dayIndex}-${hour}`;
      const values = aggregationMap.get(key) || [];

      let intensity = 0;

      if (isSingleDayRange) {
        // For single day ranges (Today, Yesterday), only show data for the actual day
        const now = new Date();
        const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1; // Convert to Monday=0 format

        if (dateRange === "Today" && dayIndex === currentDayIndex) {
          // Only show data for today
          intensity = values.length > 0 ? values[values.length - 1] : 0;
        } else if (dateRange === "Yesterday") {
          const yesterdayDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
          if (dayIndex === yesterdayDayIndex) {
            intensity = values.length > 0 ? values[values.length - 1] : 0;
          }
        }
        // All other days remain 0 for single day ranges
      } else {
        // For multi-day ranges, calculate average (среднее арифметическое)
        if (values.length > 0) {
          intensity = values.reduce((sum, val) => sum + val, 0) / values.length;
        }
      }

      heatmapData.push({
        day: days[dayIndex],
        dayIndex,
        hour,
        intensity: Math.round(intensity * 100) / 100, // Round to 2 decimal places
      });
    }
  }

  return heatmapData;
}

function generateEmptyHeatmapData(): HeatmapDataPoint[] {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const heatmapData: HeatmapDataPoint[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    for (let hour = 0; hour < 24; hour++) {
      heatmapData.push({
        day: days[dayIndex],
        dayIndex,
        hour,
        intensity: 0,
      });
    }
  }

  return heatmapData;
}
