import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { DatabaseService } from "../../infra/database.service.js";
import { StorageService } from "../../infra/storage.service.js";
import { ProjectsService } from "../projects/projects.service.js";
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
    private readonly projects: ProjectsService,
  ) {}

  async saveGeneratedSprite(
    userId: string,
    projectId: string,
    imageBase64: string,
    width: number,
    height: number,
    prompt: string,
    sourceModel: string,
    metadata: Record<string, unknown>,
  ): Promise<Asset> {
    await this.projects.findById(projectId, userId); // ownership check

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
    userId: string,
    projectId: string,
    buffer: Buffer,
    width: number,
    height: number,
  ): Promise<Asset> {
    await this.projects.findById(projectId, userId);

    const key = `projects/${projectId}/references/${uuidv4()}.png`;
    const { url } = await this.storage.uploadBuffer(key, buffer, "image/png");

    const row = await this.db.queryOne<AssetRow>(
      `INSERT INTO assets (project_id, kind, image_url, width, height, has_alpha)
       VALUES ($1,'reference',$2,$3,$4,true)
       RETURNING *`,
      [projectId, url, width, height],
    );
    return toAsset(row!);
  }

  async findByProject(projectId: string, userId: string): Promise<Asset[]> {
    await this.projects.findById(projectId, userId);
    const rows = await this.db.query<AssetRow>(
      "SELECT * FROM assets WHERE project_id = $1 ORDER BY created_at ASC",
      [projectId],
    );
    return rows.map(toAsset);
  }

  async findById(id: string, userId: string): Promise<Asset> {
    const row = await this.db.queryOne<AssetRow>(
      `SELECT a.* FROM assets a
       JOIN projects p ON p.id = a.project_id
       WHERE a.id = $1`,
      [id],
    );
    if (!row) throw new NotFoundException("Asset not found");

    const project = await this.projects.findById(row.project_id, userId);
    if (project.userId !== userId) throw new ForbiddenException();

    return toAsset(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const asset = await this.findById(id, userId);
    await this.db.query("DELETE FROM assets WHERE id = $1", [id]);

    // Extract storage key from URL and delete from storage
    const key = asset.imageUrl.split("/").slice(3).join("/");
    await this.storage.delete(key);
  }
}
