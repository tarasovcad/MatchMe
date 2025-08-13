"use client";

import {useInfiniteQuery} from "@tanstack/react-query";
import {SerializableFilter} from "@/store/filterStore";

interface UseInfiniteItemsProps<T> {
  type: "profiles" | "projects";
  userId: string;
  itemsPerPage: number;
  serializableFilters: SerializableFilter[];
  fetchItems: (page: number, itemsPerPage: number, filters?: SerializableFilter[]) => Promise<T[]>;
  cacheKey?: string;
}

export function useInfiniteItems<T extends {id: string}>({
  type,
  userId,
  itemsPerPage,
  serializableFilters,
  fetchItems,
  cacheKey,
}: UseInfiniteItemsProps<T>) {
  // Infinite query for items
  const infiniteKey = cacheKey ? `${type}-${cacheKey}-infinite` : `${type}-infinite`;
  const infiniteQuery = useInfiniteQuery({
    queryKey: [infiniteKey, serializableFilters],
    queryFn: async ({pageParam}) => {
      const items = await fetchItems(pageParam, itemsPerPage, serializableFilters);
      return {
        items,
        nextPage: items.length === itemsPerPage ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts if the data is stale
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
