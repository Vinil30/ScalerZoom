"use client";

import { create } from "zustand";
import { dashboardService } from "@/services/dashboard_service";
import type { DashboardOverview } from "@/types/api";

interface DashboardState {
  overview: DashboardOverview | null;
  loading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  overview: null,
  loading: true,
  error: null,
  fetchOverview: async () => {
    set({ loading: true, error: null });
    try {
      const overview = await dashboardService.getOverview();
      set({ overview, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load dashboard.", loading: false });
    }
  },
}));
