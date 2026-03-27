// ─── Domain Models ────────────────────────────────────────────────────────────

export type EngineTarget = "godot" | "unity" | "generic";

export type AssetKind = "sprite" | "reference" | "sheet" | "thumbnail";

export type ZoomLevel = 1 | 2 | 4 | 8;

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  userId: string;
  name: string;
  engineTarget: EngineTarget;
  defaultCellWidth: number;
  defaultCellHeight: number;
  stylePreset: string;
  transparentBackground: boolean;
  exportScale: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  engineTarget: EngineTarget;
  defaultCellWidth: number;
  defaultCellHeight: number;
  stylePreset: string;
  transparentBackground: boolean;
  exportScale: number;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

// ─── Asset ────────────────────────────────────────────────────────────────────

export interface Asset {
  id: string;
  projectId: string;
  kind: AssetKind;
  prompt?: string;
  imageUrl: string;
  width: number;
  height: number;
  hasAlpha: boolean;
  sourceModel?: string;
  metadataJson?: Record<string, unknown>;
  createdAt: string;
}

export interface GenerateSpriteInput {
  projectId: string;
  prompt: string;
  referenceAssetId?: string;
  baseAssetId?: string;
  size?: { width: number; height: number };
}

export interface GenerateVariantInput {
  prompt: string;
  referenceAssetId?: string;
}

// ─── Animation ────────────────────────────────────────────────────────────────

export interface Animation {
  id: string;
  projectId: string;
  name: string;
  fps: number;
  loop: boolean;
  frameIds: string[];
  createdAt: string;
}

export interface CreateAnimationInput {
  projectId: string;
  name: string;
  fps: number;
  loop: boolean;
  frameIds: string[];
}

export interface UpdateAnimationInput extends Partial<Omit<CreateAnimationInput, "projectId">> {}

// ─── Sheet Layout ─────────────────────────────────────────────────────────────

export interface FramePlacement {
  assetId: string;
  row: number;
  col: number;
  pivotX?: number;
  pivotY?: number;
}

export interface SheetLayout {
  id: string;
  projectId: string;
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  margin: number;
  padding: number;
  placements: FramePlacement[];
}

export interface ComposeSheetInput {
  projectId: string;
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  margin: number;
  padding: number;
  placements: FramePlacement[];
}

// ─── Export ───────────────────────────────────────────────────────────────────

export interface GodotManifest {
  texture: string;
  cell_width: number;
  cell_height: number;
  animations: Record<string, number[]>;
  fps: Record<string, number>;
}

export interface UnityManifest {
  textureType: "Sprite (2D and UI)";
  spriteMode: "Multiple";
  sliceType: "GridByCellSize" | "GridByCellCount" | "Automatic";
  cellWidth: number;
  cellHeight: number;
  offsetX: number;
  offsetY: number;
  padding: number;
  pivot: { x: number; y: number };
  animations: Record<string, string[]>;
}

// ─── AI Provider Interface ────────────────────────────────────────────────────

export interface GenerateSpriteOptions {
  prompt: string;
  referenceImageUrl?: string;
  baseImageUrl?: string;
  size: { width: number; height: number };
  transparency: boolean;
  stylePreset?: string;
}

export interface GenerateSpriteResult {
  imageBase64: string;
  revisedPrompt?: string;
  metadata?: Record<string, unknown>;
}

export interface AiImageProvider {
  generateSprite(input: GenerateSpriteOptions): Promise<GenerateSpriteResult>;
}

// ─── AI Metadata Schema (from Gemini structured output) ───────────────────────

export interface AiAssetMetadata {
  asset_name: string;
  animation_name?: string;
  frame_index: number;
  tags?: string[];
  notes?: string;
}

// ─── Preview State ────────────────────────────────────────────────────────────

export interface PreviewState {
  animationId: string;
  fps: number;
  currentFrameIndex: number;
  isPlaying: boolean;
  loop: boolean;
  zoom: ZoomLevel;
  showCheckerboard: boolean;
}

// ─── Full Project Response ────────────────────────────────────────────────────

export interface ProjectFull {
  project: Project;
  assets: Asset[];
  animations: Animation[];
  sheetLayout?: SheetLayout;
}
