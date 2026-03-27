-- Sprite Generator — PostgreSQL schema
-- Run once to initialize the database.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  engine_target        TEXT NOT NULL CHECK (engine_target IN ('godot', 'unity', 'generic')),
  default_cell_width   INTEGER NOT NULL DEFAULT 32,
  default_cell_height  INTEGER NOT NULL DEFAULT 32,
  style_preset         TEXT NOT NULL DEFAULT 'pixel_art',
  transparent_background BOOLEAN NOT NULL DEFAULT TRUE,
  export_scale         NUMERIC(4,2) NOT NULL DEFAULT 1,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- ─── Assets ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL CHECK (kind IN ('sprite', 'reference', 'sheet', 'thumbnail')),
  prompt        TEXT,
  image_url     TEXT NOT NULL,
  width         INTEGER NOT NULL,
  height        INTEGER NOT NULL,
  has_alpha     BOOLEAN NOT NULL DEFAULT TRUE,
  source_model  TEXT,
  metadata_json JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_kind ON assets(kind);

-- ─── Animations ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS animations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  fps         INTEGER NOT NULL DEFAULT 8,
  loop        BOOLEAN NOT NULL DEFAULT TRUE,
  frame_ids   UUID[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_animations_project_id ON animations(project_id);

-- ─── Sheet Layouts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sheet_layouts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  columns     INTEGER NOT NULL,
  rows        INTEGER NOT NULL,
  cell_width  INTEGER NOT NULL,
  cell_height INTEGER NOT NULL,
  margin      INTEGER NOT NULL DEFAULT 0,
  padding     INTEGER NOT NULL DEFAULT 0,
  placements  JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id)
);

-- ─── Export Jobs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS export_jobs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  engine      TEXT NOT NULL CHECK (engine IN ('godot', 'unity', 'generic')),
  result_url  TEXT,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
