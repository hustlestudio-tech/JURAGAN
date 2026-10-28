import { generateObject } from 'ai';
import { MarketShockSchema, type MarketShockRequest } from '@juragan/contracts';
import { MODEL_TIMEOUT_MS, createMetaModel, type MetaEnv } from './meta';

export interface ShockProposal {
  concept_id: string;
  price_multiplier: number;
  demand_multiplier: number;
  headline_game: string;
}

const clamp = (v: number, lo = 0.85, hi = 1.3) => Math.min(hi, Math.max(lo, v));

/** Model mengubah headline menjadi proposal; kode mem-clamp ke 0,85–1,30 (FR-026). Null = pakai kurasi. */
export async function proposeMarketShock(
  req: MarketShockRequest & { headline: string },
  env: MetaEnv,
  fetchFn: typeof fetch = fetch,
): Promise<ShockProposal | null> {
  try {
    // no-schema: SDK mengambil JSON tanpa validasi; Zod + clamp milik kode (FR-026).
    const { object } = await generateObject({
      model: createMetaModel(env, fetchFn),
      instructions:
        'Ubah headline ekonomi menjadi event pasar game kedai kopi: concept_id dari enum, pengali 0.85–1.30, headline_game versi game (maks 200 karakter). Jawab HANYA JSON.',
      prompt: req.headline,
      output: 'no-schema',
      maxOutputTokens: 300,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    });
    const parsed = MarketShockSchema.safeParse(object);
    if (!parsed.success) {
      // Terima lalu clamp bila hanya pengali yang di luar rentang.
      const loose = object as Partial<ShockProposal>;
      const retry = MarketShockSchema.safeParse({
        ...loose,
        price_multiplier: clamp(Number(loose.price_multiplier)),
        demand_multiplier: clamp(Number(loose.demand_multiplier)),
      });
      if (!retry.success) return null;
      return retry.data;
    }
    return {
      ...parsed.data,
      price_multiplier: clamp(parsed.data.price_multiplier),
      demand_multiplier: clamp(parsed.data.demand_multiplier),
    };
  } catch {
    return null;
  }
}
