import { describe, expect, test } from 'bun:test';
import { findPath } from '../src/pathfinding';

const open = (rows: number, cols: number, walls: [number, number][] = []) =>
  Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) =>
      walls.some(([wx, wy]) => wx === x && wy === y),
    ),
  );

describe('findPath (BFS)', () => {
  test('jalur terpendek di grid kosong', () => {
    const path = findPath(open(5, 5), { x: 0, y: 0 }, { x: 2, y: 1 });
    expect(path).not.toBeNull();
    expect(path!.length).toBe(3); // jarak Manhattan
    expect(path![path!.length - 1]).toEqual({ x: 2, y: 1 });
  });

  test('memutar melewati dinding', () => {
    const solid = open(3, 3, [
      [1, 0],
      [1, 1],
    ]);
    const path = findPath(solid, { x: 0, y: 0 }, { x: 2, y: 0 });
    expect(path).toEqual([
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 2, y: 0 },
    ]);
  });

  test('deterministik: dua panggilan menghasilkan jalur identik', () => {
    const solid = open(18, 24, [
      [5, 5],
      [6, 5],
      [12, 10],
    ]);
    const a = findPath(solid, { x: 0, y: 0 }, { x: 23, y: 17 });
    const b = findPath(solid, { x: 0, y: 0 }, { x: 23, y: 17 });
    expect(a).toEqual(b);
  });

  test('null bila tujuan tak terjangkau atau solid', () => {
    expect(
      findPath(
        open(3, 3, [
          [1, 0],
          [0, 1],
          [1, 1],
          [2, 1],
          [1, 2],
        ]),
        { x: 0, y: 0 },
        { x: 2, y: 2 },
      ),
    ).toBeNull();
    expect(findPath(open(3, 3), { x: 0, y: 0 }, { x: 5, y: 5 })).toBeNull();
    expect(
      findPath(open(3, 3, [[2, 2]]), { x: 0, y: 0 }, { x: 2, y: 2 }),
    ).toBeNull();
  });

  test('[] bila from == to', () => {
    expect(findPath(open(3, 3), { x: 1, y: 1 }, { x: 1, y: 1 })).toEqual([]);
  });
});
