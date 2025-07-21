export type Project = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  teamLeadUsername: string;
  managerUsername: string;
  teamMemberUsernames: string[];
  backlogId: number;
  sprintIds: number[];
  statuses: string[];
};
