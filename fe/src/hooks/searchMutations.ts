import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { SearchResponse } from "@/types/Search";

export interface SearchParams {
  projectName?: string;
  title?: string;
  description?: string;
  issueType?: string;
  statusName?: string;
  userName?: string;
}

export function useSearch() {
  return useMutation({
    mutationFn: (params: SearchParams) =>
      api
        .get<SearchResponse[]>("/search", {
          params: params,
        })
        .then((res) => res.data),
  });
}
