import { apiClient } from "@/lib/api-client.js";
import type { GodotManifest, UnityManifest } from "@sprite-generator/shared-types";

interface ExportJob {
  id: string;
  projectId: string;
  status: "pending" | "processing" | "done" | "failed";
  engine: string;
  resultUrl: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export const exportApi = {
  triggerGodot: (projectId: string) =>
    apiClient.post<ExportJob>(`/exports/${projectId}/godot`, {}),

  triggerUnity: (projectId: string) =>
    apiClient.post<ExportJob>(`/exports/${projectId}/unity`, {}),

  getDownload: (projectId: string) =>
    apiClient.get<ExportJob | null>(`/exports/${projectId}/download`),

  getGodotManifest: (projectId: string) =>
    apiClient.get<GodotManifest>(`/exports/${projectId}/manifest/godot`),

  getUnityManifest: (projectId: string) =>
    apiClient.get<UnityManifest>(`/exports/${projectId}/manifest/unity`),
};
