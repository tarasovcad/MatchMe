"use client";

import {useEffect} from "react";
import {useFilterStore} from "@/store/filterStore";
import {useFilterSearchParams} from "./useFilterSearchParams";

export function useFiltersWithUrl(pageKey: string) {
  const {filtersFromUrl, updateUrlFilters} = useFilterSearchParams();
  const {
    getSerializableFilters,
    setFiltersFromUrl,
    addFilter,
    removeFilter,
    clearFilters,
    updateFilter,
    getFiltersForPage,
  } = useFilterStore();

  // Initialize filters from URL on mount
  useEffect(() => {
    if (filtersFromUrl.length > 0) {
      setFiltersFromUrl(pageKey, filtersFromUrl);
    }
  }, [pageKey, setFiltersFromUrl]);

  // Sync URL when filters change in store
  useEffect(() => {
    const currentFilters = getSerializableFilters(pageKey);

    const urlFiltersString = JSON.stringify(
      filtersFromUrl.sort((a, b) => a.value.localeCompare(b.value)),
    );
    const storeFiltersString = JSON.stringify(
      currentFilters.sort((a, b) => a.value.localeCompare(b.value)),
    );

    if (urlFiltersString !== storeFiltersString) {
      updateUrlFilters(currentFilters);
    }
  }, [getSerializableFilters(pageKey)]);

  return {
    // Filter store methods
    addFilter: (filter: Parameters<typeof addFilter>[1]) => addFilter(pageKey, filter),
    removeFilter: (filterValue: string) => removeFilter(pageKey, filterValue),
    clearFilters: () => clearFilters(pageKey),
    updateFilter: (filter: Parameters<typeof updateFilter>[1]) => updateFilter(pageKey, filter),

    // Get current filters
    getFiltersForPage: () => getFiltersForPage(pageKey),
    getSerializableFilters: () => getSerializableFilters(pageKey),
  };
}
