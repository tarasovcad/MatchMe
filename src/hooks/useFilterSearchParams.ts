"use client";

import {useSearchParams, useRouter, usePathname} from "next/navigation";
import {useCallback, useMemo} from "react";
import {SerializableFilter} from "@/store/filterStore";

export function useFilterSearchParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Convert URL search params to SerializableFilter format
  const filtersFromUrl = useMemo((): SerializableFilter[] => {
    const filters: SerializableFilter[] = [];

    searchParams.forEach((value, key) => {
      if (!value) return;

      switch (key) {
        case "search":
          filters.push({
            value: "search",
            type: "globalSearch",
            title: "Search",
            searchValue: value,
          });
          break;

        case "skills":
          filters.push({
            value: "skills",
            type: "tagsSearch",
            title: "Skills",
            selectedTags: value.split(",").filter(Boolean),
          });
          break;

        case "public_current_role":
          filters.push({
            value: "public_current_role",
            type: "searchInput",
            title: "Current Role",
            searchValue: value,
          });
          break;

        case "looking_for":
        case "seniority_level":
        case "time_commitment":
        case "age":
        case "location":
        case "languages":
          filters.push({
            value: key,
            type: "multiSelect",
            title: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            selectedOptions: value.split(",").filter(Boolean),
          });
          break;

        default:
          // Generic multiSelect for other filters
          filters.push({
            value: key,
            type: "multiSelect",
            title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
            selectedOptions: value.split(",").filter(Boolean),
          });
          break;
      }
    });

    return filters;
  }, [searchParams]);

  // Update URL with new filters
  const updateUrlFilters = useCallback(
    (filters: SerializableFilter[]) => {
      const params = new URLSearchParams();

      filters.forEach((filter) => {
        switch (filter.type) {
          case "globalSearch":
            if (filter.searchValue) {
              params.set("search", filter.searchValue);
            }
            break;

          case "searchInput":
            if (filter.searchValue) {
              params.set(filter.value, filter.searchValue);
            }
            break;

          case "tagsSearch":
            if (filter.selectedTags?.length) {
              params.set(filter.value, filter.selectedTags.join(","));
            }
            break;

          case "multiSelect":
            if (filter.selectedOptions?.length) {
              params.set(filter.value, filter.selectedOptions.join(","));
            }
            break;

          case "numberSelect":
            if (filter.selectedValue) {
              if (Array.isArray(filter.selectedValue)) {
                params.set(filter.value, filter.selectedValue.join("-"));
              } else {
                params.set(filter.value, filter.selectedValue.toString());
              }
            }
            break;
        }
      });

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl, {scroll: false});
    },
    [router, pathname],
  );

  return {
    filtersFromUrl,
    updateUrlFilters,
  };
}
