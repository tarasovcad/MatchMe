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

  // Subscribe to just this page's filters so we can detect store changes
  const pageFilters = useFilterStore((state) => state.appliedFilters[pageKey]);

  // Always reflect URL -> Store (including clearing when URL has no filters)
  useEffect(() => {
    setFiltersFromUrl(pageKey, filtersFromUrl);
  }, [pageKey, filtersFromUrl, setFiltersFromUrl]);

  // Store -> URL (only when different to avoid echo loops)
  useEffect(() => {
    const currentStoreFilters = getSerializableFilters(pageKey);

    const sortByValue = <T extends {value: string}>(arr: T[]) =>
      [...arr].sort((a, b) => a.value.localeCompare(b.value));

    const urlStr = JSON.stringify(sortByValue(filtersFromUrl));
    const storeStr = JSON.stringify(sortByValue(currentStoreFilters));

    if (urlStr !== storeStr) {
      updateUrlFilters(currentStoreFilters);
    }
  }, [pageKey, pageFilters, filtersFromUrl, getSerializableFilters, updateUrlFilters]);

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
