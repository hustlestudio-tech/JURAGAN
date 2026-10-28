import { useState } from "react";
import {
  BASE_DEMAND_D0,
  ELASTICITY,
  FIXED_COST_PER_WEEK,
  HENDRA_CONTRACT_PRICE,
  PASAR_BULK_DISCOUNT,
  PASAR_BULK_MIN_QTY,
  PASAR_PRICE,
  REFERENCE_PRICE,
  VENDOR_SCALE_SHORTFALL,
  compileMap,
} from "@juragan/content";
import { findPath, runWeek, type EconomyParams, type NpcPlace } from "@juragan/sim-core";
import { useGameStore } from "../state/store";
import { useMarketShock, useNpcTick } from "../api/client";
import { formatRp } from "./HUD";

const MAP = compileMap();
const DEMO_SEED = 20261029;

const PARAMS: EconomyParams = {
  d0: BASE_DEMAND_D0,
  referencePrice: REFERENCE_PRICE,
  elasticity: ELASTICITY,
  pasarPrice: PASAR_PRICE,
  bulkDiscount: PASAR_BULK_DISCOUNT,
  bulkMinQty: PASAR_BULK_MIN_QTY,
  fixedCost: FIXED_COST_PER_WEEK,
  hendraPrice: HENDRA_CONTRACT_PRICE,
  vendorShortfall: VENDOR_SCALE_SHORTFALL,
};

function nearestPlace(x: number, y: number): NpcPlace {
  let best: NpcPlace = "kedai";
  let bestDist = Infinity;
  for (const [place, p] of Object.entries(MAP.placeAnchors) as [NpcPlace, { x: number; y: number }][]) {
    const d = Math.abs(p.x - x) + Math.abs(p.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = place;
    }
  }
  return best;
}

const btn =
  "pixel-btn min-h-[44px] flex-1 rounded bg-emas px-2 py-2 font-pixel text-[11px] text-rimba active:pixel-btn-active disabled:opacity-50";

export function Controls() {
  const npcTick = useNpcTick();
  const shock = useMarketShock();
  const [running, setRunning] = useState(false);

  const onNpcTick = () => {
    const s = useGameStore.getState();
    const vendor = s.npcPos.vendor;
    npcTick.mutate(
      {
        npcId: "vendor",
        week: s.hud.week,
        tickIndex: s.tickIndex,
        playerPlace: nearestPlace(s.playerPos.x, s.playerPos.y),
        npcPlace: nearestPlace(vendor.x, vendor.y),
      },
      {
        onSuccess: (res) => {
          const g = useGameStore.getState();
          g.pushLog(res.log);
          g.bumpTick();
          if (res.action.type === "walk_to" && res.action.place) {
            const target = MAP.placeAnchors[res.action.place];
            const path = findPath(MAP.solid, g.npcPos.vendor, target);
            if (path && path.length > 0) {
              g.pushOrder("vendor", path);
              g.setNpcPos("vendor", target);
              g.notify(`Vendor menuju ${res.action.place} (${res.source})`);
            } else {
              g.notify(`Vendor bertahan (${res.source})`);
            }
          } else {
            g.notify(`Vendor: ${res.action.type} (${res.source})`);
          }
        },
        onError: () => useGameStore.getState().notify("API tick tidak terjangkau"),
      },
    );
  };

  const onShock = () => {
    const week = useGameStore.getState().hud.week;
    shock.mutate(
      { week },
      {
        onSuccess: (res) => {
          useGameStore.getState().setMarketCard({ ...res.card, origin: res.origin });
        },
        onError: () => useGameStore.getState().notify("API shock tidak terjangkau"),
      },
    );
  };

  const onRunWeek = () => {
    setRunning(true);
    try {
      const s = useGameStore.getState();
      const card = s.marketCard;
      const { state, result } = runWeek(
        { week: s.hud.week, cash: s.hud.cash, stock: s.hud.stock, reputation: s.hud.reputation, ap: s.hud.ap },
        { price: 15_000, qty: 80, supplier: "pasar" },
        {
          priceMultiplier: card?.price_multiplier ?? 1,
          demandMultiplier: card?.demand_multiplier ?? 1,
        },
        DEMO_SEED,
        PARAMS,
      );
      s.setHud({ week: state.week, cash: state.cash, stock: state.stock, reputation: state.reputation, ap: state.ap });
      s.setLastResult(result);
      s.notify(
        `Minggu ${s.hud.week}: ${result.unitsSold} terjual, kas ${result.cashDelta >= 0 ? "+" : ""}${formatRp(result.cashDelta)}`,
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button className={btn} onClick={onNpcTick} disabled={npcTick.isPending}>
          {npcTick.isPending ? "…" : "Simulasi Tick NPC"}
        </button>
        <button className={btn} onClick={onShock} disabled={shock.isPending}>
          {shock.isPending ? "…" : "Market Shock"}
        </button>
        <button className={btn} onClick={onRunWeek} disabled={running}>
          Jalankan Minggu
        </button>
      </div>
    </div>
  );
}
