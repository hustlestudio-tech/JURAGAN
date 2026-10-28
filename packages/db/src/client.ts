import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import type { DbStatus } from '@juragan/contracts';
import * as schema from './schema';

function buildDb(url: string) {
  return drizzle(neon(url), { schema });
}

export type JuraganDb = ReturnType<typeof buildDb>;

let cached: { url: string; db: JuraganDb } | null = null;

/** Klien Drizzle mode HTTP (stateless, aman untuk serverless). Null bila URL tak diset. */
export function getDb(
  url: string | undefined = process.env.DATABASE_URL,
): JuraganDb | null {
  if (!url) return null;
  if (!cached || cached.url !== url) cached = { url, db: buildDb(url) };
  return cached.db;
}

/** unconfigured = DATABASE_URL tidak diset (S1 sah tanpa DB); down = diset tapi tak terjangkau. */
export async function checkDb(
  url: string | undefined = process.env.DATABASE_URL,
): Promise<DbStatus> {
  if (!url) return 'unconfigured';
  try {
    const db = getDb(url);
    if (!db) return 'unconfigured';
    await db.execute(sql`SELECT 1`);
    return 'up';
  } catch {
    return 'down';
  }
}
