import { MarketShockSchema, type MarketShockRequest } from "@juragan/contracts";
import { chatCompletions, type MetaEnv } from "./meta";
import { MARKET_SHOCK_FORMAT } from "./schemas";

export interface ShockProposal {
  concept_id: string;
  price_multiplier: number;
  demand_multiplier: number;
  headline_game: string;
}

const clamp = (v: number, lo = 0.85, hi = 1.3) => Math.min(hi, Math.max(lo, v));

/** Model mengubah headline menjadi proposal; kode mem-clamp ke 0.85–1.30 (FR-026). Null = pakai kurasi. */
export async function proposeMarketShock(
  req: MarketShockRequest & { headline: string },
  env: MetaEnv,
  fetchFn: typeof fetch = fetch,
): Promise<ShockProposal | null> {
  try {
    const { content } = await chatCompletions(
      {
        messages: [
          {
            role: "system",
            content:
              "Ubah headline ekonomi menjadi event pasar game kedai kopi. Jawab HANYA dengan JSON sesuai skema: concept_id dari enum, pengali 0.85–1.30, headline_game versi game (maks 200 karakter).",
          },
          { role: "user", content: req.headline },
        ],
        response_format: MARKET_SHOCK_FORMAT,
        max_tokens: 300,
      },
      env,
      fetchFn,
    );
    if (!content) return null;
    const parsed = MarketShockSchema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      // Coba terima lalu clamp bila hanya pengali yang di luar rentang.
      const loose = JSON.parse(content) as Partial<ShockProposal>;
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
