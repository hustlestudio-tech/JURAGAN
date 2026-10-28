import { useEffect, useRef } from "react";
import { Application, Container, Sprite, type Texture, type Ticker } from "pixi.js";
import {
  compileMap,
  MAP_COLS,
  MAP_ROWS,
  type NpcId,
  type TilePos,
} from "@juragan/content";
import { findPath } from "@juragan/sim-core";
import { useGameStore, type ActorId } from "../state/store";
import { buildCharacterTexture, buildMarkerTexture, buildTileTextures } from "./textures";

const TILE = 16;
const SPEED_PX_S = 110;

const NPC_COLORS: Record<NpcId, string> = {
  dimas: "#3E8E4D",
  "pak-hendra": "#6B4226",
  "pak-budi": "#3D7EA6",
  vendor: "#7A4FA3",
};

interface QueuedOrder {
  actor: ActorId;
  path: TilePos[];
}

/** PixiJS v8 imperatif: peta 18x24 statis (cacheAsTexture) + sprite dinamis. */
export function WorldCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const orders = useGameStore((s) => s.orders);
  const ackOrder = useGameStore((s) => s.ackOrder);
  const queueRef = useRef<QueuedOrder[]>([]);

  // Pindahkan order Zustand -> antrean loop Pixi, lalu ack agar tak diproses ulang.
  useEffect(() => {
    if (orders.length === 0) return;
    for (const o of orders) {
      queueRef.current.push({ actor: o.actor, path: o.path });
      ackOrder(o.id);
    }
  }, [orders, ackOrder]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let app: Application | null = null;
    let isCancelled = false;
    let onPointer: ((e: PointerEvent) => void) | null = null;

    const boot = async () => {
      const MAP = compileMap();
      const instance = new Application();
      await instance.init({
        width: MAP_COLS * TILE,
        height: MAP_ROWS * TILE,
        background: "#1F4D3A",
        antialias: false,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      });
      // StrictMode double-mount: batalkan boot pertama sebelum attach.
      if (isCancelled || hostRef.current !== host) {
        instance.destroy();
        return;
      }
      app = instance;
      const canvas = app.canvas;
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.display = "block";
      canvas.style.imageRendering = "pixelated";
      host.appendChild(canvas);

      const tileTex = buildTileTextures();

      // Layer statis: 432 sprite lalu dibekukan.
      const staticLayer = new Container();
      for (let y = 0; y < MAP_ROWS; y++) {
        for (let x = 0; x < MAP_COLS; x++) {
          const t = MAP.terrain[y]?.[x] ?? "grass";
          const sprite = new Sprite(tileTex[t]);
          sprite.position.set(x * TILE, y * TILE);
          sprite.width = TILE;
          sprite.height = TILE;
          staticLayer.addChild(sprite);
        }
      }
      staticLayer.cacheAsTexture(true);
      app.stage.addChild(staticLayer);

      const dyn = new Container();
      app.stage.addChild(dyn);

      const actors = new Map<ActorId, { sprite: Sprite; waypoints: { x: number; y: number }[] }>();
      const spawn = (actor: ActorId, pos: TilePos, tex: Texture) => {
        const sprite = new Sprite(tex);
        sprite.position.set(pos.x * TILE, pos.y * TILE);
        dyn.addChild(sprite);
        actors.set(actor, { sprite, waypoints: [] });
      };
      const st = useGameStore.getState();
      spawn("player", st.playerPos, buildCharacterTexture("#C0392B"));
      for (const [npc, pos] of Object.entries(MAP.npcSpawns) as [NpcId, TilePos][]) {
        spawn(npc, pos, buildCharacterTexture(NPC_COLORS[npc]));
      }

      // Penanda "!" di atas kasir & vendor.
      const bobbers: { sprite: Sprite; baseY: number }[] = [];
      const markerTex = buildMarkerTexture();
      const addMarker = (pos: TilePos) => {
        const m = new Sprite(markerTex);
        m.position.set(pos.x * TILE, (pos.y - 1) * TILE);
        dyn.addChild(m);
        bobbers.push({ sprite: m, baseY: m.y });
      };
      const kasir = MAP.interactions.find((p) => p.id === "kasir");
      if (kasir) addMarker(kasir);
      addMarker(MAP.npcSpawns.vendor);

      onPointer = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const tx = Math.floor(((e.clientX - rect.left) / rect.width) * MAP_COLS);
        const ty = Math.floor(((e.clientY - rect.top) / rect.height) * MAP_ROWS);
        const s = useGameStore.getState();
        if (tx < 0 || ty < 0 || tx >= MAP_COLS || ty >= MAP_ROWS) return;
        if (MAP.solid[ty]?.[tx]) {
          s.notify("Tidak bisa lewat ⛔");
          return;
        }
        const path = findPath(MAP.solid, s.playerPos, { x: tx, y: ty });
        if (!path) {
          s.notify("Tidak ada jalan ke sana");
          return;
        }
        if (path.length === 0) return;
        s.pushOrder("player", path);
        s.setPlayerPos({ x: tx, y: ty });
        s.notify(null);
      };
      canvas.addEventListener("pointerdown", onPointer);

      let elapsed = 0;
      app.ticker.add((ticker: Ticker) => {
        const dt = ticker.deltaMS / 1000;
        elapsed += dt;
        while (queueRef.current.length > 0) {
          const order = queueRef.current.shift();
          if (!order) break;
          const a = actors.get(order.actor);
          if (a) a.waypoints = order.path.map((p) => ({ x: p.x * TILE, y: p.y * TILE }));
        }
        for (const [, a] of actors) {
          const next = a.waypoints[0];
          if (!next) continue;
          const dx = next.x - a.sprite.x;
          const dy = next.y - a.sprite.y;
          const dist = Math.hypot(dx, dy);
          const step = SPEED_PX_S * dt;
          if (dist <= step) {
            a.sprite.position.set(next.x, next.y);
            a.waypoints.shift();
          } else if (dist > 0) {
            a.sprite.x += (dx / dist) * step;
            a.sprite.y += (dy / dist) * step;
          }
        }
        for (const b of bobbers) b.sprite.y = b.baseY + Math.sin(elapsed * 3) * 2;
      });
    };

    void boot();
    return () => {
      isCancelled = true;
      if (app && onPointer) app.canvas.removeEventListener("pointerdown", onPointer);
      app?.destroy();
      app = null;
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="pixel-panel w-full overflow-hidden bg-rimba"
      aria-label="Peta dunia Juragan 18 kali 24 ubin"
    />
  );
}
