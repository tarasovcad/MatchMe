import {LucideIcon} from "lucide-react";
import {create} from "zustand";

export type FilterOption = {
  title: string;
  value?: string;
};

export type FilterType = "searchInput" | "multiSelect" | "tagsSearch" | "numberSelect";

export type BaseFilter = {
  title: string;
  icon: LucideIcon;
  value: string;
  type: FilterType;
  showSearchInput?: boolean;
};

export type MultiSelectFilter = BaseFilter & {
  type: "multiSelect";
  options?: FilterOption[];
  selectedOptions?: string[];
};

export type TagsSearchFilter = BaseFilter & {
  type: "tagsSearch";
  options?: FilterOption[];
  selectedTags?: string[];
};

export type SearchInputFilter = BaseFilter & {
  type: "searchInput";
  searchValue?: string;
};

export type NumberSelectFilter = BaseFilter & {
  type: "numberSelect";
  numberSelectProps?: {
    maxValue: number;
  };
  selectedValue?: number;
};

export type Filter = MultiSelectFilter | TagsSearchFilter | SearchInputFilter | NumberSelectFilter;

interface FilterStore {
  appliedFilters: Record<string, Filter[]>;

  // Methods for managing filters
  addFilter: (pageKey: string, filter: Filter) => void;
  removeFilter: (pageKey: string, filterValue: string) => void;
  clearFilters: (pageKey: string) => void;
  updateFilter: (pageKey: string, updatedFilter: Filter) => void;

  // Get filters for specific page
  getFiltersForPage: (pageKey: string) => Filter[];
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  appliedFilters: {},

  addFilter: (pageKey, filter) =>
    set((state) => {
      // Create a copy of current filters for the page or initialize empty array
      const currentPageFilters = [...(state.appliedFilters[pageKey] || [])];

      // Check if filter with same value already exists
      const existingFilterIndex = currentPageFilters.findIndex((f) => f.value === filter.value);

      if (existingFilterIndex >= 0) {
        // Replace existing filter
        currentPageFilters[existingFilterIndex] = filter;
      } else {
        // Add new filter
        currentPageFilters.push(filter);
      }

      return {
        appliedFilters: {
          ...state.appliedFilters,
          [pageKey]: currentPageFilters,
        },
      };
    }),

  removeFilter: (pageKey, filterValue) =>
    set((state) => {
      // If no filters for this page, return current state
      if (!state.appliedFilters[pageKey]) return state;

      return {
        appliedFilters: {
          ...state.appliedFilters,
          [pageKey]: state.appliedFilters[pageKey].filter((f) => f.value !== filterValue),
        },
      };
    }),

  clearFilters: (pageKey) =>
    set((state) => ({
      appliedFilters: {
        ...state.appliedFilters,
        [pageKey]: [],
      },
    })),

  updateFilter: (pageKey, updatedFilter) =>
    set((state) => {
      // If no filters for this page, return current state
      if (!state.appliedFilters[pageKey]) return state;

      return {
        appliedFilters: {
          ...state.appliedFilters,
          [pageKey]: state.appliedFilters[pageKey].map((filter) =>
            filter.value === updatedFilter.value ? updatedFilter : filter,
          ),
        },
      };
    }),

  getFiltersForPage: (pageKey) => {
    return get().appliedFilters[pageKey] || [];
  },
}));
