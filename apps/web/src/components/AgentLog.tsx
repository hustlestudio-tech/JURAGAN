import { useGameStore } from "../state/store";

export function AgentLog() {
  const agentLog = useGameStore((s) => s.agentLog);
  return (
    <details className="pixel-panel bg-krem p-3">
      <summary className="cursor-pointer font-pixel text-xs text-rimba">
        Cara NPC mengambil keputusan{" "}
        <span className="ml-1 rounded bg-rimba px-1.5 py-0.5 text-[10px] text-krem">{agentLog.length}</span>
      </summary>
      {agentLog.length === 0 ? (
        <p className="mt-2 text-sm opacity-70">Belum ada tick. Tekan “Simulasi Tick NPC”.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {agentLog.map((e, i) => (
            <li key={i} className="rounded border-2 border-kayu/40 bg-white/60 p-2 text-xs">
              <div className="flex flex-wrap items-center gap-1 font-pixel text-[10px]">
                <span className="text-rimba">{e.npcId}</span>
                <span className="opacity-60">· {e.tool}</span>
                <span
                  className={`rounded px-1 ${e.source === "fallback" ? "bg-emas text-rimba" : "bg-rimba text-krem"}`}
                >
                  {e.source === "fallback" ? "fallback" : "model"}
                </span>
                <span className="opacity-60">{e.latencyMs} ms</span>
              </div>
              <pre className="mt-1 overflow-x-auto text-[11px] opacity-80">
                {JSON.stringify(e.args)}
              </pre>
              <div className="opacity-60">validasi: {e.validation}</div>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
