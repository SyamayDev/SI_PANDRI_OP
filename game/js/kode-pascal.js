/* File ini DIBUAT OTOMATIS oleh tools/ekstrak_cuplikan.js dari SI_PANDRI.pas.
   Jangan diedit manual. Nomor baris mengacu ke SI_PANDRI.pas. */
window.KODE_PASCAL = {
 "input": {
  "judul": "Input & output teks (BacaTeks)",
  "segments": [
   {
    "start": 198,
    "lines": [
     "function BacaTeks(const prompt: string): string;",
     "var",
     "  teks: string;",
     "begin",
     "  Write(prompt);",
     "  Readln(teks);",
     "  Result := Trim(teks);",
     "end;"
    ]
   }
  ]
 },
 "validasi": {
  "judul": "Validasi angka dengan while-do (BacaReal)",
  "segments": [
   {
    "start": 247,
    "lines": [
     "  while not valid do",
     "  begin",
     "    Write(prompt);",
     "    Readln(teks);",
     "    teks := StringReplace(Trim(teks), ',', '.', [rfReplaceAll]);",
     "    valid := TryStrToFloat(teks, angka, formatInput);",
     "    if valid then",
     "    begin",
     "      if (angka < nilaiMin) or (angka > nilaiMaks) then",
     "      begin",
     "        PesanError('Nilai harus antara ' + FormatFloat('0.##', nilaiMin, FormatIndonesia) +",
     "          ' dan ' + FormatFloat('0.##', nilaiMaks, FormatIndonesia) + '.');",
     "        valid := False;",
     "      end;",
     "    end",
     "    else",
     "      PesanError('Input angka tidak valid. Gunakan titik atau koma untuk desimal.');",
     "  end;"
    ]
   }
  ]
 },
 "pilihLayanan": {
  "judul": "Percabangan case-of (PilihLayanan)",
  "segments": [
   {
    "start": 352,
    "lines": [
     "  case pilihan of",
     "    1: Result := LAYANAN_REGULER;",
     "    2: Result := LAYANAN_EXPRESS;",
     "  else",
     "    Result := LAYANAN_REGULER;",
     "  end;"
    ]
   }
  ]
 },
 "hitung": {
  "judul": "Memilih tarif dan menghitung total",
  "segments": [
   {
    "start": 1101,
    "lines": [
     "  if SameText(p.layanan, LAYANAN_EXPRESS) then",
     "    hargaPerKg := Pengaturan.hargaExpress",
     "  else",
     "    hargaPerKg := Pengaturan.hargaReguler;",
     "",
     "  { Rumus inti: total biaya = berat aktual x tarif per kg layanan. }",
     "  p.beratKg := berat;",
     "  p.sudahDitimbang := True;",
     "  p.totalBiaya := berat * hargaPerKg;"
    ]
   }
  ]
 },
 "output": {
  "judul": "Output hasil penimbangan",
  "segments": [
   {
    "start": 1117,
    "lines": [
     "  Writeln('Berat aktual : ', TeksBerat(p.beratKg));",
     "  Writeln('Tarif per kg : ', Rupiah(hargaPerKg));",
     "  Writeln('Total biaya  : ', Rupiah(p.totalBiaya));",
     "  Writeln('Status cucian: ', p.statusCucian);"
    ]
   }
  ]
 },
 "ulangFor": {
  "judul": "Perulangan for-to-do + hak akses pesanan",
  "segments": [
   {
    "start": 835,
    "lines": [
     "    for i := 0 to FileSize(f) - 1 do",
     "    begin",
     "      Seek(f, i);",
     "      Read(f, p);",
     "      { Hanya pesanan milik akun yang sedang login yang ditampilkan. }",
     "      if p.idPelanggan = pelangganAktif.idPelanggan then",
     "      begin",
     "        ada := True;",
     "        TampilkanDetailPesanan(p);",
     "      end;",
     "    end;"
    ]
   }
  ]
 },
 "menuRepeat": {
  "judul": "Menu berulang dengan repeat-until",
  "segments": [
   {
    "start": 1495,
    "lines": [
     "  repeat",
     "    Judul('MENU ADMIN SI-PANDRI');",
     "    Writeln(' 1. Lihat semua pesanan');"
    ]
   },
   {
    "start": 1530,
    "lines": [
     "  until pilihan = 11;"
    ]
   }
  ]
 },
 "statusUrut": {
  "judul": "Nested-if: status tidak boleh melompat",
  "segments": [
   {
    "start": 1301,
    "lines": [
     "  if indeksBaru = indeksLama then",
     "  begin",
     "    PesanPeringatan('Status yang dipilih sama dengan status saat ini. Tidak ada perubahan.');",
     "    Exit;",
     "  end",
     "  else if indeksBaru > indeksLama + 1 then",
     "  begin",
     "    PesanError('Status tidak boleh melompati tahap. Dari \"' + p.statusCucian +",
     "      '\" lanjutkan dulu ke tahap berikutnya.');",
     "    Exit;",
     "  end;"
    ]
   }
  ]
 },
 "syaratTimbang": {
  "judul": "Syarat: cucian harus ditimbang dulu",
  "segments": [
   {
    "start": 1268,
    "lines": [
     "  if not p.sudahDitimbang then",
     "  begin",
     "    PesanError('Status belum dapat diproses karena cucian belum ditimbang.');",
     "    Writeln('Masukkan berat aktual terlebih dahulu.');",
     "    Exit;",
     "  end;"
    ]
   }
  ]
 },
 "simpanFile": {
  "judul": "Menyimpan perubahan ke file lokal",
  "segments": [
   {
    "start": 520,
    "lines": [
     "  AssignFile(f, FILE_PESANAN);",
     "  try",
     "    Reset(f);",
     "    if (posisi >= 0) and (posisi < FileSize(f)) then",
     "    begin",
     "      Seek(f, posisi);",
     "      Write(f, pesanan);",
     "    end;"
    ]
   }
  ]
 },
 "cariBreak": {
  "judul": "Pencarian ID dengan while-do dan Break",
  "segments": [
   {
    "start": 579,
    "lines": [
     "    while not EOF(f) do",
     "    begin",
     "      Read(f, data);",
     "      if SameText(Trim(data.idPesanan), Trim(idPesanan)) then",
     "      begin",
     "        hasil := data;",
     "        posisi := indeks;",
     "        Result := True;",
     "        Break;",
     "      end;",
     "      Inc(indeks);",
     "    end;"
    ]
   }
  ]
 },
 "recordPesanan": {
  "judul": "Tipe data record TPesanan",
  "segments": [
   {
    "start": 49,
    "lines": [
     "  TPesanan = record",
     "    idPesanan       : string[12];",
     "    idPelanggan     : string[10];",
     "    namaPelanggan   : string[50];",
     "    nomorWA         : string[20];",
     "    layanan         : string[12];",
     "    beratKg         : Real;",
     "    sudahDitimbang  : Boolean;",
     "    totalBiaya      : Real;"
    ]
   }
  ]
 },
 "linkWA": {
  "judul": "Menyusun tautan WhatsApp (tidak mengirim otomatis)",
  "segments": [
   {
    "start": 330,
    "lines": [
     "function LinkWhatsApp(const nomor, pesan: string): string;",
     "begin",
     "  Result := 'https://wa.me/' + NormalisasiNomorWA(nomor) + '?text=' + EncodeURL(pesan);",
     "end;"
    ]
   }
  ]
 }
};
