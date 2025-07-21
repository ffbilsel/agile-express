import { Project } from "@/types/Project";

export type DashboardStatistics = {
  projects: Project[];
  activeSprintCount: number;
  openIssueCount: number;
  closedIssueCount: number;
};
