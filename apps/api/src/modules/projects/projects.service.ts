import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../infra/database.service.js";
import type {
  Project,
  ProjectFull,
  CreateProjectInput,
  UpdateProjectInput,
} from "@sprite-generator/shared-types";

interface ProjectRow {
  id: string;
  name: string;
  engine_target: string;
  default_cell_width: number;
  default_cell_height: number;
  style_preset: string;
  transparent_background: boolean;
  export_scale: number;
  created_at: string;
  updated_at: string;
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: "default",
    name: row.name,
    engineTarget: row.engine_target as Project["engineTarget"],
    defaultCellWidth: row.default_cell_width,
    defaultCellHeight: row.default_cell_height,
    stylePreset: row.style_preset,
    transparentBackground: row.transparent_background,
    exportScale: Number(row.export_scale),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DatabaseService) {}

  async create(input: CreateProjectInput): Promise<Project> {
    const row = await this.db.queryOne<ProjectRow>(
      `INSERT INTO projects
         (name, engine_target, default_cell_width, default_cell_height,
          style_preset, transparent_background, export_scale)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        input.name,
        input.engineTarget,
        input.defaultCellWidth,
        input.defaultCellHeight,
        input.stylePreset,
        input.transparentBackground,
        input.exportScale,
      ],
    );
    return toProject(row!);
  }

  async findAll(): Promise<Project[]> {
    const rows = await this.db.query<ProjectRow>(
      "SELECT * FROM projects ORDER BY updated_at DESC",
    );
    return rows.map(toProject);
  }

  async findById(id: string): Promise<Project> {
    const row = await this.db.queryOne<ProjectRow>(
      "SELECT * FROM projects WHERE id = $1",
      [id],
    );
    if (!row) throw new NotFoundException("Project not found");
    return toProject(row);
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    await this.findById(id);

    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;

    const fields: Array<[keyof UpdateProjectInput, string]> = [
      ["name", "name"],
      ["engineTarget", "engine_target"],
      ["defaultCellWidth", "default_cell_width"],
      ["defaultCellHeight", "default_cell_height"],
      ["stylePreset", "style_preset"],
      ["transparentBackground", "transparent_background"],
      ["exportScale", "export_scale"],
    ];

    for (const [key, col] of fields) {
      if (input[key] !== undefined) {
        sets.push(`${col} = $${i++}`);
        vals.push(input[key]);
      }
    }

    if (sets.length === 0) return this.findById(id);

    sets.push(`updated_at = NOW()`);
    vals.push(id);

    const row = await this.db.queryOne<ProjectRow>(
      `UPDATE projects SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
      vals,
    );
    return toProject(row!);
  }

  async getFull(id: string): Promise<ProjectFull> {
    const project = await this.findById(id);

    const [assets, animations, sheetRows] = await Promise.all([
      this.db.query(
        "SELECT * FROM assets WHERE project_id = $1 ORDER BY created_at ASC",
        [id],
      ),
      this.db.query(
        "SELECT * FROM animations WHERE project_id = $1 ORDER BY created_at ASC",
        [id],
      ),
      this.db.query(
        "SELECT * FROM sheet_layouts WHERE project_id = $1",
        [id],
      ),
    ]);

    return {
      project,
      assets: assets as ProjectFull["assets"],
      animations: animations as ProjectFull["animations"],
      sheetLayout: sheetRows[0] as ProjectFull["sheetLayout"],
    };
  }
}
