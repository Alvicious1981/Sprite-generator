import { Module } from "@nestjs/common";
import { ExportsController } from "./exports.controller.js";
import { ExportsService } from "./exports.service.js";
import { ProjectsModule } from "../projects/projects.module.js";
import { AssetsModule } from "../assets/assets.module.js";

@Module({
  imports: [ProjectsModule, AssetsModule],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
