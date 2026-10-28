// Lima Pasal Jebakan kontrak Pak Hendra (PRD §9.8). Per sesi dipilih 3 dari 5.
// Status S1: default PRD, "belum divalidasi dosen" (Keputusan Final Q1).
export interface TrapClause {
  id: string;
  title: string;
  clause: string;
  plainMeaning: string;
  /** Minggu relatif setelah tanda tangan saat akibat terjadwal. */
  effectWeekOffset: number;
  effect: string;
  /** Hasil tawar yang dikabulkan kode (kuota 2x tawar, FR-016). */
  haggleResult: "diterima" | "diturunkan" | "ditolak";
  haggleNote: string;
}

export const TRAP_CLAUSES: readonly TrapClause[] = [
  {
    id: "harga-sepihak",
    title: "Kenaikan Harga Sepihak",
    clause: "Pemasok berhak menyesuaikan harga bahan mengikuti harga pasar tanpa persetujuan tertulis penerima.",
    plainMeaning: "Pak Hendra boleh menaikkan harga kapan saja tanpa izinmu.",
    effectWeekOffset: 1,
    effect: "Harga kontrak naik 15% mulai minggu berikutnya.",
    haggleResult: "diturunkan",
    haggleNote: "Kenaikan dibatasi maksimal 5% per minggu.",
  },
  {
    id: "minimal-beli",
    title: "Minimal Pembelian",
    clause: "Penerima wajib membeli sekurang-kurangnya 120 unit setiap minggu selama kontrak berjalan.",
    plainMeaning: "Kamu wajib beli 120 unit tiap minggu, laku atau tidak.",
    effectWeekOffset: 0,
    effect: "Jumlah beli minimum dikunci 120 unit per minggu.",
    haggleResult: "diturunkan",
    haggleNote: "Minimal diturunkan menjadi 80 unit per minggu.",
  },
  {
    id: "uang-muka",
    title: "Uang Muka di Depan",
    clause: "Penerima membayar uang muka Rp1.300.000 pada saat penandatanganan sebagai tanda jadi.",
    plainMeaning: "Kasmu langsung berkurang Rp1.300.000 saat tanda tangan.",
    effectWeekOffset: 0,
    effect: "Kas berkurang Rp1.300.000 pada minggu tanda tangan.",
    haggleResult: "ditolak",
    haggleNote: "Pak Hendra menolak: uang muka adalah syarat mutlak gudang.",
  },
  {
    id: "denda-keluar",
    title: "Denda Keluar Kontrak",
    clause: "Pemutusan kontrak sebelum waktunya dikenai denda 20% dari nilai sisa kontrak.",
    plainMeaning: "Berhenti di tengah jalan kena denda 20% sisa kontrak.",
    effectWeekOffset: 2,
    effect: "Denda 20% dari sisa kontrak jika kontrak diputus lebih awal.",
    haggleResult: "diturunkan",
    haggleNote: "Denda diturunkan menjadi 10% dari sisa kontrak.",
  },
  {
    id: "tanpa-garansi",
    title: "Tanpa Garansi Mutu",
    clause: "Pemasok tidak bertanggung jawab atas penurunan mutu bahan selama penyimpanan penerima.",
    plainMeaning: "Bahan rusak di gudangmu bukan urusan Pak Hendra.",
    effectWeekOffset: 1,
    effect: "20% stok dinyatakan afkir (tidak bisa dijual) mulai minggu berikutnya.",
    haggleResult: "diterima",
    haggleNote: "Pasal dihapus: garansi mutu 7 hari disepakati.",
  },
];
