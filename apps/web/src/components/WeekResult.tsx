import { useGameStore } from '../state/store';
import { formatRp } from '../lib/format';

export function WeekResult() {
  const lastResult = useGameStore((s) => s.lastResult);
  if (!lastResult) return null;
  const rows: [string, string][] = [
    ['Unit terjual', `${lastResult.unitsSold}`],
    ['Pendapatan', formatRp(lastResult.revenue)],
    ['Biaya bahan', formatRp(lastResult.materialCost)],
    ['Biaya tetap', formatRp(lastResult.fixedCost)],
    ['Perubahan kas', formatRp(lastResult.cashDelta)],
    [
      'Perubahan stok',
      `${lastResult.stockDelta >= 0 ? '+' : ''}${lastResult.stockDelta}`,
    ],
  ];
  return (
    <div className="pixel-panel bg-krem p-3">
      <span className="font-pixel text-xs text-rimba">
        Hasil Minggu (demo lokal)
      </span>
      <dl className="mt-1 text-sm">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between border-b border-kayu/20 py-0.5 last:border-0"
          >
            <dt className="opacity-70">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      {lastResult.unservedDemand > 0 && (
        <p className="mt-1 text-xs opacity-70">
          Permintaan tak terlayani: {lastResult.unservedDemand} (stok habis)
        </p>
      )}
    </div>
  );
}
