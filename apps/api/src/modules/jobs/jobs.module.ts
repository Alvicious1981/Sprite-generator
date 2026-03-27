import { Module } from "@nestjs/common";
import { AnimationsService } from "./animations.service.js";
import { AnimationsController } from "./animations.controller.js";
import { SheetService } from "./sheet.service.js";
import { SheetController } from "./sheet.controller.js";
import { ProjectsModule } from "../projects/projects.module.js";
import { AssetsModule } from "../assets/assets.module.js";

@Module({
  imports: [ProjectsModule, AssetsModule],
  controllers: [AnimationsController, SheetController],
  providers: [AnimationsService, SheetService],
  exports: [AnimationsService, SheetService],
})
export class JobsModule {}
