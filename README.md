# SI-PANDRI — Sistem Pengelolaan Parfait Laundry

> *Laundry Lebih Mudah, Lebih Teratur.* · Proyek UTS Dasar Pemrograman · Tim SEPAKAT

Proyek ini terdiri dari **dua komponen terpisah** yang menjelaskan sistem yang sama:

| Komponen | Isi | Teknologi |
|---|---|---|
| **A. Aplikasi SI-PANDRI** (produk utama) | Program administrasi laundry di terminal: registrasi/login pelanggan, pesanan, penimbangan, perhitungan biaya, status, pembayaran, tautan WhatsApp, laporan. | Free Pascal (CLI), data di file lokal `.dat` |
| **B. Game “SI-PANDRI: Misi Laundry Beres!”** (media presentasi) | Cerita interaktif 9 babak: dari laundry yang kewalahan menjadi laundry yang lebih teratur dengan SI-PANDRI. | HTML, CSS, JavaScript (tanpa server, tanpa library) |

Game **tidak** menjalankan `SI_PANDRI.exe`, tidak membaca atau mengubah file `.dat`, tidak mengirim WhatsApp, dan tidak memproses pembayaran. Game hanya simulasi pembelajaran dengan data fiktif.

---

## Struktur folder

```
SI_PANDRI.pas            Source code utama aplikasi (Free Pascal)
SI_PANDRI.exe / .o       Hasil kompilasi (Windows)
pandri_*.dat             Data aplikasi (dibuat otomatis saat program dijalankan)
README_SI_PANDRI.txt     Panduan singkat aplikasi Pascal
game/
  index.html             Game presentasi (buka file ini)
  manifest.webmanifest   Agar bisa “Tambahkan ke Layar Utama” dan tampil layar penuh (lewat http/https)
  assets/icon.svg        Ikon game
  css/game.css           Tampilan game
  js/data.js             Konten: tokoh, babak, catatan presenter, data mini-game
  js/acts.js             Naskah dan misi 9 babak
  js/engine.js           Mesin cerita: dialog, misi, progres, XP, achievement
  js/art.js              Semua grafis pixel (karakter & latar) digambar dengan kode
  js/main.js             Layar judul, menu, Mode Presenter, keyboard
  js/kode-pascal.js      Cuplikan kode asli SI_PANDRI.pas (dibuat otomatis)
  assets/fonts/          Font lokal (SIL Open Font License)
tests/uji_pascal.js      Uji skenario otomatis aplikasi Pascal
tests/uji_game.js        Uji otomatis game di Chrome/Edge headless
tools/ekstrak_cuplikan.js  Menyalin cuplikan kode dari SI_PANDRI.pas ke game
index.html               Halaman awal (mengarahkan ke game/) untuk GitHub Pages
backup/                  Salinan SI_PANDRI.pas sebelum penyempurnaan
contoh-game/             Game referensi (tidak diubah)
```

---

## A. Aplikasi Pascal

### Kompilasi dan menjalankan

Butuh Free Pascal Compiler (FPC), misalnya dari Lazarus. Diuji dengan FPC 3.2.2 di Windows 11.

```bash
fpc SI_PANDRI.pas
SI_PANDRI.exe        # Windows
./SI_PANDRI          # Linux/macOS (belum diuji di sistem ini)
```

Login admin demo: **admin / admin123** (kredensial demo kelas, bukan untuk penggunaan nyata).

### Alur demo yang disarankan

1. Menu Pelanggan → Registrasi akun baru → Login → **1. Buat pesanan laundry**. Catat ID (misalnya `PD00001`).
2. Logout, lalu Login Admin → **2. Input berat aktual dan hitung biaya**.
3. **7. Siapkan pesan tagihan via WhatsApp** → buka tautan yang dicetak, periksa, lalu tekan Kirim sendiri.
4. **4. Perbarui status pembayaran** setelah pembayaran benar-benar diperiksa.
5. **5. Perbarui status cucian**: Sedang Diproses → Siap Diambil.
6. **8. Siapkan notifikasi cucian siap diambil**, lalu status **Selesai/Diserahkan**.
7. **9. Laporan transaksi**.

### Penyempurnaan pada versi ini

Struktur record dan format file `.dat` **tidak diubah**, sehingga data lama tetap terbaca (sudah dicek dengan file `.dat` yang ada). Perubahan:

- **Tampilan terminal**: banner bingkai ASCII, judul cyan, pesan `[OK]` hijau / `[!]` kuning / `[X]` merah, tabel daftar pesanan yang rata dalam 80 kolom, detail pesanan dikelompokkan (Pelanggan; Layanan, Berat, dan Biaya; Pembayaran; Status dan Waktu). Warna hanya aktif jika terminal mendukung kode ANSI; jika tidak, teks tetap polos dan terbaca.
- **Timbang ulang dijaga**: jika pesanan sudah ditimbang, admin diminta konfirmasi; pesanan yang sudah **Lunas** tidak bisa ditimbang ulang.
- **Lunas hanya setelah ditimbang**: total harus diketahui sebelum pembayaran ditandai Lunas.
- **Status cucian tidak boleh melompat**: hanya boleh maju satu tahap (koreksi mundur tetap boleh, dengan peringatan).
- **Registrasi**: username yang sudah dipakai langsung diminta ulang, tidak membatalkan seluruh registrasi.
- **Pengaturan rekening**: jika ada isian kosong, data rekening lama tetap dipakai. Pesan “Pengaturan disimpan” hanya muncul jika ada yang berubah.
- **Jeda**: cukup tekan ENTER.

### Penerapan materi Dasar Pemrograman (nomor baris versi ini)

| Materi | Contoh di `SI_PANDRI.pas` |
|---|---|
| Input/output `write`, `writeln`, `read`, `readln` | `BacaTeks` (baris 198–205), `Jeda` memakai `Read` (baris 190), hasil timbang `Writeln` (baris 1117–1120) |
| Tipe data & `record` | `TPesanan` (baris 49), `Real` untuk berat dan total, `Boolean` `sudahDitimbang` |
| Konstanta | Status, layanan, metode bayar (baris 8–37) |
| `if-then-else` | Pilih tarif (baris 1101–1104), syarat sudah ditimbang (baris 1268) |
| Nested-if & operator logika | Aturan status tidak boleh melompat (baris 1301–1311), `(angka < nilaiMin) or (angka > nilaiMaks)` |
| `case-of` | `PilihLayanan` (baris 352), menu admin (baris 1511) |
| `repeat-until` | Menu admin (baris 1495–1530), menu utama (sampai baris 1565) |
| `while-do` | Validasi `BacaInteger` (baris 207), `BacaReal` (baris 247), username unik (baris 699) |
| `for-to-do` | Pesanan milik pelanggan (baris 835), digit nomor WA di `NormalisasiNomorWA` (baris 290) |
| `break` | Berhenti saat ID/username ditemukan (baris 556 dan 587) |
| Perhitungan | `p.totalBiaya := berat * hargaPerKg;` (baris 1109) |
| File lokal | `SimpanPerubahanPesanan` dengan `Seek`/`Write` (baris 516) |

Cuplikan kode di Babak 7 game diambil otomatis dari source ini (lihat bagian Pengujian).

---

## B. Game presentasi “SI-PANDRI: Misi Laundry Beres!”

### Menjalankan

- **Paling mudah:** buka `game/index.html` langsung di Chrome/Edge (klik dua kali). Tidak perlu internet atau server.
- Saat dibuka, muncul layar **“Ketuk/klik untuk mulai”**. Ketukan atau tombol pertama itu langsung membawa game ke **layar penuh** (browser tidak mengizinkan layar penuh tanpa interaksi pengguna, jadi tidak bisa terjadi tanpa ketukan). Fitur ini bisa dimatikan di Pengaturan. Tombol ⛶ atau `F` untuk masuk/keluar layar penuh.
- **Di HP & tablet: hanya mode mendatar (landscape).** Ketukan pertama membuka layar penuh dan, di Android Chrome, sekaligus mengunci layar ke posisi mendatar. Bila perangkat dipegang tegak dan kunci rotasi tidak didukung (misalnya iPhone) atau setelah keluar dari layar penuh, muncul layar *Putar perangkatmu*. Di HP mendatar, panel misi memakai tinggi penuh di kiri dan dialog pindah ke kolom kanan; tombol HUD diringkas ke menu ☰. iPhone tidak mendukung layar penuh untuk halaman web; jika game dibuka lewat GitHub Pages, pilih *Bagikan → Tambahkan ke Layar Utama* agar tampil tanpa bilah browser (manifest meminta orientasi mendatar). Di komputer, jendela sempit tetap memakai tata letak responsif.
- **Lewat Laragon:** `http://localhost/SI_PANDRI_Source/game/`
- **Lewat GitHub Pages:** lihat bagian Publikasi.

### Alur cerita (9 babak)

Tokoh: **Bu Ratna** (pemilik Parfait Laundry), **Gilbert** (harimau jantan berkacamata, teliti), **Sarah** (snow leopard betina berkacamata, komunikatif), **Syahril** (beruang putih jantan tanpa kacamata, perancang alur). Aset maskot resmi tidak ditemukan di workspace, jadi ketiganya digambar ulang sebagai pixel art dengan kode (`game/js/art.js`) sesuai identitas yang ditetapkan. Ganti dengan aset resmi bila tersedia.

| Babak | Isi | Interaksi |
|---|---|---|
| 1. Sebuah Laundry Kecil yang Sibuk | Bu Ratna mengurus semuanya sendiri; masalah muncul bertahap | Pilih data yang perlu dicatat, hitung total 4 kg × Rp 6.000, cari catatan di buku, buka rantai pekerjaan |
| 2. Tiga Orang Menawarkan Bantuan | Tim datang, bertanya, mendengarkan | Pilih pendekatan tim, bantu Sarah mencatat kendala |
| 3. Menemukan Akar Permasalahan | Papan masalah | Pasangkan 6 masalah ↔ 6 kebutuhan sistem, pilih arah solusi |
| 4. Memperkenalkan SI-PANDRI | Terminal menyala, logo, menu asli | Jelajahi menu untuk menjawab 3 pertanyaan |
| 5. Simulasi Perjalanan Satu Pesanan | 7 langkah: registrasi → pesanan → timbang → hitung → kelola status → pembayaran → selesai | Formulir dengan validasi, timbangan, hitung total, tabel pesanan, status, pratinjau pesan WhatsApp, verifikasi pembayaran |
| 6. Sebelum dan Sesudah | Perbandingan yang adil | Kelompokkan 9 kartu: Sebelum / Sesudah / Tetap sama |
| 7. Logika di Balik Sistem | Kode Pascal asli dengan nomor baris | Buka 8 kartu konsep, pasangkan kode ↔ fungsi, tebak perilaku program |
| 8. Bu Ratna Mencoba Sendiri | Bu Ratna makin percaya diri | 6 situasi; salah → penjelasan dan coba lagi |
| 9. Laundry yang Lebih Teratur | Penutup dan pesan utama | Rangkuman: masalah, solusi, cara kerja, konsep, hasil pengujian, manfaat, keterbatasan |

### Mode Cerita dan Mode Presenter

- **Mode Cerita**: babak terbuka berurutan setelah misi selesai. Progres tersimpan otomatis per bagian babak di `localStorage` browser. XP diberikan sekali per misi (mengulang tidak menambah XP). Ada jurnal perjalanan dan 11 achievement.
- **Mode Presenter** (tombol di layar judul atau HUD): semua babak dan ketujuh langkah Babak 5 bisa dipilih langsung, kecepatan dialog bisa diatur (Lambat/Normal/Cepat/Instan), ada **Catatan Presenter** (ringkasan, kaitan dengan aplikasi Pascal, kalimat transisi, alur presentasi), tombol **Tampilkan jawaban**, **Ulang bagian**, dan **Teks besar**. Mode Presenter **tidak mengubah** save Mode Cerita.
- Dialog tidak pernah berjalan sendiri; selalu menunggu klik atau Spasi.

Pintasan: `Spasi`/`→`/`PageDown` lanjut · `B` peta babak · `J` jurnal · `L` riwayat dialog · `R` ulang bagian · `M` suara · `F` layar penuh · Mode Presenter: `N` catatan, `S` tampilkan jawaban, `←`/`PageUp` bagian sebelumnya.

**Reset progres:** Pengaturan → *Reset progres Mode Cerita…* (ada konfirmasi). Pengaturan suara/tampilan tetap disimpan.

### Alur presentasi kelas yang disarankan

1. Babak 1 — ceritakan masalah Bu Ratna.
2. Babak 2 — perkenalkan tim yang menawarkan bantuan.
3. Babak 3 — hasil identifikasi masalah.
4. Babak 4 — SI-PANDRI sebagai solusi (boleh buka `SI_PANDRI.exe` sebentar).
5. Babak 5 — ajak audiens mencoba simulasi pesanan.
6. Buka `SI_PANDRI.exe` dan ulangi alur yang sama dengan aplikasi asli.
7. Babak 7 — konsep Dasar Pemrograman di kode asli.
8. Tunjukkan hasil pengujian (`node tests/uji_pascal.js`).
9. Babak 9 — kesimpulan dan manfaat.

---

## Pengujian

Semua perintah dijalankan dari folder proyek. Butuh Node.js 22+ (tanpa `npm install`).

| Perintah | Yang diuji | Hasil terakhir (15 Oktober 2026) |
|---|---|---|
| `node tests/uji_pascal.js` | Mengompilasi `SI_PANDRI.pas` (FPC 3.2.2) lalu menjalankan 14 skenario dengan input terskrip di folder sementara: login admin, registrasi & validasi, login gagal, pesanan, berat 0/negatif/teks, Reguler 3,5 kg = Rp 21.000, Express 2,5 kg = Rp 25.000, status bayar & cucian, aturan lompat tahap, perubahan tarif tidak mengubah total lama, tautan WhatsApp, hak akses pelanggan, laporan, persistensi antar-proses | **14/14 lulus** |
| `node tools/ekstrak_cuplikan.js --cek` | Cuplikan kode di game sama persis dengan `SI_PANDRI.pas` | **Lulus (13 cuplikan)** |
| `node tests/uji_game.js` | Game di Chrome headless: layar mulai & menu (keyboard), tidak ada error JavaScript, gating babak, umpan balik jawaban salah, seluruh 9 babak bisa ditamatkan lewat UI, anti-farming XP, save & reload, Mode Presenter tidak mengubah save, jalur pemain manual (validasi registrasi, batal pesanan, notifikasi ditolak sebelum siap, jelajah menu, Spasi), reset dengan konfirmasi, tanpa overflow di 1920×1080, 1366×768, 1024×768, dan **layar sentuh: posisi tegak 390×844 menampilkan layar "Putar perangkatmu"; di 7 ukuran mendatar (568×320, 667×375, 740×360, 844×390, 932×430, tablet 1024×768 dan 1180×820) setiap babak dan setiap bagian dicek muat di layar tanpa menutupi dialog**, teks narator selebar teks tokoh, menu utama di 8 ukuran layar lebar (tokoh tidak masuk ke belakang panel, kartu nota tidak menimpa apa pun), kontras tombol saat di-hover | **103/103 lulus** |

Selain itu, `SI_PANDRI.exe` versi baru dicoba membaca file `.dat` lama (salinan) dan menampilkan pesanan serta laporan dengan benar.

**Belum diuji:** kompilasi di Linux/macOS, game di Firefox/Safari, HP fisik (pengujian HP memakai emulasi ukuran layar dan sentuh di Chrome), tampilan pada proyektor sungguhan, pembaca layar, dan Windows Terminal versi lama tanpa dukungan warna ANSI (program tetap berjalan tanpa warna).

Jika `SI_PANDRI.pas` diubah, jalankan `node tools/ekstrak_cuplikan.js` agar cuplikan kode di game ikut diperbarui.

---

## Publikasi game ke GitHub Pages

1. Push repository ke GitHub (`SyamayDev/SI_PANDRI_OP`).
2. Buka **Settings → Pages**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Game dapat dibuka di `https://<username>.github.io/<nama-repo>/game/`. Halaman `index.html` di root mengarahkan ke sana.

Semua path di game relatif, jadi tetap bekerja di subfolder GitHub Pages.

---

## Keterbatasan

- Game adalah simulasi terpisah; datanya tidak masuk ke aplikasi Pascal.
- Aplikasi dirancang untuk satu komputer, bukan akses bersamaan dari banyak perangkat.
- WhatsApp tidak terkirim otomatis; program hanya menyiapkan tautan `wa.me` berisi teks.
- Pembayaran tidak terhubung ke bank; verifikasi transfer dilakukan manual oleh admin. Nomor rekening bawaan hanyalah contoh.
- Password pelanggan disimpan apa adanya di file lokal (untuk demo kelas). Jangan memakai password pribadi.
- Belum ada pengukuran waktu atau tingkat kesalahan, jadi tidak ada klaim angka efisiensi.
- Cerita dan tokoh di game bersifat ilustratif, bukan hasil wawancara atau kejadian nyata.

Font: Pixelify Sans dan Atkinson Hyperlegible (SIL Open Font License, lisensi di `game/assets/fonts/`).
