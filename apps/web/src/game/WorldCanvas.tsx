import { useEffect, useRef } from 'react';
import {
  Application,
  Container,
  Sprite,
  type Texture,
  type Ticker,
} from 'pixi.js';
import {
  compileMap,
  MAP_COLS,
  MAP_ROWS,
  type CompiledMap,
  type NpcId,
  type TerrainId,
  type TilePos,
} from '@juragan/content';
import { findPath } from '@juragan/sim-core';
import { useGameStore, type ActorId } from '../state/store';
import {
  buildCharacterTexture,
  buildMarkerTexture,
  buildTileTextures,
} from './textures';

const TILE = 16;
const SPEED_PX_S = 110;

const NPC_COLORS: Record<NpcId, string> = {
  dimas: '#3E8E4D',
  'pak-hendra': '#6B4226',
  'pak-budi': '#3D7EA6',
  vendor: '#7A4FA3',
};

interface QueuedOrder {
  actor: ActorId;
  path: TilePos[];
}

interface ActorState {
  sprite: Sprite;
  waypoints: { x: number; y: number }[];
}

type ActorTable = Map<ActorId, ActorState>;

/** Layer statis: 432 sprite lalu dibekukan (1 draw call). */
function buildStaticLayer(
  tileTex: Record<TerrainId, Texture>,
  map: CompiledMap,
): Container {
  const layer = new Container();
  for (let y = 0; y < MAP_ROWS; y++) {
    for (let x = 0; x < MAP_COLS; x++) {
      const sprite = new Sprite(tileTex[map.terrain[y]?.[x] ?? 'grass']);
      sprite.position.set(x * TILE, y * TILE);
      sprite.width = TILE;
      sprite.height = TILE;
      layer.addChild(sprite);
    }
  }
  layer.cacheAsTexture(true);
  return layer;
}

function spawnActors(dyn: Container, map: CompiledMap): ActorTable {
  const actors: ActorTable = new Map();
  const spawn = (actor: ActorId, pos: TilePos, tex: Texture) => {
    const sprite = new Sprite(tex);
    sprite.position.set(pos.x * TILE, pos.y * TILE);
    dyn.addChild(sprite);
    actors.set(actor, { sprite, waypoints: [] });
  };
  spawn(
    'player',
    useGameStore.getState().playerPos,
    buildCharacterTexture('#C0392B'),
  );
  for (const [npc, pos] of Object.entries(map.npcSpawns) as [
    NpcId,
    TilePos,
  ][]) {
    spawn(npc, pos, buildCharacterTexture(NPC_COLORS[npc]));
  }
  return actors;
}

function addMarkers(
  dyn: Container,
  map: CompiledMap,
): { sprite: Sprite; baseY: number }[] {
  const bobbers: { sprite: Sprite; baseY: number }[] = [];
  const markerTex = buildMarkerTexture();
  const add = (pos: TilePos) => {
    const marker = new Sprite(markerTex);
    marker.position.set(pos.x * TILE, (pos.y - 1) * TILE);
    dyn.addChild(marker);
    bobbers.push({ sprite: marker, baseY: marker.y });
  };
  const kasir = map.interactions.find((p) => p.id === 'kasir');
  if (kasir) add(kasir);
  add(map.npcSpawns.vendor);
  return bobbers;
}

/** Klik ubin → antrean jalan BFS. Mengembalikan pelepas listener. */
function attachPointer(
  canvas: HTMLCanvasElement,
  map: CompiledMap,
  queue: QueuedOrder[],
): () => void {
  const onPointer = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const tx = Math.floor(((e.clientX - rect.left) / rect.width) * MAP_COLS);
    const ty = Math.floor(((e.clientY - rect.top) / rect.height) * MAP_ROWS);
    const s = useGameStore.getState();
    if (tx < 0 || ty < 0 || tx >= MAP_COLS || ty >= MAP_ROWS) return;
    if (map.solid[ty]?.[tx]) {
      s.notify('Tidak bisa lewat ⛔');
      return;
    }
    const path = findPath(map.solid, s.playerPos, { x: tx, y: ty });
    if (!path) {
      s.notify('Tidak ada jalan ke sana');
      return;
    }
    if (path.length === 0) return;
    queue.push({ actor: 'player', path });
    s.setPlayerPos({ x: tx, y: ty });
    s.notify(null);
  };
  canvas.addEventListener('pointerdown', onPointer);
  return () => canvas.removeEventListener('pointerdown', onPointer);
}

function stepActors(
  actors: ActorTable,
  queue: QueuedOrder[],
  dtSeconds: number,
) {
  while (queue.length > 0) {
    const order = queue.shift();
    if (!order) break;
    const actor = actors.get(order.actor);
    if (actor)
      actor.waypoints = order.path.map((p) => ({
        x: p.x * TILE,
        y: p.y * TILE,
      }));
  }
  for (const [, actor] of actors) {
    const next = actor.waypoints[0];
    if (!next) continue;
    const dx = next.x - actor.sprite.x;
    const dy = next.y - actor.sprite.y;
    const dist = Math.hypot(dx, dy);
    const step = SPEED_PX_S * dtSeconds;
    if (dist <= step) {
      actor.sprite.position.set(next.x, next.y);
      actor.waypoints.shift();
    } else if (dist > 0) {
      actor.sprite.x += (dx / dist) * step;
      actor.sprite.y += (dy / dist) * step;
    }
  }
}

/** PixiJS v8 imperatif: peta 18x24 statis (cacheAsTexture) + sprite dinamis. */
export function WorldCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  // Bukti: cleanup mengembalikan pelepasan SEMUA resource (detach listener,
  // unsubscribe store, ticker.remove, destroy Pixi). Matcher melewatkannya karena
  // registrasi terjadi pasca-await di boot() — false-positive klas (2) rule ini.
  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let app: Application | null = null;
    let isCancelled = false;
    let detach: (() => void) | null = null;
    let unsubscribe: (() => void) | null = null;
    let onTick: ((ticker: Ticker) => void) | null = null;
    const queue: QueuedOrder[] = [];
    const seenOrders = new Set<number>();

    // Langganan tanpa render-ulang di level atas effect (sinkron, sebelum boot):
    // order tick NPC mengalir lewat antrean; dilepas eksplisit di cleanup.
    unsubscribe = useGameStore.subscribe((s) => {
      for (const order of s.orders) {
        if (seenOrders.has(order.id)) continue;
        seenOrders.add(order.id);
        queue.push({ actor: order.actor, path: order.path });
        // Ack sinkron aman: set di dalam subscribe hanya memicu notify ulang,
        // dan seenOrders mencegah pemrosesan ganda.
        useGameStore.getState().ackOrder(order.id);
      }
    });

    const destroyApp = () => {
      // Pola destroy resmi v8: lepas canvas + kuras pool global (anti-bocor saat remount).
      app?.destroy(
        { removeView: true, releaseGlobalResources: true },
        { children: true, texture: true, textureSource: true },
      );
      app = null;
    };

    const boot = async () => {
      const map = compileMap();
      const instance = new Application();
      await instance.init({
        width: MAP_COLS * TILE,
        height: MAP_ROWS * TILE,
        background: '#1F4D3A',
        antialias: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      });
      // StrictMode double-mount: batalkan boot pertama sebelum attach.
      if (isCancelled || hostRef.current !== host) {
        instance.destroy(
          { removeView: true, releaseGlobalResources: true },
          { children: true, texture: true, textureSource: true },
        );
        return;
      }
      app = instance;
      const { canvas } = app;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      canvas.style.imageRendering = 'pixelated';
      host.appendChild(canvas);

      app.stage.addChild(buildStaticLayer(buildTileTextures(), map));
      const dyn = new Container();
      app.stage.addChild(dyn);
      const actors = spawnActors(dyn, map);
      const bobbers = addMarkers(dyn, map);
      detach = attachPointer(canvas, map, queue);

      let elapsed = 0;
      onTick = (ticker: Ticker) => {
        const dt = ticker.deltaMS / 1000;
        elapsed += dt;
        stepActors(actors, queue, dt);
        for (const bobber of bobbers) {
          bobber.sprite.y = bobber.baseY + Math.sin(elapsed * 3) * 2;
        }
      };
      app.ticker.add(onTick);
    };

    void boot();
    return () => {
      isCancelled = true;
      detach?.();
      unsubscribe?.();
      if (app && onTick) app.ticker.remove(onTick);
      destroyApp();
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
