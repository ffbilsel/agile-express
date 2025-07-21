import { SprintStatus } from "../Sprint";

export type SprintGetPayload = {
  projectId: number;
  sprintId: number;
};

export type SprintCreatePayload = {
  projectId: number;
  startDate: Date;
  endDate: Date;
};

export type SprintUpdatePayload = {
  projectId: number;
  sprintId: number;
  status: SprintStatus | null;
  startDate: Date;
  endDate: Date;
};
