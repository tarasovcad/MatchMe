"use client";

import {useInfiniteQuery} from "@tanstack/react-query";
import {SerializableFilter} from "@/store/filterStore";

interface UseInfiniteItemsProps<T> {
  type: "profiles" | "projects" | "open-positions";
  userId: string;
  itemsPerPage: number;
  serializableFilters: SerializableFilter[];
  fetchItems: (page: number, itemsPerPage: number, filters?: SerializableFilter[]) => Promise<T[]>;
  cacheKey?: string;
  initialData?: T[]; // Initial data from server-side rendering
  enabled?: boolean; // Control if the query should run
}

export function useInfiniteItems<T extends {id: string}>({
  type,
  userId,
  itemsPerPage,
  serializableFilters,
  fetchItems,
  cacheKey,
  initialData,
  enabled = true,
}: UseInfiniteItemsProps<T>) {
  const infiniteKey = cacheKey ? `${type}-${cacheKey}-infinite` : `${type}-infinite`;

  // Check if current filters are empty (no active filters)
  const hasActiveFilters = serializableFilters && serializableFilters.length > 0;

  const queryInitialData =
    initialData && !hasActiveFilters
      ? {
          pages: [
            {items: initialData, nextPage: initialData.length === itemsPerPage ? 2 : undefined},
          ],
          pageParams: [1],
        }
      : undefined;

  const queryKey = [
    infiniteKey,
    JSON.stringify([...serializableFilters].sort((a, b) => a.value.localeCompare(b.value))),
  ];

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam}) => {
      const items = await fetchItems(pageParam, itemsPerPage, serializableFilters);
      return {
        items,
        nextPage: items.length === itemsPerPage ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialData: queryInitialData, // Use server-side data only when no filters are active
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Fewer retries to avoid duplicate traffic
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Avoid duplicate initial fetch (especially in StrictMode)
    enabled, // Only run when ready
  });

  // Flatten items and filter out current user
  const allItems = infiniteQuery.data?.pages.flatMap((page) => page.items) || [];
  const filteredItems = allItems.filter((item) => item.id !== userId);

  return {
    items: filteredItems,
    ...infiniteQuery,
    // Provide cleaner API
    isLoadingInitial: infiniteQuery.isLoading,
    isLoadingMore: infiniteQuery.isFetchingNextPage,
    hasMore: infiniteQuery.hasNextPage,
    loadMore: infiniteQuery.fetchNextPage,
    // Expose refetch functionality
    refetch: infiniteQuery.refetch,
    // Total count across all pages
    totalItems: filteredItems.length,
  };
}
