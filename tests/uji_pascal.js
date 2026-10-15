/* =====================================================================
   Uji skenario otomatis untuk aplikasi Pascal SI-PANDRI.
   - Mengompilasi SI_PANDRI.pas ke folder sementara (butuh fpc di PATH),
     atau memakai SI_PANDRI.exe yang sudah ada bila fpc tidak tersedia.
   - Menjalankan program dengan input dari skrip (stdin), di folder
     sementara, sehingga file .dat asli di folder proyek TIDAK disentuh.
   - Setiap skenario dijalankan sebagai proses terpisah sehingga
     penyimpanan file lokal (persistensi) ikut teruji.
   Cara pakai:  node tests/uji_pascal.js
   ===================================================================== */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'SI_PANDRI.pas');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'sipandri-uji-'));
const exeName = process.platform === 'win32' ? 'SI_PANDRI.exe' : 'SI_PANDRI';
const exe = path.join(work, exeName);

function siapkanProgram() {
  const fpc = spawnSync('fpc', ['-v0', '-FE' + work, '-FU' + work, SRC], { encoding: 'utf8' });
  if (fpc.status === 0 && fs.existsSync(exe)) return 'dikompilasi ulang dari SI_PANDRI.pas';
  const ada = path.join(ROOT, exeName);
  if (!fs.existsSync(ada)) {
    console.error('fpc tidak tersedia dan executable tidak ditemukan.');
    process.exit(2);
  }
  fs.copyFileSync(ada, exe);
  return 'memakai ' + exeName + ' yang sudah ada (fpc tidak tersedia)';
}

let lulus = 0, gagal = 0;
function jalankan(nama, baris, harapan, tidakBoleh = []) {
  const input = baris.join('\r\n') + '\r\n';
  const r = spawnSync(exe, [], { cwd: work, input, encoding: 'latin1', timeout: 15000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const hasil = [];
  if (r.error || r.status !== 0) hasil.push(`program tidak berhenti normal (status ${r.status}${r.error ? ', ' + r.error.code : ''})`);
  harapan.forEach(h => { if (!out.includes(h)) hasil.push('tidak ditemukan: "' + h + '"'); });
  tidakBoleh.forEach(h => { if (out.includes(h)) hasil.push('tidak seharusnya muncul: "' + h + '"'); });
  if (hasil.length === 0) { lulus++; console.log('  LULUS  ' + nama); }
  else {
    gagal++; console.log('  GAGAL  ' + nama);
    hasil.forEach(h => console.log('         - ' + h));
    fs.writeFileSync(path.join(work, 'gagal-' + (lulus + gagal) + '.txt'), out);
  }
  return out;
}

const ADMIN = ['1', 'admin', 'admin123'];
const KELUAR_ADMIN = ['11', '3'];

console.log('SI-PANDRI · uji skenario aplikasi Pascal');
console.log('Program : ' + siapkanProgram());
console.log('Folder  : ' + work + '\n');

jalankan('Menu utama menolak input bukan angka dan di luar rentang',
  ['x', '9', '3'],
  ['Input harus berupa angka bulat', 'Pilihan harus berada di antara 1 dan 3', 'Terima kasih telah menggunakan SI-PANDRI']);

jalankan('Login admin: password salah lalu benar',
  ['1', 'admin', 'salah', 'admin', 'admin123', '11', '3'],
  ['Username atau password salah. Percobaan 1 dari 3', 'Login admin berhasil', 'Logout admin berhasil']);

jalankan('Login admin gagal 3 kali kembali ke menu utama',
  ['1', 'a', 'b', 'c', 'd', 'e', 'f', '', '3'],
  ['Percobaan 3 dari 3', 'Login gagal. Kembali ke menu utama']);

jalankan('Registrasi pelanggan dengan validasi nama, WA, username, password',
  ['2', '1', '', 'Budi Santoso', '12', '0812-0000-1111', 'ab', 'budi', '12', '1234', '', '3', '3'],
  ['Nama tidak boleh kosong', 'Nomor WhatsApp belum valid', 'Username minimal 3 karakter',
   'Password minimal 4 karakter', 'Registrasi berhasil', 'ID Pelanggan: PL0001']);

jalankan('Registrasi menolak username yang sudah dipakai',
  ['2', '1', 'Sari Dewi', '081200002222', 'budi', 'sari', 'abcd', '', '3', '3'],
  ['Username tersebut sudah digunakan', 'ID Pelanggan: PL0002']);

jalankan('Login pelanggan gagal 3 kali',
  ['2', '2', 'budi', 'x', 'budi', 'y', 'tidakada', 'z', '', '3', '3'],
  ['Password salah. Percobaan 1 dari 3', 'Username tidak ditemukan. Percobaan 3 dari 3', 'Login gagal.']);

jalankan('Pelanggan membuat pesanan Reguler/Tunai, Express/Transfer, dan membatalkan satu',
  ['2', '2', 'budi', '1234',
   '1', '1', '1', 'Y', '',
   '1', '2', '2', 'Y', '',
   '1', '1', '1', 'n', '',
   '2', '',
   '6', '3', '3'],
  ['Selamat datang, Budi Santoso', 'Catat ID pesanan: PD00001', 'Catat ID pesanan: PD00002',
   'Pesanan dibatalkan dan tidak disimpan', 'Belum ditimbang oleh admin', 'Menunggu Ditimbang']);

jalankan('Admin menimbang: nol, negatif, teks ditolak; 3,5 kg Reguler = Rp 21.000',
  [...ADMIN, '2', 'PD00001', '0', '-1', 'abc', '3,5', '', ...KELUAR_ADMIN],
  ['Nilai harus antara 0,01 dan 500', 'Input angka tidak valid', 'Berat aktual : 3,5 kg',
   'Tarif per kg : Rp 6.000', 'Total biaya  : Rp 21.000', 'Status cucian: Menunggu Diproses']);

jalankan('Status pembayaran & cucian: aturan urutan dan prasyarat penimbangan',
  [...ADMIN,
   '4', 'PD00002', '1', '',
   '5', 'PD00002', '',
   '5', 'PD00001', '3', '',
   '5', 'PD00001', '2', '',
   '8', 'PD00001', '',
   '5', 'PD00001', '3', '',
   '5', 'PD00001', '3', '',
   '5', 'PD00001', '2', '',
   '5', 'PD00001', '3', '',
   '8', 'PD00001', '',
   ...KELUAR_ADMIN],
  ['Cucian belum ditimbang, jadi total biaya belum diketahui',
   'Status belum dapat diproses karena cucian belum ditimbang',
   'Status tidak boleh melompati tahap',
   'Status cucian diperbarui menjadi: Sedang Diproses',
   'Status cucian belum Siap Diambil',
   'Status cucian diperbarui menjadi: Siap Diambil',
   'sama dengan status saat ini',
   'Status dikoreksi mundur',
   'https://wa.me/6281200001111?text=Halo%20Budi%20Santoso',
   'Pesan belum terkirim otomatis']);

jalankan('Ubah tarif tidak mengubah total pesanan lama; rekening kosong ditolak',
  [...ADMIN, '3', '1', '7000', '', '4', '', 'x', 'y', '', '5', '6', 'PD00001', '', ...KELUAR_ADMIN],
  ['Pengaturan disimpan', 'Harga reguler      : Rp 7.000 per kg',
   'Ada data kosong. Informasi rekening lama tetap dipakai', 'Nama bank          : BCA',
   'Total Biaya      : Rp 21.000']);

jalankan('Express 2,5 kg = Rp 25.000; tagihan transfer; lunas; timbang ulang dijaga',
  [...ADMIN,
   '2', 'PD00002', '2,5', '',
   '7', 'PD00002', '',
   '4', 'PD00002', '1', 'n', '',
   '4', 'PD00002', '1', 'Y', '',
   '2', 'PD00002', '',
   '2', 'PD00001', 'n', '',
   ...KELUAR_ADMIN],
  ['Total biaya  : Rp 25.000', 'Nomor%20rekening%3A%201234567890', 'Status tidak diubah.',
   'Status pembayaran sekarang: Lunas', 'Pesanan sudah lunas. Berat dan total tidak dapat diubah',
   'Pesanan ini sudah ditimbang: 3,5 kg', 'Data penimbangan tidak diubah']);

jalankan('Daftar pesanan, laporan, dan daftar pelanggan (data tersimpan antar-proses)',
  [...ADMIN, '1', '', '9', '', '10', '', ...KELUAR_ADMIN],
  ['Status cucian', 'PD00001', 'Rp 21.000', 'Siap Diambil', 'Lunas',
   'Jumlah pesanan          : 2', 'Pesanan berstatus lunas : 1',
   'Pendapatan terkonfirmasi: Rp 25.000', 'Tagihan belum lunas     : Rp 21.000',
   'PL0001 | Budi Santoso', 'PL0002 | Sari Dewi']);

jalankan('Pelanggan lain tidak dapat melihat atau memakai pesanan milik akun lain',
  ['2', '2', 'sari', 'abcd', '3', 'PD00001', '', '2', '', '5', 'PD00001', '', '4', 'PD00001', '', '6', '3', '3'],
  ['Pesanan tersebut bukan milik akun yang sedang login', 'Kamu belum memiliki pesanan'],
  ['Total Biaya      : Rp 21.000']);

jalankan('Pemilik pesanan: cek status, tautan WA ke admin, metode bayar terkunci saat lunas',
  ['2', '2', 'budi', '1234', '3', 'PD00001', '', '5', 'PD00002', '', '5', 'PD00001', '', '4', 'PD00002', '', '6', '3', '3'],
  ['Status Cucian    : Siap Diambil', 'https://wa.me/6281234567890?text=',
   'Pesanan ini tidak menggunakan metode transfer',
   'Metode pembayaran tidak dapat diubah karena pesanan sudah lunas']);

console.log(`\nHasil: ${lulus} lulus, ${gagal} gagal dari ${lulus + gagal} skenario.`);
if (gagal) console.log('Output skenario yang gagal disimpan di ' + work);
else fs.rmSync(work, { recursive: true, force: true });
process.exit(gagal ? 1 : 0);
