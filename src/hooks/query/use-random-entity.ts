"use client";

import {useMutation} from "@tanstack/react-query";
import {supabase} from "@/utils/supabase/client";

export type RandomWhereFilter = {
  column: string;
  op?: "eq" | "neq";
  value: unknown;
};

export type UseRandomEntityOptions<TRow extends Record<string, unknown>> = {
  table: string;
  selectColumns: readonly (keyof TRow & string)[];
  where?: readonly RandomWhereFilter[];
  buildHref: (row: Readonly<TRow>) => string;
};

type WhereCapable = {
  eq: (column: string, value: unknown) => unknown;
  neq: (column: string, value: unknown) => unknown;
};

function applyWhereFilters(
  query: WhereCapable,
  where: readonly RandomWhereFilter[] | undefined,
): WhereCapable {
  if (!where || where.length === 0) return query;
  let filtered: WhereCapable = query;
  for (const f of where) {
    const op = f.op ?? "eq";
    filtered = (
      op === "eq" ? filtered.eq(f.column, f.value) : filtered.neq(f.column, f.value)
    ) as WhereCapable;
  }
  return filtered;
}

export function useRandomEntity<TRow extends Record<string, unknown>>(
  options: UseRandomEntityOptions<TRow>,
) {
  const {table, selectColumns, where, buildHref} = options;

  const whereKey = where ? JSON.stringify(where) : "";
  const selectKey = (selectColumns as readonly string[]).join(",");

  return useMutation<{href: string; row: Readonly<TRow>}, Error, void>({
    mutationKey: ["random-entity", table, whereKey, selectKey],
    mutationFn: async () => {
      // Count matching rows
      const countQueryRaw = supabase.from(table).select("id", {count: "exact", head: true});
      const countQuery = applyWhereFilters(
        countQueryRaw as unknown as WhereCapable,
        where,
      ) as unknown as typeof countQueryRaw;

      const countRes = (await countQuery) as unknown as {count?: number; error?: unknown};
      if (countRes.error) throw countRes.error as Error;
      const total = countRes.count ?? 0;
      if (total === 0) throw new Error("No matching rows found");

      const offset = Math.floor(Math.random() * total);

      // Fetch the single random row
      const dataQueryRaw = supabase
        .from(table)
        .select((selectColumns as readonly string[]).join(", "))
        .range(offset, offset);
      const dataQuery = applyWhereFilters(
        dataQueryRaw as unknown as WhereCapable,
        where,
      ) as unknown as typeof dataQueryRaw;

      const res = (await dataQuery) as unknown as {data?: unknown; error?: unknown};
      if (res.error) throw res.error as Error;
      const dataArr = res.data as unknown[] | undefined;
      const row = (dataArr?.[0] ?? undefined) as Readonly<TRow> | undefined;
      if (!row) throw new Error("No matching rows found");

      return {href: buildHref(row), row};
    },
  });
}
