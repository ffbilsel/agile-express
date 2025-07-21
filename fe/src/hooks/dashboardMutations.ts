import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { DashboardStatistics } from "@/types/Dashboard";

export function useDashboardStatistics() {
  return useQuery<DashboardStatistics>({
    queryKey: ["dashboardStatistics"],
    queryFn: () =>
      api.get<DashboardStatistics>("/dashboard").then((res) => res.data),
  });
}
