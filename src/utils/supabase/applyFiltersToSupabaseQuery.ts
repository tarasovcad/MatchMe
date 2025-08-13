/* eslint-disable @typescript-eslint/no-explicit-any */
import {SerializableFilter} from "@/store/filterStore";

export function applyFiltersToSupabaseQuery(query: any, filters: SerializableFilter[]) {
  if (!filters || filters.length === 0) return query;

  for (const filter of filters) {
    switch (filter.type) {
      case "searchInput":
        if (filter.searchValue) {
          // For text search - adjust column name based on your schema
          query = query.ilike(filter.value, `%${filter.searchValue}%`);
        }
        break;

      case "multiSelect":
        if (filter.selectedOptions && filter.selectedOptions.length > 0) {
          if (filter.value === "age") {
            const clauses = filter.selectedOptions
              .map((opt) => {
                const [minStr, maxStr] = String(opt).split("-");
                const min = Number(minStr);
                const max = Number(maxStr);
                if (Number.isFinite(min) && Number.isFinite(max)) {
                  return `${filter.value}.gte.${min},${filter.value}.lte.${max}`;
                }
                return null;
              })
              .filter(Boolean) as string[];

            if (clauses.length > 0) {
              // Combine ranges with OR
              query = query.or(clauses.map((c) => `and(${c})`).join(","));
            }
          } else {
            // For other multi-select filters
            query = query.in(filter.value, filter.selectedOptions);
          }
        }
        break;

      case "tagsSearch":
        if (filter.selectedTags && filter.selectedTags.length > 0) {
          // For tags - assuming tags are stored in an array column
          query = query.contains(filter.value, filter.selectedTags);
        }
        break;

      case "numberSelect":
        if (filter.selectedValue !== undefined) {
          if (Array.isArray(filter.selectedValue)) {
            // Range selection [min, max]
            query = query
              .gte(filter.value, filter.selectedValue[0])
              .lte(filter.value, filter.selectedValue[1]);
          } else {
            // Single value selection
            query = query.eq(filter.value, filter.selectedValue);
          }
        }
        break;

      case "globalSearch":
        if (filter.searchValue) {
          query = query.or(
            `username.ilike.%${filter.searchValue}%,` +
              `name.ilike.%${filter.searchValue}%,` +
              `about_you.ilike.%${filter.searchValue}%,` +
              `public_current_role.ilike.%${filter.searchValue}%`,
          );
        }
        break;
    }
  }

  return query;
}
