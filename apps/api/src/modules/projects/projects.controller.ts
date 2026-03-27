import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { IsString, IsIn, IsInt, IsBoolean, IsNumber, Min, Max, IsOptional } from "class-validator";
import { ProjectsService } from "./projects.service.js";

class CreateProjectDto {
  @IsString() name!: string;
  @IsIn(["godot", "unity", "generic"]) engineTarget!: "godot" | "unity" | "generic";
  @IsInt() @Min(8) @Max(512) defaultCellWidth!: number;
  @IsInt() @Min(8) @Max(512) defaultCellHeight!: number;
  @IsString() stylePreset!: string;
  @IsBoolean() transparentBackground!: boolean;
  @IsNumber() @Min(0.5) @Max(8) exportScale!: number;
}

class UpdateProjectDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsIn(["godot", "unity", "generic"]) engineTarget?: "godot" | "unity" | "generic";
  @IsOptional() @IsInt() @Min(8) @Max(512) defaultCellWidth?: number;
  @IsOptional() @IsInt() @Min(8) @Max(512) defaultCellHeight?: number;
  @IsOptional() @IsString() stylePreset?: string;
  @IsOptional() @IsBoolean() transparentBackground?: boolean;
  @IsOptional() @IsNumber() @Min(0.5) @Max(8) exportScale?: number;
}

@ApiTags("projects")
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new project" })
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all projects" })
  findAll() {
    return this.projects.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a project by ID" })
  findOne(@Param("id") id: string) {
    return this.projects.findById(id);
  }

  @Get(":id/full")
  @ApiOperation({ summary: "Get a project with assets, animations, and sheet layout" })
  getFull(@Param("id") id: string) {
    return this.projects.getFull(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a project" })
  update(@Param("id") id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }
}
