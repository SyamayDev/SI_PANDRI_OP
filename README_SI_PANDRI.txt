SI-PANDRI - Sistem Pengelolaan Parfait Laundry
==============================================

BERKAS
- SI_PANDRI.pas       : source code utama Pascal.
- pandri_*.dat        : file data yang otomatis dibuat saat program dijalankan.

KEBUTUHAN
- Free Pascal Compiler (FPC), misalnya melalui Lazarus atau terminal.
- Program utama berjalan di terminal/command prompt.

CARA MENJALANKAN
1. Simpan SI_PANDRI.pas ke folder yang mudah ditemukan.
2. Buka terminal pada folder tersebut.
3. Kompilasi dengan perintah:
       fpc SI_PANDRI.pas
4. Jalankan program hasil kompilasi:
   - Windows: SI_PANDRI.exe
   - Linux/macOS: ./SI_PANDRI

LOGIN ADMIN DEMO
- Username: admin
- Password: admin123

PENTING: PENGATURAN AWAL
Masuk ke Login Admin > Pengaturan harga dan transfer. Ganti nomor WhatsApp admin,
nama bank, nomor rekening, nama pemilik rekening, serta harga sesuai kebutuhan demo.
Nomor rekening bawaan hanyalah data contoh dan bukan rekening pembayaran sungguhan.

ALUR DEMO YANG DISARANKAN
1. Jalankan program, pilih Menu Pelanggan, lalu registrasi akun.
2. Login pelanggan dan buat pesanan. Catat ID pesanan yang muncul.
3. Kembali ke menu utama dan login admin.
4. Pilih Lihat semua pesanan, lalu Input berat aktual dan hitung biaya.
5. Perbarui status pembayaran setelah pembayaran benar-benar diverifikasi.
6. Ubah status cucian menjadi Sedang Diproses, lalu Siap Diambil.
7. Pilih Siapkan notifikasi cucian siap diambil. Salin tautan yang dicetak dan buka di browser.
8. Setelah cucian diserahkan, ubah status menjadi Selesai/Diserahkan.
9. Buka Laporan Transaksi untuk melihat ringkasan.

PENERAPAN MATERI UTS
- Input/output: write, writeln, read, readln.
- Percabangan: if-then-else dan case-of.
- Perulangan: repeat-until, while-do, for-to-do.
- break: menghentikan pencarian saat pesanan/pelanggan ditemukan.
- File handling: data pelanggan, pesanan, dan pengaturan disimpan dalam file lokal.

CATATAN IMPLEMENTASI
- File pandri_pelanggan.dat, pandri_pesanan.dat, dan pandri_pengaturan.dat akan dibuat
  otomatis di folder kerja saat program dijalankan pertama kali.
- Jangan menghapus file .dat jika data masih ingin dipertahankan.
- Jika ingin reset total data untuk demonstrasi baru, tutup program terlebih dahulu,
  lalu hapus file .dat tersebut.
- Data akun pelanggan pada versi tugas ini disimpan lokal untuk tujuan pembelajaran.
  Jangan gunakan password penting/pribadi.
- WhatsApp tidak mengirim pesan secara otomatis. Program menyiapkan tautan wa.me
  dengan teks yang sudah diisi; pengguna tetap perlu membuka tautan dan menekan Kirim.
- Tautan WhatsApp biasa tidak dapat menyertakan gambar QRIS lokal secara otomatis.
  Karena rancangan ini memakai transfer bank, admin mengirim nomor rekening melalui
  WhatsApp dan memverifikasi transfer secara manual.
- Program dirancang untuk demonstrasi di satu komputer, bukan untuk akses serentak
  dari komputer admin dan pelanggan yang berbeda.

KREDENSIAL ADMIN
Username/password admin pada source code adalah kredensial demo sederhana. Jika
proyek digunakan di luar demonstrasi kelas, perlu desain keamanan yang lebih baik.
