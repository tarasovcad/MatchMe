import React, {useEffect, useRef, useState} from "react";
import SimpleInput from "./SimpleInput";
import {useFilterStore} from "@/store/filterStore";
import {Search} from "lucide-react";
import type {FilterType} from "@/store/filterStore";

const SearchInputPage = ({
  pageKey,
  loading,
  searchPlaceholder = "Search...",
  searchFilterType = "globalSearch",
}: {
  pageKey: string;
  loading: {initial: boolean; more: boolean};
  searchPlaceholder?: string;
  searchFilterType?: FilterType;
}) => {
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [debouncedValue, setDebouncedValue] = useState("");
  const {addFilter, removeFilter, getFiltersForPage} = useFilterStore();
  const pageFilters = useFilterStore((state) => state.appliedFilters[pageKey]);

  // Initialize from store and react to page/store changes
  useEffect(() => {
    const currentFilters = getFiltersForPage(pageKey);
    const searchFilter = currentFilters.find(
      (f) =>
        (f.type === "globalSearch" ||
          f.type === "searchInput" ||
          f.type === "openPositionsSearch") &&
        f.value === "search",
    ) as {searchValue?: string} | undefined;

    const initial = searchFilter?.searchValue || "";
    setSearchValue(initial);
    setDebouncedValue(initial);
  }, [pageKey, pageFilters, getFiltersForPage]);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Update filter when debounced value changes
  useEffect(() => {
    if (debouncedValue === "") {
      removeFilter(pageKey, "search");
    } else {
      addFilter(pageKey, {
        type: searchFilterType,
        value: "search",
        title: "Search",
        searchValue: debouncedValue,
        icon: Search,
        showInFilterBtn: false,
      });
    }
  }, [debouncedValue, pageKey, addFilter, removeFilter, searchFilterType]);

  const handleClearInput = () => {
    setSearchValue("");
    setDebouncedValue("");
    removeFilter(pageKey, "search");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <SimpleInput
      placeholder={loading.initial ? "Loading..." : searchPlaceholder}
      type="search"
      id="search"
      search={!loading.initial}
      loading={loading.initial}
      loadingPlacement="left"
      value={searchValue}
      ref={inputRef}
      onChange={(e) => setSearchValue(e.target.value)}
      onClear={handleClearInput}
      showClearButton={searchValue !== ""}
    />
  );
};

export default SearchInputPage;
