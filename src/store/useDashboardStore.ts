import {create} from "zustand";

type DashboardStore = {
  dateRange: string;
  compareDateRange: string;
  setDateRange: (range: string) => void;
  setCompareDateRange: (range: string) => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  dateRange: "Last 24 hours",
  compareDateRange: "Previous Period",
  setDateRange: (range) => set({dateRange: range}),
  setCompareDateRange: (range) => set({compareDateRange: range}),
}));
