import { z } from "zod";

// Amplop error tunggal (PRD §9.4): { error: { code, message } }
export const ErrorEnvelopeSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

export function err(code: string, message: string): ErrorEnvelope {
  return { error: { code, message } };
}

export const DbStatusSchema = z.enum(["up", "down", "unconfigured"]);
export type DbStatus = z.infer<typeof DbStatusSchema>;

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  db: DbStatusSchema,
  time: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
