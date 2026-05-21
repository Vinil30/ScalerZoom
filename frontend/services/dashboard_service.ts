import { apiGet } from "@/services/api";
import type { DashboardOverview } from "@/types/api";

export const dashboardService = {
  getOverview() {
    return apiGet<DashboardOverview>("/dashboard/overview");
  },
};
