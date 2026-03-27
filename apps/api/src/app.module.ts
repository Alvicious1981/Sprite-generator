import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./modules/auth/auth.module.js";
import { ProjectsModule } from "./modules/projects/projects.module.js";
import { AssetsModule } from "./modules/assets/assets.module.js";
import { AiModule } from "./modules/ai/ai.module.js";
import { ExportsModule } from "./modules/exports/exports.module.js";
import { JobsModule } from "./modules/jobs/jobs.module.js";
import { InfraModule } from "./infra/infra.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    InfraModule,
    AuthModule,
    ProjectsModule,
    AssetsModule,
    AiModule,
    ExportsModule,
    JobsModule,
  ],
})
export class AppModule {}
