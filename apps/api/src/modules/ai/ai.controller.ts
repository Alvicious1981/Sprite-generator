import { Controller, Post, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { IsString, IsUUID, IsOptional, IsObject } from "class-validator";
import { AiService } from "./ai.service.js";

class GenerateSpriteDto {
  @IsUUID() projectId!: string;
  @IsString() prompt!: string;
  @IsOptional() @IsUUID() referenceAssetId?: string;
  @IsOptional() @IsUUID() baseAssetId?: string;
  @IsOptional() @IsObject() size?: { width: number; height: number };
}

class GenerateVariantDto {
  @IsString() prompt!: string;
  @IsOptional() @IsUUID() referenceAssetId?: string;
}

@ApiTags("ai")
@Controller()
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post("assets/generate")
  @ApiOperation({ summary: "Generate a new sprite frame with Gemini" })
  generate(@Body() dto: GenerateSpriteDto) {
    return this.ai.generateSprite(dto);
  }

  @Post("assets/:id/variant")
  @ApiOperation({ summary: "Generate a variant based on an existing asset" })
  variant(@Param("id") id: string, @Body() dto: GenerateVariantDto) {
    return this.ai.generateVariant(id, dto);
  }
}
