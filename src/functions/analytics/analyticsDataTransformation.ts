import {PostHogResponse} from "@/types/analytics";
import {formatLanguageLabel, isLanguageCode} from "@/utils/other/languageMapping";

type ChartDataPoint = {
  month: string;
  date: string;
  firstDate: number;
  secondDate?: number;
};
interface AnalyticsBadgeData {
  percentageChange: number;
  changeType: "positive" | "negative" | "neutral";
  shouldShowBadge: boolean;
}

export function transformSupabaseDataForChart(
  followsData: Array<{id: string; created_at: string}>,
  startDate: string,
  endDate: string,
  granularity: "hour" | "day" | "month",
  comparisonFollowsData?: Array<{id: string; created_at: string}>,
  comparisonStartDate?: string,
  comparisonEndDate?: string,
) {
  const chartData: ChartDataPoint[] = [];
  const timePoints: Date[] = [];
  let formattedDate: string = "";

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (granularity === "hour") {
    // Check if this is a "Last 24 hours" type range (spans across dates)
    const isLast24Hours =
      start.getUTCDate() !== end.getUTCDate() || start.getUTCMonth() !== end.getUTCMonth();

    if (isLast24Hours) {
      // Generate hourly points from start to end time
      const currentTime = new Date(start);
      currentTime.setUTCMinutes(0, 0, 0); // Round down to the hour

      while (currentTime < end) {
        timePoints.push(new Date(currentTime));
        currentTime.setUTCHours(currentTime.getUTCHours() + 1);
      }
    } else {
      // Generate 24 hour points for the start date (for Today/Yesterday)
      for (let i = 0; i < 24; i++) {
        const point = new Date(start);
        point.setUTCHours(i, 0, 0, 0);
        timePoints.push(point);
      }
    }
  } else if (granularity === "day") {
    // Generate daily points from start to end date
    const currentDate = new Date(start);
    while (currentDate < end) {
      timePoints.push(new Date(currentDate));
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
  } else if (granularity === "month") {
    // Generate monthly points from start to end date
    const currentDate = new Date(start);
    currentDate.setUTCDate(1); // Set to first day of the month
    currentDate.setUTCHours(0, 0, 0, 0);

    while (currentDate < end) {
      timePoints.push(new Date(currentDate));
      // Move to first day of next month
      currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
    }
  }

  // Count followers for each time point
  timePoints.forEach((timePoint, index) => {
    const nextTimePoint = index < timePoints.length - 1 ? timePoints[index + 1] : end;

    // Count followers in this time period
    const followersInPeriod = followsData.filter((follow) => {
      const followDate = new Date(follow.created_at);
      return followDate >= timePoint && followDate < nextTimePoint;
    }).length;

    // Count comparison followers if comparison data is provided
    let comparisonFollowersInPeriod = 0;
    if (comparisonFollowsData && comparisonStartDate && comparisonEndDate) {
      const comparisonStart = new Date(comparisonStartDate);
      const comparisonEnd = new Date(comparisonEndDate);

      // Calculate the equivalent time point in the comparison period
      const timeDiff = timePoint.getTime() - start.getTime();
      const comparisonTimePoint = new Date(comparisonStart.getTime() + timeDiff);
      const comparisonNextTimePoint =
        index < timePoints.length - 1
          ? new Date(comparisonStart.getTime() + (nextTimePoint.getTime() - start.getTime()))
          : comparisonEnd;

      comparisonFollowersInPeriod = comparisonFollowsData.filter((follow) => {
        const followDate = new Date(follow.created_at);
        return followDate >= comparisonTimePoint && followDate < comparisonNextTimePoint;
      }).length;
    }

    // Format the date based on granularity
    if (granularity === "hour") {
      formattedDate = timePoint.toISOString().slice(0, 13) + ":00:00.000Z";
    } else if (granularity === "day") {
      formattedDate = timePoint.toISOString().slice(0, 10) + "T00:00:00.000Z";
    } else if (granularity === "month") {
      formattedDate = timePoint.toISOString().slice(0, 7) + "-01T00:00:00.000Z";
    }

    const dataPoint: ChartDataPoint = {
      month: formattedDate,
      date: formattedDate,
      firstDate: followersInPeriod,
    };

    // Add comparison data if available
    if (comparisonFollowsData) {
      dataPoint.secondDate = comparisonFollowersInPeriod;
    }

    chartData.push(dataPoint);
  });

  return chartData;
}

// Function to determine chart granularity based on date range
export function getChartGranularity(dateRange: string): "hour" | "day" | "month" {
  switch (dateRange) {
    case "Today":
    case "Yesterday":
    case "Last 24 hours":
      return "hour";
    case "Past 7 days":
    case "Past 14 days":
    case "Past 30 days":
      return "day";
    default:
      return "month";
  }
}

export function getDateRange(range: string, profileCreatedAt: string) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  switch (range) {
    case "Today":
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
    case "Yesterday": {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday.toISOString(),
        end: today.toISOString(),
      };
    }

    case "Last 24 hours": {
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: last24Hours.toISOString(),
        end: now.toISOString(),
      };
    }

    case "Past 7 days": {
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        start: sevenDaysAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "Past 14 days": {
      const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      return {
        start: fourteenDaysAgo.toISOString(),
        end: now.toISOString(),
      };
    }

    case "Past 30 days": {
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        start: thirtyDaysAgo.toISOString(),
        end: now.toISOString(),
      };
    }

    case "Past Quarter": {
      const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      return {
        start: quarterAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "Past Half Year": {
      const halfYearAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
      return {
        start: halfYearAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "Past Year": {
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      return {
        start: yearAgo.toISOString(),
        end: now.toISOString(),
      };
    }
    case "All Time":
      return {
        start: new Date(profileCreatedAt).toISOString(),
        end: now.toISOString(),
      };

    default:
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
  }
}

export function getComparisonDateRange(
  dateRange: string,
  compareDateRange: string,
  profileCreatedAt: string,
): {start: string; end: string} {
  if (compareDateRange === "Previous Period") {
    const currentRange = getDateRange(dateRange, profileCreatedAt);
    const currentStart = new Date(currentRange.start);
    const currentEnd = new Date(currentRange.end);
    const duration = currentEnd.getTime() - currentStart.getTime();

    const compareEnd = new Date(currentStart.getTime());
    const compareStart = new Date(currentStart.getTime() - duration);

    return {
      start: compareStart.toISOString(),
      end: compareEnd.toISOString(),
    };
  }

  if (compareDateRange === "Year over year") {
    const currentRange = getDateRange(dateRange, profileCreatedAt);
    const currentStart = new Date(currentRange.start);
    const currentEnd = new Date(currentRange.end);

    // Go back exactly one year
    const compareStart = new Date(currentStart);
    compareStart.setUTCFullYear(compareStart.getUTCFullYear() - 1);

    const compareEnd = new Date(currentEnd);
    compareEnd.setUTCFullYear(compareEnd.getUTCFullYear() - 1);

    return {
      start: compareStart.toISOString(),
      end: compareEnd.toISOString(),
    };
  }

  return getDateRange(dateRange, profileCreatedAt);
}

export function getPreviousPeriodDate(currentDate: string, dateRange: string): string {
  const date = new Date(currentDate);

  switch (dateRange) {
    case "Today":
    case "Yesterday":
    case "Last 24 hours":
      return new Date(date.getTime() - 24 * 60 * 60 * 1000).toISOString();

    case "Past 7 days":
      return new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    case "Past 14 days":
      return new Date(date.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

    case "Past 30 days":
      return new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    case "Past Quarter":
      return new Date(date.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

    case "Past Half Year":
      return new Date(date.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();

    case "Past Year":
      return new Date(date.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();

    default:
      return new Date(date.getTime() - 24 * 60 * 60 * 1000).toISOString();
  }
}

export function calculateAnalyticsBadgeData(
  currentPeriodViews: number,
  previousPeriodViews: number,
  compareDateRange: string,
): AnalyticsBadgeData {
  let percentageChange = 0;
  let changeType: "positive" | "negative" | "neutral" = "neutral";
  let shouldShowBadge = true;

  // Don't show badge if comparison is disabled
  if (compareDateRange === "Disabled") {
    shouldShowBadge = false;
  }
  // Don't show badge if there's no previous period data
  else if (previousPeriodViews === 0) {
    shouldShowBadge = false;
  }
  // Calculate percentage change if we have previous period data
  else if (previousPeriodViews > 0) {
    percentageChange = Math.round(
      ((currentPeriodViews - previousPeriodViews) / previousPeriodViews) * 100,
    );
    changeType = percentageChange > 0 ? "positive" : percentageChange < 0 ? "negative" : "neutral";
  }

  return {
    percentageChange: Math.abs(percentageChange),
    changeType,
    shouldShowBadge,
  };
}

// POSTHOG UTILS

export function normalizePostHogTimestamp(timestamp: string): string {
  // If timestamp doesn't end with 'Z' or have timezone info, treat as UTC
  if (!timestamp.includes("Z") && !timestamp.includes("+") && !timestamp.includes("-", 10)) {
    return timestamp.replace(" ", "T") + "Z";
  }
  return timestamp;
}

export function mapDateRangeToPostHog(dateRange: string, profileCreatedAt: string) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  switch (dateRange) {
    case "Today": {
      const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1); // Add 24 hours minus 1ms
      return {
        date_from: today.toISOString(),
        date_to: endOfToday.toISOString(),
      };
    }
    case "Yesterday": {
      // Add 24 hours minus 1ms
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000 - 1);
      return {
        date_from: yesterday.toISOString(),
        date_to: today.toISOString(),
      };
    }
    case "Last 24 hours": {
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return {
        date_from: last24Hours.toISOString(),
        date_to: now.toISOString(),
      };
    }
    case "Past 7 days": {
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        date_from: sevenDaysAgo.toISOString(),
        date_to: now.toISOString(),
      };
    }
    case "Past 14 days": {
      const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      return {
        date_from: fourteenDaysAgo.toISOString(),
        date_to: now.toISOString(),
      };
    }
    case "Past 30 days": {
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        date_from: thirtyDaysAgo.toISOString(),
        date_to: now.toISOString(),
      };
    }
    case "Past Quarter": {
      const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      return {
        date_from: quarterAgo.toISOString(),
        date_to: now.toISOString(),
      };
    }
    case "Past Half Year": {
      const halfYearAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
      return {
        date_from: halfYearAgo.toISOString(),
        date_to: now.toISOString(),
      };
    }
    case "Past Year": {
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      return {
        date_from: yearAgo.toISOString(),
        date_to: now.toISOString(),
      };
    }
    case "All Time":
      return {
        date_from: new Date(profileCreatedAt).toISOString(),
        date_to: now.toISOString(),
      };
    default: {
      const defaultStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        date_from: defaultStart.toISOString(),
        date_to: now.toISOString(),
      };
    }
  }
}

export function getComparisonDateRangeForPostHog(
  dateRange: string,
  compareDateRange: string,
  profileCreatedAt: string,
): {date_from: string; date_to: string} {
  if (compareDateRange === "Previous Period") {
    const currentRange = mapDateRangeToPostHog(dateRange, profileCreatedAt);
    const currentStart = new Date(currentRange.date_from);
    const currentEnd = new Date(currentRange.date_to);
    const duration = currentEnd.getTime() - currentStart.getTime();

    const compareEnd = new Date(currentStart.getTime());
    const compareStart = new Date(currentStart.getTime() - duration);

    return {
      date_from: compareStart.toISOString(),
      date_to: compareEnd.toISOString(),
    };
  }

  if (compareDateRange === "Year over year") {
    const currentRange = mapDateRangeToPostHog(dateRange, profileCreatedAt);
    const currentStart = new Date(currentRange.date_from);
    const currentEnd = new Date(currentRange.date_to);

    // Go back exactly one year
    const compareStart = new Date(currentStart);
    compareStart.setUTCFullYear(compareStart.getUTCFullYear() - 1);

    const compareEnd = new Date(currentEnd);
    compareEnd.setUTCFullYear(compareEnd.getUTCFullYear() - 1);

    return {
      date_from: compareStart.toISOString(),
      date_to: compareEnd.toISOString(),
    };
  }

  // Default fallback
  return mapDateRangeToPostHog(dateRange, profileCreatedAt);
}

export function transformPostHogDataWithComparison(
  currentData: PostHogResponse,
  comparisonData?: PostHogResponse,
): ChartDataPoint[] {
  if (!currentData.result?.[0]?.data || !Array.isArray(currentData.result[0].data)) {
    return [];
  }

  const currentSeriesData = currentData.result[0].data;
  const currentTimePoints = currentData.result[0].days || [];

  return currentTimePoints.map((timeString, index) => {
    const normalizedTimeString = normalizePostHogTimestamp(timeString);

    const dataPoint: ChartDataPoint = {
      month: normalizedTimeString,
      date: normalizedTimeString,
      firstDate: currentSeriesData[index] || 0,
    };

    // Add comparison data if available
    if (comparisonData?.result?.[0]?.data && Array.isArray(comparisonData.result[0].data)) {
      const comparisonSeriesData = comparisonData.result[0].data;
      dataPoint.secondDate = comparisonSeriesData[index] || 0;
    }

    return dataPoint;
  });
}

export interface TransformedItem {
  label: string;
  count: number;
  percentage: number; // of total views
  relative: number; // 0-100, scaled to the max
  flag?: string; // Optional flag URL for countries
  image?: string; // Optional image URL for favicons or other icons
}

export function transformCountsForAnalytics(
  rawCounts: Record<string, number>,
  type: string,
): TransformedItem[] {
  const chartColorTypes = ["age_distribution", "pronoun_counts"];

  if (!rawCounts || Object.keys(rawCounts).length === 0) return [];
  const total = Object.values(rawCounts).reduce((sum, count) => sum + count, 0);
  const maxCount = Math.max(...Object.values(rawCounts));
  return Object.entries(rawCounts)
    .map(([key, count]) => ({
      label: key,
      count: count,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
      relative: parseFloat(((count / maxCount) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count)
    .map((item, index) => ({
      ...item,
      fill: chartColorTypes.includes(type) ? `hsl(var(--chart-${index + 1}))` : undefined,
    }));
}

export function transformPostHogDemographicsData(
  postHogResponse: PostHogResponse,
  type?: string,
): TransformedItem[] {
  if (!postHogResponse?.result || !Array.isArray(postHogResponse.result)) {
    return [];
  }

  // Extract counts from each result item
  const demographicCounts: Record<string, number> = {};

  postHogResponse.result.forEach((item) => {
    if (item.breakdown_value && typeof item.count === "number") {
      demographicCounts[item.breakdown_value] = item.count;
    }
  });

  // If no valid data found, return empty array
  if (Object.keys(demographicCounts).length === 0) {
    return [];
  }

  // Calculate totals and transform data
  const total = Object.values(demographicCounts).reduce((sum, count) => sum + count, 0);
  const maxCount = Math.max(...Object.values(demographicCounts));

  return Object.entries(demographicCounts)
    .map(([label, count]) => {
      // Format labels based on type
      let displayLabel = label;
      let image: string | null = null;

      if (type === "Languages" && isLanguageCode(label)) {
        displayLabel = formatLanguageLabel(label);
      } else if (type === "Timezones") {
        displayLabel = formatTimezoneWithOffset(label);
      } else if (type === "Referrers") {
        displayLabel = transformReferrerLabel(label);
        image = getFaviconUrl(label);
      } else if (type === "Browser") {
        image = getBrowserIcon(label);
      } else if (type === "OS") {
        image = getOSIcon(label);
      } else if (type === "Device type") {
        image = getDeviceIcon(label);
      }

      const transformedItem: TransformedItem = {
        label: displayLabel,
        count,
        percentage: parseFloat(((count / total) * 100).toFixed(1)),
        relative: parseFloat(((count / maxCount) * 100).toFixed(1)),
      };

      // Add image if available
      if (image) {
        transformedItem.image = image;
      }

      return transformedItem;
    })
    .sort((a, b) => b.count - a.count);
}

// Server-side function to fetch country flag
export async function fetchCountryFlag(countryName: string): Promise<string | null> {
  if (!countryName) return null;

  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`,
    );

    if (!res.ok) {
      console.warn(`Failed to fetch country flag for ${countryName}: ${res.status}`);
      return null;
    }

    const data = await res.json();

    if (data && data.length > 0) {
      return data[0].flags.svg;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching country flag for ${countryName}:`, error);
    return null;
  }
}

// Function to format timezone with UTC offset
export function formatTimezoneWithOffset(timezone: string): string {
  try {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      timeZoneName: "longOffset",
    });

    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((part) => part.type === "timeZoneName");

    if (offsetPart && offsetPart.value) {
      // Convert from GMT+X format to UTC+X format
      const offset = offsetPart.value.replace("GMT", "UTC");
      return `${timezone} (${offset})`;
    }

    const utcDate = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
    const tzDate = new Date(now.toLocaleString("en-US", {timeZone: timezone}));
    const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;

    const sign = offsetMinutes >= 0 ? "+" : "-";
    const formattedOffset =
      offsetMins > 0
        ? `UTC${sign}${offsetHours}:${offsetMins.toString().padStart(2, "0")}`
        : `UTC${sign}${offsetHours}`;

    return `${timezone} (${formattedOffset})`;
  } catch (error) {
    console.error(`Error formatting timezone ${timezone}:`, error);
    return timezone;
  }
}

export function extractCountryName(label: string, type: string): string | null {
  switch (type) {
    case "Counties":
      return label;
    case "Regions":
    case "Cities": {
      // Extract country from "Country - Region/City" format
      const parts = label.split(" - ");
      return parts.length > 1 ? parts[0] : null;
    }
    default:
      return null;
  }
}

// Function to get favicon URL for a referrer domain
export function getFaviconUrl(referrer: string): string | null {
  if (!referrer) {
    return null;
  }

  // Special case for direct traffic - return a special identifier
  if (referrer === "$direct" || referrer === "Direct/unknown") {
    return "direct-traffic-icon";
  }

  try {
    // Handle cases where referrer might not have protocol
    let url = referrer;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  } catch (error) {
    console.error(`Error getting favicon for referrer ${referrer}:`, error);
    return null;
  }
}

// Function to transform referrer labels
export function transformReferrerLabel(referrer: string): string {
  if (referrer === "$direct") {
    return "Direct/unknown";
  }

  // For other referrers, try to extract domain name for cleaner display
  if (referrer && referrer.startsWith("http")) {
    try {
      const url = new URL(referrer);
      return url.hostname.replace("www.", "");
    } catch (error) {
      return referrer;
    }
  }

  return referrer;
}

// Function to get browser icon based on browser name
export function getBrowserIcon(browserName: string): string | null {
  if (!browserName) return null;

  const browserMap: Record<string, string> = {
    // Chrome variants
    Chrome: "/images/browser/chrome.png",
    "Chrome Mobile": "/images/browser/chrome.png",
    "Chrome Mobile iOS": "/images/browser/crios.png",
    "Chrome Mobile WebView": "/images/browser/chromium-webview.png",
    Chromium: "/images/browser/chrome.png",

    // Firefox variants
    Firefox: "/images/browser/firefox.png",
    "Firefox Mobile": "/images/browser/firefox.png",
    "Firefox iOS": "/images/browser/fxios.png",

    // Safari variants
    Safari: "/images/browser/safari.png",
    "Mobile Safari": "/images/browser/safari.png",
    "Safari Mobile": "/images/browser/safari.png",

    // Edge variants
    Edge: "/images/browser/edge.png",
    "Edge Mobile": "/images/browser/edge.png",
    "Edge Chromium": "/images/browser/edge-chromium.png",
    "Edge iOS": "/images/browser/edge-ios.png",

    // Opera variants
    Opera: "/images/browser/opera.png",
    "Opera Mini": "/images/browser/opera-mini.png",
    "Opera Mobile": "/images/browser/opera.png",

    // Samsung Internet
    "Samsung Internet": "/images/browser/samsung.png",
    "Samsung Browser": "/images/browser/samsung.png",

    // Other browsers
    "Internet Explorer": "/images/browser/ie.png",
    IE: "/images/browser/ie.png",
    Brave: "/images/browser/brave.png",
    "Yandex Browser": "/images/browser/yandexbrowser.png",
    Silk: "/images/browser/silk.png",
    "MIUI Browser": "/images/browser/miui.png",
    Facebook: "/images/browser/facebook.png",
    Instagram: "/images/browser/instagram.png",
    KakaoTalk: "/images/browser/kakaotalk.png",
    AOL: "/images/browser/aol.png",
    "Beaker Browser": "/images/browser/beaker.png",
    BlackBerry: "/images/browser/blackberry.png",
    cURL: "/images/browser/curl.png",
    Searchbot: "/images/browser/searchbot.png",

    // WebView variants
    "Android WebView": "/images/browser/android-webview.png",
    "iOS WebView": "/images/browser/ios-webview.png",
    WebView: "/images/browser/android-webview.png",
  };

  // Try exact match first
  if (browserMap[browserName]) {
    return browserMap[browserName];
  }

  // Try partial matches for common browsers
  const lowerBrowser = browserName.toLowerCase();
  if (lowerBrowser.includes("chrome")) return "/images/browser/chrome.png";
  if (lowerBrowser.includes("firefox")) return "/images/browser/firefox.png";
  if (lowerBrowser.includes("safari")) return "/images/browser/safari.png";
  if (lowerBrowser.includes("edge")) return "/images/browser/edge.png";
  if (lowerBrowser.includes("opera")) return "/images/browser/opera.png";
  if (lowerBrowser.includes("samsung")) return "/images/browser/samsung.png";
  if (lowerBrowser.includes("brave")) return "/images/browser/brave.png";

  return null;
}

// Function to get OS icon based on OS name
export function getOSIcon(osName: string): string | null {
  if (!osName) return null;

  const osMap: Record<string, string> = {
    // Windows variants
    Windows: "/images/os/windows-10.png",
    "Windows 11": "/images/os/windows-11.png",
    "Windows 10": "/images/os/windows-10.png",
    "Windows 8.1": "/images/os/windows-8-1.png",
    "Windows 8": "/images/os/windows-8.png",
    "Windows 7": "/images/os/windows-7.png",
    "Windows Vista": "/images/os/windows-vista.png",
    "Windows XP": "/images/os/windows-xp.png",
    "Windows 2000": "/images/os/windows-2000.png",
    "Windows 98": "/images/os/windows-98.png",
    "Windows 95": "/images/os/windows-95.png",
    "Windows 3.11": "/images/os/windows-3-11.png",
    "Windows ME": "/images/os/windows-me.png",
    "Windows Mobile": "/images/os/windows-mobile.png",
    "Windows Server 2003": "/images/os/windows-server-2003.png",

    // macOS variants
    macOS: "/images/os/mac-os.png",
    "Mac OS": "/images/os/mac-os.png",
    "Mac OS X": "/images/os/mac-os.png",
    "OS X": "/images/os/mac-os.png",

    // iOS variants
    iOS: "/images/os/ios.png",
    "iPhone OS": "/images/os/ios.png",
    iPadOS: "/images/os/ios.png",

    // Android variants
    Android: "/images/os/android-os.png",
    "Android OS": "/images/os/android-os.png",

    // Linux variants
    Linux: "/images/os/linux.png",
    Ubuntu: "/images/os/linux.png",
    Debian: "/images/os/linux.png",
    "Red Hat": "/images/os/linux.png",
    CentOS: "/images/os/linux.png",
    Fedora: "/images/os/linux.png",
    SUSE: "/images/os/linux.png",

    // Chrome OS
    "Chrome OS": "/images/os/chrome-os.png",
    ChromeOS: "/images/os/chrome-os.png",

    // Other OS
    "BlackBerry OS": "/images/os/blackberry-os.png",
    BlackBerry: "/images/os/blackberry-os.png",
    "Amazon OS": "/images/os/amazon-os.png",
    "Fire OS": "/images/os/amazon-os.png",
    BeOS: "/images/os/beos.png",
    QNX: "/images/os/qnx.png",
    SunOS: "/images/os/sun-os.png",
    Solaris: "/images/os/sun-os.png",
    OpenBSD: "/images/os/open-bsd.png",
    "OS/2": "/images/os/os-2.png",
  };

  // Try exact match first
  if (osMap[osName]) {
    return osMap[osName];
  }

  // Try partial matches for common OS
  const lowerOS = osName.toLowerCase();
  if (lowerOS.includes("windows")) return "/images/os/windows-10.png";
  if (lowerOS.includes("mac") || lowerOS.includes("osx")) return "/images/os/mac-os.png";
  if (lowerOS.includes("ios") || lowerOS.includes("iphone") || lowerOS.includes("ipad"))
    return "/images/os/ios.png";
  if (lowerOS.includes("android")) return "/images/os/android-os.png";
  if (lowerOS.includes("linux") || lowerOS.includes("ubuntu") || lowerOS.includes("debian"))
    return "/images/os/linux.png";
  if (lowerOS.includes("chrome")) return "/images/os/chrome-os.png";
  if (lowerOS.includes("blackberry")) return "/images/os/blackberry-os.png";

  return null;
}

// Function to get device icon based on device type
export function getDeviceIcon(deviceType: string): string | null {
  if (!deviceType) return null;

  const deviceMap: Record<string, string> = {
    Desktop: "/images/device/desktop.png",
    Mobile: "/images/device/mobile.png",
    Tablet: "/images/device/tablet.png",
    Phone: "/images/device/mobile.png",
    Laptop: "/images/device/desktop.png",
  };

  if (deviceMap[deviceType]) {
    return deviceMap[deviceType];
  } else {
    return null;
  }
}
