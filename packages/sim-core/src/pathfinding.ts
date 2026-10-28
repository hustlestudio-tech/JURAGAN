// BFS deterministik untuk grid 18x24 (adentum §1: ±40 baris, tanpa EasyStar).
import type { TilePos } from './types';

// Urutan tetangga TETAP (atas, kiri, kanan, bawah) -> hasil deterministik.
const DIRS: readonly (readonly [number, number])[] = [
  [0, -1],
  [-1, 0],
  [1, 0],
  [0, 1],
];

/**
 * Jalur terpendek dari `from` ke `to` pada grid `solid` (solid[y][x]).
 * Mengembalikan array ubin TANPA titik awal, DENGAN titik tujuan.
 * `null` bila tujuan tak terjangkau; `[]` bila from == to.
 */
export function findPath(
  solid: readonly (readonly boolean[])[],
  from: TilePos,
  to: TilePos,
): TilePos[] | null {
  const rows = solid.length;
  const cols = solid[0]?.length ?? 0;
  const inside = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < cols && y < rows;
  if (!inside(from.x, from.y) || !inside(to.x, to.y)) return null;
  if (solid[from.y]?.[from.x] || solid[to.y]?.[to.x]) return null;
  if (from.x === to.x && from.y === to.y) return [];

  const prev = new Map<number, number>();
  const seen = new Set<number>([from.y * cols + from.x]);
  const queue: TilePos[] = [{ ...from }];
  while (queue.length > 0) {
    const cur = queue.shift() as TilePos;
    for (const [dx, dy] of DIRS) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (!inside(nx, ny) || solid[ny]?.[nx]) continue;
      const key = ny * cols + nx;
      if (seen.has(key)) continue;
      seen.add(key);
      prev.set(key, cur.y * cols + cur.x);
      if (nx === to.x && ny === to.y) {
        const path: TilePos[] = [];
        let k = key;
        while (k !== from.y * cols + from.x) {
          path.push({ x: k % cols, y: Math.floor(k / cols) });
          k = prev.get(k) as number;
        }
        return path.reverse();
      }
      queue.push({ x: nx, y: ny });
    }
  }
  return null;
}
