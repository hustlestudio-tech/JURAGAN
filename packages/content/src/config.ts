// Angka tuning PRD §9.8 — semua [ASUMSI – OQ-05], dapat dituning tanpa ubah kode sim.
export const WEEKS_PER_RUN = 4;
export const AP_PER_WEEK = 3;
export const START_CASH = 5_000_000;
export const START_STOCK = 60;
export const START_REPUTATION = 50;

export const BASE_DEMAND_D0 = 90;
export const REFERENCE_PRICE = 15_000;
export const ELASTICITY = 1.6;

export const PASAR_PRICE = 6_000;
export const PASAR_BULK_DISCOUNT = 0.08;
export const PASAR_BULK_MIN_QTY = 150;
export const FIXED_COST_PER_WEEK = 350_000;
export const HENDRA_CONTRACT_PRICE = 5_400;

export const VENDOR_SCALE_SHORTFALL = 0.1;
export const VENDOR_FIRST_SHIPMENT_RATE = 0.6;

export const VENDOR_MAX_WORDS = 50;
export const CONTRACT_ASSISTANT_MAX_WORDS = 60;

export const STAR_THRESHOLDS = { star3: 7_500_000, star2: 5_500_000 } as const;

export const PRICE_RANGE = { min: 5_000, max: 50_000, step: 500 } as const;
export const QTY_RANGE = { min: 0, max: 300 } as const;

export const SHOCK_CLAMP = { min: 0.85, max: 1.3 } as const;
export const SHOCK_WEEKS = [2, 3, 4] as const;
