"use client";

import {useQuery} from "@tanstack/react-query";
import {getNewItemsCount} from "@/actions/profiles/getNewItemsCount";

export function useNewItemsCount(table: "profiles" | "projects") {
  return useQuery({
    queryKey: ["new-items-count", table],
    queryFn: () => getNewItemsCount(table),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}
