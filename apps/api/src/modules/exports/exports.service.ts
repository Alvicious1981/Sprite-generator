import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../../infra/database.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import type { GodotManifest, UnityManifest } from "@sprite-generator/shared-types";

interface AnimationRow {
  id: string;
  name: string;
  fps: number;
  loop: boolean;
  frame_ids: string[];
}

interface SheetLayoutRow {
  id: string;
  columns: number;
  rows: number;
  cell_width: number;
  cell_height: number;
  margin: number;
  padding: number;
  placements: Array<{ assetId: string; row: number; col: number; pivotX?: number; pivotY?: number }>;
}

interface ExportJobRow {
  id: string;
  project_id: string;
  status: string;
  engine: string;
  result_url: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ExportsService {
  private readonly workerUrl: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly projects: ProjectsService,
    private readonly config: ConfigService,
  ) {
    this.workerUrl = this.config.get("IMAGE_WORKER_URL", "http://localhost:8000");
  }

  async buildGodotManifest(projectId: string, userId: string): Promise<GodotManifest> {
    const project = await this.projects.findById(projectId, userId);
    const animations = await this.db.query<AnimationRow>(
      "SELECT * FROM animations WHERE project_id = $1",
      [projectId],
    );
    const sheet = await this.db.queryOne<SheetLayoutRow>(
      "SELECT * FROM sheet_layouts WHERE project_id = $1",
      [projectId],
    );
    if (!sheet) throw new NotFoundException("No sheet layout found for project");

    const animationMap: Record<string, number[]> = {};
    const fpsMap: Record<string, number> = {};

    for (const anim of animations) {
      animationMap[anim.name] = anim.frame_ids.map((fid) => {
        const placement = sheet.placements.find((p) => p.assetId === fid);
        if (!placement) return -1;
        return placement.row * sheet.columns + placement.col;
      });
      fpsMap[anim.name] = anim.fps;
    }

    return {
      texture: "spritesheet.png",
      cell_width: project.defaultCellWidth,
      cell_height: project.defaultCellHeight,
      animations: animationMap,
      fps: fpsMap,
    };
  }

  async buildUnityManifest(projectId: string, userId: string): Promise<UnityManifest> {
    const project = await this.projects.findById(projectId, userId);
    const animations = await this.db.query<AnimationRow>(
      "SELECT * FROM animations WHERE project_id = $1",
      [projectId],
    );

    const animationMap: Record<string, string[]> = {};
    for (const anim of animations) {
      animationMap[anim.name] = anim.frame_ids.map((_, i) => `${anim.name}_${i}`);
    }

    return {
      textureType: "Sprite (2D and UI)",
      spriteMode: "Multiple",
      sliceType: "GridByCellSize",
      cellWidth: project.defaultCellWidth,
      cellHeight: project.defaultCellHeight,
      offsetX: 0,
      offsetY: 0,
      padding: 0,
      pivot: { x: 0.5, y: 0.0 },
      animations: animationMap,
    };
  }

  async createExportJob(projectId: string, userId: string, engine: string): Promise<ExportJobRow> {
    await this.projects.findById(projectId, userId);

    const row = await this.db.queryOne<ExportJobRow>(
      `INSERT INTO export_jobs (project_id, engine) VALUES ($1, $2) RETURNING *`,
      [projectId, engine],
    );

    // Trigger image worker asynchronously
    this.dispatchToWorker(row!.id, projectId, engine).catch((err) => {
      this.db.query(
        "UPDATE export_jobs SET status='failed', error=$1, updated_at=NOW() WHERE id=$2",
        [String(err), row!.id],
      );
    });

    return row!;
  }

  async getExportJob(projectId: string, userId: string): Promise<ExportJobRow | null> {
    await this.projects.findById(projectId, userId);
    return this.db.queryOne<ExportJobRow>(
      "SELECT * FROM export_jobs WHERE project_id=$1 ORDER BY created_at DESC LIMIT 1",
      [projectId],
    );
  }

  private async dispatchToWorker(
    jobId: string,
    projectId: string,
    engine: string,
  ): Promise<void> {
    await this.db.query(
      "UPDATE export_jobs SET status='processing', updated_at=NOW() WHERE id=$1",
      [jobId],
    );

    const response = await fetch(`${this.workerUrl}/compose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId, project_id: projectId, engine }),
    });

    if (!response.ok) {
      throw new Error(`Worker responded with ${response.status}`);
    }

    const { result_url } = (await response.json()) as { result_url: string };
    await this.db.query(
      "UPDATE export_jobs SET status='done', result_url=$1, updated_at=NOW() WHERE id=$2",
      [result_url, jobId],
    );
  }
}
