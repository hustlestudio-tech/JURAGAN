import { z } from "zod";

// Daftar aksi sah model (PRD §9.6). Bentuk DATAR agar cocok dengan strict subset Meta.
export const NPC_PLACES = ["kedai", "gudang", "pasar", "gerbang"] as const;
export const NPC_IDS = ["dimas", "pak-hendra", "pak-budi", "vendor"] as const;

export const NpcActionFlatSchema = z.object({
  type: z.enum(["walk_to", "speak", "offer", "wait"]),
  place: z.enum(NPC_PLACES).nullable(),
  topic: z.string().max(64).nullable(),
  offerId: z.string().max(64).nullable(),
});
export type NpcActionFlat = z.infer<typeof NpcActionFlatSchema>;

export const NpcTickRequestSchema = z.object({
  npcId: z.enum(NPC_IDS),
  week: z.number().int().min(1).max(4),
  tickIndex: z.number().int().min(0),
  playerPlace: z.enum(NPC_PLACES),
  npcPlace: z.enum(NPC_PLACES),
});
export type NpcTickRequest = z.infer<typeof NpcTickRequestSchema>;

export const AgentLogEntrySchema = z.object({
  npcId: z.string(),
  tool: z.string(),
  args: z.record(z.string(), z.unknown()),
  validation: z.enum(["ok", "rejected", "fallback"]),
  source: z.enum(["model", "fallback"]),
  latencyMs: z.number().int().min(0),
});
export type AgentLogEntry = z.infer<typeof AgentLogEntrySchema>;

export const NpcTickResponseSchema = z.object({
  action: NpcActionFlatSchema,
  source: z.enum(["model", "fallback"]),
  log: AgentLogEntrySchema,
});
export type NpcTickResponse = z.infer<typeof NpcTickResponseSchema>;
