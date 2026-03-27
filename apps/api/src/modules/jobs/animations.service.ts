import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { DatabaseService } from "../../infra/database.service.js";
import { ProjectsService } from "../projects/projects.service.js";
import type { Animation, CreateAnimationInput, UpdateAnimationInput } from "@sprite-generator/shared-types";

interface AnimationRow {
  id: string;
  project_id: string;
  name: string;
  fps: number;
  loop: boolean;
  frame_ids: string[];
  created_at: string;
}

function toAnimation(row: AnimationRow): Animation {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    fps: row.fps,
    loop: row.loop,
    frameIds: row.frame_ids,
    createdAt: row.created_at,
  };
}

@Injectable()
export class AnimationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly projects: ProjectsService,
  ) {}

  async create(userId: string, input: CreateAnimationInput): Promise<Animation> {
    await this.projects.findById(input.projectId, userId);

    const row = await this.db.queryOne<AnimationRow>(
      `INSERT INTO animations (project_id, name, fps, loop, frame_ids)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [input.projectId, input.name, input.fps, input.loop, input.frameIds],
    );
    return toAnimation(row!);
  }

  async update(id: string, userId: string, input: UpdateAnimationInput): Promise<Animation> {
    const animation = await this.findById(id, userId);

    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;

    if (input.name !== undefined) { sets.push(`name = $${i++}`); vals.push(input.name); }
    if (input.fps !== undefined) { sets.push(`fps = $${i++}`); vals.push(input.fps); }
    if (input.loop !== undefined) { sets.push(`loop = $${i++}`); vals.push(input.loop); }
    if (input.frameIds !== undefined) { sets.push(`frame_ids = $${i++}`); vals.push(input.frameIds); }

    if (sets.length === 0) return animation;

    vals.push(id);
    const row = await this.db.queryOne<AnimationRow>(
      `UPDATE animations SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
      vals,
    );
    return toAnimation(row!);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId);
    await this.db.query("DELETE FROM animations WHERE id = $1", [id]);
  }

  async findById(id: string, userId: string): Promise<Animation> {
    const row = await this.db.queryOne<AnimationRow>(
      "SELECT * FROM animations WHERE id = $1",
      [id],
    );
    if (!row) throw new NotFoundException("Animation not found");
    await this.projects.findById(row.project_id, userId); // ownership check
    return toAnimation(row);
  }
}
