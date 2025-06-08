import {useQuery} from "@tanstack/react-query";

interface StatsParams {
  id: string;
  type: string;
  table: string;
}

const fetchAnalyticsVisits = async ({id, type, table}: StatsParams) => {
  const response = await fetch(`/api/analytics-visits?id=${id}&type=${type}&table=${table}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || "Failed to fetch analytics visits");
  }

  return response.json();
};

export const useAnalyticsVisits = (params: StatsParams) => {
  return useQuery({
    queryKey: ["analytics-visits", params.id, params.type, params.table],
    queryFn: () => fetchAnalyticsVisits(params),
    enabled: !!params.id && !!params.type && !!params.table,
  });
};
