import { create } from 'zustand';
import {
  AP_PER_WEEK,
  START_CASH,
  START_REPUTATION,
  START_STOCK,
  compileMap,
  type NpcId,
  type TilePos,
} from '@juragan/content';
import type { AgentLogEntry, MarketShockResponse } from '@juragan/contracts';
import type { WeekResult } from '@juragan/sim-core';

export type ActorId = 'player' | NpcId;

export interface MoveOrder {
  id: number;
  actor: ActorId;
  path: TilePos[];
}

export interface WeekHud {
  week: number;
  cash: number;
  stock: number;
  reputation: number;
  ap: number;
}

/** Entri log + nomor urut stabil untuk key React (append-only). */
export type LogEntry = AgentLogEntry & { seq: number };

export type MarketCardView = MarketShockResponse['card'] & {
  origin: 'live' | 'curated';
};

interface GameStore {
  playerPos: TilePos;
  npcPos: Record<NpcId, TilePos>;
  orders: MoveOrder[];
  hud: WeekHud;
  lastResult: WeekResult | null;
  agentLog: LogEntry[];
  marketCard: MarketCardView | null;
  notice: string | null;
  tickIndex: number;
  pushOrder: (actor: ActorId, path: TilePos[]) => void;
  ackOrder: (id: number) => void;
  setPlayerPos: (p: TilePos) => void;
  setNpcPos: (npc: NpcId, p: TilePos) => void;
  setHud: (h: WeekHud) => void;
  setLastResult: (r: WeekResult | null) => void;
  pushLog: (e: AgentLogEntry) => void;
  setMarketCard: (c: MarketCardView | null) => void;
  notify: (msg: string | null) => void;
  bumpTick: () => void;
}

const MAP = compileMap();
let orderSeq = 0;
let logSeq = 0;

export const useGameStore = create<GameStore>((set) => ({
  playerPos: MAP.playerSpawn,
  npcPos: { ...MAP.npcSpawns },
  orders: [],
  hud: {
    week: 1,
    cash: START_CASH,
    stock: START_STOCK,
    reputation: START_REPUTATION,
    ap: AP_PER_WEEK,
  },
  lastResult: null,
  agentLog: [],
  marketCard: null,
  notice: null,
  tickIndex: 0,
  pushOrder: (actor, path) =>
    set((s) => ({ orders: [...s.orders, { id: ++orderSeq, actor, path }] })),
  ackOrder: (id) =>
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
  setPlayerPos: (playerPos) => set({ playerPos }),
  setNpcPos: (npc, p) => set((s) => ({ npcPos: { ...s.npcPos, [npc]: p } })),
  setHud: (hud) => set({ hud }),
  setLastResult: (lastResult) => set({ lastResult }),
  pushLog: (entry) =>
    set((s) => ({
      agentLog: [...s.agentLog.slice(-49), { ...entry, seq: ++logSeq }],
    })),
  setMarketCard: (marketCard) => set({ marketCard }),
  notify: (notice) => set({ notice }),
  bumpTick: () => set((s) => ({ tickIndex: s.tickIndex + 1 })),
}));
