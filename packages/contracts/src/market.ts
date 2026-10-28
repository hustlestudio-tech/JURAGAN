import { z } from "zod";

export const CONCEPT_IDS = [
  "break-even",
  "working-capital",
  "cashflow-vs-profit",
  "price-elasticity",
  "contract-risk",
  "supplier-verification",
] as const;

export const MarketShockSchema = z.object({
  concept_id: z.enum(CONCEPT_IDS),
  price_multiplier: z.number().min(0.85).max(1.3),
  demand_multiplier: z.number().min(0.85).max(1.3),
  headline_game: z.string().min(1).max(200),
});
export type MarketShock = z.infer<typeof MarketShockSchema>;

export const MarketShockRequestSchema = z.object({
  week: z.number().int().min(1).max(4),
  headline: z.string().max(500).optional(),
});
export type MarketShockRequest = z.infer<typeof MarketShockRequestSchema>;

export const MarketShockResponseSchema = z.object({
  card: MarketShockSchema.extend({ id: z.string() }),
  origin: z.enum(["live", "curated"]),
  source: z.enum(["model", "fallback"]),
});
export type MarketShockResponse = z.infer<typeof MarketShockResponseSchema>;
