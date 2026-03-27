import { apiClient } from "@/lib/api-client.js";
import type {
  Project,
  ProjectFull,
  CreateProjectInput,
  UpdateProjectInput,
} from "@sprite-generator/shared-types";

export const projectsApi = {
  list: () => apiClient.get<Project[]>("/projects"),
  get: (id: string) => apiClient.get<Project>(`/projects/${id}`),
  getFull: (id: string) => apiClient.get<ProjectFull>(`/projects/${id}/full`),
  create: (input: CreateProjectInput) => apiClient.post<Project>("/projects", input),
  update: (id: string, input: UpdateProjectInput) =>
    apiClient.put<Project>(`/projects/${id}`, input),
};
