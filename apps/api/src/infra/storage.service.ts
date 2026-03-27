import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";

export interface UploadResult {
  key: string;
  url: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly mode: "local" | "s3";
  private readonly uploadsDir: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.mode = (config.get<string>("STORAGE_MODE") ?? "local") as "local" | "s3";
    this.uploadsDir = config.get<string>("UPLOADS_DIR") ?? path.join(process.cwd(), "uploads");
    this.publicUrl = config.get<string>("PUBLIC_URL") ?? "http://localhost:3001";

    if (this.mode === "local") {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      this.logger.log(`Local storage → ${this.uploadsDir}`);
    }
  }

  async uploadBuffer(key: string, buffer: Buffer, _contentType: string): Promise<UploadResult> {
    if (this.mode === "local") {
      return this.writeLocal(key, buffer);
    }
    // TODO: replace with real S3/R2 SDK call
    this.logger.warn("S3 storage not implemented; falling back to local");
    return this.writeLocal(key, buffer);
  }

  async uploadBase64(key: string, base64: string, contentType: string): Promise<UploadResult> {
    const buffer = Buffer.from(base64, "base64");
    return this.uploadBuffer(key, buffer, contentType);
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    if (this.mode === "local") {
      const fullPath = path.join(this.uploadsDir, key);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.debug(`Deleted ${fullPath}`);
      }
      return;
    }
    // TODO: S3 delete
    this.logger.warn(`S3 delete not implemented for key: ${key}`);
  }

  private writeLocal(key: string, buffer: Buffer): UploadResult {
    const fullPath = path.join(this.uploadsDir, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    this.logger.debug(`Saved ${key} (${buffer.length} bytes)`);
    return { key, url: this.getPublicUrl(key) };
  }
}
