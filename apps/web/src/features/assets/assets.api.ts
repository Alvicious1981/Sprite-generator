import { apiClient } from "@/lib/api-client.js";
import type {
  Asset,
  GenerateSpriteInput,
  GenerateVariantInput,
} from "@sprite-generator/shared-types";

export const assetsApi = {
  generate: (input: GenerateSpriteInput) =>
    apiClient.post<Asset>("/assets/generate", input),

  generateVariant: (assetId: string, input: GenerateVariantInput) =>
    apiClient.post<Asset>(`/assets/${assetId}/variant`, input),

  uploadReference: (projectId: string, file: File) => {
    const fd = new FormData();
    fd.append("projectId", projectId);
    fd.append("file", file, file.name);
    return apiClient.upload<Asset>("/assets/reference-upload", fd);
  },

  delete: (id: string) => apiClient.delete<void>(`/assets/${id}`),
};
