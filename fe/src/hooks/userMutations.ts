import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { RoleUpdatePayload } from "@/types/request/UserPayload";
import { User } from "@/types/User";

export function useSetRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RoleUpdatePayload) =>
      api.post<string>("/user/set-role", payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
export function useGetUsers(
  projectId?: number | null,
  getAll?: boolean | null
) {
  return useQuery({
    queryKey: ["users", projectId],
    queryFn: () => {
      if (getAll) {
        return api
          .get<User[]>("/user", { params: { getAll } })
          .then((res) => res.data);
      }
      if (projectId) {
        return api
          .get<User[]>("/user", { params: { projectId } })
          .then((res) => res.data);
      }
      return api.get<User[]>("/user").then((res) => res.data);
    },
  });
}
