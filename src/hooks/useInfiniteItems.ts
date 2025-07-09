"use client";

import {useInfiniteQuery, useQuery} from "@tanstack/react-query";
import {SerializableFilter} from "@/store/filterStore";

interface UseInfiniteItemsProps<T> {
  type: "profiles" | "projects";
  userId: string;
  itemsPerPage: number;
  serializableFilters: SerializableFilter[];
  fetchItems: (page: number, itemsPerPage: number, filters?: SerializableFilter[]) => Promise<T[]>;
  fetchUserFavorites?: (userId: string) => Promise<string[]>;
}

export function useInfiniteItems<T extends {id: string}>({
  type,
  userId,
  itemsPerPage,
  serializableFilters,
  fetchItems,
  fetchUserFavorites,
}: UseInfiniteItemsProps<T>) {
  // Fetch user favorites

  const {data: favorites = []} = useQuery({
    queryKey: [`${type}-favorites`, userId],
    queryFn: () => fetchUserFavorites!(userId),
    enabled: !!userId && !!fetchUserFavorites,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry failed requests 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Create favorites set for quick lookup
  const favoritesSet = new Set(favorites);

  // Infinite query for items
  const infiniteQuery = useInfiniteQuery({
    queryKey: [`${type}-infinite`, serializableFilters],
    queryFn: async ({pageParam}) => {
      const start = Date.now();
      const items = await fetchItems(pageParam, itemsPerPage, serializableFilters);
      const end = Date.now();
      console.log(`Fetch ${type} page ${pageParam} took ${end - start}ms`);
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
    refetchOnMount: false, // Don't refetch when component mounts if data exists
  });

  // Flatten all items from pages and add favorite status
  const allItems = infiniteQuery.data?.pages.flatMap((page) => page.items) || [];
  const itemsWithFavorites = allItems
    .filter((item) => item.id !== userId) // Filter out current user
    .map((item) => ({
      ...item,
      isFavorite: favoritesSet.has(item.id),
    }));

  return {
    items: itemsWithFavorites,
    ...infiniteQuery,
    // Provide cleaner API
    isLoadingInitial: infiniteQuery.isLoading,
    isLoadingMore: infiniteQuery.isFetchingNextPage,
    hasMore: infiniteQuery.hasNextPage,
    loadMore: infiniteQuery.fetchNextPage,
    // Expose refetch functionality
    refetch: infiniteQuery.refetch,
    // Total count across all pages
    totalItems: itemsWithFavorites.length,
  };
}
