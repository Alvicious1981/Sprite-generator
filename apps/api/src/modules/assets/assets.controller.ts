import {
  Controller,
  Delete,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { AssetsService } from "./assets.service.js";

@ApiTags("assets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("assets")
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Delete(":id")
  @ApiOperation({ summary: "Delete an asset" })
  delete(@Request() req: { user: { id: string } }, @Param("id") id: string) {
    return this.assets.delete(id, req.user.id);
  }
}
