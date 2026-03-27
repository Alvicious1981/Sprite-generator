import {
  Controller, Post, Put, Delete,
  Body, Param,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import {
  IsString, IsUUID, IsInt, IsBoolean, IsArray,
  Min, Max, IsOptional,
} from "class-validator";
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
@Controller("animations")
export class AnimationsController {
  constructor(private readonly animations: AnimationsService) {}

  @Post()
  @ApiOperation({ summary: "Create an animation" })
  create(@Body() dto: CreateAnimationDto) {
    return this.animations.create(dto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an animation" })
  update(@Param("id") id: string, @Body() dto: UpdateAnimationDto) {
    return this.animations.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an animation" })
  delete(@Param("id") id: string) {
    return this.animations.delete(id);
  }
}
