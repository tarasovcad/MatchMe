"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {useEffect, useState} from "react";
import {persistQueryClient} from "@tanstack/react-query-persist-client";
import {createAsyncStoragePersister} from "@tanstack/query-async-storage-persister";

// Minimal local AsyncStorage type to avoid type export issues
type LocalAsyncStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export default function QueryProvider({children}: {children: React.ReactNode}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const asyncLocalStorage: LocalAsyncStorage = {
      getItem: async (key: string) => window.localStorage.getItem(key),
      setItem: async (key: string, value: string) => {
        window.localStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        window.localStorage.removeItem(key);
      },
    };

    const persister = createAsyncStoragePersister({
      storage: asyncLocalStorage,
      key: "matchme-react-query",
      throttleTime: 1000,
    });

    persistQueryClient({
      queryClient,
      persister,
      maxAge: 2 * 24 * 60 * 60 * 1000,
      buster: "v1",
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          const key = query.queryKey as unknown as (string | number | boolean | null | undefined)[];
          // Persist ONLY unread-count queries
          return Array.isArray(key) && key.includes("unread-count");
        },
      },
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
    </QueryClientProvider>
  );
}
