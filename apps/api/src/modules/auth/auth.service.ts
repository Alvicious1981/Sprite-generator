import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DatabaseService } from "../../infra/database.service.js";
import * as crypto from "crypto";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.db.queryOne<UserRow>(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (existing) throw new ConflictException("Email already registered");

    const hash = this.hashPassword(password);
    const user = await this.db.queryOne<UserRow>(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, hash],
    );
    if (!user) throw new Error("Failed to create user");

    return { accessToken: this.jwt.sign({ sub: user.id, email: user.email }) };
  }

  async login(email: string, password: string) {
    const user = await this.db.queryOne<UserRow>(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email],
    );
    if (!user || user.password_hash !== this.hashPassword(password)) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return { accessToken: this.jwt.sign({ sub: user.id, email: user.email }) };
  }

  private hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }
}
