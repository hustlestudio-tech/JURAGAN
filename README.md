# Juragan — Kedai Kopi Kampus

Game simulasi usaha kedai kopi kampus dengan NPC yang digerakkan Muse Spark.
Dokumen sumber: [PRD.md](PRD.md) · [adentum.md](adentum.md) · Aturan kerja: [AGENTS.md](AGENTS.md).

> Status S1: Pasal Jebakan, 5 soal pra/pasca pilot, dan angka ekonomi memakai default PRD §9.8 —
> **belum divalidasi dosen**.

## Mulai cepat

```sh
bun install
bun run dev        # web http://localhost:5173 + api http://localhost:8787
```

Buka http://localhost:5173 di browser. Ketuk ubin untuk berjalan, tekan **Simulasi Tick NPC**
untuk menggerakkan Vendor, **Market Shock** untuk kartu pasar, **Jalankan Minggu** untuk demo ekonomi lokal.

## Perintah

| Perintah             | Fungsi                                              |
| -------------------- | --------------------------------------------------- |
| `bun test`           | Unit test (BFS, sim-core, map, ai-client fallback)  |
| `bun check`          | Typecheck seluruh repo (pemeriksa bawaan Bun)       |
| `bun fmt --check`    | Cek format seluruh repo (builtin, tanpa Prettier)   |
| `bun fmt`            | Format seluruh repo (opsi di `bunfig.toml`)         |
| `bun run build`      | Build produksi `apps/web` ke `dist/`                |
| `bun run dev:web`    | Hanya Vite dev server                               |
| `bun run dev:api`    | Hanya API Hono lokal (port 8787)                    |
| `bun run db:migrate` | Terapkan migrasi Drizzle ke Neon (`drizzle-kit`)    |
| `bun run smoke:llm`  | Gerbang smoke test model S2 (butuh `MODEL_API_KEY`) |

## Struktur

```text
apps/web        Vite + React + Tailwind v4 + PixiJS v8 (WorldCanvas) + Zustand + TanStack Query
apps/api        Logika Hono murni & portable (createApp)
api/            Entry tipis Vercel Functions: health, npc-tick, market-shock
packages/content  Peta ASCII 18x24 + compiler, konsep, pasal, soal pilot, SUS, kurasi shock
packages/sim-core Mesin simulasi murni: BFS, ekonomi, deterministic fallback (+ bun test)
packages/ai-client  AI SDK + Muse Spark (Zod + fallback otomatis, + bun test)
packages/contracts  Skema Zod & tipe API bersama
packages/db     Drizzle ORM (neon-http) + skema + migrasi drizzle-kit
scripts/        Tooling DEV-ONLY (dev-api, migrate, smoke-llm) — tidak ikut deploy
```

## Environment

Salin `.env.example` ke `.env`. Semua key hanya dipakai server (`apps/api`, `api/`, `scripts/`)
dan tidak pernah dibundel ke klien.

| Variabel          | Wajib? | Keterangan                                                 |
| ----------------- | ------ | ---------------------------------------------------------- |
| `MODEL_API_KEY`   | S2+    | Kunci Meta Model API; tanpa ini semua tick = fallback      |
| `META_MODEL_ID`   | Tidak  | Default `muse-spark-1.3`                                   |
| `DATABASE_URL`    | S1+ops | Koneksi Neon; tanpa ini `/api/health` lapor `unconfigured` |
| `ADMIN_TOKEN`     | S8     | Proteksi route peneliti                                    |
| `NEWS_SOURCE_URL` | S7     | Default RSS Ekonomi ANTARA                                 |

## Deploy Vercel

1. `vercel link` (atau import repo dari dashboard), lalu set Environment Variables di atas.
2. `vercel` untuk preview, `vercel --prod` untuk produksi.
3. `vercel.json` sudah mengatur `bunVersion: "1.x"`, build `bun run build`,
   output `apps/web/dist`, dan SPA fallback. Jika runtime Bun bermasalah,
   hapus `bunVersion` (fallback Node, kode tidak berubah).

## Target perangkat (Q2)

Android Entry-Mid: RAM 4 GB, Android 8.0+, Chrome terbaru. NFR: 60 fps saat bergerak,
bundel JS gzip ≤ 300 KB.
