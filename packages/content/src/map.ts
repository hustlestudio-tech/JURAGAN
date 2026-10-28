// Peta Juragan: 18 baris x 24 kolom = 432 ubin (PRD FR-006, adentum §1+§8).
// Legenda: G rumput | J jalan | D dinding/bangunan | W air | T pohon |
//          C konter dekor | P pintu | E gerbang | S spawn pemain |
//          d Dimas | h Pak Hendra | b Pak Budi | m Vendor Misterius | k kasir | g titik gerbang

export const MAP_ROWS = 18;
export const MAP_COLS = 24;

export const MAP_DATA: readonly string[] = [
  'DDDDDDDDDDDDDDDDDDDDDDDD',
  'DGDDDDDDGGGJJGGGDDDDDDGD',
  'DGDDDDDDTGGJJGGTDDDDDDGD',
  'DGDDDDDDGGGJJGGGDDDDDDGD',
  'DGDDPDDDGGGJJGGGDDPDDDGD',
  'DGGGGGGGGGGJJGGGGGGGGGGD',
  'DGGkGGdGGGGJJGGGGGhGGGGD',
  'DGTGGGGGGGJJGGGGGGGGTGGD',
  'DJJJJJJJJJJJJJJJJJJJJJJD',
  'DGGGJGGGGGGSJGGGGGGGGGGD',
  'DGGGJGGGGGGJJGGGGGGGTGGD',
  'DGGGJGGGGGGJJGGGGGGGGGGD',
  'DGGCJCGGGGGJJGGGGGGGGGGD',
  'DGGGbGGGTWWJJGTGGGGGGGGD',
  'DGTGJGGGGWWJJGGGmGgGGGGD',
  'DGGGJGGGGGGJJGGGGEEGGGGD',
  'DGGGGGGGGGGJJGGGGGGGGGGD',
  'DDDDDDDDDDDDDDDDDDDDDDDD',
];

export type TerrainId =
  'grass' | 'road' | 'wall' | 'water' | 'tree' | 'counter' | 'door' | 'gate';

export interface TilePos {
  x: number;
  y: number;
}

export type InteractionId =
  'kasir' | 'dimas' | 'pak-hendra' | 'pak-budi' | 'vendor' | 'gerbang';

export interface InteractionPoint extends TilePos {
  id: InteractionId;
  label: string;
}

export type NpcId = 'dimas' | 'pak-hendra' | 'pak-budi' | 'vendor';

export interface CompiledMap {
  /** terrain[y][x] */
  terrain: TerrainId[][];
  /** solid[y][x]: true = tidak bisa dilewati */
  solid: boolean[][];
  interactions: InteractionPoint[];
  playerSpawn: TilePos;
  npcSpawns: Record<NpcId, TilePos>;
  /** Ubin jalan kaki untuk aksi walk_to per tempat (PRD §9.6). */
  placeAnchors: Record<'kedai' | 'gudang' | 'pasar' | 'gerbang', TilePos>;
}

const MARKER_INTERACTION: Record<string, { id: InteractionId; label: string }> =
  {
    k: { id: 'kasir', label: 'Kasir Kedai' },
    d: { id: 'dimas', label: 'Dimas' },
    h: { id: 'pak-hendra', label: 'Pak Hendra' },
    b: { id: 'pak-budi', label: 'Pak Budi' },
    m: { id: 'vendor', label: 'Vendor Misterius' },
    g: { id: 'gerbang', label: 'Gerbang Kampus' },
  };

const MARKER_NPC: Record<string, NpcId> = {
  d: 'dimas',
  h: 'pak-hendra',
  b: 'pak-budi',
  m: 'vendor',
};

function terrainOf(ch: string): TerrainId {
  switch (ch) {
    case 'J':
    case 'S':
    case 'd':
    case 'h':
    case 'b':
    case 'm':
    case 'g':
      return 'road';
    case 'D':
      return 'wall';
    case 'W':
      return 'water';
    case 'T':
      return 'tree';
    case 'C':
    case 'k':
      return 'counter';
    case 'P':
      return 'door';
    case 'E':
      return 'gate';
    case 'G':
    default:
      return 'grass';
  }
}

function solidOf(terrain: TerrainId): boolean {
  return (
    terrain === 'wall' ||
    terrain === 'water' ||
    terrain === 'tree' ||
    terrain === 'counter'
  );
}

export function compileMap(rows: readonly string[] = MAP_DATA): CompiledMap {
  if (rows.length !== MAP_ROWS)
    throw new Error(`Peta harus ${MAP_ROWS} baris, dapat ${rows.length}`);
  const terrain: TerrainId[][] = [];
  const solid: boolean[][] = [];
  const interactions: InteractionPoint[] = [];
  const npcSpawns = {} as Record<NpcId, TilePos>;
  let playerSpawn: TilePos | null = null;

  for (let y = 0; y < MAP_ROWS; y++) {
    const row = rows[y] as string;
    if (row.length !== MAP_COLS)
      throw new Error(
        `Baris ${y} harus ${MAP_COLS} kolom, dapat ${row.length}`,
      );
    const tRow: TerrainId[] = [];
    const sRow: boolean[] = [];
    for (let x = 0; x < MAP_COLS; x++) {
      const ch = row[x] as string;
      const t = terrainOf(ch);
      tRow.push(t);
      sRow.push(solidOf(t));
      if (ch === 'S') playerSpawn = { x, y };
      const marker = MARKER_INTERACTION[ch];
      if (marker)
        interactions.push({ id: marker.id, label: marker.label, x, y });
      const npc = MARKER_NPC[ch];
      if (npc) npcSpawns[npc] = { x, y };
    }
    terrain.push(tRow);
    solid.push(sRow);
  }
  if (!playerSpawn) throw new Error('Peta tidak punya spawn pemain (S)');
  for (const npc of ['dimas', 'pak-hendra', 'pak-budi', 'vendor'] as const) {
    if (!npcSpawns[npc]) throw new Error(`Peta tidak punya spawn NPC ${npc}`);
  }
  return {
    terrain,
    solid,
    interactions,
    playerSpawn,
    npcSpawns,
    placeAnchors: {
      kedai: { x: 5, y: 6 },
      gudang: { x: 17, y: 6 },
      pasar: { x: 4, y: 11 },
      gerbang: { x: 17, y: 14 },
    },
  };
}

export function isWalkable(map: CompiledMap, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= MAP_COLS || y >= MAP_ROWS) return false;
  return !map.solid[y]?.[x];
}
