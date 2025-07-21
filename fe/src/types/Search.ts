import { Issue } from "./Issue";
import { Project } from "./Project";

export type SearchResponse = {
  searchType: "ISSUE" | "PROJECT";
  issue: Issue | null;
  project: Project | null;
};
