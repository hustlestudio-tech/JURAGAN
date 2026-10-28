// Instrumen pilot: 5 soal pra/pasca (identik) + SUS 10 butir standar.
// Status S1: default PRD, "belum divalidasi dosen" (Keputusan Final Q1).
export interface PilotQuestion {
  id: string;
  conceptId: string;
  question: string;
  choices: readonly [string, string, string, string];
  answerIndex: number;
}

export const PILOT_QUESTIONS: readonly PilotQuestion[] = [
  {
    id: 'q1',
    conceptId: 'cashflow-vs-profit',
    question:
      'Kedaimu laba Rp500 ribu minggu ini, tetapi kas turun Rp1 juta karena menumpuk stok. Kesimpulan yang tepat adalah …',
    choices: [
      'Laporan labanya pasti salah hitung',
      'Laba dan kas bergerak berbeda karena uang tertahan di stok',
      'Stok yang menumpuk selalu menambah kas',
      'Kas turun berarti minggu ini pasti rugi',
    ],
    answerIndex: 1,
  },
  {
    id: 'q2',
    conceptId: 'price-elasticity',
    question:
      'Harga naik dari Rp15 ribu ke Rp18 ribu, pembeli turun lebih dari separuh. Artinya permintaan kopi kampus …',
    choices: [
      'Tidak sensitif terhadap harga',
      'Sangat sensitif (elastis) terhadap harga',
      'Hanya peduli rasa, bukan harga',
      'Akan kembali normal minggu depan dengan sendirinya',
    ],
    answerIndex: 1,
  },
  {
    id: 'q3',
    conceptId: 'contract-risk',
    question:
      'Kontrak mewajibkan beli minimal 120 unit/minggu. Minggu sepi hanya laku 70. Risiko terbesar pasal ini adalah …',
    choices: [
      'Harus menaikkan harga jual',
      'Kas tertahan di stok yang tidak laku',
      'Pemasok menaikkan harga sepihak',
      'Reputasi kedai turun',
    ],
    answerIndex: 1,
  },
  {
    id: 'q4',
    conceptId: 'supplier-verification',
    question:
      'Pemasok baru menawarkan harga 30% lebih murah tanpa sampel, tanpa nota, tanpa alamat gudang. Langkah pertama yang benar adalah …',
    choices: [
      'Langsung pesan besar sebelum harga naik',
      'Minta sampel dan bukti tertulis sebelum memesan',
      'Menawar lebih murah lagi',
      'Membayar uang muka agar diprioritaskan',
    ],
    answerIndex: 1,
  },
  {
    id: 'q5',
    conceptId: 'break-even',
    question:
      'Biaya tetap Rp350 ribu/minggu, margin Rp9 ribu/cangkir. Titik impas mingguan adalah …',
    choices: ['30 cangkir', '39 cangkir', '350 cangkir', '500 cangkir'],
    answerIndex: 1,
  },
];

/** SUS standar 10 butir (Brooke), adaptasi Bahasa Indonesia. Ganjil = positif, genap = negatif. */
export const SUS_ITEMS: readonly string[] = [
  'Saya akan sering menggunakan game ini jika belajar usaha.',
  'Game ini rumit dan sulit dimainkan.',
  'Game ini mudah dimainkan.',
  'Saya butuh bantuan orang lain untuk memainkan game ini.',
  'Berbagai fitur dalam game ini menyatu dengan baik.',
  'Terlalu banyak hal yang tidak konsisten dalam game ini.',
  'Saya merasa orang lain akan cepat memahami game ini.',
  'Game ini merepotkan untuk dimainkan.',
  'Saya merasa percaya diri saat memainkan game ini.',
  'Saya harus belajar banyak hal dulu sebelum bisa memainkan game ini.',
];
