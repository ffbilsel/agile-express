import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useConfirmation } from "@/contexts/ConfirmationContext";
import api from "@/lib/axios";
import {
  EffortCreatePayload,
  EffortDeletePayload,
  IssueCreatePayload,
  EffortUpdatePayload,
  IssueUpdatePayload,
} from "@/types/request/IssuePayload";
import { Effort, Issue } from "@/types/Issue";

/**
 * Invalidate both the single issue and the issue list for the sprint.
 * This robust approach ensures all related queries are refreshed.
 */
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
  projectId: number | undefined
) {
  if (!projectId) return;
  queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: IssueCreatePayload & {
        sprintId?: number | null;
        sprintName?: string;
      }
    ) => api.post<Issue>("/issue/create", payload).then((res) => res.data),
    onSuccess: (_, variables) => {
      invalidateIssueQueries(queryClient, variables);
      invalidateSprintQueries(queryClient, variables.projectId);
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmation();

  const mutation = useMutation({
    mutationFn: (
      payload: IssueUpdatePayload & {
        sprintId?: number | null;
        sprintName?: string;
      }
    ) => api.put<Issue>("/issue/update", payload).then((res) => res.data),
    onSuccess: (_, variables) => {
      invalidateIssueQueries(queryClient, variables);
      invalidateSprintQueries(queryClient, variables.projectId);
    },
  });

  return {
    ...mutation,
    mutate: (
      payload: IssueUpdatePayload & {
        sprintId?: number | null;
        sprintName?: string;
      },
      options?: {
        onSuccess?: (data: any, variables: any, context: any) => void;
        onError?: (error: any, variables: any, context: any) => void;
      }
    ) => {
      showConfirmation({
        type: "warning",
        title: "Update Issue",
        message: "Are you sure you want to update this issue?",
        confirmText: "Update",
        cancelText: "Cancel",
        onConfirm: () => {
          mutation.mutate(payload, {
            onSuccess: (data, vars, context) => {
              options?.onSuccess?.(data, vars, context);
            },
            onError: (error, vars, context) => {
              options?.onError?.(error, vars, context);
            },
          });
        },
      });
    },
  };
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmation();

  const mutation = useMutation({
    mutationFn: ({
      issueId,
    }: {
      projectId: number;
      issueId: number;
      sprintId?: number | null;
      sprintName?: string;
    }) => api.delete("/issue", { params: { issueId } }).then((res) => res.data),
    onSuccess: (_, variables) => {
      invalidateIssueQueries(queryClient, {
        ...variables,
        notInvalidateIssue: true,
      });
      invalidateSprintQueries(queryClient, variables.projectId);
    },
  });

  return {
    ...mutation,
    mutate: (
      variables: {
        projectId: number;
        issueId: number;
        sprintId?: number | null;
        sprintName?: string;
      },
      options?: {
        onSuccess?: (data: any, variables: any, context: any) => void;
        onError?: (error: any, variables: any, context: any) => void;
      }
    ) => {
      showConfirmation({
        type: "danger",
        title: "Delete Issue",
        message:
          "Are you sure you want to delete this issue? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        onConfirm: () => {
          mutation.mutate(variables, {
            onSuccess: (data, vars, context) => {
              options?.onSuccess?.(data, vars, context);
            },
            onError: (error, vars, context) => {
              options?.onError?.(error, vars, context);
            },
          });
        },
      });
    },
  };
}

export function useViewIssue(projectId?: number, issueId?: number) {
  return useQuery({
    queryKey: ["issue", projectId, issueId],
    queryFn: () =>
      api
        .get<Issue>("/issue/view", { params: { projectId, issueId } })
        .then((res) => res.data),
    enabled: !!projectId && !!issueId,
  });
}

export function useCreateEffort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: EffortCreatePayload & {
        sprintId?: number | null;
        sprintName?: string;
      }
    ) =>
      api.post<Issue>("/issue/effort/create", payload).then((res) => res.data),
    onSuccess: (_, variables) => {
      invalidateIssueQueries(queryClient, variables);
      queryClient.invalidateQueries({
        queryKey: ["efforts", variables.projectId, variables.issueId],
      });
    },
  });
}

export function useUpdateEffort() {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmation();

  const mutation = useMutation({
    mutationFn: (
      payload: EffortUpdatePayload & {
        sprintId?: number | null;
        sprintName?: string;
      }
    ) =>
      api.put<Effort>(`/issue/effort/update`, payload).then((res) => res.data),
    onSuccess: (_, variables) => {
      invalidateIssueQueries(queryClient, variables);
      queryClient.invalidateQueries({
        queryKey: ["efforts", variables.projectId, variables.issueId],
      });
    },
  });

  return {
    ...mutation,
    mutate: (
      payload: EffortUpdatePayload & {
        sprintId?: number | null;
        sprintName?: string;
      },
      options?: UseMutationOptions<Effort, unknown, EffortUpdatePayload>
    ) => {
      showConfirmation({
        type: "warning",
        title: "Update Effort",
        message: "Are you sure you want to update this effort record?",
        confirmText: "Update",
        cancelText: "Cancel",
        onConfirm: () => mutation.mutate(payload, options),
      });
    },
  };
}

export function useDeleteEffort() {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmation();

  const mutation = useMutation({
    mutationFn: (
      payload: EffortDeletePayload & {
        sprintId?: number | null;
        sprintName?: string;
      }
    ) =>
      api
        .delete(`/issue/effort`, {
          params: {
            projectId: payload.projectId,
            issueId: payload.issueId,
            effortId: payload.effortId,
          },
        })
        .then((res) => res.data),
    onSuccess: (_, variables) => {
      invalidateIssueQueries(queryClient, variables);
      queryClient.invalidateQueries({
        queryKey: ["efforts", variables.projectId, variables.issueId],
      });
    },
  });

  return {
    ...mutation,
    mutate: (
      payload: EffortDeletePayload & {
        sprintId?: number | null;
        sprintName?: string;
      },
      options?: UseMutationOptions<void, unknown, EffortDeletePayload>
    ) => {
      showConfirmation({
        type: "danger",
        title: "Delete Effort",
        message:
          "Are you sure you want to delete this effort record? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        onConfirm: () => mutation.mutate(payload, options),
      });
    },
  };
}

export function useViewEffort(
  projectId: number,
  issueId: number,
  effortId: number
) {
  return useQuery({
    queryKey: ["effort", projectId, issueId, effortId],
    queryFn: () =>
      api
        .get<Effort>("/issue/effort/view", {
          params: { projectId, issueId, effortId },
        })
        .then((res) => res.data),
  });
}
