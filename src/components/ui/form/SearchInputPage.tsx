import React, {useEffect, useRef, useState} from "react";
import SimpleInput from "./SimpleInput";
import {useFilterStore} from "@/store/filterStore";
import {Search} from "lucide-react";

const SearchInputPage = ({
  pageKey,
  loading,
}: {
  pageKey: string;
  loading: {initial: boolean; more: boolean};
}) => {
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [debouncedValue, setDebouncedValue] = useState("");
  const {addFilter, removeFilter, getFiltersForPage} = useFilterStore();

  useEffect(() => {
    const currentFilters = getFiltersForPage(pageKey);
    const searchFilter = currentFilters.find((f) => f.type === "searchInput");
    if (searchFilter?.searchValue) {
      setSearchValue(searchFilter.searchValue);
      setDebouncedValue(searchFilter.searchValue);
    }
  }, []);

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
        type: "globalSearch",
        value: "search",
        title: "Search",
        searchValue: debouncedValue,
      });
    }
  }, [debouncedValue]);

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
      placeholder={loading.initial ? "Loading..." : "Search..."}
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
