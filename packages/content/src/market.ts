// Lima kartu kurasi cadangan Market Shock (FR-025). Selalu berlabel "Simulasi pasar".
// Bentuk snake_case = sama persis dengan kontrak API MarketShock (packages/contracts).
import { CONCEPT_IDS } from "./concepts";

export interface CuratedShockCard {
  id: string;
  concept_id: string;
  headline_game: string;
  price_multiplier: number;
  demand_multiplier: number;
}

export const CURATED_SHOCK_CARDS: readonly CuratedShockCard[] = [
  {
    id: "kurasi-01",
    concept_id: "price-elasticity",
    headline_game: "Harga gula pasir naik, warung sekitar menaikkan harga minuman.",
    price_multiplier: 1.12,
    demand_multiplier: 0.95,
  },
  {
    id: "kurasi-02",
    concept_id: "working-capital",
    headline_game: "Distributor kopi tersendat, pengiriman telat seminggu.",
    price_multiplier: 1.2,
    demand_multiplier: 0.9,
  },
  {
    id: "kurasi-03",
    concept_id: "break-even",
    headline_game: "Festival kampus! Pengunjung membludak di sekitar gerbang.",
    price_multiplier: 0.95,
    demand_multiplier: 1.28,
  },
  {
    id: "kurasi-04",
    concept_id: "cashflow-vs-profit",
    headline_game: "Hujan deras seminggu penuh, mahasiswa malas keluar kos.",
    price_multiplier: 1.0,
    demand_multiplier: 0.85,
  },
  {
    id: "kurasi-05",
    concept_id: "price-elasticity",
    headline_game: "Panen raya kopi, harga biji di pasar turun.",
    price_multiplier: 0.88,
    demand_multiplier: 1.1,
  },
];

export function curatedCardForWeek(week: number): CuratedShockCard {
  const card = CURATED_SHOCK_CARDS[(week - 1) % CURATED_SHOCK_CARDS.length] as CuratedShockCard;
  if (!CONCEPT_IDS.includes(card.concept_id)) throw new Error(`concept_id kurasi tidak valid: ${card.id}`);
  return card;
}
