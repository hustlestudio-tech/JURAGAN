import { describe, expect, test } from 'bun:test';
import { runWeek, weekNoise, type EconomyParams } from '../src/economy';

const P: EconomyParams = {
  d0: 90,
  referencePrice: 15_000,
  elasticity: 1.6,
  pasarPrice: 6_000,
  bulkDiscount: 0.08,
  bulkMinQty: 150,
  fixedCost: 350_000,
  hendraPrice: 5_400,
  vendorShortfall: 0.1,
};

const BASE = { week: 1, cash: 5_000_000, stock: 60, reputation: 50, ap: 3 };
const NO_SHOCK = { priceMultiplier: 1, demandMultiplier: 1 };

describe('runWeek', () => {
  test('deterministik: seed sama -> hasil identik (M6)', () => {
    const d = { price: 15_000, qty: 80, supplier: 'pasar' as const };
    const a = runWeek(BASE, d, NO_SHOCK, 42, P);
    const b = runWeek(BASE, d, NO_SHOCK, 42, P);
    expect(a).toEqual(b);
  });

  test('stok habis -> unserved demand tercatat, tanpa NaN (FR-013)', () => {
    const { state, result } = runWeek(
      { ...BASE, stock: 0 },
      { price: 15_000, qty: 0, supplier: 'pasar' },
      NO_SHOCK,
      7,
      P,
    );
    expect(result.unitsSold).toBe(0);
    expect(result.unservedDemand).toBeGreaterThan(0);
    for (const v of Object.values({ ...state, ...result })) {
      expect(Number.isNaN(v as number)).toBe(false);
    }
  });

  test('harga lebih tinggi -> permintaan turun (elastisitas)', () => {
    const cheap = runWeek(
      BASE,
      { price: 12_000, qty: 100, supplier: 'pasar' },
      NO_SHOCK,
      7,
      P,
    );
    const pricey = runWeek(
      BASE,
      { price: 25_000, qty: 100, supplier: 'pasar' },
      NO_SHOCK,
      7,
      P,
    );
    expect(pricey.result.demand).toBeLessThan(cheap.result.demand);
  });

  test('diskon grosir >= 150 unit menurunkan biaya bahan', () => {
    const small = runWeek(
      BASE,
      { price: 15_000, qty: 100, supplier: 'pasar' },
      NO_SHOCK,
      7,
      P,
    );
    const bulk = runWeek(
      BASE,
      { price: 15_000, qty: 150, supplier: 'pasar' },
      NO_SHOCK,
      7,
      P,
    );
    expect(bulk.result.materialCost / 150).toBeLessThan(
      small.result.materialCost / 100,
    );
  });

  test('vendor menyusutkan kiriman 10% (FR-024)', () => {
    const { result } = runWeek(
      BASE,
      { price: 15_000, qty: 100, supplier: 'vendor' },
      NO_SHOCK,
      7,
      P,
    );
    expect(result.stockDelta).toBe(90 - result.unitsSold);
  });

  test('noise terbatas [-0.05, +0.05) dan stabil per (seed, minggu)', () => {
    for (let s = 0; s < 50; s++) {
      const n = weekNoise(s, 3);
      expect(n).toBeGreaterThanOrEqual(-0.05);
      expect(n).toBeLessThan(0.05);
      expect(weekNoise(s, 3)).toBe(n);
    }
  });
});
