import { Controller, Post, Body, Param, UseGuards, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import {
  IsString,
  IsUUID,
  IsOptional,
  IsObject,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { AiService } from "./ai.service.js";

class GenerateSpriteDto {
  @IsUUID() projectId!: string;
  @IsString() prompt!: string;
  @IsOptional() @IsUUID() referenceAssetId?: string;
  @IsOptional() @IsUUID() baseAssetId?: string;
  @IsOptional()
  @IsObject()
  size?: { width: number; height: number };
}

class GenerateVariantDto {
  @IsString() prompt!: string;
  @IsOptional() @IsUUID() referenceAssetId?: string;
}

@ApiTags("ai")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post("assets/generate")
  @ApiOperation({ summary: "Generate a new sprite frame with Gemini" })
  generate(@Request() req: { user: { id: string } }, @Body() dto: GenerateSpriteDto) {
    return this.ai.generateSprite(req.user.id, dto);
  }

  @Post("assets/:id/variant")
  @ApiOperation({ summary: "Generate a variant based on an existing asset" })
  variant(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: GenerateVariantDto,
  ) {
    return this.ai.generateVariant(req.user.id, id, dto);
  }
}
