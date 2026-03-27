import { Controller, Post, Get, Param, Body, UseGuards, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import {
  IsUUID, IsInt, IsArray, IsNumber,
  Min, Max, ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { SheetService } from "./sheet.service.js";

class PlacementDto {
  @IsUUID() assetId!: string;
  @IsInt() @Min(0) row!: number;
  @IsInt() @Min(0) col!: number;
}

class ComposeSheetDto {
  @IsUUID() projectId!: string;
  @IsInt() @Min(1) @Max(64) columns!: number;
  @IsInt() @Min(1) @Max(64) rows!: number;
  @IsInt() @Min(1) @Max(512) cellWidth!: number;
  @IsInt() @Min(1) @Max(512) cellHeight!: number;
  @IsInt() @Min(0) @Max(64) margin!: number;
  @IsInt() @Min(0) @Max(64) padding!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlacementDto)
  placements!: PlacementDto[];
}

@ApiTags("sheets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("sheets")
export class SheetController {
  constructor(private readonly sheet: SheetService) {}

  @Post("compose")
  @ApiOperation({ summary: "Save sheet layout and trigger composition" })
  compose(@Request() req: { user: { id: string } }, @Body() dto: ComposeSheetDto) {
    return this.sheet.compose(req.user.id, dto);
  }

  @Get(":projectId/preview")
  @ApiOperation({ summary: "Get current sheet layout" })
  preview(@Request() req: { user: { id: string } }, @Param("projectId") id: string) {
    return this.sheet.getPreview(id, req.user.id);
  }
}
