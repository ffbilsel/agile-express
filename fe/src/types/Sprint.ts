import { Issue } from "./Issue";

export enum SprintStatus {
  ACTIVE = "ACTIVE",
  PLANNED = "PLANNED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELLED",
  BACKLOG = "BACKLOG",
}

export type Sprint = {
  projectId: number;
  id: number;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  issues: Issue[];
};

export type OverdueSprint = {
  projectId: number;
  id: number;
  overdue: number;
};
