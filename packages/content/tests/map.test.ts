import { describe, expect, test } from 'bun:test';
import { findPath } from '@juragan/sim-core';
import {
  compileMap,
  isWalkable,
  MAP_COLS,
  MAP_ROWS,
  type InteractionId,
} from '../src/map';

describe('compileMap', () => {
  const map = compileMap();

  test('dimensi tepat 18 x 24', () => {
    expect(map.terrain.length).toBe(MAP_ROWS);
    expect(map.solid.length).toBe(MAP_ROWS);
    for (const row of map.terrain) expect(row.length).toBe(MAP_COLS);
  });

  test('border sepenuhnya solid', () => {
    for (let x = 0; x < MAP_COLS; x++) {
      expect(isWalkable(map, x, 0)).toBe(false);
      expect(isWalkable(map, x, MAP_ROWS - 1)).toBe(false);
    }
    for (let y = 0; y < MAP_ROWS; y++) {
      expect(isWalkable(map, 0, y)).toBe(false);
      expect(isWalkable(map, MAP_COLS - 1, y)).toBe(false);
    }
  });

  test('enam titik interaksi + spawn pemain + 4 spawn NPC', () => {
    const want = [
      'dimas',
      'gerbang',
      'kasir',
      'pak-budi',
      'pak-hendra',
      'vendor',
    ].sort() as InteractionId[];
    expect(map.interactions.map((p) => p.id).sort()).toEqual(want);
    expect(isWalkable(map, map.playerSpawn.x, map.playerSpawn.y)).toBe(true);
    for (const pos of Object.values(map.npcSpawns)) {
      expect(isWalkable(map, pos.x, pos.y)).toBe(true);
    }
  });

  test('kasir solid (didekati dari ubin sebelah, FR-008)', () => {
    const kasir = map.interactions.find((p) => p.id === 'kasir')!;
    expect(isWalkable(map, kasir.x, kasir.y)).toBe(false);
    expect(isWalkable(map, kasir.x, kasir.y + 1)).toBe(true);
  });

  test('semua spawn & anchor terjangkau dari spawn pemain (BFS)', () => {
    const targets = [
      ...Object.values(map.npcSpawns),
      ...Object.values(map.placeAnchors),
    ];
    for (const t of targets) {
      const path = findPath(map.solid, map.playerSpawn, t);
      expect(path).not.toBeNull();
    }
  });

  test('menolak peta berdimensi salah', () => {
    expect(() => compileMap(['DG'])).toThrow();
  });
});
