// Enam Kartu Konsep (PRD FR-029). Dibuka setelah pemain mengalami pemicunya.
export interface ConceptCard {
  id: string;
  title: string;
  trigger: string;
  body: string;
}

export const CONCEPTS: readonly ConceptCard[] = [
  {
    id: 'break-even',
    title: 'Titik Impas (Break-even)',
    trigger: 'Menutup minggu pertama dengan Hasil Minggu',
    body: 'Titik impas adalah jumlah cangkir yang harus terjual agar pendapatan menutup semua biaya. Di bawah itu kamu rugi, di atas itu kamu untung.',
  },
  {
    id: 'working-capital',
    title: 'Modal Kerja (Working Capital)',
    trigger: 'Stok menumpuk sementara kas menipis',
    body: 'Modal kerja adalah uang yang tertahan di stok dan piutang. Stok yang tidak terjual berarti kas yang tidak bisa dipakai belanja minggu depan.',
  },
  {
    id: 'cashflow-vs-profit',
    title: 'Arus Kas vs Laba',
    trigger: 'Laba positif tetapi kas menurun',
    body: 'Laba menghitung pendapatan dikurangi biaya, tetapi kas baru bergerak saat uang benar-benar masuk dan keluar. Bisnis bisa berlaba di kertas namun kehabisan kas.',
  },
  {
    id: 'price-elasticity',
    title: 'Elastisitas Harga',
    trigger: 'Menaikkan harga lalu unit terjual turun tajam',
    body: 'Elastisitas mengukur seberapa sensitif pembeli terhadap harga. Kopi kampus pembelinya sensitif: naik sedikit, banyak yang pindah ke warung sebelah.',
  },
  {
    id: 'contract-risk',
    title: 'Risiko Kontrak',
    trigger: 'Menandatangani kontrak Pak Hendra',
    body: 'Kontrak mengunci harga dan kewajiban. Pasal yang tidak dibaca — denda, minimal beli, uang muka — menjadi biaya yang muncul minggu-minggu berikutnya.',
  },
  {
    id: 'supplier-verification',
    title: 'Verifikasi Pemasok',
    trigger: 'Menerima kiriman pertama Vendor Misterius',
    body: 'Pemasok baru harus diverifikasi: minta sampel, tanya pedagang lain, cek timbangan, minta bukti tertulis. Harga murah tanpa bukti adalah risiko, bukan rezeki.',
  },
];

export const CONCEPT_IDS = CONCEPTS.map((c) => c.id);
