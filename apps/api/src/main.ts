import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import * as path from "path";
import * as fs from "fs";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  // Multipart support for file uploads (10 MB limit)
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

  // Serve uploaded files as static assets
  const uploadsDir = process.env["UPLOADS_DIR"] ?? path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: "/uploads/",
    decorateReply: false,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env["CORS_ORIGIN"] ?? "http://localhost:3000",
    credentials: true,
  });

  // Swagger docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Sprite Generator API")
    .setDescription("API for AI-powered sprite sheet generation")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const port = process.env["PORT"] ?? 3001;
  await app.listen(port, "0.0.0.0");
  logger.log(`API running on http://localhost:${port}`);
  logger.log(`Uploads served from ${uploadsDir} at /uploads/`);
  logger.log(`Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
