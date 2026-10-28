import { sql } from 'drizzle-orm';
import {
  bigserial,
  bigint,
  check,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

// Skema MVP (PRD §9.5) sebagai sumber kebenaran tunggal. Migrasi SQL dibuat via:
//   cd packages/db && bun x drizzle-kit generate
// Terapkan ke Neon via: bun run db:migrate

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey(),
    mode: text('mode').notNull(),
    pilotCode: text('pilot_code'),
    consentAt: timestamp('consent_at', { withTimezone: true }),
    status: text('status').notNull(),
    seed: bigint('seed', { mode: 'number' }).notNull(),
    difficulty: text('difficulty').notNull().default('normal'),
    sessionTokenHash: text('session_token_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (t) => [check('sessions_mode_check', sql`${t.mode} IN ('demo', 'pilot')`)],
);

export const playerProfiles = pgTable('player_profiles', {
  sessionId: uuid('session_id')
    .primaryKey()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  riskStyle: text('risk_style').notNull(),
  experience: text('experience').notNull(),
  goal: text('goal').notNull(),
});

export const gameStates = pgTable('game_states', {
  sessionId: uuid('session_id')
    .primaryKey()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  week: integer('week').notNull(),
  cash: bigint('cash', { mode: 'number' }).notNull(),
  stock: integer('stock').notNull(),
  reputation: integer('reputation').notNull(),
  apRemaining: integer('ap_remaining').notNull(),
  contractState: jsonb('contract_state').notNull().default({}),
  vendorState: jsonb('vendor_state').notNull().default({}),
  unlockedConcepts: text('unlocked_concepts').array().notNull().default([]),
  snapshot: jsonb('snapshot').notNull().default({}),
  stateVersion: integer('state_version').notNull().default(0),
});

export const actionLogs = pgTable(
  'action_logs',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    week: integer('week').notNull(),
    actionType: text('action_type').notNull(),
    payload: jsonb('payload').notNull().default({}),
    idempotencyKey: text('idempotency_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique('action_logs_session_key_uniq').on(t.sessionId, t.idempotencyKey),
  ],
);

export const agentLogs = pgTable('agent_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  week: integer('week').notNull(),
  npcId: text('npc_id').notNull(),
  trigger: text('trigger').notNull(),
  toolName: text('tool_name').notNull(),
  arguments: jsonb('arguments').notNull().default({}),
  validationResult: text('validation_result').notNull(),
  executedAction: text('executed_action').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const marketNewsCache = pgTable(
  'market_news_cache',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    sourceName: text('source_name').notNull(),
    sourceUrl: text('source_url').notNull(),
    headline: text('headline').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    fetchedAt: timestamp('fetched_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    shockProposal: jsonb('shock_proposal'),
    origin: text('origin').notNull(),
  },
  (t) => [
    check(
      'market_news_cache_origin_check',
      sql`${t.origin} IN ('live', 'curated')`,
    ),
  ],
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type GameStateRow = typeof gameStates.$inferSelect;
export type ActionLog = typeof actionLogs.$inferSelect;
export type AgentLogRow = typeof agentLogs.$inferSelect;
export type MarketNewsCacheRow = typeof marketNewsCache.$inferSelect;
