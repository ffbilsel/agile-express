export enum IssueType {
  BUG = "BUG",
  TASK = "TASK",
  STORY = "STORY",
  EPIC = "EPIC",
}

export type Effort = {
  issueId: number;
  id: number;
  description: string;
  user: string;
  startTime: string;
  endTime: string;
};

export type Issue = {
  projectId: number;
  sprintId: number;
  id: number;
  title: string;
  description: string;
  estimatedEffort: number;
  storyPoints: number;
  issueType: IssueType;
  status: string;
  assignee: string;
  assigner: string;
  efforts: Effort[];
  issuedAt: Date;
  closedAt: Date;
};
