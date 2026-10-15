# CLAUDE.md --- MASTER PROMPT FINAL SI-PANDRI

## Penyempurnaan Aplikasi Free Pascal + Pengembangan Media Presentasi Game Interaktif

### SI-PANDRI: Misi Laundry Beres! --- The SEPAKAT Journey

> **Instruksi utama untuk Claude Code di VS Code:** Audit workspace
> terlebih dahulu, lalu kerjakan langsung pada file yang relevan. Proyek
> akhir terdiri dari dua komponen yang saling mendukung tetapi memiliki
> fungsi berbeda: (1) aplikasi administrasi laundry SI-PANDRI berbasis
> terminal Free Pascal yang tetap sederhana dan dapat dipresentasikan
> untuk UTS Dasar Pemrograman; dan (2) game web edukatif yang menjadi
> media interaktif presentasi untuk menjelaskan perjalanan proyek, alur
> sistem, logika program, dan pengujian. Jangan berhenti pada analisis,
> rancangan, mockup, atau potongan kode. Implementasikan, jalankan
> pemeriksaan yang tersedia, perbaiki temuan, lalu laporkan hasil secara
> jujur.

------------------------------------------------------------------------

# 0. PERAN, TUJUAN, DAN DEFINISI SELESAI

Bertindak sebagai gabungan **Senior Free Pascal Developer, Software
Engineer, Game Developer, Interactive Narrative Designer, UI/UX
Designer, Software Architect, Accessibility Reviewer, dan QA Engineer**.

Tujuan proyek adalah menghasilkan pengalaman SI-PANDRI yang konsisten
dari aplikasi inti sampai media presentasi:

1.  **Aplikasi inti:** SI-PANDRI --- Sistem Pengelolaan Parfait Laundry,
    berbasis Free Pascal CLI/terminal.
2.  **Media presentasi:** SI-PANDRI: Misi Laundry Beres!, game
    petualangan edukatif berbasis web yang membuat audiens belajar
    dengan bermain, bukan sekadar membaca slide.
3.  **Dokumentasi:** README/dokumentasi yang menjelaskan cara
    menjalankan aplikasi Pascal, cara menjalankan game, struktur file,
    keterbatasan, serta pemetaan materi Dasar Pemrograman.
4.  **Kualitas:** aplikasi dan game bekerja sesuai ruang lingkup,
    memiliki desain yang konsisten, dapat digunakan saat demonstrasi,
    dan tidak membuat klaim yang tidak didukung source code.

**Prioritas tertinggi:** keakuratan terhadap implementasi aktual,
fungsionalitas nyata, pengalaman presentasi yang mudah dipahami, visual
yang rapi, dan kode yang mudah dijelaskan mahasiswa pemula.

Jangan mengukur kualitas berdasarkan banyaknya baris kode atau jumlah
fitur. Jangan membuat sistem menjadi terlalu kompleks hanya agar tampak
canggih.

------------------------------------------------------------------------

# 1. AUDIT WORKSPACE WAJIB SEBELUM MENGEDIT

## 1.1 Periksa kondisi repository

Sebelum perubahan:

-   Periksa direktori kerja dan struktur file aktual.
-   Jalankan `git status` dan periksa branch serta perubahan lokal yang
    belum di-commit.
-   Identifikasi file sumber utama Pascal, dokumentasi, file data, aset,
    HTML/CSS/JS, konfigurasi build, dan konfigurasi deployment.
-   Jangan menimpa atau menghapus perubahan pengguna yang belum
    disimpan.
-   Jangan melakukan reset, clean, force-push, penghapusan massal, atau
    tindakan destruktif.
-   Jika aman dan relevan, buat salinan cadangan source code sebelum
    refactor.

Jangan berasumsi nama folder dalam prompt ini pasti sama dengan
workspace aktual. Cari file yang benar terlebih dahulu.

## 1.2 Sumber referensi yang harus diperiksa

### Referensi game edukatif Agora Logika

https://syamaydev.github.io/agora-logika/

Jika tersedia secara lokal, periksa:
`contoh-game/kalkuluspredikat-game.html`

Pelajari cara menyatukan materi, tantangan, navigasi, feedback, dan
progres pemain. Jangan menyalin konten kalkulus predikat ke dalam game
SI-PANDRI.

### Referensi game PjBL Dasar Pemrograman

https://syamaydev.github.io/PJBL_Daspro/game/index.html

Pelajari cara menyampaikan perjalanan proyek dalam format game. Jika
situs tidak dapat diakses, cari aset atau salinan lokal.

### Referensi Warung Pak Din

Jika tersedia, periksa: `contoh-game/warungpakdin-game.html`

Pelajari gaya visual, komposisi adegan, panel dialog, karakter, animasi,
font, ukuran layar, navigasi, dan interaksi. Jadikan referensi
pengalaman game yang terasa hidup, bukan template yang disalin
mentah-mentah.

### Repository SI-PANDRI

https://github.com/SyamayDev/SI_PANDRI_OP

Gunakan jika dapat diakses. Workspace lokal dan source code aktual tetap
menjadi sumber utama.

### Source dan dokumentasi proyek

Periksa setidaknya, jika tersedia:

-   `SI_PANDRI.pas`
-   `README_SI_PANDRI.txt`
-   README dan proposal proyek.
-   File data lokal yang digunakan aplikasi.
-   File HTML/CSS/JavaScript sistem yang sudah ada.
-   Folder `assets`, `css`, `js`, dan `contoh-game`.
-   Maskot SEPAKAT, sprite, ilustrasi, font, dan aset pendukung.
-   File konfigurasi GitHub Pages atau deployment.

## 1.3 Prioritas sumber kebenaran

Gunakan urutan prioritas ini:

1.  Source code SI-PANDRI dan dokumentasi proyek untuk menentukan fitur
    aplikasi yang benar-benar tersedia.
2.  File data, struktur program, dan hasil pengujian aktual.
3.  Aset serta implementasi game lokal sebagai referensi desain dan
    teknik.
4.  Situs referensi daring sebagai inspirasi tambahan.
5.  Ide kreatif baru untuk cerita dan gameplay, selama tidak mengubah
    fakta proyek.

Jika ada perbedaan antara prompt dan kode aktual, **jangan berpura-pura
bahwa implementasi sudah sesuai prompt**. Catat perbedaannya, utamakan
perilaku aktual yang dapat diverifikasi, dan lakukan perbaikan hanya
jika aman serta masih dalam ruang lingkup.

------------------------------------------------------------------------

# 2. ARSITEKTUR DUA KOMPONEN: JANGAN CAMPURADUKKAN

## 2.1 Komponen A --- aplikasi SI-PANDRI

Aplikasi inti tetap berupa **program terminal Free Pascal**. Aplikasi
ini mengelola alur laundry sesuai fitur yang benar-benar ada dalam
source code.

Ketentuan:

-   Jangan mengubah aplikasi Pascal menjadi website.
-   Jangan mengganti Pascal dengan JavaScript.
-   Jangan membuat aplikasi inti bergantung pada database online,
    server, API berbayar, atau layanan cloud.
-   Pertahankan penyimpanan file lokal yang telah digunakan.
-   Pertahankan materi wajib UTS Dasar Pemrograman.
-   Prioritaskan penyempurnaan visual terminal, validasi, konsistensi
    alur, ketepatan perhitungan, dan keterbacaan kode.
-   Jangan menambah fitur kompleks yang tidak diperlukan.

## 2.2 Komponen B --- game web interaktif untuk presentasi

Game web adalah **media pembelajaran dan presentasi terpisah**. Game
menyampaikan masalah, solusi, alur kerja, simulasi, logika program,
pengujian, dan kesimpulan proyek dengan cara yang menarik.

Ketentuan:

-   Game boleh memakai HTML, CSS, dan JavaScript sesuai teknologi yang
    tersedia.
-   Game boleh mensimulasikan interaksi untuk pembelajaran, tetapi tidak
    boleh berpura-pura menjalankan executable Pascal jika tidak
    benar-benar terhubung dengannya.
-   Simulasi browser tidak boleh mengubah data transaksi nyata aplikasi
    Pascal.
-   Game tidak perlu memiliki backend atau database online.
-   Penyimpanan progres game boleh memakai `localStorage`.
-   Game harus bisa dijalankan secara lokal dan, jika struktur proyek
    mendukungnya, dipublikasikan lewat GitHub Pages.
-   Buat pemisahan file yang masuk akal; jangan membuat arsitektur besar
    yang tidak dibutuhkan.

## 2.3 Hubungan keduanya

Keduanya harus menjelaskan sistem yang sama, dengan istilah dan alur
yang konsisten. Game menjadi "pintu masuk" untuk memahami proyek,
sementara aplikasi Pascal adalah implementasi utama yang dapat
didemonstrasikan.

Alur presentasi yang disarankan:

1.  Buka game dan perkenalkan masalah laundry.
2.  Ajak audiens menyelesaikan satu atau dua mini-game.
3.  Tunjukkan alur kerja SI-PANDRI.
4.  Jalankan simulasi pesanan di game dengan data fiktif.
5.  Buka aplikasi Pascal asli dan tunjukkan fitur yang bersesuaian.
6.  Jelaskan kode Pascal yang benar-benar digunakan.
7.  Tunjukkan pengujian yang relevan.
8.  Tutup dengan ringkasan solusi dan pembelajaran.

Jangan membuat game terlalu panjang sehingga menyita seluruh waktu
presentasi. Sediakan **Mode Presentasi** yang memudahkan presenter
berpindah ke chapter yang relevan tanpa merusak Mode Cerita normal.

------------------------------------------------------------------------

# 3. IDENTITAS RESMI SI-PANDRI

-   **Nama:** SI-PANDRI
-   **Kepanjangan:** Sistem Pengelolaan Parfait Laundry
-   **Slogan:** "Laundry Lebih Mudah, Lebih Teratur."
-   **Bahasa aplikasi inti:** Free Pascal
-   **Jenis aplikasi inti:** CLI/terminal
-   **Lingkup:** simulasi pengelolaan laundry kecil pada satu komputer
-   **Media edukasi:** game web interaktif SI-PANDRI: Misi Laundry
    Beres!
-   **Identitas tim:** SEPAKAT

Gunakan penamaan ini secara konsisten. Jangan membuat kepanjangan baru
atau mengubah nama proyek tanpa bukti dari dokumentasi resmi.

------------------------------------------------------------------------

# 4. BAGIAN A --- PENYEMPURNAAN APLIKASI TERMINAL FREE PASCAL

## 4.1 Prinsip utama

**Jangan membuat ulang program dari nol jika source code yang ada masih
dapat diperbaiki.** Pelajari struktur dan alur yang ada terlebih dahulu.
Identifikasi bug nyata, inkonsistensi, atau pengalaman pengguna yang
memang perlu ditingkatkan.

Tujuan bukan menambah sebanyak mungkin fitur, melainkan menyempurnakan
yang sudah ada agar aplikasi terasa dirancang dengan baik dan tetap
dapat dijelaskan dalam presentasi UTS.

Hindari:

-   Dashboard statistik kompleks.
-   Grafik atau analitik bisnis berlebihan.
-   Sistem notifikasi internal yang rumit.
-   Role baru di luar kebutuhan admin dan pelanggan.
-   Database online, API, server, dan cloud.
-   Pembayaran otomatis.
-   Integrasi WhatsApp otomatis.
-   Splash screen panjang.
-   Framework UI besar.
-   Banyak unit atau modul tanpa manfaat nyata.
-   Refactor besar hanya demi mengganti gaya penulisan.
-   Kode yang sulit dipahami pemula.

## 4.2 Fitur inti yang perlu diverifikasi dan dipertahankan

Prompt sumber menyebut fitur-fitur berikut. Periksa keberadaannya dalam
source code dan pertahankan yang memang sudah diimplementasikan:

-   Login admin.
-   Registrasi dan login pelanggan.
-   Pembuatan pesanan laundry.
-   Pilihan layanan Reguler dan Express.
-   Penimbangan aktual oleh admin.
-   Perhitungan biaya berdasarkan berat aktual.
-   Pembayaran tunai atau transfer bank.
-   Pembaruan status pembayaran.
-   Pembaruan status cucian.
-   Pencarian pesanan berdasarkan ID.
-   Detail dan riwayat pesanan.
-   Pengaturan harga serta informasi rekening.
-   Pembuatan tautan WhatsApp dengan teks siap kirim.
-   Pemberitahuan bahwa cucian siap diambil.
-   Laporan transaksi sederhana.
-   Penyimpanan data pada file lokal.

Jangan mengklaim fitur tersedia hanya karena tercantum di sini. Jika
belum ada, catat sebagai gap dan jangan otomatis membangun fitur besar
baru kecuali dibutuhkan agar alur inti yang sudah dijanjikan dapat
berfungsi.

## 4.3 Desain terminal: Dark Navy + Cyan + White

Buat antarmuka terminal yang bersih, konsisten, dan profesional dengan
palet terbatas:

-   Navy/biru gelap untuk identitas.
-   Cyan untuk judul dan informasi penting.
-   Putih/abu terang untuk konten.
-   Hijau untuk keberhasilan atau status lunas.
-   Kuning untuk status menunggu dan peringatan.
-   Merah untuk kesalahan atau kegagalan.

Jangan memakai semua warna sekaligus. Prioritaskan keterbacaan.

### Splash screen

Buat splash screen singkat yang dapat menampilkan:

-   Logo teks ASCII SI-PANDRI.
-   Nama lengkap sistem.
-   Slogan.
-   Garis pembatas atau bingkai yang rapi.
-   Versi aplikasi jika memang diperlukan.

Contoh arah desain:

``` text
+----------------------------------------------------------------+
|                         S I - P A N D R I                      |
|             Sistem Pengelolaan Parfait Laundry                 |
|                Laundry Lebih Mudah, Lebih Teratur.              |
+----------------------------------------------------------------+
```

Ini hanya inspirasi; buat komposisi yang lebih rapi jika sesuai. Jangan
membuat animasi panjang atau memaksa pengguna menunggu.

### Komponen tampilan reusable

Buat prosedur bantuan secukupnya untuk:

-   Membersihkan layar bila dibutuhkan.
-   Header aplikasi dan judul halaman.
-   Garis dan bingkai.
-   Pesan sukses, peringatan, dan error.
-   Tampilan status pesanan.
-   Menu pilihan.
-   Footer/informasi navigasi.
-   Jeda sebelum kembali ke menu sebelumnya.

Hindari duplikasi format header dan pesan di banyak prosedur. Namun,
jangan memecah setiap beberapa baris menjadi prosedur kecil yang justru
membuat alur sulit diikuti.

### Menu utama

Minimal pertahankan:

1.  Login Admin.
2.  Menu Pelanggan.
3.  Keluar.

Tampilkan nama aplikasi dan slogan secukupnya. Menu harus mudah dipahami
dan tidak terlalu ramai.

### Menu admin dan pelanggan

Gunakan pola visual konsisten:

-   Judul halaman jelas.
-   Nama akun yang sedang login jika relevan.
-   Nomor pilihan yang mudah dibaca.
-   Pemisahan antara menu utama dan logout.
-   Pesan validasi yang mudah ditemukan.
-   Navigasi kembali yang konsisten.

Jangan mengubah susunan menu secara berlebihan apabila pengguna sudah
terbiasa dengan alur yang ada.

### Daftar pesanan

Tampilkan, jika datanya tersedia:

-   ID pesanan.
-   Nama pelanggan.
-   Layanan.
-   Berat aktual.
-   Total biaya.
-   Status pembayaran.
-   Status cucian.

Pastikan kolom rata. Jika terminal terlalu sempit, gunakan daftar
ringkas dan tampilan detail terpisah, bukan memaksakan seluruh teks ke
satu baris.

### Detail pesanan

Kelompokkan informasi menjadi:

-   Pelanggan.
-   Layanan.
-   Berat dan biaya.
-   Metode serta status pembayaran.
-   Status pengerjaan.
-   Waktu pembuatan/pembaruan jika memang disimpan.

Jika cucian belum ditimbang, jangan menampilkan angka nol seolah-olah
berat dan biaya sudah final. Beri label seperti "Belum ditimbang" atau
padanan yang sesuai.

## 4.4 Batasan terminal

Gunakan kemampuan Free Pascal yang tersedia. Unit `Crt` boleh digunakan
jika cocok.

-   Jangan menambahkan library UI besar.
-   Jangan menggunakan framework lain.
-   Jangan mengubah aplikasi menjadi website.
-   Jangan bergantung pada emoji atau karakter Unicode yang tidak
    konsisten di Windows Terminal/PowerShell.
-   Sediakan ASCII fallback.
-   Jangan memakai `ReadKey` sembarangan hingga input berikutnya
    tertelan.
-   Jangan menghapus pesan penting terlalu cepat.
-   Jangan membersihkan layar setelah setiap pesan jika hal itu
    menghilangkan konteks.
-   Pastikan tampilan nyaman pada lebar terminal sekitar 80 kolom.
-   Jika dekorasi tidak cocok pada terminal sempit, utamakan versi
    ringkas yang terbaca.

## 4.5 Rapikan source code tanpa overengineering

Pertahankan nama variabel dan fungsi yang jelas dalam bahasa Indonesia
bila sudah konsisten. Refactor dengan hati-hati.

Periksa potensi duplikasi pada:

-   Header halaman.
-   Validasi input.
-   Format Rupiah.
-   Pencarian ID pesanan.
-   Pembacaan daftar pesanan.
-   Pembaruan status.
-   Pesan WhatsApp.
-   Pesan sukses dan gagal.

Pisahkan logika perhitungan, validasi, operasi file, dan tampilan bila
pemisahan itu membantu pemahaman. Jangan memaksakan arsitektur berlapis
yang tidak sesuai skala tugas.

Tambahkan komentar singkat hanya pada logika yang berpotensi
membingungkan, misalnya pembuatan ID, pencarian data, penyimpanan,
perhitungan biaya, dan URL WhatsApp.

## 4.6 Aturan logika transaksi

### Pemesanan

Pelanggan mengisi data awal dan memilih layanan yang tersedia. Program
membuat ID pesanan dan menyimpan status awal yang sesuai dengan
implementasi.

### Penimbangan dan perhitungan

Admin memasukkan ID pesanan dan berat aktual. Validasi harus jelas.

-   Berat aktual tidak boleh nol atau negatif.
-   Tarif tidak boleh negatif.
-   Input nonnumerik harus ditangani tanpa membuat program crash.
-   Tarif harus sesuai layanan pesanan.
-   Nilai total yang ditampilkan harus sama dengan nilai yang disimpan.
-   Penimbangan ulang tidak boleh merusak data secara diam-diam.

Rumus inti:

**Total biaya = berat aktual (kg) × tarif per kilogram**

Jika harga layanan dapat berubah, pertimbangkan menyimpan tarif
transaksi saat pesanan dihitung agar transaksi lama tidak berubah secara
tidak sengaja. Lakukan perubahan struktur record hanya jika manfaatnya
jelas dan data lama dapat ditangani secara aman.

### Pembayaran

Pertahankan tunai dan transfer bank apabila sudah tersedia.

-   Status pembayaran harus terpisah dari status cucian.
-   Memilih transfer bukan bukti bahwa pembayaran telah berhasil.
-   Admin harus melakukan konfirmasi sebelum menandai Lunas.
-   Jangan membuat transaksi otomatis atau mengklaim verifikasi bank
    otomatis.

### Status cucian

Pertahankan status yang sudah ada jika sesuai:

-   Menunggu Ditimbang.
-   Menunggu Diproses.
-   Sedang Diproses.
-   Siap Diambil.
-   Selesai/Diserahkan.

Validasi transisi agar status tidak melompat ke tahap yang tidak masuk
akal. Misalnya, cucian belum dapat diproses jika berat aktual belum
dicatat. Sesuaikan dengan aturan yang benar-benar ada dalam source code.

### Data pelanggan

-   Pertahankan registrasi/login bila sudah ada.
-   Pastikan pelanggan hanya melihat pesanan milik akunnya.
-   Username duplikat, input tidak valid, dan login gagal harus
    menghasilkan pesan yang jelas.
-   Jangan menampilkan data pelanggan lain.

### Penyimpanan file lokal

-   Tangani file yang belum ada atau kosong.
-   Pastikan file ditutup dengan aman.
-   Periksa proses baca/tulis dan pembaruan data.
-   Jangan mengubah format file biner tanpa alasan kuat.
-   Jangan menghapus data lama otomatis.
-   Jika migrasi diperlukan, buat backup dan strategi yang jelas.
-   Jangan menaruh data pribadi nyata ke dalam game presentasi.

## 4.7 WhatsApp tetap manual

Jika fitur ini memang ada, pertahankan pembuatan tautan WhatsApp dengan
teks siap kirim, misalnya:

-   Permintaan informasi rekening.
-   Informasi tagihan.
-   Pemberitahuan cucian siap diambil.

Periksa encoding URL dan normalisasi nomor sesuai source code. Isi pesan
dengan informasi pesanan yang tersedia dan relevan.

Aplikasi boleh membuka tautan atau menampilkan pesan siap kirim, tetapi
pengguna tetap meninjau dan menekan tombol kirim sendiri. Jangan
menambahkan pengiriman otomatis, API WhatsApp, QRIS, atau upload gambar
pada tahap ini.

## 4.8 Materi UTS Dasar Pemrograman wajib dipertahankan

Periksa bahwa implementasi tetap memperlihatkan materi yang menjadi
persyaratan UTS:

-   Input/output: `write`, `writeln`, `read`, `readln`.
-   Percabangan `if-then-else`.
-   Nested-if dan operator logika jika sesuai.
-   Pemilihan menu `case-of`.
-   Perulangan menu `repeat-until`.
-   `while-do` untuk input/validasi berulang.
-   `for-to-do` untuk iterasi data yang relevan.
-   `break` atau `continue` jika diwajibkan dan dapat digunakan secara
    wajar.
-   Variabel dan tipe data yang sesuai.
-   Penyimpanan file lokal.

Jangan menambahkan `break`/`continue` tanpa tujuan hanya untuk
mencentang daftar. Jangan menghilangkan konsep wajib demi memendekkan
kode. Tambahkan bagian README singkat yang menunjukkan letak penerapan
konsep tersebut.

## 4.9 Pengujian aplikasi Pascal

Jika compiler tersedia, jalankan kompilasi sesuai lingkungan. Contoh:

``` bash
fpc SI_PANDRI.pas
```

Lalu uji alur yang relevan:

1.  Login admin.
2.  Registrasi dan login pelanggan.
3.  Pembuatan pesanan.
4.  Berat valid, nol, negatif, dan input tidak valid.
5.  Perhitungan biaya Reguler/Express jika layanan itu memang tersedia.
6.  Pembaruan tarif dan dampaknya terhadap pesanan lama.
7.  Status pembayaran dan status cucian.
8.  Pembatasan akses data pelanggan.
9.  Pencarian ID dan detail pesanan.
10. Pembuatan tautan WhatsApp.
11. Menutup dan membuka ulang program untuk memeriksa persistensi data.
12. Navigasi menu setelah perubahan UI.

Jangan menyatakan test lulus jika belum dijalankan. Jika compiler tidak
tersedia, jelaskan batasannya secara eksplisit dan berikan perintah
untuk menguji di komputer pengguna.

------------------------------------------------------------------------

# 5. BAGIAN B --- GAME WEB INTERAKTIF UNTUK PRESENTASI

## 5.1 Nama dan konsep game

**Judul:** SI-PANDRI: Misi Laundry Beres!\
**Subjudul:** *The SEPAKAT Journey --- From Everyday Problems to a Real
System*

Konsep: petualangan edukatif yang membawa pemain dari menemukan masalah
pengelolaan laundry hingga memahami SI-PANDRI, menyusun workflow,
mencoba simulasi pesanan, mengenali logika program, menguji skenario,
dan mempersiapkan presentasi.

Game harus terasa seperti permainan yang utuh, bukan kumpulan slide
dengan tombol "Next". Pemain perlu melakukan tindakan, menerima respons,
dan melihat hubungan sebab-akibat.

## 5.2 Pengalaman inti

Bayangkan pemain membuka sebuah usaha laundry kecil yang sibuk. Ada buku
catatan, daftar harga, timbangan, dan daftar pesanan. Pemain menyelidiki
apa yang perlu dicatat, membantu pemilik memahami masalah, bertemu tim
SEPAKAT, menyusun solusi, mencoba simulasi SI-PANDRI, mempelajari logika
di baliknya, lalu menyelesaikan misi pengujian.

Inti pengalaman:

**Pemain mengalami proses pemecahan masalah sebelum memahami solusi dan
implementasinya.**

Gunakan bahasa Indonesia yang natural, hangat, dan mudah dipahami
audiens nonteknis. Istilah teknis perlu dijelaskan saat pertama kali
muncul.

## 5.3 Tiga maskot SEPAKAT

Gunakan aset maskot lokal yang tersedia. Jangan mengganti desain aslinya
bila aset resmi sudah ada.

### Gilbert

-   Harimau jantan memakai kacamata.
-   Peran naratif: memperhatikan detail, menyelidiki masalah pencatatan,
    menemukan informasi yang diperlukan.

### Sarah

-   Snow leopard betina memakai kacamata.
-   Peran naratif: membantu memahami kebutuhan pelanggan/admin,
    merancang alur pelayanan, menyusun workflow.

### Syahril

-   Beruang putih jantan tanpa kacamata.
-   Peran naratif: membantu memahami solusi SI-PANDRI, menjalankan
    simulasi, menghubungkan alur dengan program.

Pembagian ini adalah fungsi cerita, bukan klaim pembagian tugas resmi
anggota kelompok.

Ketiganya harus menjadi karakter aktif melalui dialog natural, ekspresi
yang sesuai, reaksi terhadap pilihan, dan percakapan singkat. Jangan
sekadar menaruh gambar maskot sebagai dekorasi. Hindari dialog yang
terlalu panjang.

## 5.4 Struktur chapter dan gameplay

Setiap chapter wajib memiliki:

-   Tujuan cerita.
-   Tujuan pembelajaran.
-   Scene dan dialog.
-   Interaksi yang nyata.
-   Kondisi penyelesaian yang terukur.
-   Feedback ketika pemain benar/salah.
-   Ringkasan pembelajaran.
-   Syarat membuka chapter berikutnya.
-   Cara mengulang chapter.

### PROLOG --- A Laundry in Trouble

Tampilkan adegan laundry dengan elemen visual sesuai aset: meja
penerimaan, tumpukan pakaian, catatan pesanan, daftar harga, timbangan,
nota, dan daftar pesanan.

Narasi pembuka yang dapat diadaptasi:

> Setiap hari, laundry menerima pakaian dari pelanggan. Data pelanggan
> perlu dicatat, berat pakaian harus diketahui, biaya dihitung, dan
> status pengerjaan perlu dipantau. Ketika informasi tersebar di banyak
> catatan, pekerjaan administratif bisa menjadi lebih sulit.

Ini adalah narasi ilustratif, bukan klaim wawancara atau kejadian nyata.

**Gameplay investigasi:** pemain mengeklik objek seperti buku catatan,
timbangan, daftar harga, dan daftar pesanan. Setiap objek membuka
petunjuk singkat. Setelah petunjuk terkumpul, pemain memilih masalah
yang perlu ditangani. Terima lebih dari satu jawaban yang masuk akal
bila sesuai konteks dan jelaskan alasannya.

### CHAPTER 1 --- The SEPAKAT Arrival

Ketiga maskot datang dan mengamati masalah. Gilbert memperhatikan data,
Sarah meninjau proses pelayanan, dan Syahril mengusulkan sistem
pengelolaan.

**Mini-game: Identify the Problems**

Pemain mengelompokkan masalah, misalnya:

-   Data pelanggan.
-   Data pesanan.
-   Berat dan biaya.
-   Pembayaran.
-   Status pengerjaan.
-   Informasi penyelesaian pesanan.

Gunakan kartu pilihan atau drag-and-drop yang benar-benar berfungsi.
Saat memilih, tampilkan penjelasan mengapa informasi tersebut penting.
Misi selesai berdasarkan kondisi yang jelas, bukan hanya klik lanjut.

### CHAPTER 2 --- Meet SI-PANDRI

Perkenalkan SI-PANDRI dengan kepanjangan resmi dari dokumentasi: Sistem
Pengelolaan Parfait Laundry.

Jelaskan tujuan dalam bahasa sederhana: membantu mengelola data dan alur
layanan laundry secara lebih terstruktur, sesuai fungsi yang benar-benar
ada di source code.

**Mini-game: Build the Solution**

Hubungkan masalah dengan komponen yang tepat, misalnya data pelanggan
dengan pencatatan pelanggan, berat dengan input berat aktual, biaya
dengan perhitungan tarif × berat, dan pesanan dengan daftar/riwayat
pesanan. Gunakan fitur yang benar-benar tersedia; tandai komponen
simulasi bila hanya ada di game.

### CHAPTER 3 --- Design the Workflow

Ajak pemain menyusun alur dari awal sampai akhir. Gunakan alur
konseptual berikut sebagai titik awal dan cocokkan dengan implementasi
aktual:

1.  Pelanggan memasukkan informasi yang diperlukan.
2.  Pelanggan memilih layanan yang tersedia.
3.  Pesanan diterima.
4.  Admin menimbang dan memasukkan berat aktual.
5.  Sistem menghitung biaya sesuai tarif.
6.  Informasi/metode pembayaran ditangani sesuai implementasi.
7.  Pembayaran dikonfirmasi sesuai prosedur.
8.  Pesanan diproses dan status diperbarui.
9.  Pesanan selesai dan informasi penyelesaian diberikan melalui
    mekanisme yang tersedia.

Jangan mengklaim transfer otomatis, QRIS, WhatsApp otomatis, verifikasi
pembayaran otomatis, atau integrasi lain jika tidak didukung kode.

**Mini-game: Arrange the Flow**

Pemain menyusun kartu langkah. Jika urutan salah, tampilkan petunjuk
yang membantu, bukan hanya "Wrong". Setelah berhasil, tampilkan diagram
alur yang setiap tahapnya dapat diklik untuk melihat penjelasan.

Jelaskan Input → Process → Output melalui contoh laundry yang baru
dimainkan.

### CHAPTER 4 --- Inside the SI-PANDRI System

Buat simulasi antarmuka aplikasi pengelolaan laundry yang terasa seperti
aplikasi, bukan slide. Area yang bisa ditampilkan, hanya jika relevan
dengan kode:

-   Menu utama.
-   Menu pelanggan.
-   Menu admin.
-   Input pesanan.
-   Pengaturan tarif.
-   Input berat aktual.
-   Perhitungan biaya.
-   Daftar dan detail pesanan.
-   Status pembayaran.
-   Status pengerjaan.
-   Informasi penyelesaian.

Jangan mengarang database, autentikasi web, integrasi eksternal, atau
halaman yang tidak ada pada sistem. Beri label **Simulasi Pembelajaran**
jika data hanya berada di browser.

**Mini-game: Process a Laundry Order**

Pemain mengisi data fiktif, memilih layanan yang memang tersedia,
memasukkan berat aktual, lalu melihat perhitungan.

Rumus: **Total biaya = berat aktual (kg) × tarif per kilogram**

Contoh demonstrasi (bukan tarif resmi proyek): - Berat aktual: 3 kg. -
Tarif contoh: Rp7.000/kg. - Total: Rp21.000.

Hitung hasil secara nyata menggunakan JavaScript. Validasi input kosong,
angka negatif, nol bila tidak valid, dan nilai tidak masuk akal.
Sediakan tombol untuk mengubah input dan mengulang simulasi.

Jangan meminta nomor telepon pribadi pemain. Gunakan identitas pelanggan
fiktif dan jangan mengirim pesan nyata. Jika membahas transfer, jelaskan
bahwa simulasi bukan transaksi bank sungguhan.

### CHAPTER 5 --- Behind the Code

Baca `SI_PANDRI.pas` secara menyeluruh. Gunakan cuplikan kode aktual
yang singkat untuk menjelaskan:

-   Variabel dan tipe data.
-   Konstanta jika digunakan.
-   Input/output.
-   Perhitungan biaya.
-   Percabangan.
-   Perulangan.
-   Pencarian/pengelolaan data.
-   Validasi input.
-   Prosedur/fungsi.
-   Penyimpanan lokal.

Jelaskan urutan Input, Process, dan Output berdasarkan kode sebenarnya.
Hindari kode contoh generik yang tidak berhubungan dengan program.

**Mini-game: Find the Logic**

Buat tantangan untuk memilih rumus, memprediksi hasil input, mencocokkan
potongan kode dengan fungsi, atau memilih kondisi validasi yang benar.
Evaluasi jawaban dan jelaskan alasannya.

Jangan mengganti program inti Pascal dengan JavaScript. JavaScript hanya
menggerakkan game dan simulasi pembelajaran.

### CHAPTER 6 --- The Testing Room

Buat ruang pengujian yang mengajarkan bahwa sistem perlu diuji dengan
kondisi berbeda. Pilih skenario yang relevan dengan source code aktual:

-   Data pelanggan valid.
-   Input wajib kosong jika validasi diterapkan.
-   Berat valid, nol, atau negatif.
-   Perhitungan biaya.
-   Pilihan menu tidak valid jika menggunakan menu bernomor.
-   Status pembayaran.
-   Perubahan status pesanan.
-   Hak akses pelanggan.
-   Kondisi batas tipe data atau logika yang memang relevan.

Untuk tiap skenario tampilkan: 1. Tujuan pengujian. 2. Input/kondisi
awal. 3. Hasil yang diharapkan. 4. Hasil simulasi. 5. Status
lulus/gagal. 6. Penjelasan.

Jangan menyatakan browser telah menjalankan executable Pascal. Pisahkan
pengujian simulasi game dengan pengujian aplikasi asli.

**Mini-game: Bug Hunter**

Berikan contoh tantangan bug buatan yang masuk akal. Pemain
mengidentifikasi masalah dan memilih perbaikan. Labeli sebagai skenario
latihan, bukan bug nyata yang dipastikan pernah ada. Feedback harus
mengajarkan dampak kesalahan pada data atau proses laundry.

### CHAPTER 7 --- Prepare the Presentation

Buat project board interaktif yang merangkum:

-   Identifikasi masalah.
-   Analisis kebutuhan.
-   Rancangan alur.
-   Implementasi.
-   Simulasi.
-   Pengujian.
-   Dokumentasi.
-   Ringkasan hasil.

Pemain menyelesaikan checklist. Setiap item membuka penjelasan singkat.
Jangan mengklaim hasil pengujian atau keberhasilan implementasi yang
belum terbukti.

Sediakan "Presenter Notes" atau ringkasan poin bicara singkat agar game
dapat dipakai sebagai bahan presentasi kelas.

### FINAL CHAPTER --- Mission Accomplished

Buat ending yang terasa seperti penutup perjalanan. Tampilkan ketiga
maskot di depan visual SI-PANDRI dan pesan:

**"Dari masalah sehari-hari, menjadi solusi yang terstruktur."**

Judul penutup: **"FROM PROBLEM TO SOLUTION --- SI-PANDRI"**

Rangkum pembelajaran:

-   Memahami masalah pengguna.
-   Menentukan kebutuhan sistem.
-   Menyusun workflow.
-   Menghubungkan algoritma dengan implementasi.
-   Memahami pentingnya pengujian.
-   Menyajikan proyek secara jelas.

Tampilkan chapter selesai, XP, achievement, dan jurnal perjalanan.
Sediakan opsi mengulang game, chapter, mini-game, atau membuka ringkasan
sistem.

Jangan mengklaim bahwa sistem telah digunakan usaha laundry sungguhan
atau mencapai hasil bisnis tertentu jika tidak ada bukti.

------------------------------------------------------------------------

# 6. MEKANISME GAME YANG BENAR-BENAR BERFUNGSI

## 6.1 Scene manager

Gunakan state/scene manager yang jelas. Setiap scene memiliki ID,
narasi, karakter, interaksi, kondisi penyelesaian, aksi lanjutan, dan
transisi. Hindari event listener ganda atau state yang saling
bertabrakan.

## 6.2 Progression chapter

Status chapter dapat berupa:

-   Locked.
-   Available.
-   In Progress.
-   Completed.

Chapter baru terbuka setelah syarat misi sebelumnya terpenuhi. Pemain
tidak boleh melewati semua misi hanya dengan mengklik Next. Chapter yang
sudah terbuka tetap dapat dimainkan ulang.

## 6.3 XP dan anti-farming

Berikan XP untuk aktivitas bermakna: investigasi, kuis, workflow,
simulasi, Bug Hunter, dan persiapan presentasi.

-   XP harus berasal dari event yang benar-benar selesai.
-   Cegah XP bertambah tanpa batas saat misi yang sama diulang.
-   Simpan status reward per misi.
-   Mode latihan dapat mengizinkan percobaan ulang tanpa XP tambahan.

## 6.4 Achievement

Gunakan achievement yang dibuka berdasarkan kondisi nyata, misalnya:

-   First Investigation.
-   Problem Solver.
-   Workflow Architect.
-   System Explorer.
-   Logic Builder.
-   Bug Hunter.
-   Testing Specialist.
-   Presentation Ready.
-   Mission Accomplished.

Jangan membuka achievement hanya karena pemain menekan tombol.

## 6.5 Kuis dan feedback

Setiap kuis harus memiliki:

-   Jawaban yang dievaluasi.
-   Penjelasan benar/salah.
-   Petunjuk saat pemain keliru.
-   Kesempatan mencoba ulang.
-   Skor yang dihitung nyata jika skor digunakan.

Jangan menggunakan jawaban yang tidak sesuai materi atau penjelasan
generik yang tidak membantu.

## 6.6 Penyimpanan progres

Gunakan `localStorage` bila cocok dengan arsitektur. Simpan data game
yang tidak sensitif, misalnya:

-   Chapter terbuka/selesai.
-   Progres misi.
-   XP.
-   Achievement.
-   Hasil kuis yang relevan.
-   Pengaturan suara dan preferensi tampilan.

Sediakan tombol reset progres dengan dialog konfirmasi. Jangan simpan
informasi pelanggan nyata.

## 6.7 Jurnal perjalanan

Buat jurnal yang otomatis merangkum chapter yang sudah selesai.
Kontennya harus berasal dari hasil chapter yang benar-benar ada, bukan
teks generik yang tidak terhubung dengan progres.

## 6.8 Mode Presentasi

Selain Mode Cerita, sediakan Mode Presentasi yang cocok untuk kelas:

-   Navigasi chapter terlihat jelas.
-   Presenter dapat melompat ke bagian yang diperlukan tanpa merusak
    save/progres utama.
-   Teks lebih mudah dibaca dari proyektor.
-   Ada tombol untuk menyembunyikan panel bantuan atau membuka
    ringkasan.
-   Setiap chapter menyediakan satu ringkasan dan satu kalimat transisi
    untuk presenter.
-   Hindari animasi panjang dan interaksi yang memakan waktu saat demo.
-   Sediakan opsi memulai demo dari chapter yang dipilih.
-   Jika Mode Presentasi melewati misi, beri label sebagai navigasi
    presenter, bukan penyelesaian misi pemain.

------------------------------------------------------------------------

# 7. DESAIN VISUAL GAME

## 7.1 Arah visual

Gabungkan kekuatan referensi Agora Logika dan Warung Pak Din menjadi
identitas baru. Target gaya:

**Pixel-art adventure game + aplikasi laundry modern.**

Gunakan palet yang cocok dengan aset yang tersedia. Inspirasi awal:
cream, terracotta, hijau, dan gold untuk dunia laundry; panel aplikasi
dapat menggunakan warna yang konsisten dengan identitas SI-PANDRI.
Jangan memaksakan palet ini jika aset resmi menunjukkan arah yang lebih
cocok.

Pisahkan visual dengan jelas:

-   Latar adegan laundry.
-   Area karakter.
-   Panel dialog.
-   Area mini-game.
-   UI simulasi sistem.
-   Indikator chapter dan progres.
-   Petunjuk objektif.
-   Pesan keberhasilan/kesalahan.

## 7.2 Tipografi

-   Font pixel untuk judul/label retro bila sesuai.
-   Font monospaced untuk cuplikan kode.
-   Font sans-serif yang sangat terbaca untuk dialog dan teks panjang.
-   Jangan menggunakan font pixel untuk semua teks.
-   Pastikan kontras, ukuran, dan jarak baca nyaman di proyektor.

## 7.3 Adegan dan komposisi

Buat tampilan seperti game sungguhan:

-   Latar yang memberi konteks.
-   Karakter dengan pose yang sesuai.
-   Panel dialog.
-   Pilihan interaktif.
-   Indikator chapter.
-   Objektif aktif.
-   Animasi feedback ketika misi selesai.

Jika menggunakan kanvas virtual 16:9, lakukan scaling secara benar.
Jangan memaksa semua elemen ke kanvas 1920×1080 hingga teks menjadi
kecil. Desain harus tetap terbaca pada laptop dan ponsel.

## 7.4 Animasi dan audio

Animasi ringan yang relevan:

-   Karakter masuk.
-   Dialog muncul.
-   Petunjuk ditemukan.
-   Jawaban benar/salah.
-   XP bertambah.
-   Chapter terbuka.
-   Transisi dunia laundry ke UI aplikasi.

Hormati `prefers-reduced-motion`. Jangan biarkan animasi menghalangi
tombol atau memperlambat presentasi.

Audio opsional. Jika ada: - Jangan autoplay dengan suara yang
mengganggu. - Sediakan mute dan kontrol volume bila memungkinkan. -
Jangan membuat gameplay bergantung pada audio. - Berikan fallback jika
file audio tidak tersedia.

## 7.5 Responsivitas dan aksesibilitas

Game harus berfungsi pada desktop, laptop, tablet, dan ponsel.

-   Tombol memiliki area klik yang cukup.
-   Teks tidak terpotong.
-   Dialog tidak menutupi semua kontrol penting.
-   Drag-and-drop, jika ada, juga harus memiliki alternatif klik/tap.
-   Navigasi keyboard dasar berfungsi.
-   Fokus terlihat.
-   Warna bukan satu-satunya cara membedakan status.
-   Gunakan label yang jelas.
-   Hindari animasi berlebihan.
-   Periksa overflow horizontal.
-   Uji ukuran layar yang sempit dan ukuran proyektor umum.

------------------------------------------------------------------------

# 8. ARSITEKTUR DAN KEBERSIHAN KODE GAME

## 8.1 Pilih teknologi sesuai workspace

Periksa teknologi yang sudah tersedia sebelum memutuskan. Jangan
menambah framework besar hanya untuk game yang dapat dibuat dengan
HTML/CSS/JS biasa.

-   Gunakan kembali dependensi yang masih sesuai.
-   Pisahkan konten cerita, data pertanyaan, logika state, style, dan
    aset bila struktur proyek memungkinkan.
-   Hindari satu file raksasa yang sulit dirawat jika pemisahan
    sederhana lebih baik.
-   Jangan membuat banyak file kecil tanpa manfaat.
-   Jangan menghapus aset referensi.
-   Jangan mengubah `SI_PANDRI.pas` demi kebutuhan game.
-   Jangan memodifikasi file data atau executable secara destruktif.
-   Jangan menimpa file referensi asli.

## 8.2 Lokasi file game

Periksa struktur repository. Jika belum ada lokasi yang cocok, lokasi
yang dapat dipertimbangkan:

-   `si-pandri-story-game.html`, atau
-   `game/index.html` beserta file aset terkait.

Pilih berdasarkan struktur aktual dan target deployment. Jangan membuat
salinan duplikat yang membingungkan. Jika website SI-PANDRI sudah aktif,
integrasikan secara hati-hati agar halaman yang ada tidak rusak.

Jangan menimpa file referensi berikut jika ada:

-   `contoh-game/kalkuluspredikat-game.html`
-   `contoh-game/warungpakdin-game.html`
-   Source code SI-PANDRI.
-   Dokumentasi asli.

## 8.3 Aset dan path

-   Cari aset maskot, sprite, font, dan ilustrasi yang tersedia terlebih
    dahulu.
-   Gunakan aset lokal yang relevan.
-   Jangan bergantung pada URL eksternal yang belum diverifikasi.
-   Pastikan relative path bekerja dari lokasi output.
-   Perhatikan base path GitHub Pages yang mungkin berada di subfolder.
-   Tangani aset yang tidak tersedia dengan fallback visual yang layak.
-   Jangan mengganti maskot resmi jika aset asli tersedia.

## 8.4 Keakuratan fitur

Beri pemisahan yang mudah dipahami antara:

1.  **Fitur aplikasi yang benar-benar tersedia** berdasarkan source
    code.
2.  **Simulasi edukatif** yang hanya berjalan dalam game.
3.  **Fitur yang direncanakan atau belum diimplementasikan.**

Jangan mengklaim game browser menjalankan executable Pascal, menyimpan
ke database aplikasi, melakukan transaksi nyata, mengirim WhatsApp,
memverifikasi transfer, atau menjalankan compiler kecuali mekanisme
tersebut benar-benar dibuat dan diuji.

------------------------------------------------------------------------

# 9. PENGALAMAN CERITA DAN MICROCOPY

Bahasa game harus natural, ringkas, dan ramah untuk presentasi kelas.

Prinsip:

-   Satu dialog sebaiknya menyampaikan satu ide utama.
-   Pecah penjelasan panjang menjadi potongan yang nyaman dibaca.
-   Setiap interaksi punya konsekuensi atau feedback.
-   Beri petunjuk, bukan hanya pesan "salah".
-   Gunakan humor ringan jika sesuai, tanpa mengganggu materi.
-   Jangan mengulang kalimat yang sama di banyak chapter.
-   Jangan memakai istilah teknis tanpa penjelasan singkat.
-   Hindari popup terus-menerus.
-   Hindari tombol yang tidak melakukan apa pun.
-   Hindari chapter yang hanya berupa halaman teks.
-   Jangan memaksa pemain membaca semua materi sekaligus.
-   Gunakan petunjuk visual untuk memperjelas hubungan antaride.

Contoh pola interaksi yang baik:

**Pemain mengeklik buku catatan → mendapat petunjuk → memilih informasi
penting → Gilbert memberi feedback → pemain memahami kebutuhan data →
misi berlanjut.**

Bukan:

**Pemain membaca paragraf panjang → menekan Next berkali-kali →
ending.**

------------------------------------------------------------------------

# 10. KEAMANAN, PRIVASI, DAN KETAHANAN

-   Gunakan data fiktif untuk game dan demo.
-   Jangan meminta nomor telepon asli pemain.
-   Jangan mengirim pesan WhatsApp nyata dari game.
-   Jangan menyimpan password atau data pelanggan aplikasi Pascal ke
    `localStorage` game.
-   Jangan mengirim data lokal ke server.
-   Jangan menampilkan data pelanggan lain kepada pengguna yang tidak
    berhak.
-   Jangan menambahkan telemetry atau analytics eksternal.
-   Jangan menghapus data lokal aplikasi secara otomatis.
-   Jika ada reset data aplikasi dalam fitur yang sudah ada, pastikan
    konfirmasi jelas.
-   Validasi input dan tangani error dengan pesan yang dapat dipahami.
-   Hindari ketergantungan jaringan agar game lokal tetap dapat
    dimainkan jika memungkinkan.

------------------------------------------------------------------------

# 11. TAHAP IMPLEMENTASI WAJIB

## Tahap 1 --- Audit

Periksa workspace, source Pascal, dokumentasi, file data, game
referensi, aset, dan konfigurasi deployment. Catat struktur yang ada dan
risiko perubahan.

## Tahap 2 --- Rencana singkat

Buat rencana internal/daftar kerja yang mencakup:

-   File yang perlu diubah.
-   File baru yang diperlukan.
-   Fitur Pascal yang perlu diperbaiki.
-   Alur game dan chapter.
-   Mekanisme gameplay.
-   Aset yang dapat digunakan kembali.
-   Pengujian yang akan dijalankan.

Jangan berhenti pada tahap rencana. Lanjutkan implementasi setelah
audit.

## Tahap 3 --- Penyempurnaan Pascal

Kerjakan peningkatan terminal dan logika yang memang diperlukan.
Pertahankan fitur inti, struktur yang masih baik, materi UTS, dan
penyimpanan lokal. Hindari perubahan yang tidak berhubungan dengan
tujuan.

## Tahap 4 --- Implementasi game

Bangun game utuh dari prolog hingga ending, termasuk dialog, mini-game,
simulasi, progress, XP, achievement, jurnal, dan Mode Presentasi.
Pastikan interaksi nyata dan semua tombol berfungsi.

## Tahap 5 --- Integrasi dokumentasi

Perbarui README/dokumentasi yang relevan agar menjelaskan dua komponen
secara jelas. Jangan menghapus dokumentasi asli yang masih berguna.
Dokumentasikan batasan dan cara menjalankan setiap komponen.

## Tahap 6 --- Uji seluruh alur

Uji aplikasi Pascal dan game secara terpisah, lalu periksa konsistensi
penjelasan keduanya.

## Tahap 7 --- Perbaiki dan verifikasi

Perbaiki error yang ditemukan. Periksa console browser, path aset,
navigasi, responsivitas, dan penyimpanan progres. Jangan menyatakan
hasil lulus jika tidak benar-benar dijalankan.

------------------------------------------------------------------------

# 12. CHECKLIST PENGUJIAN GAME

Periksa satu per satu:

-   [ ] Game dapat dibuka pada lokasi file yang dipilih.
-   [ ] Tidak ada error JavaScript yang menghalangi gameplay.
-   [ ] Semua aset lokal ditemukan atau memiliki fallback.
-   [ ] Prolog dan setiap chapter dapat dibuka sesuai syarat.
-   [ ] Interaksi objek investigasi berfungsi.
-   [ ] Mini-game pengelompokan dapat dievaluasi.
-   [ ] Mini-game penyusunan workflow dapat diselesaikan.
-   [ ] Simulasi menghitung total dari input aktual.
-   [ ] Input invalid ditangani.
-   [ ] Tantangan kode memakai cuplikan aktual atau diberi label
    ilustrasi.
-   [ ] Tantangan Bug Hunter memberi feedback yang benar.
-   [ ] Status chapter berubah sesuai kondisi.
-   [ ] XP tidak dapat difarming dengan mengulang misi.
-   [ ] Achievement hanya terbuka setelah syarat tercapai.
-   [ ] Jurnal mencerminkan progres.
-   [ ] `localStorage` menyimpan dan memuat progres dengan benar.
-   [ ] Reset progres meminta konfirmasi.
-   [ ] Mode Presentasi berfungsi.
-   [ ] Mode Cerita tetap memiliki progression yang wajar.
-   [ ] Tombol ulang chapter dan mini-game berfungsi.
-   [ ] Tidak ada klaim palsu tentang integrasi atau pengujian.
-   [ ] Tampilan nyaman di desktop, tablet, dan ponsel.
-   [ ] Tidak ada overflow horizontal yang mengganggu.
-   [ ] Navigasi keyboard dan fokus terlihat jika memungkinkan.
-   [ ] `prefers-reduced-motion` dihormati.
-   [ ] Tidak ada data pribadi nyata dalam demo.

------------------------------------------------------------------------

# 13. CHECKLIST PENGUJIAN APLIKASI PASCAL

-   [ ] Source code diperiksa sebelum diedit.
-   [ ] Perubahan lokal pengguna tetap terjaga.
-   [ ] Program dikompilasi jika compiler tersedia.
-   [ ] Login admin diuji.
-   [ ] Registrasi/login pelanggan diuji jika tersedia.
-   [ ] Pembuatan pesanan diuji.
-   [ ] Validasi berat dan input diuji.
-   [ ] Perhitungan biaya diverifikasi.
-   [ ] Status pembayaran terpisah dari status cucian.
-   [ ] Transisi status divalidasi.
-   [ ] Hak akses pesanan pelanggan diperiksa.
-   [ ] Pencarian dan detail pesanan diuji.
-   [ ] Tautan WhatsApp diuji jika tersedia.
-   [ ] Persistensi file lokal diperiksa.
-   [ ] Data lama tidak hilang tanpa izin.
-   [ ] Terminal tetap terbaca sekitar 80 kolom.
-   [ ] Navigasi menu tidak rusak.
-   [ ] Materi wajib UTS tetap ada.
-   [ ] README menjelaskan konsep pemrograman yang digunakan.
-   [ ] Hasil test dilaporkan secara jujur.

------------------------------------------------------------------------

# 14. KRITERIA KEBERHASILAN AKHIR

Proyek dianggap selesai jika seluruh kriteria yang relevan telah
dipenuhi atau keterbatasannya didokumentasikan dengan jelas.

## Aplikasi Pascal

1.  Tetap merupakan aplikasi CLI Free Pascal.
2.  Fitur inti yang memang sudah ada tetap berfungsi.
3.  Tampilan terminal lebih rapi, konsisten, dan mudah dibaca.
4.  Validasi input dan alur transaksi lebih andal.
5.  Perhitungan biaya benar.
6.  Status pembayaran dan cucian tidak tercampur.
7.  Penyimpanan lokal tetap terjaga.
8.  Source code mudah dijelaskan untuk UTS.
9.  Materi pemrograman wajib tetap terwakili.
10. Tidak ada fitur besar yang ditambahkan tanpa kebutuhan jelas.

## Game web

1.  Ada prolog, chapter, dan ending yang saling terhubung.
2.  Tiga maskot SEPAKAT berperan dalam cerita.
3.  Masalah laundry diperkenalkan dengan jelas.
4.  SI-PANDRI dijelaskan sesuai implementasi aktual.
5.  Ada gameplay sungguhan, bukan hanya slide.
6.  Mini-game memberikan evaluasi dan feedback.
7.  Simulasi biaya dihitung secara nyata.
8.  Source code Pascal dijelaskan berdasarkan kode aktual.
9.  Ruang pengujian membedakan simulasi dari test nyata.
10. Progress, XP, achievement, jurnal, dan penyimpanan berfungsi.
11. Mode Presentasi cocok digunakan di kelas.
12. UI konsisten, responsif, dan mudah dipahami.
13. Aset referensi tidak rusak atau terhapus.
14. Tidak ada klaim fitur yang tidak didukung.
15. Game bisa dijalankan dan diuji sesuai lingkungan yang tersedia.

## Konsistensi proyek

1.  Nama dan istilah SI-PANDRI konsisten.
2.  Game tidak menggambarkan fitur yang tidak ada sebagai fitur nyata.
3.  Dokumentasi menjelaskan aplikasi inti dan media presentasi secara
    terpisah.
4.  Semua keterbatasan penting ditulis secara jelas.
5.  Tidak ada perubahan destruktif yang tidak diperlukan.

------------------------------------------------------------------------

# 15. DOKUMENTASI DAN LAPORAN AKHIR

Setelah implementasi, perbarui dokumentasi yang relevan. README
setidaknya menjelaskan:

-   Apa itu SI-PANDRI.
-   Teknologi aplikasi inti.
-   Cara kompilasi dan menjalankan Pascal.
-   Cara menjalankan game secara lokal.
-   Struktur folder penting.
-   Cara mengakses Mode Presentasi.
-   Cara reset progres game.
-   Materi Dasar Pemrograman yang diterapkan dan lokasi contohnya.
-   Batasan simulasi dan fitur yang belum tersedia.
-   Cara publikasi ke GitHub Pages sesuai struktur repository.
-   Catatan pengujian yang benar-benar dilakukan.

Pada laporan akhir, sampaikan secara ringkas:

1.  Konsep dan alur game yang dibangun.
2.  File baru dan file yang diubah.
3.  Perbaikan pada aplikasi Pascal.
4.  Mekanisme gameplay yang benar-benar berfungsi.
5.  Fitur simulasi yang disediakan.
6.  Pengujian yang benar-benar dijalankan dan hasilnya.
7.  Cara menjalankan kedua komponen.
8.  Cara mempublikasikan game jika relevan.
9.  Masalah yang belum dapat diuji atau diselesaikan.
10. Fitur yang sengaja tidak ditambahkan karena di luar ruang lingkup.

Jangan menulis "semua sudah berhasil" tanpa bukti pemeriksaan yang
dilakukan. Bedakan antara selesai diimplementasikan, diuji secara
manual, diuji otomatis, dan belum diverifikasi.

------------------------------------------------------------------------

# 16. INSTRUKSI PENUTUP UNTUK CLAUDE CODE

Mulai dengan menginspeksi seluruh workspace relevan dan memahami kode
yang ada. Kemudian:

1.  Pertahankan pekerjaan lokal yang sudah ada.
2.  Sempurnakan aplikasi Pascal secara hati-hati tanpa overengineering.
3.  Buat game web SI-PANDRI yang memiliki cerita, maskot, gameplay,
    simulasi, materi akademik, progress, dan Mode Presentasi.
4.  Pastikan kedua komponen konsisten, tetapi tetap terpisah secara
    teknis.
5.  Jalankan pengujian yang tersedia.
6.  Perbaiki temuan nyata.
7.  Perbarui dokumentasi.
8.  Berikan laporan akhir yang jujur dan dapat diverifikasi.

**Jangan berhenti setelah membuat rencana. Jangan hanya memberikan saran
di chat. Lakukan implementasi langsung pada workspace.**

Hasil yang diinginkan adalah proyek SI-PANDRI yang tetap sederhana dan
mudah dijelaskan sebagai tugas Dasar Pemrograman, tetapi memiliki media
presentasi game yang menarik, asik dimainkan, mudah dipahami, dan
benar-benar membantu audiens memahami perjalanan dari masalah hingga
solusi.
