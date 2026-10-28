import { useGameStore } from "../state/store";

export const formatRp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export function HUD() {
  const hud = useGameStore((s) => s.hud);
  const item = "flex min-w-0 flex-col items-center px-1";
  const label = "font-pixel text-[9px] uppercase tracking-wide text-krem/70";
  const value = "font-pixel text-xs text-krem sm:text-sm";
  return (
    <header className="pixel-panel grid grid-cols-5 items-center gap-1 bg-rimba px-2 py-2">
      <div className={item}>
        <span className={label}>Minggu</span>
        <span className={value}>{hud.week}</span>
      </div>
      <div className={item}>
        <span className={label}>Kas</span>
        <span className={`${value} ${hud.cash < 0 ? "text-red-300" : ""}`}>
          {hud.cash < 0 ? "⚠ " : ""}
          {formatRp(hud.cash)}
        </span>
      </div>
      <div className={item}>
        <span className={label}>Stok</span>
        <span className={value}>{hud.stock}</span>
      </div>
      <div className={item}>
        <span className={label}>Reputasi</span>
        <span className={value}>{hud.reputation}</span>
      </div>
      <div className={item}>
        <span className={label}>AP</span>
        <span className={value}>{hud.ap}</span>
      </div>
    </header>
  );
}
