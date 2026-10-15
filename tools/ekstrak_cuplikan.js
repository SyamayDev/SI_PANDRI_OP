/* =====================================================================
   Mengambil cuplikan kode ASLI dari SI_PANDRI.pas untuk Babak 7 game.
   Cuplikan dicari berdasarkan teks penanda (bukan nomor baris tetap),
   lalu ditulis ke game/js/kode-pascal.js lengkap dengan nomor barisnya.

   node tools/ekstrak_cuplikan.js         -> membuat ulang kode-pascal.js
   node tools/ekstrak_cuplikan.js --cek   -> memeriksa kode-pascal.js masih
                                             sama persis dengan SI_PANDRI.pas
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'SI_PANDRI.pas');
const OUT = path.join(ROOT, 'game', 'js', 'kode-pascal.js');

// within: baris penanda tempat pencarian dimulai; start: baris awal cuplikan; lines: jumlah baris
const DEFS = {
  input: { judul: 'Input & output teks (BacaTeks)', segments: [{ within: 'function BacaTeks(', start: 'function BacaTeks(const prompt: string): string;', lines: 8 }] },
  validasi: { judul: 'Validasi angka dengan while-do (BacaReal)', segments: [{ within: 'function BacaReal(', start: '  while not valid do', lines: 18 }] },
  pilihLayanan: { judul: 'Percabangan case-of (PilihLayanan)', segments: [{ within: 'function PilihLayanan', start: '  case pilihan of', lines: 6 }] },
  hitung: { judul: 'Memilih tarif dan menghitung total', segments: [{ within: 'procedure InputBeratDanHitungBiaya', start: '  if SameText(p.layanan, LAYANAN_EXPRESS) then', lines: 9 }] },
  output: { judul: 'Output hasil penimbangan', segments: [{ within: 'procedure InputBeratDanHitungBiaya', start: "  Writeln('Berat aktual : ', TeksBerat(p.beratKg));", lines: 4 }] },
  ulangFor: { judul: 'Perulangan for-to-do + hak akses pesanan', segments: [{ within: 'procedure LihatPesananPelanggan', start: '    for i := 0 to FileSize(f) - 1 do', lines: 11 }] },
  menuRepeat: { judul: 'Menu berulang dengan repeat-until', segments: [
    { within: 'procedure MenuAdmin', start: '  repeat', lines: 3 },
    { within: 'procedure MenuAdmin', start: '  until pilihan = 11;', lines: 1 }] },
  statusUrut: { judul: 'Nested-if: status tidak boleh melompat', segments: [{ within: 'procedure UbahStatusCucian', start: '  if indeksBaru = indeksLama then', lines: 11 }] },
  syaratTimbang: { judul: 'Syarat: cucian harus ditimbang dulu', segments: [{ within: 'procedure UbahStatusCucian', start: '  if not p.sudahDitimbang then', lines: 6 }] },
  simpanFile: { judul: 'Menyimpan perubahan ke file lokal', segments: [{ within: 'procedure SimpanPerubahanPesanan', start: '  AssignFile(f, FILE_PESANAN);', lines: 8 }] },
  cariBreak: { judul: 'Pencarian ID dengan while-do dan Break', segments: [{ within: 'function CariPesananID', start: '    while not EOF(f) do', lines: 12 }] },
  recordPesanan: { judul: 'Tipe data record TPesanan', segments: [{ within: 'type', start: '  TPesanan = record', lines: 9 }] },
  linkWA: { judul: 'Menyusun tautan WhatsApp (tidak mengirim otomatis)', segments: [{ within: 'function LinkWhatsApp', start: 'function LinkWhatsApp(const nomor, pesan: string): string;', lines: 4 }] }
};

function ekstrak() {
  const lines = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n').split('\n');
  const hasil = {};
  for (const [id, def] of Object.entries(DEFS)) {
    hasil[id] = { judul: def.judul, segments: def.segments.map(seg => {
      const w = lines.findIndex(l => l.includes(seg.within));
      if (w < 0) throw new Error(`[${id}] penanda "${seg.within}" tidak ditemukan`);
      const s = lines.findIndex((l, i) => i >= w && l.trimEnd() === seg.start);
      if (s < 0) throw new Error(`[${id}] baris awal "${seg.start}" tidak ditemukan`);
      return { start: s + 1, lines: lines.slice(s, s + seg.lines) };
    }) };
  }
  return hasil;
}

function render(data) {
  return '/* File ini DIBUAT OTOMATIS oleh tools/ekstrak_cuplikan.js dari SI_PANDRI.pas.\n' +
    '   Jangan diedit manual. Nomor baris mengacu ke SI_PANDRI.pas. */\n' +
    'window.KODE_PASCAL = ' + JSON.stringify(data, null, 1) + ';\n';
}

const isi = render(ekstrak());
if (process.argv.includes('--cek')) {
  const lama = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
  if (lama === isi) {
    console.log('LULUS  Cuplikan kode di game sama persis dengan SI_PANDRI.pas (' + Object.keys(DEFS).length + ' cuplikan).');
  } else {
    console.log('GAGAL  game/js/kode-pascal.js tidak sesuai SI_PANDRI.pas. Jalankan: node tools/ekstrak_cuplikan.js');
    process.exit(1);
  }
} else {
  fs.writeFileSync(OUT, isi);
  console.log('Ditulis: ' + path.relative(ROOT, OUT));
}
