import { WorldCanvas } from './game/WorldCanvas';
import { HUD } from './components/HUD';
import { Controls } from './components/Controls';
import { AgentLog } from './components/AgentLog';
import { MarketCard } from './components/MarketCard';
import { WeekResult } from './components/WeekResult';
import { useHealth } from './api/client';
import { useGameStore } from './state/store';

function Notice() {
  const notice = useGameStore((s) => s.notice);
  if (!notice) return null;
  return (
    <div className="pixel-panel bg-emas px-3 py-2 font-pixel text-[11px] text-rimba">
      {notice}
    </div>
  );
}

function HealthFooter() {
  const { data, isLoading, isError } = useHealth();
  const text = isLoading
    ? 'API: menghubungkan…'
    : isError
      ? 'API: tidak terjangkau (jalankan bun run dev:api)'
      : `API: ${data?.status} · DB: ${data?.db}`;
  return (
    <p className="pb-6 text-center text-xs opacity-60">{text} · Juragan S1</p>
  );
}

export function App() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <h1 className="font-pixel text-xl text-rimba">JURAGAN</h1>
        <span className="font-pixel text-[10px] opacity-60">
          kedai kopi kampus
        </span>
      </div>
      <HUD />
      <WorldCanvas />
      <p className="-mt-1 text-center text-xs opacity-60">
        Ketuk ubin untuk berjalan ke sana.
      </p>
      <Controls />
      <Notice />
      <WeekResult />
      <MarketCard />
      <AgentLog />
      <HealthFooter />
    </div>
  );
}
