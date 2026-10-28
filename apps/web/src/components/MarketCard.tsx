import { useGameStore } from '../state/store';

const arrow = (m: number) => (m > 1 ? '▲' : m < 1 ? '▼' : '＝');

export function MarketCard() {
  const marketCard = useGameStore((s) => s.marketCard);
  if (!marketCard) {
    return (
      <div className="pixel-panel bg-krem p-3 text-sm opacity-70">
        Belum ada Market Shock. Tekan “Market Shock” untuk mengambil kartu.
      </div>
    );
  }
  return (
    <div className="pixel-panel bg-krem p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-pixel text-xs text-rimba">Market Shock</span>
        <span className="rounded bg-kayu px-1.5 py-0.5 font-pixel text-[10px] text-krem">
          {marketCard.origin === 'curated'
            ? 'Simulasi pasar'
            : 'Berita terkini'}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold">{marketCard.headline_game}</p>
      <p className="mt-1 text-xs opacity-80">
        Harga {arrow(marketCard.price_multiplier)} ×
        {marketCard.price_multiplier.toFixed(2)} · Permintaan{' '}
        {arrow(marketCard.demand_multiplier)} ×
        {marketCard.demand_multiplier.toFixed(2)}
      </p>
      <p className="text-[11px] opacity-60">Konsep: {marketCard.concept_id}</p>
    </div>
  );
}
