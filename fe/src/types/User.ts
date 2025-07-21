export enum UserRole {
  ADMIN = "ADMIN",
  PROJECT_MANAGER = "PROJECT_MANAGER",
  TEAM_LEAD = "TEAM_LEAD",
  TEAM_MEMBER = "TEAM_MEMBER",
}

export type User = {
  username: string;
  role: UserRole;
};
