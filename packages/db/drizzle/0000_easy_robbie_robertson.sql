CREATE TABLE "action_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"week" integer NOT NULL,
	"action_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "action_logs_session_key_uniq" UNIQUE("session_id","idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "agent_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"week" integer NOT NULL,
	"npc_id" text NOT NULL,
	"trigger" text NOT NULL,
	"tool_name" text NOT NULL,
	"arguments" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"validation_result" text NOT NULL,
	"executed_action" text NOT NULL,
	"latency_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_states" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"week" integer NOT NULL,
	"cash" bigint NOT NULL,
	"stock" integer NOT NULL,
	"reputation" integer NOT NULL,
	"ap_remaining" integer NOT NULL,
	"contract_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"vendor_state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"unlocked_concepts" text[] DEFAULT '{}' NOT NULL,
	"snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"state_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_news_cache" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"source_name" text NOT NULL,
	"source_url" text NOT NULL,
	"headline" text NOT NULL,
	"published_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"shock_proposal" jsonb,
	"origin" text NOT NULL,
	CONSTRAINT "market_news_cache_origin_check" CHECK ("market_news_cache"."origin" IN ('live', 'curated'))
);
--> statement-breakpoint
CREATE TABLE "player_profiles" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"risk_style" text NOT NULL,
	"experience" text NOT NULL,
	"goal" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mode" text NOT NULL,
	"pilot_code" text,
	"consent_at" timestamp with time zone,
	"status" text NOT NULL,
	"seed" bigint NOT NULL,
	"difficulty" text DEFAULT 'normal' NOT NULL,
	"session_token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sessions_mode_check" CHECK ("sessions"."mode" IN ('demo', 'pilot'))
);
--> statement-breakpoint
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_logs" ADD CONSTRAINT "agent_logs_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_states" ADD CONSTRAINT "game_states_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;