interface AnalyticsBadgeData {
  percentageChange: number;
  changeType: "positive" | "negative" | "neutral";
  shouldShowBadge: boolean;
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
