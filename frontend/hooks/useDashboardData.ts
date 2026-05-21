"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/store/dashboard_store";

export function useDashboardData() {
  const { overview, loading, error, fetchOverview } = useDashboardStore();

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error };
}
