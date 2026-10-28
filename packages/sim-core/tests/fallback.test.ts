import { describe, expect, test } from 'bun:test';
import { deterministicNpcAction, fallbackLine } from '../src/fallback';

describe('deterministic fallback', () => {
  test('jadwal vendor berputar dan deterministik', () => {
    expect(deterministicNpcAction('vendor', 0)).toEqual({
      type: 'walk_to',
      place: 'pasar',
    });
    expect(deterministicNpcAction('vendor', 1)).toEqual({
      type: 'walk_to',
      place: 'kedai',
    });
    expect(deterministicNpcAction('vendor', 3)).toEqual({ type: 'wait' });
    expect(deterministicNpcAction('vendor', 4)).toEqual({
      type: 'walk_to',
      place: 'pasar',
    });
  });

  test('NPC tak dikenal tetap dapat aksi valid', () => {
    const a = deterministicNpcAction('???', 0);
    expect(a.type).toBe('walk_to');
  });

  test('template kalimat tersedia per peran', () => {
    for (const npc of ['vendor', 'dimas', 'pak-hendra', 'pak-budi']) {
      expect(fallbackLine(npc).length).toBeGreaterThan(0);
    }
  });
});
