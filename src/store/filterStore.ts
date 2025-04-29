import {LucideIcon} from "lucide-react";
import {create} from "zustand";

export type FilterOption = {
  title: string;
  value?: string;
};

export type FilterType =
  | "searchInput"
  | "multiSelect"
  | "tagsSearch"
  | "numberSelect"
  | "globalSearch";

export type BaseFilter = {
  title: string;
  icon?: LucideIcon;
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

export type GlobalSearchFilter = BaseFilter & {
  type: "globalSearch";
  searchValue?: string;
};

export type NumberSelectFilter = BaseFilter & {
  type: "numberSelect";
  numberSelectProps?: {
    maxValue: number;
  };
  selectedValue?: number | number[];
};

export type Filter =
  | MultiSelectFilter
  | TagsSearchFilter
  | SearchInputFilter
  | NumberSelectFilter
  | GlobalSearchFilter;

export type SerializableBaseFilter = {
  value: string;
  type: FilterType;
  title: string;
};

export type SerializableMultiSelectFilter = SerializableBaseFilter & {
  type: "multiSelect";
  selectedOptions?: string[];
};

export type SerializableTagsSearchFilter = SerializableBaseFilter & {
  type: "tagsSearch";
  selectedTags?: string[];
};

export type SerializableSearchInputFilter = SerializableBaseFilter & {
  type: "searchInput";
  searchValue?: string;
};

export type SerializableNumberSelectFilter = SerializableBaseFilter & {
  type: "numberSelect";
  selectedValue?: number | number[];
};

export type SerializableGlobalSearchFilter = SerializableBaseFilter & {
  type: "globalSearch";
  searchValue?: string;
};

export type SerializableFilter =
  | SerializableMultiSelectFilter
  | SerializableTagsSearchFilter
  | SerializableSearchInputFilter
  | SerializableNumberSelectFilter
  | SerializableGlobalSearchFilter;

interface FilterStore {
  appliedFilters: Record<string, Filter[]>;

  // Methods for managing filters
  addFilter: (pageKey: string, filter: Filter) => void;
  removeFilter: (pageKey: string, filterValue: string) => void;
  clearFilters: (pageKey: string) => void;
  updateFilter: (pageKey: string, updatedFilter: Filter) => void;

  // Get filters for specific page
  getFiltersForPage: (pageKey: string) => Filter[];
  getSerializableFilters: (pageKey: string) => SerializableFilter[];
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

  getFiltersForPage: (pageKey: string) => {
    const filters = get().appliedFilters[pageKey];
    if (!filters) {
      // Initialize empty array for this page if it doesn't exist
      set((state) => ({
        appliedFilters: {
          ...state.appliedFilters,
          [pageKey]: [],
        },
      }));
      return [];
    }

    return filters;
  },
  getSerializableFilters: (pageKey: string) => {
    const filters = get().getFiltersForPage(pageKey);

    return filters.map((filter) => {
      // Create a basic serializable version with common properties
      const serializableFilter = {
        value: filter.value,
        type: filter.type,
        title: filter.title,
      };

      // Add type-specific properties
      if (filter.type === "multiSelect" && filter.selectedOptions) {
        return {
          ...serializableFilter,
          selectedOptions: filter.selectedOptions,
        };
      } else if (filter.type === "tagsSearch" && filter.selectedTags) {
        return {
          ...serializableFilter,
          selectedTags: filter.selectedTags,
        };
      } else if (
        (filter.type === "searchInput" || filter.type === "globalSearch") &&
        filter.searchValue
      ) {
        return {
          ...serializableFilter,
          searchValue: filter.searchValue,
        };
      } else if (filter.type === "numberSelect" && filter.selectedValue) {
        return {
          ...serializableFilter,
          selectedValue: filter.selectedValue,
        };
      }

      return serializableFilter;
    });
  },
}));
