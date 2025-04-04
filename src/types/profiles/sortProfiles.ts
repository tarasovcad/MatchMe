interface SortProfilesOptions {
  field: string | null;
  direction: "asc" | "desc" | null;
}

interface FilterAgeRange {
  min: number | null;
  max: number | null;
}

interface FilterProfileOptions {
  age: FilterAgeRange;
  skills: string[];
  languages: string[];
}

export interface ProfileQueryParams {
  sort: SortProfilesOptions;
  filters: FilterProfileOptions;
}
