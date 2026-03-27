import { Module, Global } from "@nestjs/common";
import { DatabaseService } from "./database.service.js";
import { StorageService } from "./storage.service.js";

@Global()
@Module({
  providers: [DatabaseService, StorageService],
  exports: [DatabaseService, StorageService],
})
export class InfraModule {}
