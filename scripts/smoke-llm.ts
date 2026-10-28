// Gerbang smoke test model (PRD §9.3, S2). Butuh MODEL_API_KEY asli; SKIP bila tidak ada.
// Kriteria lolos: 4/4 pemeriksaan lolos skema pada >= 9/10 percobaan (cek 2 menunggu skema S4).
import {
  completeText,
  proposeMarketShock,
  readMetaEnv,
  runNpcTick,
} from '@juragan/ai-client';

const TRIALS = 10;
const PASS_MIN = 9;

const env = readMetaEnv();
if (!env.apiKey) {
  console.log('SKIP smoke:llm — MODEL_API_KEY tidak diset.');
  process.exit(0);
}

let failures = 0;
async function check(name: string, fn: () => Promise<boolean>) {
  let ok = 0;
  for (let i = 0; i < TRIALS; i++) {
    try {
      if (await fn()) ok++;
    } catch {
      /* dihitung gagal */
    }
  }
  const pass = ok >= PASS_MIN;
  if (!pass) failures++;
  console.log(
    `${pass ? 'PASS' : 'FAIL'} ${name}: ${ok}/${TRIALS} (syarat >= ${PASS_MIN})`,
  );
}

await check('1 dialog Bahasa Indonesia Pak Hendra', async () => {
  const t = await completeText(
    'Kamu Pak Hendra, pemilik gudang. Jawab Bahasa Indonesia, maksimal 30 kata.',
    'Pak, kontraknya bisa dijelaskan?',
    120,
    env,
  );
  return !!t && t.length > 10 && t.length <= 600;
});

console.log('SKIP 2 tool call evaluate_offer — menunggu skema S4 (kontrak).');

await check('3 structured output concept_id dari enum', async () => {
  const p = await proposeMarketShock(
    { week: 2, headline: 'Harga gula pasir naik di pasar induk.' },
    env,
  );
  return p !== null;
});

await check('4 npc_action dari daftar sah', async () => {
  const r = await runNpcTick(
    {
      npcId: 'vendor',
      week: 3,
      tickIndex: 0,
      playerPlace: 'kedai',
      npcPlace: 'pasar',
    },
    env,
  );
  return r.source === 'model' && r.log.validation === 'ok';
});

if (failures > 0) {
  console.error(
    `smoke:llm GAGAL (${failures} cek). Pertimbangkan pivot template terstruktur (§9.3).`,
  );
  process.exit(1);
}
console.log('smoke:llm LOLOS.');
