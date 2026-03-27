import { Controller, Get, Post, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ExportsService } from "./exports.service.js";

@ApiTags("exports")
@Controller("exports")
export class ExportsController {
  constructor(private readonly exports: ExportsService) {}

  @Post(":projectId/godot")
  @ApiOperation({ summary: "Trigger a Godot export job" })
  exportGodot(@Param("projectId") id: string) {
    return this.exports.createExportJob(id, "godot");
  }

  @Post(":projectId/unity")
  @ApiOperation({ summary: "Trigger a Unity export job" })
  exportUnity(@Param("projectId") id: string) {
    return this.exports.createExportJob(id, "unity");
  }

  @Get(":projectId/download")
  @ApiOperation({ summary: "Get the latest export job status and download URL" })
  download(@Param("projectId") id: string) {
    return this.exports.getExportJob(id);
  }

  @Get(":projectId/manifest/godot")
  @ApiOperation({ summary: "Get the Godot manifest JSON" })
  godotManifest(@Param("projectId") id: string) {
    return this.exports.buildGodotManifest(id);
  }

  @Get(":projectId/manifest/unity")
  @ApiOperation({ summary: "Get the Unity manifest JSON" })
  unityManifest(@Param("projectId") id: string) {
    return this.exports.buildUnityManifest(id);
  }
}
