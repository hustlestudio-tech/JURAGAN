// Kalkulasi ekonomi deterministik (PRD §9.8). applyAction(state, action, seed) -> { state', events[] }.
import type {
  ShockMultipliers,
  ShopDecision,
  WeekResult,
  WeekState,
} from './types';

export interface EconomyParams {
  d0: number;
  referencePrice: number;
  elasticity: number;
  pasarPrice: number;
  bulkDiscount: number;
  bulkMinQty: number;
  fixedCost: number;
  hendraPrice: number;
  vendorShortfall: number;
}

/** Noise deterministik dari hash seed+minggu — keputusan pemain tak menggeser urutan acuan. */
export function weekNoise(seed: number, week: number): number {
  let h = (seed * 31 + week * 101) | 0;
  h = Math.imul(h ^ (h >>> 16), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  h ^= h >>> 16;
  return ((h >>> 0) % 1000) / 1000 / 10 - 0.05; // [-0.05, +0.05)
}

export function materialUnitPrice(
  decision: ShopDecision,
  p: EconomyParams,
): number {
  if (decision.supplier === 'hendra') return p.hendraPrice;
  if (decision.supplier === 'vendor') return Math.round(p.pasarPrice * 0.7);
  const bulk = decision.qty >= p.bulkMinQty ? 1 - p.bulkDiscount : 1;
  return Math.round(p.pasarPrice * bulk);
}

export function runWeek(
  state: WeekState,
  decision: ShopDecision,
  shock: ShockMultipliers,
  seed: number,
  p: EconomyParams,
): { state: WeekState; result: WeekResult } {
  const price = Math.max(1, decision.price);
  const demand = Math.max(
    0,
    Math.floor(
      p.d0 *
        Math.pow(p.referencePrice / price, p.elasticity) *
        (0.6 + (0.4 * state.reputation) / 100) *
        shock.demandMultiplier *
        (1 + weekNoise(seed, state.week)),
    ),
  );
  const unitPrice = Math.round(
    materialUnitPrice(decision, p) * shock.priceMultiplier,
  );
  const materialCost = unitPrice * decision.qty;

  // Kiriman vendor menyusut tanpa peringatan bila tak dicek (FR-024); S1: selalu terapkan susut.
  const delivered =
    decision.supplier === 'vendor'
      ? Math.floor(decision.qty * (1 - p.vendorShortfall))
      : decision.qty;

  const available = state.stock + delivered;
  const unitsSold = Math.min(demand, available);
  const unservedDemand = Math.max(0, demand - available);
  const revenue = unitsSold * price;
  const cashDelta = revenue - materialCost - p.fixedCost;
  const stockDelta = delivered - unitsSold;

  return {
    state: {
      week: state.week + 1,
      cash: state.cash + cashDelta,
      stock: state.stock + stockDelta,
      reputation: Math.max(
        0,
        Math.min(100, state.reputation + (unservedDemand > 0 ? -2 : 1)),
      ),
      ap: state.ap,
    },
    result: {
      demand,
      unitsSold,
      unservedDemand,
      revenue,
      materialCost,
      fixedCost: p.fixedCost,
      cashDelta,
      stockDelta,
      spoiledUnits: 0,
    },
  };
}
