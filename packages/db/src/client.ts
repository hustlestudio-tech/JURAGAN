import { neon } from "@neondatabase/serverless";
import type { DbStatus } from "@juragan/contracts";

let cached: ReturnType<typeof neon> | null = null;

export function getSql(url: string | undefined = process.env.DATABASE_URL) {
  if (!url) return null;
  if (!cached) cached = neon(url);
  return cached;
}

/** unconfigured = DATABASE_URL tidak diset (S1 sah tanpa DB); down = diset tapi tak terjangkau. */
export async function checkDb(url: string | undefined = process.env.DATABASE_URL): Promise<DbStatus> {
  if (!url) return "unconfigured";
  try {
    const sql = getSql(url);
    if (!sql) return "unconfigured";
    await sql`SELECT 1`;
    return "up";
  } catch {
    return "down";
  }
}
