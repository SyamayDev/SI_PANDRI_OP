/* =====================================================================
   SI-PANDRI: Misi Laundry Beres! — data.js
   Konten game: tokoh, babak, catatan presenter, achievement,
   dan data mini-game. Dialog lengkap ada di acts.js.
   Semua nama pelanggan, nomor WhatsApp, dan transaksi di game ini FIKTIF.
   ===================================================================== */
(function () {
  'use strict';

  // Tarif bawaan aplikasi Pascal (IsiPengaturanBawaan di SI_PANDRI.pas). Admin dapat mengubahnya.
  const TARIF = { Reguler: 6000, Express: 10000 };
  const REKENING_CONTOH = { bank: 'BCA', nomor: '1234567890', atasNama: 'Parfait Laundry', waAdmin: '6281234567890' };

  const SPEAKERS = {
    narrator: { name: 'Narator', role: '', color: '#5E6672' },
    ratna: { name: 'Bu Ratna', role: 'Pemilik Parfait Laundry', color: '#B8442E' },
    gilbert: { name: 'Gilbert', role: 'Harimau teliti · pengamat detail', color: '#C46519' },
    sarah: { name: 'Sarah', role: 'Snow leopard · pemandu & komunikator', color: '#7A3E9C' },
    syahril: { name: 'Syahril', role: 'Beruang putih · perancang alur & program', color: '#1F3A5F' },
    dimas: { name: 'Mas Dimas', role: 'Pelanggan (fiktif)', color: '#2F62A0' },
    lala: { name: 'Kak Lala', role: 'Pelanggan (fiktif)', color: '#A8761B' },
    nadia: { name: 'Kak Nadia', role: 'Pelanggan (fiktif)', color: '#2C6C65' },
    joko: { name: 'Pak Joko', role: 'Pelanggan (fiktif)', color: '#6B432B' }
  };

  const ACTS = [
    {
      id: 'b1', title: 'Sebuah Laundry Kecil yang Sibuk',
      goal: 'Mengenal Bu Ratna dan pekerjaan sehari-harinya di Parfait Laundry.',
      learn: 'Pengelolaan laundry terdiri dari tahapan yang saling berhubungan.',
      summary: [
        'Setiap pesanan butuh data pelanggan, layanan, berat aktual, total biaya, status, dan pembayaran.',
        'Berat dan total baru diketahui setelah cucian ditimbang, bukan ditebak.',
        'Saat ramai, catatan manual makin sulit diperiksa: status cucian jadi tidak jelas.'
      ],
      presenter: {
        ringkas: 'Perkenalkan Bu Ratna dan masalah sehari-hari: mencatat, menimbang, menghitung, dan mengingat status cucian.',
        transisi: '“Lalu, apa yang terjadi ketika tiga mahasiswa melihat kesibukan ini?”',
        pascal: 'Belum perlu membuka aplikasi. Fokus pada masalah pengguna.',
        durasi: '± 2 menit'
      }
    },
    {
      id: 'b2', title: 'Tiga Orang Menawarkan Bantuan',
      goal: 'Gilbert, Sarah, dan Syahril mendengarkan kendala Bu Ratna sebelum menawarkan solusi.',
      learn: 'Analisis kebutuhan dimulai dari mendengarkan pengguna, bukan dari fitur.',
      summary: [
        'Tim tidak langsung menawarkan aplikasi canggih; mereka bertanya dan mendengarkan dulu.',
        'Temuan wawancara dicatat: pencatatan, perhitungan, status, dan pertanyaan pelanggan.',
        'Bu Ratna ingin sistem yang mudah, bukan yang menambah rumit.'
      ],
      presenter: {
        ringkas: 'Perkenalkan tim (tokoh Gilbert, Sarah, Syahril) dan cara mereka menggali kebutuhan.',
        transisi: '“Dari cerita Bu Ratna, apa sebenarnya akar masalahnya?”',
        pascal: 'Belum perlu membuka aplikasi.',
        durasi: '± 2 menit'
      }
    },
    {
      id: 'b3', title: 'Menemukan Akar Permasalahan',
      goal: 'Menguraikan proses kerja laundry dan memasangkan masalah dengan kebutuhan sistem.',
      learn: 'Setiap kebutuhan sistem harus menjawab masalah yang nyata.',
      summary: [
        'Data pelanggan → pencatatan pelanggan. Pilihan paket → layanan Reguler/Express.',
        'Berat ditebak → input berat aktual oleh admin. Salah hitung → total = berat × tarif.',
        'Lupa status → status pesanan per tahap. Pertanyaan pelanggan → teks WhatsApp siap kirim.',
        'Solusi yang dibutuhkan: sederhana, konsisten, dan sesuai alur kerja laundry.'
      ],
      presenter: {
        ringkas: 'Tunjukkan hasil identifikasi masalah: enam masalah dipasangkan dengan enam kebutuhan.',
        transisi: '“Kebutuhannya sudah jelas. Saatnya memperkenalkan solusinya: SI-PANDRI.”',
        pascal: 'Opsional: sebutkan bahwa setiap kebutuhan ini punya menu di aplikasi Pascal.',
        durasi: '± 3 menit'
      }
    },
    {
      id: 'b4', title: 'Memperkenalkan SI-PANDRI',
      goal: 'Mengenal SI-PANDRI — Sistem Pengelolaan Parfait Laundry — dan menu-menunya.',
      learn: 'SI-PANDRI adalah program terminal Free Pascal dengan menu Admin dan menu Pelanggan.',
      summary: [
        'SI-PANDRI berjalan di terminal, dibuat dengan Free Pascal, dan menyimpan data di file lokal.',
        'Menu utama: Login Admin, Menu Pelanggan, Keluar.',
        'Pelanggan membuat pesanan; admin menimbang, menghitung, memperbarui status, dan menyiapkan pesan WhatsApp.'
      ],
      presenter: {
        ringkas: 'Perkenalkan nama resmi dan struktur menu. Tekankan: aplikasi utama adalah program Pascal, game hanya simulasi.',
        transisi: '“Mari kita ikuti perjalanan satu pesanan dari awal sampai selesai.”',
        pascal: 'Boleh buka SI_PANDRI.exe sebentar untuk menunjukkan banner dan menu utama yang sama.',
        durasi: '± 2 menit'
      }
    },
    {
      id: 'b5', title: 'Simulasi Perjalanan Satu Pesanan',
      goal: 'Memproses satu pesanan fiktif dari pelanggan datang sampai cucian diserahkan.',
      learn: 'Alur Input → Proses → Output pada pesanan laundry.',
      parts: ['Pelanggan datang', 'Data pesanan dicatat', 'Cucian ditimbang', 'Biaya dihitung', 'Pesanan dikelola', 'Pembayaran diinformasikan', 'Pesanan selesai'],
      summary: [
        'Input: data pelanggan, layanan, metode bayar, dan berat aktual dari timbangan.',
        'Proses: total = berat aktual × tarif per kg; status maju satu tahap demi satu tahap.',
        'Output: detail pesanan, teks tagihan, dan teks notifikasi WhatsApp yang dikirim manual.',
        'Lunas hanya ditandai setelah pembayaran benar-benar diperiksa admin.'
      ],
      presenter: {
        ringkas: 'Inti demo. Ajak audiens memilih layanan, menimbang, menghitung, dan memperbarui status.',
        transisi: '“Sekarang bandingkan: apa yang berubah dibanding cara manual?”',
        pascal: 'Setelah simulasi, ulangi alur yang sama di SI_PANDRI.exe: registrasi → buat pesanan → admin menu 2 → menu 5 → menu 7/8.',
        durasi: '± 6–8 menit'
      }
    },
    {
      id: 'b6', title: 'Sebelum dan Sesudah',
      goal: 'Membandingkan alur kerja manual dengan alur yang dibantu SI-PANDRI secara adil.',
      learn: 'Menilai manfaat berdasarkan fitur yang benar-benar ada, tanpa klaim berlebihan.',
      summary: [
        'Sebelum: catatan tulisan tangan, hitung manual, dan mencari pesanan dengan membolak-balik buku.',
        'Sesudah: pesanan tersimpan di file lokal, dicari dengan ID, total dihitung program.',
        'Tetap sama: cucian tetap ditimbang dan dicuci manusia, dan input harus benar.'
      ],
      presenter: {
        ringkas: 'Tunjukkan perbandingan yang jujur. Tidak ada angka efisiensi karena belum diukur.',
        transisi: '“Bagaimana program bisa melakukan semua itu? Mari lihat kodenya.”',
        pascal: 'Tidak perlu membuka aplikasi.',
        durasi: '± 2 menit'
      }
    },
    {
      id: 'b7', title: 'Logika di Balik Sistem',
      goal: 'Melihat konsep Dasar Pemrograman yang benar-benar dipakai di SI_PANDRI.pas.',
      learn: 'Input/output, percabangan, perulangan, perhitungan, validasi, dan file.',
      summary: [
        'Input dengan Readln, output dengan Writeln.',
        'Percabangan if-then-else, nested-if, dan case-of untuk memilih tindakan.',
        'Perulangan while-do (validasi), for-to-do (membaca data), repeat-until (menu).',
        'Total biaya = berat × tarif; data disimpan ke file lokal dengan Seek dan Write.'
      ],
      presenter: {
        ringkas: 'Hubungkan cerita dengan kode asli. Cuplikan di game diambil otomatis dari SI_PANDRI.pas.',
        transisi: '“Sekarang, apakah Bu Ratna bisa memakai sistemnya sendiri?”',
        pascal: 'Buka SI_PANDRI.pas di editor dan tunjukkan nomor baris yang sama.',
        durasi: '± 4 menit'
      }
    },
    {
      id: 'b8', title: 'Bu Ratna Mencoba Sendiri',
      goal: 'Bu Ratna memakai SI-PANDRI untuk beberapa situasi, didampingi tim.',
      learn: 'Memilih tindakan yang benar sesuai konteks dan fitur yang tersedia.',
      summary: [
        'Pelanggan baru → registrasi dulu, lalu buat pesanan.',
        'Total mengikuti tarif layanan; berat diisi dalam kilogram.',
        'Cek status dengan mencari ID pesanan, bukan dengan menebak.',
        'Jangan menandai Lunas sebelum pembayaran terverifikasi.'
      ],
      presenter: {
        ringkas: 'Ajak audiens menjawab skenario bersama. Kesalahan tidak menghentikan permainan.',
        transisi: '“Bagaimana akhir cerita Parfait Laundry?”',
        pascal: 'Opsional: peragakan satu skenario langsung di SI_PANDRI.exe.',
        durasi: '± 3 menit'
      }
    },
    {
      id: 'b9', title: 'Laundry yang Lebih Teratur',
      goal: 'Menutup cerita dan merangkum masalah, solusi, cara kerja, konsep, pengujian, dan manfaat.',
      learn: 'Pemrograman dasar dapat membantu kebutuhan nyata dengan cara yang sederhana.',
      summary: [
        'Masalah nyata → kebutuhan → alur → program → pengujian → presentasi.',
        'SI-PANDRI membantu pengelolaan pesanan menjadi lebih terstruktur sesuai fitur yang ada.',
        'Teknologi yang baik membantu menyelesaikan masalah nyata secara sederhana.'
      ],
      presenter: {
        ringkas: 'Tutup dengan pesan utama, rangkuman, hasil pengujian yang benar-benar dijalankan, dan keterbatasan.',
        transisi: '“Terima kasih. Kami siap menerima pertanyaan.”',
        pascal: 'Tunjukkan hasil `node tests/uji_pascal.js` jika ingin memperlihatkan pengujian langsung.',
        durasi: '± 2 menit'
      }
    }
  ];

  const ACHIEVEMENTS = {
    'asisten-kasir': { title: 'Asisten Kasir', desc: 'Membantu Bu Ratna menghitung total biaya dengan benar.' },
    'pendengar': { title: 'Pendengar yang Baik', desc: 'Memilih untuk mendengarkan kebutuhan sebelum menawarkan solusi.' },
    'detektif': { title: 'Detektif Masalah', desc: 'Memasangkan keenam masalah dengan kebutuhan sistem yang tepat.' },
    'penjelajah': { title: 'Penjelajah Sistem', desc: 'Menemukan menu SI-PANDRI yang tepat untuk tiga kebutuhan.' },
    'penimbang': { title: 'Penimbang Teliti', desc: 'Menimbang cucian dan memasukkan berat aktual yang sesuai timbangan.' },
    'admin-tertib': { title: 'Admin Tertib', desc: 'Menyelesaikan satu pesanan dari pelanggan datang sampai diserahkan.' },
    'adil': { title: 'Pembanding yang Jujur', desc: 'Mengelompokkan kondisi sebelum, sesudah, dan yang tetap sama.' },
    'pembaca-kode': { title: 'Pembaca Kode', desc: 'Memasangkan kode Pascal asli dengan fungsinya dan menebak output.' },
    'tanpa-ragu': { title: 'Tanpa Ragu', desc: 'Menjawab semua skenario Babak 8 benar pada percobaan pertama.' },
    'mentor': { title: 'Mentor Sabar', desc: 'Mendampingi Bu Ratna sampai percaya diri memakai sistem.' },
    'misi-beres': { title: 'Misi Laundry Beres!', desc: 'Menyelesaikan seluruh cerita dari Babak 1 sampai Babak 9.' }
  };

  // Alur presentasi kelas (ditampilkan di catatan presenter)
  const ALUR_PRESENTASI = [
    { teks: 'Ceritakan masalah yang dialami pemilik laundry', babak: 0 },
    { teks: 'Perkenalkan tiga pengembang yang menawarkan bantuan', babak: 1 },
    { teks: 'Jelaskan hasil identifikasi masalah', babak: 2 },
    { teks: 'Perkenalkan SI-PANDRI sebagai solusi', babak: 3 },
    { teks: 'Ajak audiens mencoba simulasi alur pesanan', babak: 4 },
    { teks: 'Hubungkan alur dengan fitur aplikasi Pascal (buka SI_PANDRI.exe)', babak: 4 },
    { teks: 'Jelaskan konsep Dasar Pemrograman yang diterapkan', babak: 6 },
    { teks: 'Tunjukkan hasil pengujian yang benar-benar dilakukan', babak: 8 },
    { teks: 'Tutup dengan kesimpulan dan manfaat proyek', babak: 8 }
  ];

  /* ---------------- Data mini-game ---------------- */
  const B1_CATAT = [
    { text: 'Nama pelanggan', correct: true, why: 'Betul. Nama dibutuhkan agar cucian tidak tertukar.' },
    { text: 'Nomor WhatsApp', correct: true, why: 'Betul. Nomor dipakai untuk mengabari tagihan dan cucian siap diambil.' },
    { text: 'Layanan: Reguler atau Express', correct: true, why: 'Betul. Layanan menentukan tarif per kilogram.' },
    { text: 'Total biaya', correct: false, why: 'Belum bisa. Total baru diketahui setelah cucian ditimbang.' },
    { text: 'Tebakan berat dari besar kantong', correct: false, why: 'Tebakan bisa meleset. Berat harus berasal dari timbangan.' },
    { text: 'Warna baju favorit pelanggan', correct: false, why: 'Lucu, tetapi tidak dibutuhkan untuk mengelola pesanan.' }
  ];

  const B1_BUKU = [
    { text: 'Sen · Laila · Reguler · 5 kg · sudah ambil', correct: false, why: 'Itu Laila, bukan Lala. Namanya mirip!' },
    { text: 'Sel · Lala · Reguler · ? kg', correct: false, why: 'Itu catatan hari Selasa. Kak Lala datang hari Senin.' },
    { text: 'S̶e̶n̶ ̶·̶ ̶L̶a̶l̶a̶ ̶·̶ ̶R̶e̶g̶u̶l̶e̶r̶', correct: false, why: 'Catatan ini dicoret. Mungkin salah tulis, jadi tidak bisa dipakai.' },
    { text: 'Sen · Lia · Express · 2,5 kg · blm bayar', correct: false, why: 'Itu Lia. Lagi-lagi nama yang mirip.' },
    { text: 'Sen · Lala · Express · 3 kg · dicuci?', correct: true, why: 'Ketemu! Tapi statusnya hanya ditulis “dicuci?”.' },
    { text: 'Rab · Dimas · Reguler · 4 kg', correct: false, why: 'Itu pesanan Mas Dimas hari Rabu.' }
  ];

  const B2_TEMUAN = [
    { text: '“Kalau ramai, pesanan menumpuk dan semuanya saya catat di buku.”', correct: true, why: 'Catat: pencatatan pesanan masih manual.' },
    { text: '“Biaya saya hitung satu per satu pakai kalkulator.”', correct: true, why: 'Catat: perhitungan biaya rawan salah saat ramai.' },
    { text: '“Saya sering lupa cucian mana yang sudah selesai.”', correct: true, why: 'Catat: status cucian sulit dipantau.' },
    { text: '“Pelanggan sering bertanya total, nomor rekening, dan kapan cucian siap.”', correct: true, why: 'Catat: informasi untuk pelanggan perlu disiapkan.' },
    { text: '“Mesin cuci saya warnanya putih semua.”', correct: false, why: 'Itu bukan kendala pengelolaan pesanan.' },
    { text: '“Saya lebih suka teh daripada kopi.”', correct: false, why: 'Menarik, tapi tidak berhubungan dengan sistem laundry.' }
  ];

  const B3_MASALAH = [
    { id: 'p1', text: 'Nama dan nomor WA pelanggan tercecer di banyak halaman buku', kunci: 'identitas pelanggan' },
    { id: 'p2', text: 'Pelanggan perlu tahu pilihan paket dan harganya', kunci: 'paket dan harga' },
    { id: 'p3', text: 'Berat kadang hanya diperkirakan sebelum ditimbang', kunci: 'berat yang sebenarnya' },
    { id: 'p4', text: 'Saat ramai, biaya mudah salah dihitung', kunci: 'menghitung biaya' },
    { id: 'p5', text: 'Sulit mengingat cucian mana yang sedang diproses atau sudah siap', kunci: 'tahap pengerjaan' },
    { id: 'p6', text: 'Pelanggan menanyakan total, rekening, dan kabar cucian siap', kunci: 'menyampaikan informasi ke pelanggan' }
  ];
  const B3_KEBUTUHAN = [
    { id: 'n1', text: 'Pencatatan data pelanggan (registrasi akun)', guna: 'menyimpan nama dan nomor WhatsApp pelanggan' },
    { id: 'n2', text: 'Pilihan layanan Reguler/Express dengan tarif per kg', guna: 'menentukan paket dan tarif' },
    { id: 'n3', text: 'Input berat aktual oleh admin setelah ditimbang', guna: 'mencatat hasil timbangan yang sebenarnya' },
    { id: 'n4', text: 'Perhitungan otomatis: berat × tarif', guna: 'menghitung total biaya' },
    { id: 'n5', text: 'Status pesanan yang diperbarui per tahap', guna: 'memantau tahap pengerjaan cucian' },
    { id: 'n6', text: 'Teks WhatsApp siap kirim (dikirim manual oleh admin)', guna: 'menyiapkan pesan untuk pelanggan' }
  ];
  const B3_JAWABAN = { p1: 'n1', p2: 'n2', p3: 'n3', p4: 'n4', p5: 'n5', p6: 'n6' };

  // Menu asli aplikasi Pascal (teks sama dengan SI_PANDRI.pas)
  const MENU = {
    utama: { judul: 'MENU UTAMA', items: [
      { no: 1, text: 'Login Admin', go: 'admin', info: 'Masuk sebagai admin (username admin, password demo).' },
      { no: 2, text: 'Menu Pelanggan', go: 'akses', info: 'Registrasi akun atau login sebagai pelanggan.' },
      { no: 3, text: 'Keluar', info: 'Menutup program. Data tetap tersimpan di file .dat.' }] },
    akses: { judul: 'AKSES PELANGGAN', items: [
      { no: 1, text: 'Registrasi akun baru', info: 'Mengisi nama, nomor WhatsApp, username, dan password.' },
      { no: 2, text: 'Login pelanggan', go: 'pelanggan', info: 'Masuk ke menu pelanggan.' },
      { no: 3, text: 'Kembali ke menu utama', go: 'utama', info: 'Kembali.' }] },
    pelanggan: { judul: 'MENU PELANGGAN - Kak Nadia', items: [
      { no: 1, text: 'Buat pesanan laundry', info: 'Memilih layanan dan metode pembayaran. Berat diisi admin nanti.' },
      { no: 2, text: 'Lihat semua pesanan saya', info: 'Hanya menampilkan pesanan milik akun yang sedang login.' },
      { no: 3, text: 'Cek status berdasarkan ID', info: 'Mencari satu pesanan dengan ID, misalnya PD00001.' },
      { no: 4, text: 'Ubah metode pembayaran', info: 'Tunai ↔ Transfer, selama pesanan belum lunas.' },
      { no: 5, text: 'Hubungi admin untuk transfer via WhatsApp', info: 'Menyiapkan tautan wa.me berisi teks permintaan nomor rekening.' },
      { no: 6, text: 'Logout', go: 'akses', info: 'Keluar dari akun pelanggan.' }] },
    admin: { judul: 'MENU ADMIN SI-PANDRI', items: [
      { no: 1, text: 'Lihat semua pesanan', info: 'Tabel ringkas semua pesanan: ID, nama, layanan, berat, total, bayar, status.' },
      { no: 2, text: 'Input berat aktual dan hitung biaya', info: 'Admin mengetik berat dari timbangan; program menghitung total.' },
      { no: 3, text: 'Pengaturan harga dan transfer', info: 'Mengubah tarif per kg, nomor WA admin, dan info rekening.' },
      { no: 4, text: 'Perbarui status pembayaran', info: 'Menandai Lunas setelah pembayaran diverifikasi admin.' },
      { no: 5, text: 'Perbarui status cucian', info: 'Memajukan status satu tahap: Diproses → Siap Diambil → Selesai.' },
      { no: 6, text: 'Cari pesanan berdasarkan ID', info: 'Menampilkan detail lengkap satu pesanan.' },
      { no: 7, text: 'Siapkan pesan tagihan via WhatsApp', info: 'Menyusun tautan wa.me berisi total dan cara bayar.' },
      { no: 8, text: 'Siapkan notifikasi cucian siap diambil', info: 'Menyusun tautan wa.me. Hanya bisa jika status Siap Diambil.' },
      { no: 9, text: 'Laporan transaksi', info: 'Jumlah pesanan, yang lunas, dan pendapatan terkonfirmasi.' },
      { no: 10, text: 'Lihat daftar pelanggan', info: 'Daftar akun pelanggan yang terdaftar.' },
      { no: 11, text: 'Logout', go: 'utama', info: 'Keluar dari menu admin.' }] }
  };
  const B4_MISI = [
    { tanya: 'Bu Ratna baru menimbang cucian. Di menu mana ia memasukkan beratnya?', layar: 'admin', no: 2,
      benar: 'Tepat! Menu Admin → 2. Berat aktual diisi admin, lalu total dihitung program.' },
    { tanya: 'Kak Nadia ingin membuat pesanan baru. Di menu mana ia memulainya?', layar: 'pelanggan', no: 1,
      benar: 'Betul! Menu Pelanggan → 1. Pelanggan memilih layanan dan metode bayar.' },
    { tanya: 'Cucian sudah siap. Menu mana yang menyiapkan pesan untuk pelanggan?', layar: 'admin', no: 8,
      benar: 'Benar! Menu Admin → 8. Program menyiapkan tautan WhatsApp; admin tetap menekan Kirim sendiri.' }
  ];

  // Babak 5
  const B5_PELANGGAN = { nama: 'Nadia Putri', wa: '0812-0000-0000', username: 'nadia', password: 'demo1234' };
  const B5_CUCIAN = [
    { id: 'kemeja', nama: 'Kemeja', berat: 0.4, warna: '#7FB0E0' },
    { id: 'jeans', nama: 'Celana jeans', berat: 0.8, warna: '#2F4A6B' },
    { id: 'kaos', nama: '3 kaos', berat: 0.6, warna: '#E8B33C' },
    { id: 'handuk', nama: 'Handuk', berat: 0.7, warna: '#E46A8C' },
    { id: 'sprei', nama: 'Sprei', berat: 1.0, warna: '#F3E7C9' }
  ];
  const STATUS = ['Menunggu Ditimbang', 'Menunggu Diproses', 'Sedang Diproses', 'Siap Diambil', 'Selesai/Diserahkan'];
  const B5_DAFTAR_LAIN = [
    { id: 'PD00002', nama: 'Dimas Pratama', layanan: 'Reguler', berat: 4, total: 24000, bayar: 'Lunas', status: 'Sedang Diproses' },
    { id: 'PD00003', nama: 'Lala Anggraini', layanan: 'Express', berat: null, total: null, bayar: 'Belum', status: 'Menunggu Ditimbang' },
    { id: 'PD00004', nama: 'Joko Susilo', layanan: 'Reguler', berat: 2.5, total: 15000, bayar: 'Belum', status: 'Siap Diambil' }
  ];

  const B6_SORT = {
    cats: [{ id: 'sebelum', label: 'Sebelum' }, { id: 'sesudah', label: 'Sesudah SI-PANDRI' }, { id: 'tetap', label: 'Tetap sama' }],
    items: [
      { text: 'Status cucian ditulis tangan dan harus diingat-ingat', cat: 'sebelum', why: 'Itu cara lama. Di SI-PANDRI status dipilih dari daftar tahap yang sama.' },
      { text: 'Total biaya dihitung manual dengan kalkulator', cat: 'sebelum', why: 'Itu cara lama. Sekarang program menghitung berat × tarif.' },
      { text: 'Mencari pesanan lama dengan membolak-balik buku', cat: 'sebelum', why: 'Itu cara lama. Sekarang pesanan dicari dengan ID.' },
      { text: 'Pesan untuk pelanggan diketik ulang satu per satu', cat: 'sebelum', why: 'Itu cara lama. Sekarang teks WhatsApp disusun program.' },
      { text: 'Pesanan tersimpan di file lokal dan bisa dicari dengan ID', cat: 'sesudah', why: 'Benar, fitur Cari pesanan berdasarkan ID ada di menu admin.' },
      { text: 'Total dihitung program dari berat aktual × tarif', cat: 'sesudah', why: 'Benar, lihat InputBeratDanHitungBiaya.' },
      { text: 'Teks WhatsApp disiapkan program, admin memeriksa lalu menekan Kirim', cat: 'sesudah', why: 'Benar. Pengiriman tetap manual, tidak otomatis.' },
      { text: 'Cucian tetap harus ditimbang dan dicuci oleh manusia', cat: 'tetap', why: 'Benar. Program tidak menggantikan pekerjaan fisik laundry.' },
      { text: 'Admin tetap harus mengetik data dengan benar', cat: 'tetap', why: 'Benar. Jika berat yang diketik salah, total juga salah.' }
    ]
  };

  const B7_FUNGSI = [
    { kode: 'input', baris: '  Readln(teks);', fungsi: 'Membaca teks yang diketik pengguna' },
    { kode: 'hitung', baris: '  p.totalBiaya := berat * hargaPerKg;', fungsi: 'Menghitung total biaya' },
    { kode: 'pilihLayanan', baris: '  case pilihan of', fungsi: 'Memilih tindakan sesuai nomor pilihan' },
    { kode: 'validasi', baris: '  while not valid do', fungsi: 'Mengulang input sampai datanya valid' },
    { kode: 'ulangFor', baris: '    for i := 0 to FileSize(f) - 1 do', fungsi: 'Membaca semua pesanan satu per satu' },
    { kode: 'simpanFile', baris: '      Write(f, pesanan);', fungsi: 'Menyimpan perubahan pesanan ke file' }
  ];
  const B7_TEBAK = [
    { q: 'Admin memasukkan berat 2,5 untuk pesanan Express (tarif Rp 10.000/kg). Apa yang tercetak di baris “Total biaya”?',
      options: [
        { text: 'Total biaya  : Rp 25.000', correct: true, why: 'Benar: 2,5 × 10.000 = 25.000.' },
        { text: 'Total biaya  : Rp 2.500', correct: false, why: 'Itu 2,5 × 1.000. Tarif Express adalah Rp 10.000 per kg.' },
        { text: 'Total biaya  : Rp 15.000', correct: false, why: 'Itu jika memakai tarif Reguler (2,5 × 6.000). Pesanannya Express.' }] },
    { q: 'Admin mengetik 0 saat diminta berat aktual. Apa yang dilakukan program?',
      options: [
        { text: 'Menampilkan “Nilai harus antara 0,01 dan 500.” lalu meminta input lagi', correct: true, why: 'Benar. Perulangan while not valid do mengulang sampai berat valid.' },
        { text: 'Menyimpan berat 0 dan total Rp 0', correct: false, why: 'Tidak. BacaReal memeriksa batas minimal 0,01 kg.' },
        { text: 'Program berhenti (crash)', correct: false, why: 'Tidak. Input yang salah ditangani dengan pesan, bukan crash.' }] },
    { q: 'Status pesanan “Menunggu Diproses”. Admin langsung memilih “Siap Diambil”. Apa hasilnya?',
      options: [
        { text: 'Ditolak: status tidak boleh melompati tahap', correct: true, why: 'Benar. Nested-if memeriksa indeksBaru > indeksLama + 1.' },
        { text: 'Diterima, status langsung Siap Diambil', correct: false, why: 'Tidak. Tahap Sedang Diproses tidak boleh dilewati.' },
        { text: 'Status kembali ke Menunggu Ditimbang', correct: false, why: 'Tidak. Program menolak perubahan dan status tetap.' }] },
    { q: 'Kak Nadia login lalu mencari ID pesanan milik pelanggan lain. Apa yang terjadi?',
      options: [
        { text: '“Pesanan tersebut bukan milik akun yang sedang login.”', correct: true, why: 'Benar. Program membandingkan idPelanggan pesanan dengan akun yang login.' },
        { text: 'Detail pesanan orang lain ditampilkan', correct: false, why: 'Tidak. Data pelanggan lain tidak ditampilkan.' },
        { text: 'Pesanan itu dipindah ke akun Kak Nadia', correct: false, why: 'Tidak. Program tidak mengubah kepemilikan pesanan.' }] }
  ];

  const B8_SKENARIO = [
    { situasi: 'Pak Joko datang membawa cucian. Ia pelanggan baru dan belum punya akun.', who: 'joko',
      options: [
        { text: 'Bantu registrasi di Menu Pelanggan, lalu buat pesanan', correct: true, why: 'Tepat. Tanpa akun, pesanan belum bisa dibuat.' },
        { text: 'Langsung buka Menu Admin → 2 untuk input berat', correct: false, why: 'Belum bisa. Pesanannya belum ada, jadi program akan menjawab “Pesanan tidak ditemukan.”' },
        { text: 'Catat di buku dulu, dimasukkan nanti saja', correct: false, why: 'Itu kembali ke masalah lama: catatan tercecer dan mudah lupa.' }] },
    { situasi: 'Cucian Pak Joko sudah ditimbang: 2 kg, layanan Express (Rp 10.000/kg). Apa yang Bu Ratna lakukan?', who: 'joko',
      options: [
        { text: 'Menu Admin → 2, ketik 2 → total Rp 20.000', correct: true, why: 'Tepat. 2 kg × Rp 10.000 = Rp 20.000.' },
        { text: 'Ketik 2000 karena timbangannya dalam gram', correct: false, why: 'Program meminta kilogram. Angka 2000 ditolak karena batasnya 0,01–500 kg.' },
        { text: 'Total Rp 12.000', correct: false, why: 'Itu tarif Reguler (2 × 6.000). Pesanannya Express.' }] },
    { situasi: 'Pelanggan bertanya, “Bu, harga Express sekarang berapa?”', who: 'lala',
      options: [
        { text: 'Lihat Menu Admin → 3 Pengaturan harga dan transfer', correct: true, why: 'Tepat. Harga saat ini ditampilkan di menu pengaturan.' },
        { text: 'Lihat Menu Admin → 9 Laporan transaksi', correct: false, why: 'Laporan berisi jumlah pesanan dan pendapatan, bukan tarif.' },
        { text: 'Menebak dari ingatan', correct: false, why: 'Tarif bisa sudah diubah. Lebih aman memeriksa pengaturan.' }] },
    { situasi: 'Pesanan Reguler seberat 4,5 kg (tarif Rp 6.000/kg). Berapa total biayanya?', who: 'dimas', angka: 27000 },
    { situasi: 'Pelanggan menelepon: “Bu, cucian saya PD00004 sudah bisa diambil?”', who: 'joko',
      options: [
        { text: 'Menu Admin → 6, cari PD00004 dan lihat Status Cucian', correct: true, why: 'Tepat. Status dicek dari data, bukan dari ingatan.' },
        { text: 'Jawab “sepertinya sudah”', correct: false, why: 'Menebak bisa membuat pelanggan datang sia-sia.' },
        { text: 'Langsung Menu Admin → 8 kirim notifikasi', correct: false, why: 'Periksa dulu. Menu 8 menolak jika status belum Siap Diambil.' }] },
    { situasi: 'Pelanggan berkata sudah transfer, tetapi uangnya belum terlihat di rekening.', who: 'lala',
      options: [
        { text: 'Jangan tandai Lunas dulu; periksa lagi dan konfirmasi ke pelanggan', correct: true, why: 'Tepat. Lunas hanya ditandai setelah pembayaran terverifikasi.' },
        { text: 'Tandai Lunas karena pelanggan sudah bilang', correct: false, why: 'Ucapan belum bukti. Program bahkan bertanya “Sudah diverifikasi?”.' },
        { text: 'Hapus pesanannya', correct: false, why: 'Tidak perlu, dan SI-PANDRI memang tidak menghapus pesanan.' }] }
  ];

  // Hasil pengujian aplikasi Pascal yang benar-benar dijalankan (tests/uji_pascal.js)
  const HASIL_UJI = {
    tanggal: '15 Oktober 2026',
    perintah: 'node tests/uji_pascal.js',
    catatan: 'Skrip mengompilasi SI_PANDRI.pas dengan Free Pascal 3.2.2, lalu menjalankan SI_PANDRI.exe dengan input skenario di folder sementara. File .dat asli tidak disentuh.',
    hasil: [
      'Menu utama menolak input bukan angka dan di luar rentang',
      'Login admin: password salah lalu benar',
      'Login admin gagal 3 kali kembali ke menu utama',
      'Registrasi pelanggan dengan validasi nama, WA, username, password',
      'Registrasi menolak username yang sudah dipakai',
      'Login pelanggan gagal 3 kali',
      'Pelanggan membuat pesanan Reguler/Tunai, Express/Transfer, dan membatalkan satu',
      'Admin menimbang: nol, negatif, teks ditolak; 3,5 kg Reguler = Rp 21.000',
      'Status pembayaran & cucian: aturan urutan dan prasyarat penimbangan',
      'Ubah tarif tidak mengubah total pesanan lama; rekening kosong ditolak',
      'Express 2,5 kg = Rp 25.000; tagihan transfer; lunas; timbang ulang dijaga',
      'Daftar pesanan, laporan, dan daftar pelanggan (data tersimpan antar-proses)',
      'Pelanggan lain tidak dapat melihat atau memakai pesanan milik akun lain',
      'Pemilik pesanan: cek status, tautan WA ke admin, metode bayar terkunci saat lunas'
    ]
  };

  const KETERBATASAN = [
    'Game ini simulasi pembelajaran terpisah. Data di game tidak masuk ke aplikasi Pascal.',
    'Aplikasi Pascal dirancang untuk satu komputer, bukan akses bersamaan dari banyak perangkat.',
    'WhatsApp tidak terkirim otomatis: program hanya menyiapkan tautan wa.me berisi teks.',
    'Pembayaran tidak terhubung ke bank; verifikasi transfer dilakukan manual oleh admin.',
    'Password pelanggan disimpan apa adanya di file lokal (untuk demo kelas). Jangan memakai password pribadi.',
    'Belum ada pengukuran waktu atau tingkat kesalahan, jadi game tidak menampilkan angka efisiensi.'
  ];

  window.DATA = {
    TARIF, REKENING_CONTOH, SPEAKERS, ACTS, ACHIEVEMENTS, ALUR_PRESENTASI,
    B1_CATAT, B1_BUKU, B2_TEMUAN, B3_MASALAH, B3_KEBUTUHAN, B3_JAWABAN,
    MENU, B4_MISI, B5_PELANGGAN, B5_CUCIAN, STATUS, B5_DAFTAR_LAIN,
    B6_SORT, B7_FUNGSI, B7_TEBAK, B8_SKENARIO, HASIL_UJI, KETERBATASAN
  };
})();
