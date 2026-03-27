import { z } from "zod";

// ─── Project ──────────────────────────────────────────────────────────────────

export const EngineTargetSchema = z.enum(["godot", "unity", "generic"]);

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  engineTarget: EngineTargetSchema,
  defaultCellWidth: z.number().int().positive().max(512),
  defaultCellHeight: z.number().int().positive().max(512),
  stylePreset: z.string().min(1).max(50),
  transparentBackground: z.boolean(),
  exportScale: z.number().min(0.5).max(8),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

// ─── Asset ────────────────────────────────────────────────────────────────────

export const AssetKindSchema = z.enum(["sprite", "reference", "sheet", "thumbnail"]);

export const GenerateSpriteSchema = z.object({
  projectId: z.string().uuid(),
  prompt: z.string().min(1).max(1000),
  referenceAssetId: z.string().uuid().optional(),
  baseAssetId: z.string().uuid().optional(),
  size: z
    .object({
      width: z.number().int().positive().max(512),
      height: z.number().int().positive().max(512),
    })
    .optional(),
});

export const GenerateVariantSchema = z.object({
  prompt: z.string().min(1).max(1000),
  referenceAssetId: z.string().uuid().optional(),
});

// ─── Animation ────────────────────────────────────────────────────────────────

export const CreateAnimationSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  fps: z.number().int().min(1).max(120),
  loop: z.boolean(),
  frameIds: z.array(z.string().uuid()).min(1),
});

export const UpdateAnimationSchema = CreateAnimationSchema.omit({ projectId: true }).partial();

// ─── Sheet Layout ─────────────────────────────────────────────────────────────

export const FramePlacementSchema = z.object({
  assetId: z.string().uuid(),
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  pivotX: z.number().min(0).max(1).optional(),
  pivotY: z.number().min(0).max(1).optional(),
});

export const ComposeSheetSchema = z.object({
  projectId: z.string().uuid(),
  columns: z.number().int().min(1).max(64),
  rows: z.number().int().min(1).max(64),
  cellWidth: z.number().int().positive().max(512),
  cellHeight: z.number().int().positive().max(512),
  margin: z.number().int().min(0).max(64),
  padding: z.number().int().min(0).max(64),
  placements: z.array(FramePlacementSchema).min(1),
});

// ─── AI Metadata Schema ───────────────────────────────────────────────────────

export const AiAssetMetadataSchema = z.object({
  asset_name: z.string(),
  animation_name: z.string().optional(),
  frame_index: z.number().int().min(0),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type GenerateSpriteInput = z.infer<typeof GenerateSpriteSchema>;
export type GenerateVariantInput = z.infer<typeof GenerateVariantSchema>;
export type CreateAnimationInput = z.infer<typeof CreateAnimationSchema>;
export type UpdateAnimationInput = z.infer<typeof UpdateAnimationSchema>;
export type ComposeSheetInput = z.infer<typeof ComposeSheetSchema>;
export type AiAssetMetadata = z.infer<typeof AiAssetMetadataSchema>;
