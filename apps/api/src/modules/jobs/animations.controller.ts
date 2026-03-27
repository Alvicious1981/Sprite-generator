import {
  Controller, Post, Put, Delete,
  Body, Param, UseGuards, Request,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import {
  IsString, IsUUID, IsInt, IsBoolean, IsArray,
  Min, Max, IsOptional,
} from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { AnimationsService } from "./animations.service.js";

class CreateAnimationDto {
  @IsUUID() projectId!: string;
  @IsString() name!: string;
  @IsInt() @Min(1) @Max(120) fps!: number;
  @IsBoolean() loop!: boolean;
  @IsArray() @IsUUID("4", { each: true }) frameIds!: string[];
}

class UpdateAnimationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() @Min(1) @Max(120) fps?: number;
  @IsOptional() @IsBoolean() loop?: boolean;
  @IsOptional() @IsArray() @IsUUID("4", { each: true }) frameIds?: string[];
}

@ApiTags("animations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("animations")
export class AnimationsController {
  constructor(private readonly animations: AnimationsService) {}

  @Post()
  @ApiOperation({ summary: "Create an animation" })
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateAnimationDto) {
    return this.animations.create(req.user.id, dto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an animation" })
  update(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateAnimationDto,
  ) {
    return this.animations.update(id, req.user.id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an animation" })
  delete(@Request() req: { user: { id: string } }, @Param("id") id: string) {
    return this.animations.delete(id, req.user.id);
  }
}
