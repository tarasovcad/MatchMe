interface AnalyticsTooltipData {
  metricName: string;
  currentValue: number;
  previousValue: number;
  percentageChange: number;
  changeType: "positive" | "negative" | "neutral";
}

export function getAnalyticsTooltipMessage({
  metricName,
  currentValue,
  previousValue,
  percentageChange,
  changeType,
}: AnalyticsTooltipData): string {
  const changeWord =
    changeType === "positive"
      ? "increased"
      : changeType === "negative"
        ? "decreased"
        : "remained unchanged";

  if (changeType === "neutral") {
    return `${metricName}: No change from previous period (${currentValue})`;
  }

  return `${metricName}: ${changeWord} by ${percentageChange}%, to ${currentValue} from ${previousValue}`;
}
