import {
  Controller,
  Delete,
  Post,
  Param,
  BadRequestException,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiConsumes } from "@nestjs/swagger";
import { FastifyRequest } from "fastify";
import { AssetsService } from "./assets.service.js";

@ApiTags("assets")
@Controller("assets")
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  /**
   * POST /assets/reference-upload
   * Accepts multipart/form-data with fields:
   *   - file      : image file (PNG / JPG)
   *   - projectId : UUID of the target project
   */
  @Post("reference-upload")
  @ApiOperation({ summary: "Upload a reference image" })
  @ApiConsumes("multipart/form-data")
  @HttpCode(HttpStatus.CREATED)
  async uploadReference(@Req() req: FastifyRequest) {
    // @fastify/multipart attaches parts() to the request
    const parts = (req as unknown as { parts: () => AsyncIterableIterator<unknown> }).parts();

    let fileBuffer: Buffer | null = null;
    let filename = "reference.png";
    let projectId: string | null = null;

    for await (const part of parts) {
      const p = part as Record<string, unknown>;
      if (p["type"] === "file") {
        const chunks: Buffer[] = [];
        for await (const chunk of p["file"] as AsyncIterable<Buffer>) {
          chunks.push(chunk);
        }
        fileBuffer = Buffer.concat(chunks);
        filename = String(p["filename"] ?? "reference.png");
      } else if (p["fieldname"] === "projectId") {
        projectId = String(p["value"]);
      }
    }

    if (!fileBuffer) throw new BadRequestException("No file provided");
    if (!projectId) throw new BadRequestException("projectId is required");

    // We don't parse image dimensions here — use 0,0 as placeholder;
    // the image worker normalises to the cell size anyway.
    return this.assets.saveReference(projectId, fileBuffer, filename, 0, 0);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an asset" })
  delete(@Param("id") id: string) {
    return this.assets.delete(id);
  }
}
