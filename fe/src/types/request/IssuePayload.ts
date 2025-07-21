import { IssueType } from "@/types/Issue";

export type IssueCreatePayload = {
  projectId: number;
  sprintId: number;
  title: string;
  description: string;
  status: string;
  storyPoints: number;
  estimatedEffort: number;
  issueType: IssueType;
  assignee: string;
};

export type IssueUpdatePayload = {
  projectId: number;
  newSprintId: number;
  issueId: number;
  title: string;
  description: string;
  status: string;
  storyPoints: number;
  estimatedEffort: number;
  issueType: IssueType;
  assignee: string;
};

export type EffortCreatePayload = {
  projectId: number;
  issueId: number;
  description: string;
  startTime: Date;
  endTime: Date;
};

export type EffortUpdatePayload = {
  projectId: number;
  issueId: number;
  effortId: number;
  description: string;
  startTime: Date;
  endTime: Date;
};

export type EffortDeletePayload = {
  projectId: number;
  issueId: number;
  effortId: number;
};
