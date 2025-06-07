import {useQuery} from "@tanstack/react-query";

interface StatsParams {
  username: string;
  dateRange: string;
  compareDateRange: string;
}

const fetchViewsStats = async ({username, dateRange, compareDateRange}: StatsParams) => {
  const response = await fetch(
    `/api/views-stats?username=${username}&dateRange=${encodeURIComponent(dateRange)}&compareDateRange=${encodeURIComponent(compareDateRange)}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || "Failed to fetch views statistics");
  }

  return response.json();
};

const fetchFollowerStats = async ({username, dateRange, compareDateRange}: StatsParams) => {
  const response = await fetch(
    `/api/follower-stats?username=${username}&dateRange=${encodeURIComponent(dateRange)}&compareDateRange=${encodeURIComponent(compareDateRange)}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || "Failed to fetch follower statistics");
  }

  return response.json();
};

const fetchUniqueVisitors = async ({username, dateRange, compareDateRange}: StatsParams) => {
  const response = await fetch(
    `/api/unique-visitors?username=${username}&dateRange=${encodeURIComponent(dateRange)}&compareDateRange=${encodeURIComponent(compareDateRange)}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || errorData.error || "Failed to fetch unique visitors statistics",
    );
  }

  return response.json();
};

const fetchProfileInteractions = async ({username, dateRange, compareDateRange}: StatsParams) => {
  const response = await fetch(
    `/api/profile-interactions?username=${username}&dateRange=${encodeURIComponent(dateRange)}&compareDateRange=${encodeURIComponent(compareDateRange)}`,
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || "Failed to fetch profile interactions");
  }

  return response.json();
};

export const useViewsStats = (params: StatsParams) => {
  return useQuery({
    queryKey: ["views-stats", params.username, params.dateRange, params.compareDateRange],
    queryFn: () => fetchViewsStats(params),
    enabled: !!params.username && !!params.dateRange && !!params.compareDateRange,
  });
};

export const useFollowerStats = (params: StatsParams) => {
  return useQuery({
    queryKey: ["follower-stats", params.username, params.dateRange, params.compareDateRange],
    queryFn: () => fetchFollowerStats(params),
    enabled: !!params.username && !!params.dateRange && !!params.compareDateRange,
  });
};

export const useUniqueVisitors = (params: StatsParams) => {
  return useQuery({
    queryKey: ["unique-visitors", params.username, params.dateRange, params.compareDateRange],
    queryFn: () => fetchUniqueVisitors(params),
    enabled: !!params.username && !!params.dateRange && !!params.compareDateRange,
  });
};
export const useProfileInteractions = (params: StatsParams) => {
  return useQuery({
    queryKey: ["profile-interactions", params.username, params.dateRange, params.compareDateRange],
    queryFn: () => fetchProfileInteractions(params),
    enabled: !!params.username && !!params.dateRange && !!params.compareDateRange,
  });
};
