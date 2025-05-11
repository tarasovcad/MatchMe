import {create} from "zustand";
import {persist} from "zustand/middleware";
import {useEffect, useState} from "react";

type DashboardStore = {
  dateRange: string;
  compareDateRange: string;
  setDateRange: (range: string) => void;
  setCompareDateRange: (range: string) => void;
};

// Create the store
const useDashboardStoreBase = create<DashboardStore>()(
  persist(
    (set) => ({
      dateRange: "Today",
      compareDateRange: "Previous Period",
      setDateRange: (range) => set({dateRange: range}),
      setCompareDateRange: (range) => set({compareDateRange: range}),
    }),
    {
      name: "dashboard-storage",
    },
  ),
);

// Wrapper hook with hydration tracking
export const useDashboardStore = () => {
  const store = useDashboardStoreBase();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return {
    ...store,
    hydrated,
  };
};
