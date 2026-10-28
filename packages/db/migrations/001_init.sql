-- 001_init.sql — Skema MVP (PRD §9.5). Dijalankan via `bun run db:migrate`.
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('demo', 'pilot')),
  pilot_code TEXT NULL,
  consent_at TIMESTAMPTZ NULL,
  status TEXT NOT NULL,
  seed BIGINT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'normal',
  session_token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS player_profiles (
  session_id UUID PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  risk_style TEXT NOT NULL,
  experience TEXT NOT NULL,
  goal TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS game_states (
  session_id UUID PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  week INT NOT NULL,
  cash BIGINT NOT NULL,
  stock INT NOT NULL,
  reputation INT NOT NULL,
  ap_remaining INT NOT NULL,
  contract_state JSONB NOT NULL DEFAULT '{}',
  vendor_state JSONB NOT NULL DEFAULT '{}',
  unlocked_concepts TEXT[] NOT NULL DEFAULT '{}',
  snapshot JSONB NOT NULL DEFAULT '{}',
  state_version INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS action_logs (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  week INT NOT NULL,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS agent_logs (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  week INT NOT NULL,
  npc_id TEXT NOT NULL,
  trigger TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  arguments JSONB NOT NULL DEFAULT '{}',
  validation_result TEXT NOT NULL,
  executed_action TEXT NOT NULL,
  latency_ms INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_news_cache (
  id BIGSERIAL PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  headline TEXT NOT NULL,
  published_at TIMESTAMPTZ NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  shock_proposal JSONB NULL,
  origin TEXT NOT NULL CHECK (origin IN ('live', 'curated'))
);
