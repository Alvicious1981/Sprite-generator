import { Controller, Get, Post, Param, UseGuards, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { ExportsService } from "./exports.service.js";

@ApiTags("exports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("exports")
export class ExportsController {
  constructor(private readonly exports: ExportsService) {}

  @Post(":projectId/godot")
  @ApiOperation({ summary: "Trigger a Godot export job" })
  exportGodot(@Request() req: { user: { id: string } }, @Param("projectId") id: string) {
    return this.exports.createExportJob(id, req.user.id, "godot");
  }

  @Post(":projectId/unity")
  @ApiOperation({ summary: "Trigger a Unity export job" })
  exportUnity(@Request() req: { user: { id: string } }, @Param("projectId") id: string) {
    return this.exports.createExportJob(id, req.user.id, "unity");
  }

  @Get(":projectId/download")
  @ApiOperation({ summary: "Get the latest export job status and download URL" })
  download(@Request() req: { user: { id: string } }, @Param("projectId") id: string) {
    return this.exports.getExportJob(id, req.user.id);
  }

  @Get(":projectId/manifest/godot")
  @ApiOperation({ summary: "Get the Godot manifest JSON for a project" })
  godotManifest(@Request() req: { user: { id: string } }, @Param("projectId") id: string) {
    return this.exports.buildGodotManifest(id, req.user.id);
  }

  @Get(":projectId/manifest/unity")
  @ApiOperation({ summary: "Get the Unity manifest JSON for a project" })
  unityManifest(@Request() req: { user: { id: string } }, @Param("projectId") id: string) {
    return this.exports.buildUnityManifest(id, req.user.id);
  }
}
