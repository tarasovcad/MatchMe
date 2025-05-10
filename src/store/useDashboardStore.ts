import {create} from "zustand";
import {persist} from "zustand/middleware";

type DashboardStore = {
  dateRange: string;
  compareDateRange: string;
  setDateRange: (range: string) => void;
  setCompareDateRange: (range: string) => void;
};

export const useDashboardStore = create<DashboardStore>()(
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
