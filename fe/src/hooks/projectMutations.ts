import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useConfirmation } from "@/contexts/ConfirmationContext";
import api from "@/lib/axios";
import {
  ProjectUpdatePayload,
  ProjectCreatePayload,
} from "@/types/request/ProjectPayload";
import { Project } from "@/types/Project";

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectCreatePayload) =>
      api.post<Project>("/project/create", payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStatistics"] }); // ✅ Added
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmation();

  const mutation = useMutation({
    mutationFn: (payload: ProjectUpdatePayload) =>
      api.put<Project>("/project/update", payload).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStatistics"] }); // ✅ Added
      queryClient.invalidateQueries({ queryKey: ["users"] }); // ✅ Added
    },
  });

  return {
    ...mutation,
    mutate: (
      payload: ProjectUpdatePayload,
      options?: {
        onSuccess?: (data: any, variables: any, context: any) => void;
        onError?: (error: any, variables: any, context: any) => void;
      }
    ) => {
      showConfirmation({
        type: "warning",
        title: "Update Project",
        message: "Are you sure you want to update this project?",
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

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmation();

  const mutation = useMutation({
    mutationFn: (projectId: number) =>
      api.delete("/project", { params: { projectId } }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStatistics"] }); // ✅ Added
    },
  });

  return {
    ...mutation,
    mutate: (
      projectId: number,
      options?: {
        onSuccess?: (data: any, variables: any, context: any) => void;
        onError?: (error: any, variables: any, context: any) => void;
      }
    ) => {
      showConfirmation({
        type: "danger",
        title: "Delete Project",
        message:
          "Are you sure you want to delete this project? This action cannot be undone.",
        confirmText: "Delete Project",
        cancelText: "Cancel",
        onConfirm: () => {
          mutation.mutate(projectId, {
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

// Query hooks remain unchanged
export function useViewProject(projectId: number) {
  return useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: () =>
      api
        .get<Project>("/project/view", { params: { projectId } })
        .then((res) => res.data),
    enabled: !!projectId,
  });
}


