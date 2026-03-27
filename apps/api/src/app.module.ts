import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ProjectsModule } from "./modules/projects/projects.module.js";
import { AssetsModule } from "./modules/assets/assets.module.js";
import { AiModule } from "./modules/ai/ai.module.js";
import { ExportsModule } from "./modules/exports/exports.module.js";
import { JobsModule } from "./modules/jobs/jobs.module.js";
import { InfraModule } from "./infra/infra.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfraModule,
    ProjectsModule,
    AssetsModule,
    AiModule,
    ExportsModule,
    JobsModule,
  ],
})
export class AppModule {}
