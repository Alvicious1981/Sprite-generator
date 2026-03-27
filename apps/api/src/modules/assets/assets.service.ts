import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../infra/database.service.js";
import { StorageService } from "../../infra/storage.service.js";
import type { Asset } from "@sprite-generator/shared-types";
import { v4 as uuidv4 } from "uuid";

interface AssetRow {
  id: string;
  project_id: string;
  kind: string;
  prompt: string | null;
  image_url: string;
  width: number;
  height: number;
  has_alpha: boolean;
  source_model: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

function toAsset(row: AssetRow): Asset {
  return {
    id: row.id,
    projectId: row.project_id,
    kind: row.kind as Asset["kind"],
    prompt: row.prompt ?? undefined,
    imageUrl: row.image_url,
    width: row.width,
    height: row.height,
    hasAlpha: row.has_alpha,
    sourceModel: row.source_model ?? undefined,
    metadataJson: row.metadata_json ?? undefined,
    createdAt: row.created_at,
  };
}

@Injectable()
export class AssetsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly storage: StorageService,
  ) {}

  async saveGeneratedSprite(
    projectId: string,
    imageBase64: string,
    width: number,
    height: number,
    prompt: string,
    sourceModel: string,
    metadata: Record<string, unknown>,
  ): Promise<Asset> {
    const key = `projects/${projectId}/sprites/${uuidv4()}.png`;
    const { url } = await this.storage.uploadBase64(key, imageBase64, "image/png");

    const row = await this.db.queryOne<AssetRow>(
      `INSERT INTO assets
         (project_id, kind, prompt, image_url, width, height, has_alpha, source_model, metadata_json)
       VALUES ($1,'sprite',$2,$3,$4,$5,true,$6,$7)
       RETURNING *`,
      [projectId, prompt, url, width, height, sourceModel, JSON.stringify(metadata)],
    );
    return toAsset(row!);
  }

  async saveReference(
    projectId: string,
    buffer: Buffer,
    filename: string,
    width: number,
    height: number,
  ): Promise<Asset> {
    const ext = filename.split(".").pop() ?? "png";
    const key = `projects/${projectId}/references/${uuidv4()}.${ext}`;
    const { url } = await this.storage.uploadBuffer(key, buffer, "image/png");

    const row = await this.db.queryOne<AssetRow>(
      `INSERT INTO assets (project_id, kind, image_url, width, height, has_alpha)
       VALUES ($1,'reference',$2,$3,$4,true)
       RETURNING *`,
      [projectId, url, width, height],
    );
    return toAsset(row!);
  }

  async findById(id: string): Promise<Asset> {
    const row = await this.db.queryOne<AssetRow>(
      "SELECT * FROM assets WHERE id = $1",
      [id],
    );
    if (!row) throw new NotFoundException("Asset not found");
    return toAsset(row);
  }

  async delete(id: string): Promise<void> {
    const asset = await this.findById(id);
    await this.db.query("DELETE FROM assets WHERE id = $1", [id]);
    // Extract the storage key by stripping the /uploads/ prefix from the URL path
    const key = new URL(asset.imageUrl).pathname.replace(/^\/uploads\//, "");
    await this.storage.delete(key);
  }
}
