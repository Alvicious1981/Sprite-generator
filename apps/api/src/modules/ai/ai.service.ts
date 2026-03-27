import { Injectable } from "@nestjs/common";
import { GeminiProvider } from "./providers/gemini.provider.js";
import { AssetsService } from "../assets/assets.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import type { Asset, GenerateSpriteInput, GenerateVariantInput } from "@sprite-generator/shared-types";

@Injectable()
export class AiService {
  constructor(
    private readonly gemini: GeminiProvider,
    private readonly assets: AssetsService,
    private readonly projects: ProjectsService,
  ) {}

  async generateSprite(userId: string, input: GenerateSpriteInput): Promise<Asset> {
    const project = await this.projects.findById(input.projectId, userId);

    const size = input.size ?? {
      width: project.defaultCellWidth,
      height: project.defaultCellHeight,
    };

    const referenceImageUrl = input.referenceAssetId
      ? (await this.assets.findById(input.referenceAssetId, userId)).imageUrl
      : undefined;

    const baseImageUrl = input.baseAssetId
      ? (await this.assets.findById(input.baseAssetId, userId)).imageUrl
      : undefined;

    const result = await this.gemini.generateSprite({
      prompt: input.prompt,
      referenceImageUrl,
      baseImageUrl,
      size,
      transparency: project.transparentBackground,
      stylePreset: project.stylePreset,
    });

    return this.assets.saveGeneratedSprite(
      userId,
      input.projectId,
      result.imageBase64,
      size.width,
      size.height,
      result.revisedPrompt ?? input.prompt,
      this.gemini.modelId,
      result.metadata ?? {},
    );
  }

  async generateVariant(
    userId: string,
    assetId: string,
    input: GenerateVariantInput,
  ): Promise<Asset> {
    const baseAsset = await this.assets.findById(assetId, userId);

    const referenceImageUrl = input.referenceAssetId
      ? (await this.assets.findById(input.referenceAssetId, userId)).imageUrl
      : undefined;

    const project = await this.projects.findById(baseAsset.projectId, userId);

    const result = await this.gemini.generateSprite({
      prompt: input.prompt,
      baseImageUrl: baseAsset.imageUrl,
      referenceImageUrl,
      size: { width: baseAsset.width, height: baseAsset.height },
      transparency: project.transparentBackground,
      stylePreset: project.stylePreset,
    });

    return this.assets.saveGeneratedSprite(
      userId,
      baseAsset.projectId,
      result.imageBase64,
      baseAsset.width,
      baseAsset.height,
      result.revisedPrompt ?? input.prompt,
      this.gemini.modelId,
      result.metadata ?? {},
    );
  }
}
