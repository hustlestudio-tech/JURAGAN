Addendum PRD v0.3 — Hasil Riset Internet
Dokumen ini menggantikan keputusan yang masih terbuka pada §9.2, §9.3, §9.7, dan §13 PRD v0.2. Setelah riset, sebagian besar Open Questions teknis sudah bisa ditutup tanpa menunggu jawabanmu. Yang tersisa untukmu hanya keputusan produk dan domain.

1. Render Dunia — Keputusan Final
   Perbandingan kandidat
   Kandidat Temuan riset Putusan
   PixiJS v8 + @pixi/tilemap PixiJS adalah renderer 2D yang mendukung WebGL dan WebGPU, bukan game engine penuh
   . Paket @pixi/tilemap menyediakan implementasi tilemap persegi yang dioptimalkan untuk rendering performa tinggi . Ukurannya sekitar sepertiga Phaser dan lebih cepat untuk rendering sprite mentah DIPILIH
   Phaser Phaser unggul karena tilemap-nya dapat membaca data Tiled JSON, CSV, atau array 2D Ditolak untuk MVP: Juragan tidak memakai editor Tiled, dan Phaser membawa scene manager, physics, audio, dan input yang tumpang tindih dengan React serta server. Keunggulan utamanya tidak terpakai.
   KAPLAY Pada pengujian game dengan kamera menggulir, KAPLAY tidak memiliki komponen tilemap yang di-cull, sehingga tersendat di perangkat mobile untuk tipe game ini Ditolak: dunia Juragan memang menggulir.
   Canvas 2D native (rencana lama) Tidak butuh dependensi, tetapi semua batching, culling, dan interpolasi harus ditulis dan dioptimalkan sendiri Ditolak: justru ini yang mau dihindari dengan memakai package yang sudah ada.
   LittleJS / Excalibur LittleJS sangat kecil tetapi WebGL2-only dan ekosistem tilemap/React-nya jauh lebih kecil dari PixiJS Ditolak: risiko dokumentasi dan bantuan agen coding lebih besar daripada manfaat ukurannya.
   Arsitektur render yang dikunci
   Paket: pixi.js v8 dan @pixi/tilemap. Versi eksak dikunci di bun.lock setelah spike instalasi pertama.
   Tanpa @pixi/react pada MVP. Binding React resmi v8 memang ada, tetapi dirancang eksklusif untuk React 19 dan menambahkan lapisan reconciler. PixiJS dipakai imperatif di dalam satu komponen WorldCanvas, dibuat sekali, dan dihancurkan saat komponen unmount. React tetap menguasai HUD dan semua panel.
   Peta ditulis sebagai data, bukan digambar manual per ubin. Di packages/content, peta ditulis sebagai baris string dengan legenda karakter (mis. G = rumput, J = jalan, D = dinding). Compiler peta mengubahnya menjadi: ID tile untuk renderer, grid tabrakan, dan daftar titik interaksi. Ini menggantikan editor Tiled tanpa menambah tool.
   Tileset tetap digambar kode. Sesuai keputusan D18, tekstur tiap tile dibuat saat inisialisasi dengan menggambar ke canvas kecil lalu dijadikan tekstur Pixi dengan scale mode nearest. Tidak ada berkas gambar eksternal. @pixi/tilemap hanya bertugas me-render, bukan menyediakan aset.
   Dua layer statis + satu layer dinamis. Layer tanah dan layer bangunan memakai CompositeTilemap yang digambar ulang hanya saat peta berubah. Karakter, NPC, dan penanda "!" adalah sprite dinamis yang posisinya diinterpolasi di ticker PixiJS. Kamera adalah satu Container dunia yang digeser dan dijepit ke batas peta — pixi-viewport tidak dipakai karena tidak ada kebutuhan zoom atau drag bebas.
   Pathfinding memakai BFS tulisan sendiri, bukan EasyStar. EasyStar adalah library A* asinkron — berlebihan untuk grid tanpa bobot berisi 18 × 24 = 432 ubin, di mana BFS menjamin jalur terpendek dan urutan tetangga yang tetap membuat hasilnya deterministik. Kode BFS diperkirakan ±40 baris dan masuk packages/sim-core agar bisa diuji tanpa renderer.
   Jembatan React ↔ Pixi satu arah. Zustand menyimpan posisi logis (ubin) dari server; komponen Pixi hanya membaca dan menganimasikan. Pixi tidak pernah menulis balik ke state permainan. Saat panel modal terbuka, ticker animasi dunia dijeda.
   Sisa risiko teknis (bukan pertanyaan untukmu): spike di irisan S1/S3 wajib membuktikan CompositeTilemap menerima tekstur hasil generate runtime dan frame rate di HP uji. Jika gagal, fallback-nya adalah sprite ter-pool per ubin yang terlihat (maksimal ±192 sprite) — masih di dalam PixiJS, tidak ganti engine.

2. CSS — Keputusan Final
   Perbandingan kandidat
   Kandidat Temuan riset Putusan
   Tailwind CSS v4 Tailwind memindai berkas sumber, menghasilkan CSS statis, dan berjalan zero-runtime
   . Instalasi Vite resmi hanya memasang tailwindcss dan @tailwindcss/vite
   . Konfigurasi v4 bersifat CSS-first lewat direktif @theme di dalam berkas CSS, tanpa tailwind.config.js DIPILIH
   Panda CSS Panda mengetik token secara type-safe dan mengompilasi style menjadi CSS atomik saat build, tanpa runtime di browser
   Runner-up yang sah. Ditolak untuk hackathon ini: butuh langkah codegen yang menghasilkan folder styled-system, dan nilai style harus terlihat statis di source agar bisa diekstrak
   . Kurva belajarnya tidak sebanding dengan sisa waktu.
   UnoCSS UnoCSS adalah engine CSS atomik on-demand yang seluruh utilitasnya berasal dari preset
   Ditolak: fleksibel, tetapi kosakata utilitasnya kurang dikenal agen coding dibanding Tailwind, sehingga risiko kesalahan diam-diam lebih besar.
   CSS Modules / plain CSS (rencana lama) Sesuai keberatanmu Ditolak eksplisit.
   Cara pakai yang dikunci
   Paket: tailwindcss + @tailwindcss/vite saja. Tidak memakai shadcn secara penuh dan tidak memakai framework komponen.
   Semua token Juragan masuk @theme di satu berkas styles.css: palet krem #FBF5E9, hijau tua #1F4D3A, coklat kayu #6B4226, amber #E8A33D, dua font self-hosted (Silkscreen dan Nunito), serta skala bayangan datar.
   Gaya pixel dibuat sebagai utility khusus, bukan CSS lepas per komponen: @utility untuk bayangan datar 3px, outline 2px, dan sudut bertingkat. Komponen React (Button, Panel, Sheet, KartuKonsep) memakai utility Tailwind biasa + tiga utility khusus itu.
   Aturan main untuk agen coding (masuk PRD §9.2): dilarang menulis berkas .css baru selain styles.css dan dilarang memakai arbitrary value warna di luar token @theme. Ini yang mencegah Tailwind berubah menjadi plain CSS yang tersebar.
3. AI SDK — Keputusan Final
   Ini bagian yang paling berubah oleh riset. Kabar baiknya: kamu tidak perlu menunggu SDK apa pun.

Fakta dari dokumentasi Meta
Meta Model API berada di https://api.meta.ai/v1, dinyatakan drop-in compatible dengan OpenAI SDK dan Anthropic SDK, dan diautentikasi dengan Bearer MODEL_API_KEY
.
Muse Spark mendukung structured output lewat response_format bertipe json_schema pada Chat Completions, dan tool calling lewat array tools standar
.
Batasan penting yang mengubah desain: tool_choice hanya menerima "auto"; nilai lain mengembalikan HTTP 400, jadi model tidak bisa dipaksa memanggil tool tertentu. parallel_tool_calls aktif secara bawaan dan harus dimatikan agar satu tick NPC menghasilkan tepat satu aksi
.
Mode strict menuntut setiap objek memakai additionalProperties: false dan required yang mencantumkan semua properti
. Skema dibatasi maksimum 10 tingkat kedalaman dan 5.000 properti
.
Cookbook resmi Meta sendiri memperingatkan structured output hanya menjamin bentuk, bukan kebenaran isinya
; nilai yang diekstrak model tetap harus diperlakukan sebagai klaim untuk diverifikasi
. Ini memvalidasi keputusan D6: validasi Zod + validator aturan + mesin simulasi tetap wajib, apa pun SDK-nya.
Harga tier Standard adalah
1
,
25
p
e
r
j
u
t
a
t
o
k
e
n
i
n
p
u
t
d
a
n
4,25 per juta token output; tier Contributor jauh lebih murah tetapi Meta boleh memakai prompt dan completion untuk pelatihan
. Sesuai keputusan privasi D16, tier Contributor dilarang untuk data pilot; yang dipakai muse-spark-1.3 Standard.
Perbandingan transport
Opsi Putusan Alasan
Raw fetch ke Meta Model API DIPILIH untuk produksi Nol dependensi SDK, menghormati laranganmu soal Vercel AI SDK, dan memberi kendali penuh atas dua keunikan Meta (tool_choice: "auto", strict subset). Sesuai keputusan awalmu tanpa kamu sadari alasannya sekarang terbukti benar.
OpenAI SDK (TypeScript) diarahkan ke base URL Meta Cadangan spike saja, tidak masuk produksi bila raw lolos Secara resmi kompatibel — dokumentasi Meta bahkan menunjuk helper SDK-nya
— dan helper Zod-nya praktis untuk structured output . Ditolak sebagai jalur utama karena helper parse-nya didokumentasikan Meta untuk Python/Pydantic, sehingga perilaku subset strict Meta di TypeScript tetap harus dibuktikan, sementara raw fetch tidak punya lapisan tebakan itu.
Baseten untuk Muse Spark Open Jalur cadangan resmi + jalur bonus open-weight Baseten melayani Muse Spark Open lewat endpoint kompatibel OpenAI
dengan nama model meta-models/muse-spark-open
; untuk hackathon ini panduan peserta memintamu memakai slug meta-models/muse-spark-open-1026. Function calling didukung, tetapi structured output pada route bersama tidak dijamin — berarti di jalur ini Zod-lah satu-satunya penegak skema.
Muse Glimmer Ditolak untuk MVP Glimmer adalah model open-weight yang diunduh dan dijalankan di hardware sendiri, bukan dipanggil lewat Model API , dan ukurannya ±30B yang dirancang untuk satu GPU konsumen . Tidak ada tempat menjalankannya di arsitektur Vercel dalam sisa waktu ini.
Vercel AI SDK / AI Gateway Ditolak (keputusanmu dipertahankan) Memang tersedia sebagai salah satu tempat Spark berjalan , tetapi kamu sudah memutuskan tidak memakainya, dan raw fetch membuat keputusan itu tidak berbiaya apa pun.
LangChain / framework agent lain Ditolak Menambah lapisan abstraksi di atas API yang bentuknya sudah standar; tidak ada kebutuhan rantai multi-model di MVP.
Spesifikasi packages/ai-client yang dikunci
Satu-satunya variabel kunci: MODEL_API_KEY (nama ini mengikuti dokumentasi resmi, menggantikan META_API_KEY di PRD lama). META_MODEL_ID bawaan muse-spark-1.3.
NPC tick: POST /v1/chat/completions dengan tools berisi satu fungsi npc_action, tool_choice: "auto", parallel_tool_calls: false, strict: true pada skema aksi. Karena model tidak bisa dipaksa, system prompt memerintahkan memilih tepat satu aksi; bila respons berisi teks biasa tanpa tool call, tick itu langsung dianggap gagal dan Fallback berjalan — tanpa retry di dalam tick yang sama, agar batas 3 detik tidak jebol.
Market Shock: response_format json_schema strict dengan skema datar {concept_id, price_multiplier, demand_multiplier, headline_game}, semua field required, tanpa skema rekursif. Hasil tetap melewati Zod, lalu clamp 0,85–1,30 oleh kode.
Asisten Kontrak dan hint Dimas: tanpa tool, output teks biasa dibatasi token, lalu dirender sebagai teks (NFR-006). Hint Dimas dibatasi memilih ID dari daftar template, bukan teks bebas.
Timeout: AbortController 2.500 ms untuk panggilan model, menyisakan ±500 ms untuk Fallback sebelum batas 3 detik NFR-002.
Tanpa streaming di MVP. Streaming argumen tool memang didukung
, tetapi tidak terlihat oleh pemain dan hanya menambah jalur error.
Urutan smoke test (gerbang S2, tidak berubah): dialog Bahasa Indonesia Pak Hendra → tool call evaluate_offer lolos Zod → structured output concept_id dari enum → npc_action memilih dari daftar sah. Raw fetch diuji lebih dulu; OpenAI SDK hanya dicoba bila raw gagal pada format, dan Baseten hanya diaktifkan bila keduanya gagal pada tool calling.
Estimasi biaya hasil hitung ulang (dari harga resmi di atas): satu keputusan NPC ±600 token input + 80 token output ≈
0
, 0011.
D
e
n
g
a
n
±
20
p
a
n
g
g
i
l
a
n
p
e
r
s
e
s
i
≈
0,022 per sesi, sehingga kredit $150 setara ribuan sesi pilot. Angka ini turunan hitungan, bukan janji — token reasoning aktual diukur di smoke test.

4. Keputusan Teknis Lain yang Tertutup oleh Riset
   Topik Keputusan final Bukti / alasan
   Bun di Vercel (koreksi penting) Bun lokal dikunci 1.4.4 lewat packageManager, tetapi produksi Vercel hanya menerima bunVersion: "1.x" — minor version dikelola Vercel, tidak bisa di-pin ke 1.4.4 Runtime Bun untuk Vercel Functions masih Public Beta dan secara resmi mendukung Hono
   dengan pola export default app
   . Konsekuensi: kode aplikasi dilarang memakai API khusus Bun di jalur produksi, dan adapter @hono/vercel tidak dipakai.
   Driver Neon @neondatabase/serverless mode HTTP (neon()), SQL eksplisit, migrasi SQL berversi dijalankan lewat skrip Bun. Drizzle ditolak untuk MVP. Driver resmi memang dirancang query lewat HTTP untuk lingkungan serverless, dan mode HTTP adalah bawaan yang disarankan untuk query tunggal
   . Dengan ±6 tabel dan snapshot JSONB, ORM memberi sedikit manfaat dibanding permukaan belajarnya. Drizzle tetap kompatibel bila nanti dibutuhkan
   .
   State klien TanStack Query untuk data server (sesi, debrief, ringkasan peneliti), Zustand murni untuk state UI dan animasi dunia. Keduanya tidak boleh menyimpan hal yang sama. Pemisahan server-state vs client-state adalah pola yang terdokumentasi luas di ekosistem TanStack: Query memiliki data API, Zustand memiliki state UI .
   Sumber berita Market Shock Default: RSS Ekonomi ANTARA (https://www.antaranews.com/rss/ekonomi.xml), difilter kata kunci kopi/gula/susu/BBM/cuaca/ekspor; hanya headline + tautan yang disimpan, bukan isi artikel. Fallback tetap 5 kartu kurasi berlabel "Simulasi pasar". Feed RSS ANTARA terkonfirmasi ada, termasuk feed terkini resminya dan feed ekonomi yang dipakai proyek lain . Google News RSS ditolak sebagai sumber utama: feed-nya gratis tanpa pendaftaran , tetapi format URL-nya tidak lagi terdokumentasi resmi . Keterjangkauan feed ANTARA dari region Vercel dibuktikan di spike S7, bukan ditanyakan kepadamu.
   Metode SUS SUS standar 10 butir, bukan 5 butir seperti draf awal. Target median ≥ 68. Skor SUS dihitung dengan rumus Brooke dan rata-rata lintas studi adalah 68, yang menjadi patokan "di atas rata-rata" .
5. Open Questions — Status Setelah Riset
   ID lama Status baru
   OQ-01 Model Meta TERTUTUP oleh dokumentasi. Sisa pekerjaan: smoke test dengan kunci aslimu (tugas teknis, gerbang S2).
   OQ-02 Bun/Vercel TERTUTUP dengan koreksi: pin 1.4.4 hanya berlaku lokal; produksi memakai bunVersion: "1.x".
   OQ-03 Sumber berita TERTUTUP: ANTARA RSS Ekonomi + kurasi berlabel.
   OQ-04 Auth peneliti TERTUTUP: ADMIN_TOKEN + token sesi ter-hash (default diterima sebagai keputusan).
   OQ-05 Angka ekonomi BUKAN pertanyaan sekarang: nilai §9.8 berlaku sampai skrip simulasi 1.000 sesi dan playtest temanmu memberi angka pengganti.
   OQ-06 Pemetaan profil adaptif MENUNGGU PERSETUJUANMU — lihat Q3 di bawah. Default FR-003/FR-004 jalan bila kamu tidak menjawab.
   OQ-07 Perangkat uji MENUNGGU JAWABANMU — lihat Q2. Ini satu-satunya blocker target performa.
   OQ-08 Protokol pilot SEBAGIAN TERTUTUP: SUS dikunci 10 butir, target ≥ 68. Isi 5 soal menunggu validator domain (Q1).
   OQ-09 Driver DB TERTUTUP: Neon serverless HTTP + SQL eksplisit.
   OQ-10 Stack styling/state TERTUTUP: Tailwind v4, TanStack Query + Zustand.
   OQ-11 Kedaluwarsa sesi TERTUTUP: 24 jam diterima sebagai keputusan.
   OQ-12 Visibilitas Agent Log MENUNGGU PERSETUJUANMU — lihat Q4. Default: tampil terlipat di debrief semua mode.
   OQ-13 Rate limit & retensi TERTUTUP sebagai keputusan internal: 60 aksi/menit/sesi, log 30 hari.
   OQ-14 Institusi & validasi MENUNGGU JAWABANMU — lihat Q1. Tidak bisa diriset: ini fakta jaringanmu sendiri.
   OQ-15 Isi pasal & hasil tawar MENUNGGU VALIDASI DOMAIN — lihat Q1. Aku tidak boleh mengarang keadilan kontrak atas nama dosenmu.
   OQ-16 Rentang Market Shock TERTUTUP sebagai default terukur: 0,85–1,30, ditinjau setelah simulasi.
   Dari 16 pertanyaan menjadi 4 yang benar-benar membutuhkanmu, dan semuanya punya default sehingga pembangunan tidak berhenti.

6. Pertanyaan Untukmu (urut dampak, maksimal 5)
   Q1 — Siapa validator domainmu, dan apakah ejaan institusinya "UNJADI"? Aku butuh satu nama (dosen atau pemilik ide) yang akan menyetujui dua hal sebelum 1 Nov: (a) isi final Pasal Jebakan dan hasil tawar mana yang dikabulkan kode, dan (b) isi 5 soal pra/pasca pilot. Tanpa ini, klaim Impact di video demo hanya berupa angkaku, bukan angka yang diakui pengajar bisnis. Default bila tidak dijawab: pasal dan soal dari PRD §9.8 dipakai apa adanya, dan di README ditulis jujur "belum divalidasi dosen".

Q2 — HP Android apa yang benar-benar tersedia untukmu uji dan untuk pilot? Sebutkan model, versi Android, dan RAM bila tahu. Target 60 fps dan 300 KB hanya bisa dibuktikan di perangkat nyata; PixiJS menjanjikan rendering, bukan frame rate di HP spesifik temanmu. Default bila tidak dijawab: target ditulis "Android kelas menengah, Chrome terbaru" dan hasil uji perangkatmu dilaporkan apa adanya.

Q3 — Setujukah kamu dengan pemetaan adaptasi profil ini? Pemula → hint Dimas tiap minggu; pernah jualan → hint hanya saat kas turun; gaya berani → Vendor datang awal Minggu 3; gaya hati-hati → Vendor menunggu AP pertamamu. Ini satu-satunya tempat klaim "agent menyesuaikan user sejak onboarding" bisa dibuktikan juri dalam 3 menit. Default bila tidak dijawab: pemetaan ini dipakai persis.

Q4 — Agent Log tampil untuk semua pemain, atau hanya Mode Demo dan Peneliti? Tampil untuk semua pemain (terlipat) memperkuat bukti agentic ke juri yang mencoba live product tanpa menonton video. Risikonya pemain awam bingung melihat nama tool. Default bila tidak dijawab: tampil terlipat di debrief semua mode, dengan judul Bahasa Indonesia "Cara NPC mengambil keputusan".

Q5 — Apakah kutipan dosen bisa kamu dapatkan sebelum 2 Nov? Satu kalimat seperti "mahasiswa saya selalu kena klausul minimal pembelian seperti ini" di video bernilai lebih dari satu slide argumen Impact. Ini tidak bisa diriset dan tidak bisa kukarang. Default bila tidak dijawab: video hanya memakai data pilot dan kutipan peserta, tanpa klaim dosen.

Ringkasan perubahan untuk Changelog PRD
Render dunia diganti dari Canvas 2D native menjadi PixiJS v8 + @pixi/tilemap (imperatif, tanpa @pixi/react), peta sebagai data string, BFS sendiri.
CSS diganti dari plain CSS menjadi Tailwind CSS v4 dengan token @theme dan utility pixel khusus; plain CSS per komponen dilarang.
AI SDK diputuskan: raw fetch ke Meta Model API (muse-spark-1.3 Standard), OpenAI SDK dan Baseten sebagai cadangan berjenjang, Glimmer dan Vercel AI SDK ditolak dengan alasan terdokumentasi.
Env key diganti META_API_KEY → MODEL_API_KEY mengikuti dokumentasi resmi.
Koreksi Bun: pin 1.4.4 hanya lokal; Vercel memakai "1.x".
Open Questions menyusut dari 16 menjadi 4 yang membutuhkanmu (Q1–Q4 di atas; Q5 adalah aset video, bukan blocker build).

---

## 7. Keputusan Final S0/S1 (28 Okt 2026 — MENGIKAT)

Q1: Ejaan resmi **UNJANI** (Universitas Jenderal Achmad Yani). Pasal Jebakan & 5 soal pra/pasca pilot memakai default PRD §9.8 mulai S1; status "belum divalidasi dosen" dicatat jujur di README.
Q2: Target uji = Android Entry-Mid (RAM 4 GB, Android 8.0+, Chrome terbaru).
Q3: Pemetaan adaptif PRD FR-003/FR-004 disetujui 100% tanpa perubahan.
Q4: Agent Log tampil terlipat di debrief semua mode, judul **"Cara NPC mengambil keputusan"**.
Q5: Default = data pilot & kutipan peserta; tanpa klaim dosen.

## 8. Koreksi Arsitektur Render (FINAL — menggantikan §1 di atas)

Keputusan §1 yang memilih `@pixi/tilemap` + `CompositeTilemap` **DIBATALKAN**. Bukti baru: grid hanya 18 × 24 = 432 ubin, sehingga CompositeTilemap tidak memberi manfaat yang sepadan dengan risiko kompatibilitas runtime canvas texture di Pixi v8 pada HP RAM 4 GB.

Arsitektur final: **PixiJS v8 murni** (`pixi.js` saja) — `Container` + `Sprite` biasa untuk 432 ubin, layer statis (tanah & bangunan) dibekukan dengan `staticContainer.cacheAsTexture(true)`, sprite dinamis (pemain, NPC, penanda "!") diinterpolasi di ticker. Seluruh aturan imperatif Pixi v8 dikunci di `AGENTS.md`. Sisa §1 (peta sebagai data string, tileset prosedural `scaleMode: 'nearest'`, BFS ±40 baris di sim-core, jembatan React ↔ Pixi satu arah via Zustand) tetap berlaku.

## 9. Koreksi Entry API Vercel (S1 — menggantikan klaim "tanpa adapter" di §4)

Riset lanjutan (dok resmi Vercel + Bun, 28 Okt 2026) membuktikan pola `export default app`
per-file BUKAN pola terdokumentasi untuk `api/*.ts`, sedangkan pola `Bun.serve()` di
`api/server.ts` melanggar larangan API khusus Bun di kode runtime. Keputusan final:
entry tipis `api/*.ts` memakai `handle(app)` dari subpath resmi `hono/vercel`
(bagian dari paket `hono` itu sendiri — paket terpisah `@hono/vercel` tidak ada),
yang menghasilkan handler `(req, res)` standar dan jalan di runtime Node maupun Bun.
Seluruh logika rute tetap Hono murni di `apps/api` (portable). Larangan tsconfig path
alias (`@/*`) ditambahkan karena terbukti crash saat runtime di Vercel Bun.

## 10. Adopsi Drizzle ORM (29 Okt 2026 — instruksi user, MENGGANTIKAN §4 "Drizzle ditolak")

Keputusan §4 ("tanpa ORM, SQL eksplisit") dan PRD §9.2/§9.5 ("tanpa ORM pada MVP")
**DICABUT** atas instruksi eksplisit user. `packages/db` kini memakai Drizzle ORM
stabil (`drizzle-orm`, adapter `neon-http` di atas `@neondatabase/serverless`, sesuai
panduan integrasi Neon+Drizzle) + `drizzle-kit` untuk migrasi berversi.
Skema TypeScript (`src/schema.ts`, 6 tabel PRD §9.5) adalah sumber kebenaran tunggal;
`bun run db:migrate` = `drizzle-kit migrate`. Adapter tetap HTTP/stateless sehingga
kompatibel Vercel Functions; pola `getDb()` mengembalikan `null` bila `DATABASE_URL`
tak diset (health `unconfigured`) tetap dipertahankan.

## 11. Adopsi Vercel AI SDK (29 Okt 2026 — instruksi user, MENGGANTIKAN §3 "raw fetch")

Keputusan §3 ("raw fetch DIPILIH, Vercel AI SDK ditolak") dan larangan SDK di PRD
§9.2/§9.3 **DICABUT** atas instruksi eksplisit user: SDK sudah matang, transport
buatan sendiri hanya duplikasi. `packages/ai-client` kini memakai `ai` v7 +
`@ai-sdk/openai-compatible` (`createOpenAICompatible`, `supportsStructuredOutputs`).
Model TETAP Muse Spark (`muse-spark-1.3`, baseURL Meta) sesuai ketentuan hackathon.
Yang dipertahankan: `tool_choice auto`, satu langkah per tick (`stopWhen`
`stepCountIs(1)`), `maxRetries: 0`, `AbortSignal.timeout(2500)`, skema tool datar,
validasi Zod + validator aturan + fallback deterministik tanpa retry, tanpa
streaming. Skema strict tulisan tangan (`schemas.ts`) dihapus — skema Zod dikirim
SDK, validasi akhir tetap di kode.
