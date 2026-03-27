import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assetsApi } from "./assets.api.js";
import { projectKeys } from "@/features/projects/use-projects.js";
import type { GenerateSpriteInput, GenerateVariantInput } from "@sprite-generator/shared-types";

export function useGenerateSprite(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerateSpriteInput) => assetsApi.generate(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.full(projectId) }),
  });
}

export function useGenerateVariant(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assetId, input }: { assetId: string; input: GenerateVariantInput }) =>
      assetsApi.generateVariant(assetId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.full(projectId) }),
  });
}

export function useDeleteAsset(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => assetsApi.delete(assetId),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.full(projectId) }),
  });
}
