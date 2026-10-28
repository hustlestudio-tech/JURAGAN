# AGENTS.md — Juragan Guardrails (MENGIKAT setiap iterasi)

Monorepo Bun: `apps/web` (Vite + React), `apps/api` (logika Hono, portable),
`api/` (entry tipis Vercel Functions), `packages/*` (source TS langsung, tanpa build step di S1).

Perintah: `bun install` · `bun test` · `bun check` (tsc noEmit) · `bun run build` ·
`bun run dev` (web + api lokal) · `bun run db:migrate` · `bun run smoke:llm` (S2, butuh key asli).

## 1. PixiJS v8 Strict (DILARANG sintaks v7)

- `const app = new Application(); await app.init({ ... })` — async, tidak ada opsi di konstruktor.
- Pakai `app.canvas` (BUKAN `app.view`).
- React StrictMode double-mount: flag `let isCancelled = false` di `useEffect` sebelum
  `await app.init()` selesai; jika cancelled → `app.destroy()` segera dan jangan attach.
- Tekstur runtime prosedural: `new Texture({ source: new CanvasSource({ resource: canvas, scaleMode: 'nearest' }) })`.
  DILARANG `PIXI.BaseTexture` / `BaseTexture.from`.
- Ticker v8: `app.ticker.add((ticker) => { const dt = ticker.deltaTime; })` — argumennya objek `Ticker`.
- DILARANG `@pixi/tilemap` / `CompositeTilemap`. Grid 18×24 = 432 ubin dirender dengan
  `Container` + `Sprite` biasa; layer statis dibekukan via `staticContainer.cacheAsTexture(true)`.
- DILARANG `@pixi/react`. Satu komponen imperatif `WorldCanvas`; React hanya HUD & panel.
- Arah data satu arah: Zustand menyimpan posisi logis → Pixi membaca & menganimasikan.
  Pixi TIDAK PERNAH menulis state permainan.

## 2. Tailwind CSS v4 CSS-First

- Hanya `tailwindcss` + `@tailwindcss/vite`. DILARANG `tailwind.config.js`.
- Hanya SATU file CSS: `apps/web/src/styles.css`. Token `@theme`: krem `#FBF5E9`,
  hijau tua `#1F4D3A`, coklat kayu `#6B4226`, amber `#E8A33D`; font `Silkscreen`, `Nunito`;
  `@utility` pixel-art. DILARANG warna arbitrary di luar token `@theme`.
- State: Zustand = UI & posisi logis dunia; TanStack Query = server state. Tidak boleh overlap.

## 3. Meta Model API (`https://api.meta.ai/v1/chat/completions`)

- Raw `fetch` dengan env `MODEL_API_KEY`, `META_MODEL_ID` (default `muse-spark-1.3`).
- Wajib `tool_choice: "auto"` dan `parallel_tool_calls: false`.
- `strict: true` WAJIB `additionalProperties: false` + SEMUA properti di `required`
  (opsional = nullable `["string","null"]` / `["integer","null"]`).
- Skema tool `npc_action` berbentuk DATAR (`{type, place, topic, offerId}` nullable),
  BUKAN oneOf/discriminated union — subset strict Meta tidak mendukung union.
  Diskriminasi dilakukan di kode via Zod setelah parse.
- `AbortSignal.timeout(2500)`. Timeout/gagal Zod → fungsi Deterministic Fallback langsung, tanpa retry di tick sama.
- DILARANG Vercel AI SDK (`ai`, `@ai-sdk/*`). DILARANG streaming & teks bebas model ke state.

## 4. Bun & Vercel Serverless Compatibility

- Lokal: Bun 1.4.4 (`packageManager` + `bun.lock`). Produksi: `bunVersion: "1.x"` di `vercel.json`.
- DILARANG API khusus Bun (`Bun.serve`, `Bun.file`, `bun:sqlite`) di kode runtime `apps/*`,
  `api/*`, `packages/*`. Hanya Web Standard API (`fetch`, `Request`, `Response`,
  `crypto.randomUUID()`) + `@neondatabase/serverless` mode HTTP (`neon()`).
- Pengecualian: `scripts/` (tooling dev-only: `dev-api.ts`, `migrate.ts`, `smoke-llm.ts`)
  boleh memakai `Bun.serve` / `node:fs` / `process.env`. Tidak ikut ter-deploy.
- Entry Vercel `api/*.ts` adalah file tipis WAJIB: `export default handle(app)` dari
  `hono/vercel` + import RELATIF ke `../apps/api/src/*`. Seluruh logika rute di `apps/api`
  sebagai Hono murni (portable, tanpa API khusus Vercel).
- DILARANG tsconfig path alias (`@/*`) di seluruh repo — pernah terbukti crash saat runtime
  di Vercel Bun (build lolos). Import antar-package via nama workspace (`@juragan/*`),
  entry `api/*` via path relatif.
- Jika Bun runtime bermasalah di produksi, escape hatch: hapus `bunVersion` dari
  `vercel.json` (fallback ke Node; kode tidak berubah karena portable).

## 5. Kontrak non-teknis

- Ejaan resmi **UNJANI**. Agent Log selalu judul **"Cara NPC mengambil keputusan"**, collapsible di debrief.
- Model hanya mengusulkan → `packages/contracts` (Zod) memvalidasi → sim memutuskan → db menyimpan.
  Tidak ada jalur tulis lain. Respons error selalu `{ error: { code, message } }`.
