import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  GoogleGenerativeAI,
  GenerativeModel,
  Part,
} from "@google/generative-ai";
import type {
  AiImageProvider,
  GenerateSpriteOptions,
  GenerateSpriteResult,
  AiAssetMetadata,
} from "@sprite-generator/shared-types";

// JSON schema for Gemini structured metadata output
const METADATA_SCHEMA = {
  type: "object",
  properties: {
    asset_name: { type: "string" },
    animation_name: { type: "string" },
    frame_index: { type: "integer" },
    tags: { type: "array", items: { type: "string" } },
    notes: { type: "string" },
  },
  required: ["asset_name", "frame_index"],
};

@Injectable()
export class GeminiProvider implements AiImageProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly imageModel: GenerativeModel;
  private readonly textModel: GenerativeModel;
  private readonly imageModelId: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.getOrThrow<string>("GEMINI_API_KEY");
    this.imageModelId = this.config.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image");
    const textModelId = this.config.get("GEMINI_TEXT_MODEL", "gemini-2.5-flash");

    const client = new GoogleGenerativeAI(apiKey);
    this.imageModel = client.getGenerativeModel({ model: this.imageModelId });
    this.textModel = client.getGenerativeModel({ model: textModelId });
  }

  async generateSprite(input: GenerateSpriteOptions): Promise<GenerateSpriteResult> {
    const systemPrompt = this.buildSystemPrompt(input);
    const parts: Part[] = [{ text: systemPrompt }];

    if (input.referenceImageUrl) {
      parts.push(await this.urlToPart(input.referenceImageUrl));
    }
    if (input.baseImageUrl) {
      parts.push(await this.urlToPart(input.baseImageUrl));
    }

    this.logger.debug(`Generating sprite with ${this.imageModelId}`);

    const result = await this.imageModel.generateContent(parts);
    const response = result.response;

    // Extract image from response
    const candidate = response.candidates?.[0];
    const imagePart = candidate?.content.parts.find((p) => p.inlineData);
    if (!imagePart?.inlineData) {
      throw new Error("Gemini did not return an image");
    }

    const imageBase64 = imagePart.inlineData.data;

    // Fetch structured metadata separately
    let metadata: AiAssetMetadata | undefined;
    try {
      metadata = await this.fetchMetadata(input);
    } catch (err) {
      this.logger.warn("Metadata fetch failed, continuing without it", err);
    }

    return {
      imageBase64,
      revisedPrompt: input.prompt,
      metadata: metadata as Record<string, unknown> | undefined,
    };
  }

  private buildSystemPrompt(input: GenerateSpriteOptions): string {
    const { width, height } = input.size;
    return [
      `Generate a single sprite frame as a ${width}x${height} PNG.`,
      input.transparency ? "Background must be fully transparent (alpha channel)." : "Solid background.",
      input.stylePreset ? `Style: ${input.stylePreset}.` : "",
      `Subject: ${input.prompt}`,
      "Output ONLY the image. No text, no borders, no padding beyond the cell size.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  private async fetchMetadata(input: GenerateSpriteOptions): Promise<AiAssetMetadata> {
    const result = await this.textModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Given this sprite generation prompt: "${input.prompt}", return structured metadata.`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: METADATA_SCHEMA as never,
      },
    });

    const text = result.response.text();
    return JSON.parse(text) as AiAssetMetadata;
  }

  private async urlToPart(url: string): Promise<Part> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = response.headers.get("content-type") ?? "image/png";
    return { inlineData: { data: base64, mimeType } };
  }

  get modelId(): string {
    return this.imageModelId;
  }
}
