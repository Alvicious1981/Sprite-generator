import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor(private readonly config: ConfigService) {
    this.pool = new Pool({
      connectionString: this.config.getOrThrow<string>("DATABASE_URL"),
      max: 20,
    });
  }

  async onModuleInit() {
    await this.pool.query("SELECT 1");
    this.logger.log("Database connection established");
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  get client(): Pool {
    return this.pool;
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as T[];
  }

  async queryOne<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }
}
