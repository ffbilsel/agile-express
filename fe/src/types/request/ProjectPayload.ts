export type ProjectCreatePayload = {
  name: string;
  manager: string;
  teamLead: string;
  teamMembers: string[];
  startDate: Date;
  endDate: Date;
  statuses: string[];
};

export type ProjectUpdatePayload = {
  projectId: number;
  name: string;
  manager: string;
  teamLead: string;
  teamMembers: string[];
  startDate: Date;
  endDate: Date;
  statuses: string[];
};
