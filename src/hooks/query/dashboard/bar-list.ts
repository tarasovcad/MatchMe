import {useQuery} from "@tanstack/react-query";

interface StatsParams {
  id: string;
  type: string;
  table: string;
}

const fetchBarList = async ({id, type, table}: StatsParams) => {
  const response = await fetch(`/api/bar-list?id=${id}&type=${type}&table=${table}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || "Failed to fetch bar list");
  }

  return response.json();
};

export const useBarList = (params: StatsParams) => {
  return useQuery({
    queryKey: ["bar-list", params.id, params.type, params.table],
    queryFn: () => fetchBarList(params),
    enabled: !!params.id && !!params.type && !!params.table,
  });
};
