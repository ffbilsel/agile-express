// hooks/sprintMutations.ts (Updated with auto-confirmation)
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useConfirmation } from "@/contexts/ConfirmationContext";
import api from "@/lib/axios";
import {
  SprintCreatePayload,
  SprintGetPayload,
  SprintUpdatePayload,
} from "@/types/request/SprintPayload";
import { Sprint } from "@/types/Sprint";
import { Issue } from "@/types/Issue";

function invalidateIssueQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  vars: {
    projectId: number;
    issueId?: number;
    sprintId?: number | null;
    sprintName?: string;
    notInvalidateIssue?: boolean;
  }
) {
  // Invalidate single issue query if issueId is provided
  if (vars.issueId && !vars.notInvalidateIssue) {
    queryClient.invalidateQueries({
      queryKey: ["issue", vars.projectId, vars.issueId],
    });
  }

  // Invalidate the specific sprint's issues query
  queryClient.invalidateQueries({
    queryKey: [
      "issues",
      vars.projectId,
      vars.sprintId ?? null,
      vars.sprintName ?? null,
    ],
  });

  // Always invalidate the "ACTIVE" sprint query to ensure board updates
  queryClient.invalidateQueries({
    queryKey: ["issues", vars.projectId, null, "ACTIVE"],
  });

  if (vars.sprintId) {
    queryClient.invalidateQueries({
      queryKey: ["issues", vars.projectId, vars.sprintId],
      exact: false,
    });
  }

  queryClient.invalidateQueries({
    queryKey: ["issues", vars.projectId],
    exact: false,
  });

  if (vars.issueId) {
    queryClient.invalidateQueries({
      queryKey: ["efforts", vars.projectId, vars.issueId],
    });
  }
}

function invalidateSprintQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId?: number
) {
  if (!projectId) return;

  // Invalidate the sprint list for this project
  queryClient.invalidateQueries({
    queryKey: ["sprints", projectId],
    exact: false, // match any variations
  });

  // Invalidate any single sprint queries for this project (regardless of optional params)
  queryClient.invalidateQueries({
    predicate: (query) =>
      Array.isArray(query.queryKey) &&
      query.queryKey[0] === "sprint" &&
      query.queryKey[1] === projectId,
  });
}

export function useCreateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SprintCreatePayload) =>
      api.post<Sprint>("/sprint/create", payload).then((res) => res.data),
    onSuccess: (_, variables) => {
      invalidateSprintQueries(queryClient, variables.projectId);
    },
  });
}

export function useUpdateSprint() {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmation();

  const mutation = useMutation({
    mutationFn: (payload: SprintUpdatePayload) =>
      api.put<Sprint>("/sprint/update", payload).then((res) => res.data),
    onSuccess: (_, variables) => {
      invalidateSprintQueries(queryClient, variables.projectId);
      invalidateIssueQueries(queryClient, variables);
    },
  });

  return {
    ...mutation,
    mutate: (
      payload: SprintUpdatePayload,
      options?: UseMutationOptions<Sprint, unknown, SprintUpdatePayload>
    ) => {
      showConfirmation({
        type: "warning",
        title: "Update Sprint",
        message: "Are you sure you want to update this sprint?",
        confirmText: "Update",
        cancelText: "Cancel",
        onConfirm: () => mutation.mutate(payload, options),
      });
    },
  };
}

export function useDeleteSprint() {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmation();

  const mutation = useMutation({
    mutationFn: (payload: SprintGetPayload) =>
      api
        .delete<void>("/sprint", {
          params: {
            projectId: payload.projectId,
            sprintId: payload.sprintId,
          },
        })
        .then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sprints", variables.projectId],
        exact: false, // match any variations
      });
    },
  });

  return {
    ...mutation,
    mutate: (
      payload: SprintGetPayload,
      options?: UseMutationOptions<void, unknown, SprintGetPayload>
    ) => {
      showConfirmation({
        type: "danger",
        title: "Delete Sprint",
        message:
          "Are you sure you want to delete this sprint? This action cannot be undone.",
        confirmText: "Delete Sprint",
        cancelText: "Cancel",
        onConfirm: () => mutation.mutate(payload, options),
      });
    },
  };
}

export function useViewSprint(
  projectId: number,
  sprintId?: number | null,
  sprintName?: string | null
) {
  return useQuery({
    queryKey: ["sprint", projectId, sprintId, sprintName],
    queryFn: () =>
      api
        .get<Sprint>("/sprint/view", {
          params: { projectId, sprintId, sprintName },
        })
        .then((res) => res.data),
    enabled: !!sprintId || !!sprintName,
  });
}

export function useViewAllSprints(projectId?: number) {
  return useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () =>
      api
        .get<Sprint[]>("/sprint/view-all", { params: { projectId } })
        .then((res) => res.data),
    enabled: !!projectId,
  });
}

export function useGetIssues(
  projectId?: number,
  sprintId?: number | null,
  sprintName?: string
) {
  const query = useQuery({
    queryKey: ["issues", projectId, sprintId, sprintName],
    queryFn: () =>
      api
        .get<Issue[]>("/sprint/issue/view-all", {
          params: {
            projectId,
            ...(sprintId !== null && { sprintId }),
            sprintName,
          },
        })
        .then((res) => res.data),
    enabled: !!projectId,
  });

  return {
    ...query,
    data: query.error ? [] : query.data || [],
  };
}
