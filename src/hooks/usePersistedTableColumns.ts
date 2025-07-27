import {useEffect, useRef, useState} from "react";

export default function usePersistedTableColumns(LS_KEY: string) {
  type StoredState = {
    columnOrder?: string[];
    columnSizing?: Record<string, number>;
    columnVisibility?: Record<string, boolean>;
  };

  // get from local storage
  const readStoredState = (): StoredState => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };
  // data from local storage
  const stored = readStoredState();

  const [columnOrder, setColumnOrder] = useState<string[]>(stored.columnOrder ?? []);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>(
    stored.columnSizing ?? {},
  );
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    stored.columnVisibility ?? {},
  );

  // debounced to avoid excessive writes.
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(() => {
      const payload: StoredState = {
        columnOrder,
        columnSizing,
        columnVisibility,
      };
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(payload));
      } catch {
        /* ignore write errors */
      }
    }, 1000);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
        saveTimeout.current = null;
      }
    };
  }, [LS_KEY, columnOrder, columnSizing, columnVisibility]);

  return {
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    columnVisibility,
    setColumnVisibility,
  };
}
