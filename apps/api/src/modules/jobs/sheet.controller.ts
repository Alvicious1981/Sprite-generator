import { Controller, Post, Get, Param, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import {
  IsUUID, IsInt, IsArray,
  Min, Max, ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
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
@Controller("sheets")
export class SheetController {
  constructor(private readonly sheet: SheetService) {}

  @Post("compose")
  @ApiOperation({ summary: "Save sheet layout" })
  compose(@Body() dto: ComposeSheetDto) {
    return this.sheet.compose(dto);
  }

  @Get(":projectId/preview")
  @ApiOperation({ summary: "Get current sheet layout" })
  preview(@Param("projectId") id: string) {
    return this.sheet.getPreview(id);
  }
}
