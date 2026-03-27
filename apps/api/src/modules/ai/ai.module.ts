import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller.js";
import { AiService } from "./ai.service.js";
import { GeminiProvider } from "./providers/gemini.provider.js";
import { AssetsModule } from "../assets/assets.module.js";
import { ProjectsModule } from "../projects/projects.module.js";

@Module({
  imports: [AssetsModule, ProjectsModule],
  controllers: [AiController],
  providers: [AiService, GeminiProvider],
  exports: [AiService],
})
export class AiModule {}
