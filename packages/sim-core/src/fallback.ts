// Deterministic Fallback NPC: jadwal tetap tanpa model (PRD FR-018, NFR-002/010).
import type { NpcAction, NpcPlace } from './types';

const ROTATION: Record<string, NpcPlace[]> = {
  vendor: ['pasar', 'kedai', 'gerbang', 'gudang'],
  dimas: ['kedai', 'pasar', 'kedai', 'gerbang'],
  'pak-hendra': ['gudang', 'gudang', 'kedai', 'gudang'],
  'pak-budi': ['pasar', 'pasar', 'gerbang', 'pasar'],
};

const FALLBACK_LINES: Record<string, string> = {
  vendor: 'Psst… butuh biji murah? Aku selalu punya stok.',
  dimas: 'Eh, minggu ini targetmu apa? Sudah dihitung?',
  'pak-hendra': 'Gudang buka seperti biasa. Kontrak masih tersedia.',
  'pak-budi': 'Belanja di pasar saja, timbangannya jelas.',
};

/** Aksi cadangan deterministik dari (npcId, tickIndex) — tanpa RNG, tanpa model. */
export function deterministicNpcAction(
  npcId: string,
  tickIndex: number,
): NpcAction {
  const route = ROTATION[npcId] ?? ['pasar', 'kedai', 'gudang', 'gerbang'];
  if (tickIndex % 4 === 3) return { type: 'wait' };
  return {
    type: 'walk_to',
    place: (route[tickIndex % route.length] ?? 'pasar') as NpcPlace,
  };
}

export function fallbackLine(npcId: string): string {
  return FALLBACK_LINES[npcId] ?? '…';
}
