import { Module } from "@nestjs/common";
import { AssetsService } from "./assets.service.js";
import { AssetsController } from "./assets.controller.js";
import { ProjectsModule } from "../projects/projects.module.js";

@Module({
  imports: [ProjectsModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
