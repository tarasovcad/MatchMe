import {ChartConfig} from "@/components/shadcn/chart";

export type ChangeType = "positive" | "negative" | "neutral";

export interface AnalyticsCardItem {
  title: string;
  number: number;
  type?: ChangeType;
  analyticsNumber?: number;
  shouldShowBadge?: boolean;
  tooltipData?: {
    metricName: string;
    currentValue: number;
    previousValue: number;
  };
  chartData?: unknown[];
  chartConfig?: ChartConfig;
}

export interface AnalyticsCardListProps {
  data: AnalyticsCardItem[];
  badgeDisplayment?: "top" | "bottom";
  className?: string;
  cardClassName?: string;
  displayInGraph?: boolean;
  selectedMetric?: string;
  setSelectedMetric?: (metric: string) => void;
}

export interface PostHogDateRange {
  date_from: string;
  date_to?: string;
  interval: "hour" | "day" | "week" | "month";
}

export interface SupabaseDateRange {
  date_from: string;
  date_to?: string;
  interval: "hour" | "day" | "week" | "month";
}

export interface PostHogProperty {
  key: string;
  value: string;
  type: "event";
  operator?: "exact" | "contains";
}

export interface PostHogEvent {
  id: string;
  name: string;
  type: string;
  math: string;
  properties: PostHogProperty[];
}

export interface PostHogRequestBody {
  events: PostHogEvent[];
  interval?: string;
  date_from: string;
  date_to?: string;
}

export interface PostHogResultData {
  data: number[];
  labels: string[];
  days: string[];
  count: number;
  label: string;
  filter: Record<string, unknown>;
  breakdown_value?: string;
  action: {
    days: string[];
    id: string;
    type: string;
    order: number;
    name: string;
    custom_name: string | null;
    math: string;
    math_property: string | null;
    math_hogql: string | null;
    math_group_type_index: number | null;
    properties: Record<string, unknown>;
  };
}

export interface PostHogResponse {
  result: PostHogResultData[];
  timezone: string;
  last_refresh: string;
  is_cached: boolean;
  query_method: string;
  timings: Array<{k: string; t: number}>;
  next: string | null;
}

export interface ChartDataPoint {
  month: string;
  date: string;
  firstDate: number;
}

export interface MetricData {
  total: number;
  previousPeriod: number;
  percentageChange: number;
  changeType: ChangeType;
  shouldShowBadge: boolean;
  chartData: ChartDataPoint[];
}
