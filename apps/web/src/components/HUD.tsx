import type { ReactNode } from 'react';
import { useGameStore } from '../state/store';
import { formatRp } from '../lib/format';

const STAT_WRAP = 'flex min-w-0 flex-col items-center px-1';
const STAT_LABEL = 'font-pixel text-[9px] uppercase tracking-wide text-krem/70';
const STAT_VALUE = 'font-pixel text-xs text-krem sm:text-sm';

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={STAT_WRAP}>
      <span className={STAT_LABEL}>{label}</span>
      <span className={STAT_VALUE}>{children}</span>
    </div>
  );
}

export function HUD() {
  const hud = useGameStore((s) => s.hud);
  return (
    <header className="pixel-panel grid grid-cols-5 items-center gap-1 bg-rimba px-2 py-2">
      <Stat label="Minggu">{hud.week}</Stat>
      <Stat label="Kas">
        {hud.cash < 0 ? (
          <span className="text-red-300">⚠ {formatRp(hud.cash)}</span>
        ) : (
          formatRp(hud.cash)
        )}
      </Stat>
      <Stat label="Stok">{hud.stock}</Stat>
      <Stat label="Reputasi">{hud.reputation}</Stat>
      <Stat label="AP">{hud.ap}</Stat>
    </header>
  );
}
