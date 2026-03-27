import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * S3-compatible storage service.
 * Uses the AWS SDK v3 pattern — swap the implementation to change providers.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>("STORAGE_BUCKET");
    this.endpoint = this.config.getOrThrow<string>("STORAGE_ENDPOINT");
  }

  async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    // TODO: replace with real S3/R2 SDK call
    this.logger.debug(`Uploading ${key} (${buffer.length} bytes)`);
    const url = `${this.endpoint}/${this.bucket}/${key}`;
    return { key, url };
  }

  async uploadBase64(
    key: string,
    base64: string,
    contentType: string,
  ): Promise<UploadResult> {
    const buffer = Buffer.from(base64, "base64");
    return this.uploadBuffer(key, buffer, contentType);
  }

  getPublicUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async delete(key: string): Promise<void> {
    this.logger.debug(`Deleting ${key}`);
    // TODO: replace with real S3/R2 SDK call
  }
}
