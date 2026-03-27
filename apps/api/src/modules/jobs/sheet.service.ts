import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../../infra/database.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import type { SheetLayout, ComposeSheetInput } from "@sprite-generator/shared-types";

interface SheetLayoutRow {
  id: string;
  project_id: string;
  columns: number;
  rows: number;
  cell_width: number;
  cell_height: number;
  margin: number;
  padding: number;
  placements: SheetLayout["placements"];
  created_at: string;
}

function toSheetLayout(row: SheetLayoutRow): SheetLayout {
  return {
    id: row.id,
    projectId: row.project_id,
    columns: row.columns,
    rows: row.rows,
    cellWidth: row.cell_width,
    cellHeight: row.cell_height,
    margin: row.margin,
    padding: row.padding,
    placements: row.placements,
  };
}

@Injectable()
export class SheetService {
  constructor(
    private readonly db: DatabaseService,
    private readonly projects: ProjectsService,
    private readonly config: ConfigService,
  ) {}

  async compose(input: ComposeSheetInput): Promise<SheetLayout> {
    await this.projects.findById(input.projectId);

    const row = await this.db.queryOne<SheetLayoutRow>(
      `INSERT INTO sheet_layouts
         (project_id, columns, rows, cell_width, cell_height, margin, padding, placements)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (project_id) DO UPDATE SET
         columns=$2, rows=$3, cell_width=$4, cell_height=$5,
         margin=$6, padding=$7, placements=$8
       RETURNING *`,
      [
        input.projectId,
        input.columns,
        input.rows,
        input.cellWidth,
        input.cellHeight,
        input.margin,
        input.padding,
        JSON.stringify(input.placements),
      ],
    );

    return toSheetLayout(row!);
  }

  async getPreview(projectId: string): Promise<SheetLayout> {
    await this.projects.findById(projectId);
    const row = await this.db.queryOne<SheetLayoutRow>(
      "SELECT * FROM sheet_layouts WHERE project_id = $1",
      [projectId],
    );
    if (!row) throw new NotFoundException("No sheet layout found");
    return toSheetLayout(row);
  }
}
