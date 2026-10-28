import { Hono } from 'hono';
import {
  MarketShockRequestSchema,
  NpcTickRequestSchema,
  err,
} from '@juragan/contracts';
import { curatedCardForWeek } from '@juragan/content';
import {
  proposeMarketShock,
  readMetaEnv,
  runNpcTick,
} from '@juragan/ai-client';
import { checkDb } from '@juragan/db';

/** Hono murni, portable: tanpa API khusus Vercel/Bun (AGENTS.md §4). */
export function createApp() {
  const app = new Hono();

  app.onError((e, c) =>
    c.json(err('internal', e.message || 'Kesalahan server'), 500),
  );
  app.notFound((c) => c.json(err('not_found', 'Tidak ditemukan'), 404));

  app.get('/api/health', async (c) => {
    const db = await checkDb();
    if (db === 'down')
      return c.json(err('db_unreachable', 'Basis data tidak terjangkau'), 503);
    return c.json({ status: 'ok', db, time: new Date().toISOString() });
  });

  app.post('/api/npc-tick', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(err('bad_json', 'Body bukan JSON valid'), 400);
    }
    const parsed = NpcTickRequestSchema.safeParse(body);
    if (!parsed.success)
      return c.json(err('invalid_request', 'Isian tick tidak valid'), 400);
    return c.json(await runNpcTick(parsed.data, readMetaEnv()));
  });

  app.post('/api/market-shock', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(err('bad_json', 'Body bukan JSON valid'), 400);
    }
    const parsed = MarketShockRequestSchema.safeParse(body);
    if (!parsed.success)
      return c.json(
        err('invalid_request', 'Isian market shock tidak valid'),
        400,
      );
    const env = readMetaEnv();
    if (parsed.data.headline && env.apiKey) {
      const proposal = await proposeMarketShock(
        { week: parsed.data.week, headline: parsed.data.headline },
        env,
      );
      if (proposal) {
        return c.json({
          card: { id: `live-w${parsed.data.week}`, ...proposal },
          origin: 'live',
          source: 'model',
        });
      }
    }
    return c.json({
      card: curatedCardForWeek(parsed.data.week),
      origin: 'curated',
      source: 'fallback',
    });
  });

  return app;
}

export type JuraganApp = ReturnType<typeof createApp>;
