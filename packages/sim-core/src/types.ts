// Tipe inti Mesin Simulasi — murni, tanpa dependensi UI/browser (PRD §9.1).
export interface TilePos {
  x: number;
  y: number;
}

export type SupplierId = "pasar" | "hendra" | "vendor";

export interface ShopDecision {
  price: number;
  qty: number;
  supplier: SupplierId;
}

export interface WeekState {
  week: number;
  cash: number;
  stock: number;
  reputation: number;
  ap: number;
}

export interface ShockMultipliers {
  priceMultiplier: number;
  demandMultiplier: number;
}

export interface WeekResult {
  demand: number;
  unitsSold: number;
  unservedDemand: number;
  revenue: number;
  materialCost: number;
  fixedCost: number;
  cashDelta: number;
  stockDelta: number;
  spoiledUnits: number;
}

export type NpcPlace = "kedai" | "gudang" | "pasar" | "gerbang";

export type NpcAction =
  | { type: "walk_to"; place: NpcPlace }
  | { type: "speak"; topic: string }
  | { type: "offer"; offerId: string }
  | { type: "wait" };
