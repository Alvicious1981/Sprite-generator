import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "./projects.api.js";
import type { CreateProjectInput, UpdateProjectInput } from "@sprite-generator/shared-types";

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", id] as const,
  full: (id: string) => ["projects", id, "full"] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => projectsApi.list(),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  });
}

export function useProjectFull(id: string) {
  return useQuery({
    queryKey: projectKeys.full(id),
    queryFn: () => projectsApi.getFull(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProjectInput) => projectsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) });
      qc.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
