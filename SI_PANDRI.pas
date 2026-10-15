program SI_PANDRI;

{$mode objfpc}{$H+}

uses
  SysUtils{$IFDEF WINDOWS}, Windows{$ENDIF};

const
  FILE_PELANGGAN  = 'pandri_pelanggan.dat';
  FILE_PESANAN    = 'pandri_pesanan.dat';
  FILE_PENGATURAN = 'pandri_pengaturan.dat';

  USER_ADMIN = 'admin';
  PASS_ADMIN = 'admin123';

  STATUS_MENUNGGU_TIMBANG = 'Menunggu Ditimbang';
  STATUS_MENUNGGU_PROSES  = 'Menunggu Diproses';
  STATUS_PROSES           = 'Sedang Diproses';
  STATUS_SIAP             = 'Siap Diambil';
  STATUS_SELESAI          = 'Selesai/Diserahkan';
  BAYAR_BELUM             = 'Belum Dibayar';
  BAYAR_LUNAS             = 'Lunas';

  { FIX: Menambahkan konstanta untuk menghindari magic strings }
  METODE_TUNAI    = 'Tunai';
  METODE_TRANSFER = 'Transfer';
  LAYANAN_REGULER = 'Reguler';
  LAYANAN_EXPRESS = 'Express';

  { Kode warna ANSI untuk terminal: navy/biru, cyan, putih, hijau, kuning, merah }
  WARNA_NORMAL     = #27'[0m';
  WARNA_JUDUL      = #27'[1;96m';
  WARNA_BANNER     = #27'[1;97;44m';
  WARNA_SUKSES     = #27'[92m';
  WARNA_PERINGATAN = #27'[93m';
  WARNA_ERROR      = #27'[91m';

  LEBAR_LAYAR = 70;

type
  TPelanggan = record
    idPelanggan : string[10];
    nama        : string[50];
    nomorWA     : string[20];
    username    : string[20];
    password    : string[30];
  end;

  TPesanan = record
    idPesanan       : string[12];
    idPelanggan     : string[10];
    namaPelanggan   : string[50];
    nomorWA         : string[20];
    layanan         : string[12];
    beratKg         : Real;
    sudahDitimbang  : Boolean;
    totalBiaya      : Real;
    metodeBayar     : string[12];
    statusBayar     : string[20];
    statusCucian    : string[25];
    tanggalMasuk    : string[19];
    tanggalUpdate   : string[19];
  end;

  TPengaturan = record
    hargaReguler    : Real;
    hargaExpress    : Real;
    nomorWAAdmin    : string[20];
    namaBank        : string[25];
    nomorRekening   : string[30];
    pemilikRekening : string[50];
  end;

  TFilePelanggan  = file of TPelanggan;
  TFilePesanan    = file of TPesanan;
  TFilePengaturan = file of TPengaturan;

var
  Pengaturan: TPengaturan;
  FormatIndonesia: TFormatSettings;
  WarnaAktif: Boolean;

{ ===================== TAMPILAN TERMINAL ===================== }

{ Warna hanya dipakai jika terminal mendukung kode ANSI.
  Jika output dialihkan ke file, warna dimatikan agar teks tetap bersih. }
procedure AktifkanWarnaTerminal;
{$IFDEF WINDOWS}
var
  hOut: THandle;
  mode: DWORD;
{$ENDIF}
begin
  {$IFDEF WINDOWS}
  WarnaAktif := False;
  hOut := GetStdHandle(STD_OUTPUT_HANDLE);
  if GetConsoleMode(hOut, mode) then
    WarnaAktif := SetConsoleMode(hOut, mode or $0004); { ENABLE_VIRTUAL_TERMINAL_PROCESSING }
  {$ELSE}
  WarnaAktif := True;
  {$ENDIF}
end;

procedure Warna(const kode: string);
begin
  if WarnaAktif then
    Write(kode);
end;

procedure Garis;
begin
  Writeln('======================================================================');
end;

procedure GarisTipis;
begin
  Writeln('----------------------------------------------------------------------');
end;

procedure Judul(const teks: string);
begin
  Writeln;
  Warna(WARNA_JUDUL);
  Garis;
  Writeln('  ', teks);
  Garis;
  Warna(WARNA_NORMAL);
end;

procedure SubJudul(const teks: string);
begin
  Warna(WARNA_JUDUL);
  Writeln('[ ', teks, ' ]');
  Warna(WARNA_NORMAL);
end;

procedure PesanSukses(const teks: string);
begin
  Warna(WARNA_SUKSES);
  Writeln('[OK] ', teks);
  Warna(WARNA_NORMAL);
end;

procedure PesanPeringatan(const teks: string);
begin
  Warna(WARNA_PERINGATAN);
  Writeln('[!]  ', teks);
  Warna(WARNA_NORMAL);
end;

procedure PesanError(const teks: string);
begin
  Warna(WARNA_ERROR);
  Writeln('[X]  ', teks);
  Warna(WARNA_NORMAL);
end;

{ Membuat satu baris bingkai dengan teks di tengah. }
function BarisTengah(const teks: string): string;
var
  kiri, kanan: Integer;
begin
  kiri := (LEBAR_LAYAR - 2 - Length(teks)) div 2;
  kanan := LEBAR_LAYAR - 2 - Length(teks) - kiri;
  Result := '|' + StringOfChar(' ', kiri) + teks + StringOfChar(' ', kanan) + '|';
end;

procedure TampilkanBanner;
var
  bingkai: string;
begin
  bingkai := '+' + StringOfChar('-', LEBAR_LAYAR - 2) + '+';
  Writeln;
  Warna(WARNA_BANNER);
  Write(bingkai); Warna(WARNA_NORMAL); Writeln; Warna(WARNA_BANNER);
  Write(BarisTengah('S I - P A N D R I')); Warna(WARNA_NORMAL); Writeln; Warna(WARNA_BANNER);
  Write(BarisTengah('Sistem Pengelolaan Parfait Laundry')); Warna(WARNA_NORMAL); Writeln; Warna(WARNA_BANNER);
  Write(BarisTengah('Laundry Lebih Mudah, Lebih Teratur.')); Warna(WARNA_NORMAL); Writeln; Warna(WARNA_BANNER);
  Write(bingkai);
  Warna(WARNA_NORMAL);
  Writeln;
end;

procedure Jeda;
var
  tombol: Char;
begin
  Writeln;
  Write('Tekan ENTER untuk melanjutkan... ');
  Read(tombol);
  { Di terminal yang hanya mengirim LF, ENTER kosong sudah habis dibaca oleh Read. }
  if tombol <> #10 then
    Readln;
end;

{ ===================== INPUT DAN VALIDASI ===================== }

function BacaTeks(const prompt: string): string;
var
  teks: string;
begin
  Write(prompt);
  Readln(teks);
  Result := Trim(teks);
end;

function BacaInteger(const prompt: string; nilaiMin, nilaiMaks: Integer): Integer;
var
  teks: string;
  angka: Integer;
  valid: Boolean;
begin
  valid := False;
  angka := nilaiMin;
  while not valid do
  begin
    Write(prompt);
    Readln(teks);
    valid := TryStrToInt(Trim(teks), angka);
    if valid then
    begin
      if (angka < nilaiMin) or (angka > nilaiMaks) then
      begin
        PesanError('Pilihan harus berada di antara ' + IntToStr(nilaiMin) + ' dan ' +
          IntToStr(nilaiMaks) + '.');
        valid := False;
      end;
    end
    else
      PesanError('Input harus berupa angka bulat. Coba lagi.');
  end;
  Result := angka;
end;

function BacaReal(const prompt: string; nilaiMin, nilaiMaks: Real): Real;
var
  teks: string;
  angka: Real;
  valid: Boolean;
  formatInput: TFormatSettings;
begin
  valid := False;
  angka := nilaiMin;
  formatInput := DefaultFormatSettings;
  formatInput.DecimalSeparator := '.';

  while not valid do
  begin
    Write(prompt);
    Readln(teks);
    teks := StringReplace(Trim(teks), ',', '.', [rfReplaceAll]);
    valid := TryStrToFloat(teks, angka, formatInput);
    if valid then
    begin
      if (angka < nilaiMin) or (angka > nilaiMaks) then
      begin
        PesanError('Nilai harus antara ' + FormatFloat('0.##', nilaiMin, FormatIndonesia) +
          ' dan ' + FormatFloat('0.##', nilaiMaks, FormatIndonesia) + '.');
        valid := False;
      end;
    end
    else
      PesanError('Input angka tidak valid. Gunakan titik atau koma untuk desimal.');
  end;
  Result := angka;
end;

function Rupiah(nilai: Real): string;
begin
  Result := 'Rp ' + FormatFloat('#,##0', nilai, FormatIndonesia);
end;

function TeksBerat(berat: Real): string;
begin
  Result := FormatFloat('0.##', berat, FormatIndonesia) + ' kg';
end;

function TanggalSekarang: string;
begin
  Result := FormatDateTime('dd/mm/yyyy hh:nn', Now);
end;

{ Mengubah nomor seperti 0812-3456-7890 menjadi 6281234567890 (format wa.me). }
function NormalisasiNomorWA(const nomor: string): string;
var
  i: Integer;
  digit: string;
begin
  digit := '';
  for i := 1 to Length(nomor) do
    if nomor[i] in ['0'..'9'] then
      digit := digit + nomor[i];

  if digit = '' then
  begin
    Result := '';
    Exit;
  end;

  if Copy(digit, 1, 1) = '0' then
  begin
    Delete(digit, 1, 1);
    digit := '62' + digit;
  end
  else if Copy(digit, 1, 2) <> '62' then
    digit := '62' + digit;

  Result := digit;
end;

{ Huruf/angka dibiarkan; spasi dan simbol diubah ke kode %XX agar aman di URL. }
function EncodeURL(const teks: string): string;
var
  i: Integer;
  karakter: Char;
begin
  Result := '';
  for i := 1 to Length(teks) do
  begin
    karakter := teks[i];
    if karakter in ['A'..'Z', 'a'..'z', '0'..'9', '-', '_', '.', '~'] then
      Result := Result + karakter
    else if karakter = ' ' then
      Result := Result + '%20'
    else
      Result := Result + '%' + IntToHex(Ord(karakter), 2);
  end;
end;

function LinkWhatsApp(const nomor, pesan: string): string;
begin
  Result := 'https://wa.me/' + NormalisasiNomorWA(nomor) + '?text=' + EncodeURL(pesan);
end;

procedure TampilkanLinkWhatsApp(const nomor, pesan: string);
begin
  Writeln;
  PesanSukses('Pesan sudah disiapkan. Buka atau salin tautan berikut ke browser:');
  Writeln(LinkWhatsApp(nomor, pesan));
  Writeln;
  PesanPeringatan('Pesan belum terkirim otomatis. Periksa chat, lalu tekan tombol Kirim di WhatsApp.');
end;

function PilihLayanan: string;
var
  pilihan: Integer;
begin
  Writeln('Pilih layanan:');
  Writeln('1. Reguler  - ', Rupiah(Pengaturan.hargaReguler), ' per kg');
  Writeln('2. Express  - ', Rupiah(Pengaturan.hargaExpress), ' per kg');
  pilihan := BacaInteger('Pilihan layanan: ', 1, 2);
  case pilihan of
    1: Result := LAYANAN_REGULER;
    2: Result := LAYANAN_EXPRESS;
  else
    Result := LAYANAN_REGULER;
  end;
end;

function PilihMetodePembayaran: string;
var
  pilihan: Integer;
begin
  Writeln('Pilih metode pembayaran:');
  Writeln('1. Tunai (cash)');
  Writeln('2. Transfer bank');
  pilihan := BacaInteger('Metode pembayaran: ', 1, 2);
  case pilihan of
    1: Result := METODE_TUNAI;
    2: Result := METODE_TRANSFER;
  else
    Result := METODE_TUNAI;
  end;
end;

{ ===================== OPERASI FILE ===================== }

procedure SimpanPengaturan;
var
  f: TFilePengaturan;
begin
  AssignFile(f, FILE_PENGATURAN);
  try
    Rewrite(f);
    Write(f, Pengaturan);
  finally
    CloseFile(f);
  end;
end;

procedure IsiPengaturanBawaan;
begin
  Pengaturan.hargaReguler := 6000;
  Pengaturan.hargaExpress := 10000;
  Pengaturan.nomorWAAdmin := '6281234567890';
  Pengaturan.namaBank := 'BCA';
  Pengaturan.nomorRekening := '1234567890';
  Pengaturan.pemilikRekening := 'Parfait Laundry';
end;

procedure MuatPengaturan;
var
  f: TFilePengaturan;
begin
  if not FileExists(FILE_PENGATURAN) then
  begin
    IsiPengaturanBawaan;
    SimpanPengaturan;
  end
  else
  begin
    AssignFile(f, FILE_PENGATURAN);
    try
      Reset(f);
      if FileSize(f) > 0 then
        Read(f, Pengaturan)
      else
        IsiPengaturanBawaan;
    finally
      CloseFile(f);
    end;
  end;
end;

procedure SiapkanFileData;
var
  fPelanggan: TFilePelanggan;
  fPesanan: TFilePesanan;
begin
  if not FileExists(FILE_PELANGGAN) then
  begin
    AssignFile(fPelanggan, FILE_PELANGGAN);
    try Rewrite(fPelanggan); finally CloseFile(fPelanggan); end;
  end;

  if not FileExists(FILE_PESANAN) then
  begin
    AssignFile(fPesanan, FILE_PESANAN);
    try Rewrite(fPesanan); finally CloseFile(fPesanan); end;
  end;

  MuatPengaturan;
end;

function JumlahPelanggan: LongInt;
var
  f: TFilePelanggan;
begin
  Result := 0;
  if not FileExists(FILE_PELANGGAN) then Exit;
  AssignFile(f, FILE_PELANGGAN);
  try
    Reset(f);
    Result := FileSize(f);
  finally
    CloseFile(f);
  end;
end;

function JumlahPesanan: LongInt;
var
  f: TFilePesanan;
begin
  Result := 0;
  if not FileExists(FILE_PESANAN) then Exit;
  AssignFile(f, FILE_PESANAN);
  try
    Reset(f);
    Result := FileSize(f);
  finally
    CloseFile(f);
  end;
end;

{ ID dibuat dari jumlah data + 1, misalnya data ke-3 menjadi PD00003.
  Aman karena program tidak menghapus pesanan dari file. }
function BuatIDPelanggan: string;
begin
  Result := Format('PL%.4d', [JumlahPelanggan + 1]);
end;

function BuatIDPesanan: string;
begin
  Result := Format('PD%.5d', [JumlahPesanan + 1]);
end;

procedure TambahPelanggan(const pelanggan: TPelanggan);
var
  f: TFilePelanggan;
begin
  AssignFile(f, FILE_PELANGGAN);
  try
    Reset(f);
    Seek(f, FileSize(f));
    Write(f, pelanggan);
  finally
    CloseFile(f);
  end;
end;

procedure TambahPesanan(const pesanan: TPesanan);
var
  f: TFilePesanan;
begin
  AssignFile(f, FILE_PESANAN);
  try
    Reset(f);
    Seek(f, FileSize(f));
    Write(f, pesanan);
  finally
    CloseFile(f);
  end;
end;

{ Menimpa satu record pesanan pada posisinya (posisi didapat dari CariPesananID). }
procedure SimpanPerubahanPesanan(posisi: LongInt; const pesanan: TPesanan);
var
  f: TFilePesanan;
begin
  AssignFile(f, FILE_PESANAN);
  try
    Reset(f);
    if (posisi >= 0) and (posisi < FileSize(f)) then
    begin
      Seek(f, posisi);
      Write(f, pesanan);
    end;
  finally
    CloseFile(f);
  end;
end;

{ Pencarian berurutan: baca record satu per satu, berhenti (Break) saat cocok. }
function CariPelangganUsername(const username: string; var hasil: TPelanggan;
  var posisi: LongInt): Boolean;
var
  f: TFilePelanggan;
  data: TPelanggan;
  indeks: LongInt;
begin
  Result := False;
  posisi := -1;
  if not FileExists(FILE_PELANGGAN) then Exit;
  AssignFile(f, FILE_PELANGGAN);
  try
    Reset(f);
    indeks := 0;
    while not EOF(f) do
    begin
      Read(f, data);
      if SameText(Trim(data.username), Trim(username)) then
      begin
        hasil := data;
        posisi := indeks;
        Result := True;
        Break;
      end;
      Inc(indeks);
    end;
  finally
    CloseFile(f);
  end;
end;

function CariPesananID(const idPesanan: string; var hasil: TPesanan;
  var posisi: LongInt): Boolean;
var
  f: TFilePesanan;
  data: TPesanan;
  indeks: LongInt;
begin
  Result := False;
  posisi := -1;
  if not FileExists(FILE_PESANAN) then Exit;
  AssignFile(f, FILE_PESANAN);
  try
    Reset(f);
    indeks := 0;
    while not EOF(f) do
    begin
      Read(f, data);
      if SameText(Trim(data.idPesanan), Trim(idPesanan)) then
      begin
        hasil := data;
        posisi := indeks;
        Result := True;
        Break;
      end;
      Inc(indeks);
    end;
  finally
    CloseFile(f);
  end;
end;

{ ===================== TAMPILAN DATA PESANAN ===================== }

procedure TampilkanDetailPesanan(const p: TPesanan);
begin
  Garis;
  Writeln('ID Pesanan       : ', p.idPesanan);
  SubJudul('Pelanggan');
  Writeln('Nama Pelanggan   : ', p.namaPelanggan);
  Writeln('Nomor WhatsApp   : ', p.nomorWA);
  SubJudul('Layanan, Berat, dan Biaya');
  Writeln('Layanan          : ', p.layanan);
  if p.sudahDitimbang then
  begin
    Writeln('Berat Aktual     : ', TeksBerat(p.beratKg));
    Writeln('Total Biaya      : ', Rupiah(p.totalBiaya));
  end
  else
  begin
    Writeln('Berat Aktual     : Belum ditimbang oleh admin');
    Writeln('Total Biaya      : Menunggu hasil penimbangan');
  end;
  SubJudul('Pembayaran');
  Writeln('Metode Pembayaran: ', p.metodeBayar);
  Writeln('Status Pembayaran: ', p.statusBayar);
  SubJudul('Status dan Waktu');
  Writeln('Status Cucian    : ', p.statusCucian);
  Writeln('Tanggal Masuk    : ', p.tanggalMasuk);
  Writeln('Terakhir Diubah  : ', p.tanggalUpdate);
  Garis;
end;

{ Urutan tahap cucian: 0 Menunggu Ditimbang ... 4 Selesai/Diserahkan. }
function IndeksStatus(const status: string): Integer;
begin
  if status = STATUS_MENUNGGU_TIMBANG then
    Result := 0
  else if status = STATUS_MENUNGGU_PROSES then
    Result := 1
  else if status = STATUS_PROSES then
    Result := 2
  else if status = STATUS_SIAP then
    Result := 3
  else if status = STATUS_SELESAI then
    Result := 4
  else
    Result := -1;
end;

{ ===================== LOGIN DAN AKUN ===================== }

function LoginAdmin: Boolean;
var
  percobaan: Integer;
  username, password: string;
begin
  Judul('LOGIN ADMIN');
  percobaan := 0;
  Result := False;
  while (percobaan < 3) and (not Result) do
  begin
    username := BacaTeks('Username admin: ');
    password := BacaTeks('Password admin: ');
    if (username = USER_ADMIN) and (password = PASS_ADMIN) then
      Result := True
    else
    begin
      Inc(percobaan);
      PesanError('Username atau password salah. Percobaan ' + IntToStr(percobaan) + ' dari 3.');
    end;
  end;
  if Result then
    PesanSukses('Login admin berhasil.')
  else
    PesanError('Login gagal. Kembali ke menu utama.');
end;

procedure RegistrasiPelanggan;
var
  pelanggan, cek: TPelanggan;
  posisi: LongInt;
  nomorAsli: string;
  usernameValid: Boolean;
begin
  Judul('REGISTRASI PELANGGAN');
  pelanggan.idPelanggan := BuatIDPelanggan;
  pelanggan.nama := BacaTeks('Nama lengkap: ');
  while pelanggan.nama = '' do
  begin
    PesanError('Nama tidak boleh kosong.');
    pelanggan.nama := BacaTeks('Nama lengkap: ');
  end;

  nomorAsli := BacaTeks('Nomor WhatsApp (contoh 081234567890): ');
  pelanggan.nomorWA := NormalisasiNomorWA(nomorAsli);
  while (pelanggan.nomorWA = '') or (Length(pelanggan.nomorWA) < 10) do
  begin
    PesanError('Nomor WhatsApp belum valid. Masukkan kembali.');
    nomorAsli := BacaTeks('Nomor WhatsApp: ');
    pelanggan.nomorWA := NormalisasiNomorWA(nomorAsli);
  end;

  { Ulangi sampai username cukup panjang dan belum dipakai akun lain. }
  usernameValid := False;
  while not usernameValid do
  begin
    pelanggan.username := BacaTeks('Buat username (minimal 3 karakter): ');
    if Length(pelanggan.username) < 3 then
      PesanError('Username minimal 3 karakter.')
    else if CariPelangganUsername(pelanggan.username, cek, posisi) then
      PesanError('Username tersebut sudah digunakan. Pilih username lain.')
    else
      usernameValid := True;
  end;

  pelanggan.password := BacaTeks('Buat password (minimal 4 karakter): ');
  while Length(pelanggan.password) < 4 do
  begin
    PesanError('Password minimal 4 karakter.');
    pelanggan.password := BacaTeks('Buat password: ');
  end;

  TambahPelanggan(pelanggan);
  Writeln;
  PesanSukses('Registrasi berhasil!');
  Writeln('ID Pelanggan: ', pelanggan.idPelanggan);
  Writeln('Silakan login menggunakan username dan password yang baru dibuat.');
end;

function LoginPelanggan(var pelangganAktif: TPelanggan): Boolean;
var
  percobaan: Integer;
  username, password: string;
  data: TPelanggan;
  posisi: LongInt;
begin
  Judul('LOGIN PELANGGAN');
  Result := False;
  percobaan := 0;

  while (percobaan < 3) and (not Result) do
  begin
    username := BacaTeks('Username: ');
    password := BacaTeks('Password: ');

    if CariPelangganUsername(username, data, posisi) then
    begin
      if data.password = password then
      begin
        pelangganAktif := data;
        Result := True;
      end
      else
      begin
        Inc(percobaan);
        PesanError('Password salah. Percobaan ' + IntToStr(percobaan) + ' dari 3.');
      end;
    end
    else
    begin
      Inc(percobaan);
      PesanError('Username tidak ditemukan. Percobaan ' + IntToStr(percobaan) + ' dari 3.');
    end;
  end;

  if Result then
    PesanSukses('Selamat datang, ' + pelangganAktif.nama + '!')
  else
    PesanError('Login gagal.');
end;

{ ===================== MENU PELANGGAN ===================== }

procedure BuatPesanan(const pelangganAktif: TPelanggan);
var
  p: TPesanan;
  konfirmasi: string;
begin
  Judul('BUAT PESANAN LAUNDRY');
  Writeln('Data pelanggan yang digunakan:');
  Writeln('Nama         : ', pelangganAktif.nama);
  Writeln('WhatsApp     : ', pelangganAktif.nomorWA);
  Writeln;
  Writeln('Harga saat ini:');
  Writeln('Reguler: ', Rupiah(Pengaturan.hargaReguler), ' per kg');
  Writeln('Express: ', Rupiah(Pengaturan.hargaExpress), ' per kg');
  Writeln;
  PesanPeringatan('Berat dan total final baru ditentukan setelah admin menimbang cucian.');

  p.idPesanan := BuatIDPesanan;
  p.idPelanggan := pelangganAktif.idPelanggan;
  p.namaPelanggan := pelangganAktif.nama;
  p.nomorWA := pelangganAktif.nomorWA;
  p.layanan := PilihLayanan;
  p.metodeBayar := PilihMetodePembayaran;
  p.beratKg := 0;
  p.sudahDitimbang := False;
  p.totalBiaya := 0;
  p.statusBayar := BAYAR_BELUM;
  p.statusCucian := STATUS_MENUNGGU_TIMBANG;
  p.tanggalMasuk := TanggalSekarang;
  p.tanggalUpdate := TanggalSekarang;

  Writeln;
  SubJudul('Ringkasan pesanan');
  Writeln('ID pesanan : ', p.idPesanan);
  Writeln('Layanan    : ', p.layanan);
  Writeln('Pembayaran : ', p.metodeBayar);
  Writeln('Berat      : menunggu ditimbang admin');
  Writeln('Total      : menunggu berat aktual');
  konfirmasi := BacaTeks('Simpan pesanan ini? (Y untuk ya): ');

  if SameText(konfirmasi, 'Y') then
  begin
    TambahPesanan(p);
    PesanSukses('Pesanan berhasil disimpan. Catat ID pesanan: ' + p.idPesanan);
    Writeln('Silakan bawa cucian ke admin untuk ditimbang.');
  end
  else
    PesanPeringatan('Pesanan dibatalkan dan tidak disimpan.');
end;

procedure LihatPesananPelanggan(const pelangganAktif: TPelanggan);
var
  f: TFilePesanan;
  p: TPesanan;
  i: LongInt;
  ada: Boolean;
begin
  Judul('PESANAN SAYA');
  ada := False;
  if not FileExists(FILE_PESANAN) then
  begin
    Writeln('Kamu belum memiliki pesanan.');
    Exit;
  end;

  AssignFile(f, FILE_PESANAN);
  try
    Reset(f);
    for i := 0 to FileSize(f) - 1 do
    begin
      Seek(f, i);
      Read(f, p);
      { Hanya pesanan milik akun yang sedang login yang ditampilkan. }
      if p.idPelanggan = pelangganAktif.idPelanggan then
      begin
        ada := True;
        TampilkanDetailPesanan(p);
      end;
    end;
  finally
    CloseFile(f);
  end;

  if not ada then
    Writeln('Kamu belum memiliki pesanan.');
end;

procedure CekStatusPesananPelanggan(const pelangganAktif: TPelanggan);
var
  id: string;
  p: TPesanan;
  posisi: LongInt;
begin
  Judul('CEK STATUS CUCIAN');
  id := BacaTeks('Masukkan ID pesanan: ');
  if CariPesananID(id, p, posisi) then
  begin
    if p.idPelanggan = pelangganAktif.idPelanggan then
      TampilkanDetailPesanan(p)
    else
      PesanError('Pesanan tersebut bukan milik akun yang sedang login.');
  end
  else
    PesanError('ID pesanan tidak ditemukan. Periksa kembali ID yang dimasukkan.');
end;

procedure UbahMetodePembayaranPelanggan(const pelangganAktif: TPelanggan);
var
  id: string;
  p: TPesanan;
  posisi: LongInt;
begin
  Judul('UBAH METODE PEMBAYARAN');
  id := BacaTeks('Masukkan ID pesanan: ');
  if not CariPesananID(id, p, posisi) then
  begin
    PesanError('Pesanan tidak ditemukan.');
    Exit;
  end;

  if p.idPelanggan <> pelangganAktif.idPelanggan then
  begin
    PesanError('Pesanan tersebut bukan milik akun yang sedang login.');
    Exit;
  end;

  if p.statusBayar = BAYAR_LUNAS then
  begin
    PesanError('Metode pembayaran tidak dapat diubah karena pesanan sudah lunas.');
    Exit;
  end;

  Writeln('Metode sekarang: ', p.metodeBayar);
  p.metodeBayar := PilihMetodePembayaran;
  p.tanggalUpdate := TanggalSekarang;
  SimpanPerubahanPesanan(posisi, p);
  PesanSukses('Metode pembayaran diperbarui menjadi: ' + p.metodeBayar);
end;

procedure HubungiAdminUntukTransfer(const pelangganAktif: TPelanggan);
var
  id, pesan: string;
  p: TPesanan;
  posisi: LongInt;
begin
  Judul('HUBUNGI ADMIN UNTUK TRANSFER');
  id := BacaTeks('Masukkan ID pesanan: ');
  if not CariPesananID(id, p, posisi) then
  begin
    PesanError('Pesanan tidak ditemukan.');
    Exit;
  end;

  if p.idPelanggan <> pelangganAktif.idPelanggan then
  begin
    PesanError('Pesanan tersebut bukan milik akun yang sedang login.');
    Exit;
  end;

  if p.metodeBayar <> METODE_TRANSFER then
  begin
    PesanPeringatan('Pesanan ini tidak menggunakan metode transfer.');
    Writeln('Kamu dapat mengubah metode pembayaran jika pesanan belum lunas.');
    Exit;
  end;

  if not p.sudahDitimbang then
    PesanPeringatan('Biaya final belum tersedia karena cucian belum ditimbang.');

  pesan := 'Halo Admin SI-PANDRI, saya ingin meminta informasi pembayaran transfer.' + #10 +
           'ID Pesanan: ' + p.idPesanan + #10 +
           'Nama: ' + p.namaPelanggan + #10 +
           'Layanan: ' + p.layanan + #10;
  if p.sudahDitimbang then
    pesan := pesan + 'Berat aktual: ' + TeksBerat(p.beratKg) + #10 +
             'Total biaya: ' + Rupiah(p.totalBiaya) + #10;
  pesan := pesan + 'Mohon kirimkan nomor rekening dan petunjuk pembayaran. Terima kasih.';

  TampilkanLinkWhatsApp(Pengaturan.nomorWAAdmin, pesan);
end;

procedure MenuPelanggan(const pelangganAktif: TPelanggan);
var
  pilihan: Integer;
begin
  repeat
    Judul('MENU PELANGGAN - ' + pelangganAktif.nama);
    Writeln('1. Buat pesanan laundry');
    Writeln('2. Lihat semua pesanan saya');
    Writeln('3. Cek status berdasarkan ID');
    Writeln('4. Ubah metode pembayaran');
    Writeln('5. Hubungi admin untuk transfer via WhatsApp');
    GarisTipis;
    Writeln('6. Logout');
    pilihan := BacaInteger('Pilih menu: ', 1, 6);

    case pilihan of
      1: BuatPesanan(pelangganAktif);
      2: LihatPesananPelanggan(pelangganAktif);
      3: CekStatusPesananPelanggan(pelangganAktif);
      4: UbahMetodePembayaranPelanggan(pelangganAktif);
      5: HubungiAdminUntukTransfer(pelangganAktif);
      6: PesanSukses('Logout pelanggan berhasil.');
    else
      PesanError('Pilihan tidak valid.');
    end;

    if pilihan <> 6 then
      Jeda;
  until pilihan = 6;
end;

procedure GerbangPelanggan;
var
  pilihan: Integer;
  pelangganAktif: TPelanggan;
  loginBerhasil: Boolean;
begin
  repeat
    Judul('AKSES PELANGGAN');
    Writeln('1. Registrasi akun baru');
    Writeln('2. Login pelanggan');
    GarisTipis;
    Writeln('3. Kembali ke menu utama');
    pilihan := BacaInteger('Pilih menu: ', 1, 3);

    case pilihan of
      1: begin
           RegistrasiPelanggan;
           Jeda;
         end;
      2: begin
           loginBerhasil := LoginPelanggan(pelangganAktif);
           if loginBerhasil then
             MenuPelanggan(pelangganAktif)
           else
             Jeda;
         end;
      3: Writeln('Kembali ke menu utama.');
    else
      PesanError('Pilihan tidak valid.');
    end;
  until pilihan = 3;
end;

{ ===================== MENU ADMIN ===================== }

procedure TampilkanSemuaPesanan;
var
  f: TFilePesanan;
  p: TPesanan;
  i: LongInt;
  teksBeratKolom, teksTotal, teksBayar: string;
begin
  Judul('DAFTAR SEMUA PESANAN');
  if not FileExists(FILE_PESANAN) then Exit;
  AssignFile(f, FILE_PESANAN);
  try
    Reset(f);
    if FileSize(f) = 0 then
      Writeln('Belum ada pesanan yang tercatat.')
    else
    begin
      Writeln(Format('%-8s %-13s %-8s %7s %12s %-6s %-18s',
        ['ID', 'Nama', 'Layanan', 'Berat', 'Total', 'Bayar', 'Status cucian']));
      GarisTipis;
      for i := 0 to FileSize(f) - 1 do
      begin
        Seek(f, i);
        Read(f, p);
        if p.sudahDitimbang then
        begin
          teksBeratKolom := TeksBerat(p.beratKg);
          teksTotal := Rupiah(p.totalBiaya);
        end
        else
        begin
          teksBeratKolom := '-';
          teksTotal := 'belum';
        end;
        if p.statusBayar = BAYAR_LUNAS then
          teksBayar := 'Lunas'
        else
          teksBayar := 'Belum';
        Writeln(Format('%-8s %-13s %-8s %7s %12s %-6s %-18s',
          [p.idPesanan, Copy(p.namaPelanggan, 1, 13), p.layanan, teksBeratKolom,
           teksTotal, teksBayar, p.statusCucian]));
      end;
      GarisTipis;
      Writeln('Gunakan menu 6 (Cari pesanan) untuk melihat detail lengkap.');
    end;
  finally
    CloseFile(f);
  end;
end;

procedure InputBeratDanHitungBiaya;
var
  id: string;
  p: TPesanan;
  posisi: LongInt;
  hargaPerKg: Real;
  berat: Real;
begin
  Judul('INPUT BERAT AKTUAL DAN HITUNG BIAYA');
  id := BacaTeks('Masukkan ID pesanan: ');
  if not CariPesananID(id, p, posisi) then
  begin
    PesanError('Pesanan tidak ditemukan.');
    Exit;
  end;

  TampilkanDetailPesanan(p);

  { Pesanan lunas tidak boleh ditimbang ulang agar total yang sudah dibayar tidak berubah. }
  if p.statusBayar = BAYAR_LUNAS then
  begin
    PesanError('Pesanan sudah lunas. Berat dan total tidak dapat diubah lagi.');
    Exit;
  end;

  if p.sudahDitimbang then
  begin
    PesanPeringatan('Pesanan ini sudah ditimbang: ' + TeksBerat(p.beratKg) + ', total ' +
      Rupiah(p.totalBiaya) + '.');
    if not SameText(BacaTeks('Timbang ulang dan hitung ulang total? (Y untuk ya): '), 'Y') then
    begin
      Writeln('Data penimbangan tidak diubah.');
      Exit;
    end;
  end;

  berat := BacaReal('Masukkan berat aktual (kg): ', 0.01, 500);

  if SameText(p.layanan, LAYANAN_EXPRESS) then
    hargaPerKg := Pengaturan.hargaExpress
  else
    hargaPerKg := Pengaturan.hargaReguler;

  { Rumus inti: total biaya = berat aktual x tarif per kg layanan. }
  p.beratKg := berat;
  p.sudahDitimbang := True;
  p.totalBiaya := berat * hargaPerKg;
  if p.statusCucian = STATUS_MENUNGGU_TIMBANG then
    p.statusCucian := STATUS_MENUNGGU_PROSES;
  p.tanggalUpdate := TanggalSekarang;
  SimpanPerubahanPesanan(posisi, p);

  Writeln;
  PesanSukses('Data penimbangan berhasil disimpan.');
  Writeln('Berat aktual : ', TeksBerat(p.beratKg));
  Writeln('Tarif per kg : ', Rupiah(hargaPerKg));
  Writeln('Total biaya  : ', Rupiah(p.totalBiaya));
  Writeln('Status cucian: ', p.statusCucian);
end;

procedure PengaturanHargaDanTransfer;
var
  pilihan: Integer;
  teks, bankBaru, rekeningBaru, pemilikBaru: string;
  berubah: Boolean;
begin
  repeat
    Judul('PENGATURAN HARGA DAN TRANSFER');
    Writeln('Harga reguler      : ', Rupiah(Pengaturan.hargaReguler), ' per kg');
    Writeln('Harga express      : ', Rupiah(Pengaturan.hargaExpress), ' per kg');
    Writeln('Nomor WA admin     : ', Pengaturan.nomorWAAdmin);
    Writeln('Nama bank          : ', Pengaturan.namaBank);
    Writeln('Nomor rekening     : ', Pengaturan.nomorRekening);
    Writeln('Nama pemilik       : ', Pengaturan.pemilikRekening);
    Writeln;
    Writeln('1. Ubah harga reguler');
    Writeln('2. Ubah harga express');
    Writeln('3. Ubah nomor WhatsApp admin');
    Writeln('4. Ubah informasi rekening');
    GarisTipis;
    Writeln('5. Kembali');
    pilihan := BacaInteger('Pilih pengaturan: ', 1, 5);
    berubah := False;

    case pilihan of
      1: begin
           Pengaturan.hargaReguler := BacaReal('Harga reguler per kg: Rp ', 1, 10000000);
           berubah := True;
         end;
      2: begin
           Pengaturan.hargaExpress := BacaReal('Harga express per kg: Rp ', 1, 10000000);
           berubah := True;
         end;
      3: begin
           teks := BacaTeks('Nomor WhatsApp admin: ');
           teks := NormalisasiNomorWA(teks);
           if Length(teks) >= 10 then
           begin
             Pengaturan.nomorWAAdmin := teks;
             berubah := True;
           end
           else
             PesanError('Nomor tidak valid; perubahan dibatalkan.');
         end;
      4: begin
           bankBaru := BacaTeks('Nama bank: ');
           rekeningBaru := BacaTeks('Nomor rekening: ');
           pemilikBaru := BacaTeks('Nama pemilik rekening: ');
           if (bankBaru = '') or (rekeningBaru = '') or (pemilikBaru = '') then
             PesanError('Ada data kosong. Informasi rekening lama tetap dipakai.')
           else
           begin
             Pengaturan.namaBank := bankBaru;
             Pengaturan.nomorRekening := rekeningBaru;
             Pengaturan.pemilikRekening := pemilikBaru;
             berubah := True;
           end;
         end;
      5: Writeln('Kembali ke menu admin.');
    else
      PesanError('Pilihan tidak valid.');
    end;

    if berubah then
    begin
      SimpanPengaturan;
      PesanSukses('Pengaturan disimpan.');
      Writeln('Catatan: total pesanan yang sudah ditimbang tidak ikut berubah.');
    end;
    if pilihan <> 5 then
      Jeda;
  until pilihan = 5;
end;

procedure UbahStatusPembayaran;
var
  id: string;
  p: TPesanan;
  posisi: LongInt;
  pilihan: Integer;
  berubah: Boolean;
begin
  Judul('PERBARUI STATUS PEMBAYARAN');
  id := BacaTeks('Masukkan ID pesanan: ');
  if not CariPesananID(id, p, posisi) then
  begin
    PesanError('Pesanan tidak ditemukan.');
    Exit;
  end;

  TampilkanDetailPesanan(p);
  Writeln('1. Tandai Lunas');
  Writeln('2. Tandai Belum Dibayar');
  Writeln('3. Batal');
  pilihan := BacaInteger('Pilihan: ', 1, 3);
  berubah := False;

  case pilihan of
    1: begin
         if not p.sudahDitimbang then
           PesanError('Cucian belum ditimbang, jadi total biaya belum diketahui. Timbang dahulu.')
         else
         begin
           PesanPeringatan('Pastikan pembayaran tunai sudah diterima atau transfer sudah diverifikasi.');
           if SameText(BacaTeks('Sudah diverifikasi? (Y untuk ya): '), 'Y') then
           begin
             p.statusBayar := BAYAR_LUNAS;
             berubah := True;
           end
           else
             Writeln('Status tidak diubah.');
         end;
       end;
    2: begin
         p.statusBayar := BAYAR_BELUM;
         berubah := True;
       end;
    3: Writeln('Perubahan dibatalkan.');
  else
    PesanError('Pilihan tidak valid.');
  end;

  if berubah then
  begin
    p.tanggalUpdate := TanggalSekarang;
    SimpanPerubahanPesanan(posisi, p);
    PesanSukses('Status pembayaran sekarang: ' + p.statusBayar);
  end;
end;

procedure UbahStatusCucian;
var
  id, statusBaru: string;
  p: TPesanan;
  posisi: LongInt;
  pilihan, indeksLama, indeksBaru: Integer;
begin
  Judul('PERBARUI STATUS CUCIAN');
  id := BacaTeks('Masukkan ID pesanan: ');
  if not CariPesananID(id, p, posisi) then
  begin
    PesanError('Pesanan tidak ditemukan.');
    Exit;
  end;

  if not p.sudahDitimbang then
  begin
    PesanError('Status belum dapat diproses karena cucian belum ditimbang.');
    Writeln('Masukkan berat aktual terlebih dahulu.');
    Exit;
  end;

  Writeln('Status saat ini: ', p.statusCucian);
  Writeln('1. Menunggu Diproses');
  Writeln('2. Sedang Diproses');
  Writeln('3. Siap Diambil');
  Writeln('4. Selesai/Diserahkan');
  Writeln('5. Batal');
  pilihan := BacaInteger('Status baru: ', 1, 5);

  case pilihan of
    1: statusBaru := STATUS_MENUNGGU_PROSES;
    2: statusBaru := STATUS_PROSES;
    3: statusBaru := STATUS_SIAP;
    4: statusBaru := STATUS_SELESAI;
  else
    statusBaru := '';
  end;

  if statusBaru = '' then
  begin
    Writeln('Status tidak diubah.');
    Exit;
  end;

  { Status boleh maju satu tahap atau dikoreksi mundur, tetapi tidak boleh melompat. }
  indeksLama := IndeksStatus(p.statusCucian);
  indeksBaru := IndeksStatus(statusBaru);
  if indeksBaru = indeksLama then
  begin
    PesanPeringatan('Status yang dipilih sama dengan status saat ini. Tidak ada perubahan.');
    Exit;
  end
  else if indeksBaru > indeksLama + 1 then
  begin
    PesanError('Status tidak boleh melompati tahap. Dari "' + p.statusCucian +
      '" lanjutkan dulu ke tahap berikutnya.');
    Exit;
  end;

  if indeksBaru < indeksLama then
    PesanPeringatan('Status dikoreksi mundur ke tahap sebelumnya.');

  p.statusCucian := statusBaru;
  p.tanggalUpdate := TanggalSekarang;
  SimpanPerubahanPesanan(posisi, p);
  PesanSukses('Status cucian diperbarui menjadi: ' + p.statusCucian);
end;

procedure CariDanTampilkanPesanan;
var
  id: string;
  p: TPesanan;
  posisi: LongInt;
begin
  Judul('CARI PESANAN');
  id := BacaTeks('Masukkan ID pesanan: ');
  if CariPesananID(id, p, posisi) then
    TampilkanDetailPesanan(p)
  else
    PesanError('Pesanan tidak ditemukan.');
end;

procedure SiapkanPesanTagihanWhatsApp;
var
  id, pesan: string;
  p: TPesanan;
  posisi: LongInt;
begin
  Judul('SIAPKAN PESAN TAGIHAN WHATSAPP');
  id := BacaTeks('Masukkan ID pesanan: ');
  if not CariPesananID(id, p, posisi) then
  begin
    PesanError('Pesanan tidak ditemukan.');
    Exit;
  end;

  if not p.sudahDitimbang then
  begin
    PesanError('Cucian harus ditimbang terlebih dahulu sebelum total biaya dikirim.');
    Exit;
  end;

  if p.metodeBayar = METODE_TRANSFER then
    pesan := 'Halo ' + p.namaPelanggan + ', berikut informasi pesanan SI-PANDRI.' + #10 +
             'ID Pesanan: ' + p.idPesanan + #10 +
             'Berat: ' + TeksBerat(p.beratKg) + #10 +
             'Layanan: ' + p.layanan + #10 +
             'Total biaya: ' + Rupiah(p.totalBiaya) + #10 +
             'Metode: Transfer bank' + #10 +
             'Bank: ' + Pengaturan.namaBank + #10 +
             'Nomor rekening: ' + Pengaturan.nomorRekening + #10 +
             'Atas nama: ' + Pengaturan.pemilikRekening + #10 +
             'Mohon lakukan pembayaran dan kirim konfirmasi kepada admin. Status akan diperbarui setelah transfer diverifikasi. Terima kasih.'
  else
    pesan := 'Halo ' + p.namaPelanggan + ', berikut informasi pesanan SI-PANDRI.' + #10 +
             'ID Pesanan: ' + p.idPesanan + #10 +
             'Berat: ' + TeksBerat(p.beratKg) + #10 +
             'Layanan: ' + p.layanan + #10 +
             'Total biaya: ' + Rupiah(p.totalBiaya) + #10 +
             'Metode pembayaran: Tunai. Silakan lakukan pembayaran kepada admin sesuai kesepakatan. Terima kasih.';

  TampilkanLinkWhatsApp(p.nomorWA, pesan);
end;

procedure SiapkanPesanCucianSelesai;
var
  id, pesan: string;
  p: TPesanan;
  posisi: LongInt;
begin
  Judul('NOTIFIKASI CUCIAN SIAP DIAMBIL');
  id := BacaTeks('Masukkan ID pesanan: ');
  if not CariPesananID(id, p, posisi) then
  begin
    PesanError('Pesanan tidak ditemukan.');
    Exit;
  end;

  if (p.statusCucian <> STATUS_SIAP) and (p.statusCucian <> STATUS_SELESAI) then
  begin
    PesanError('Status cucian belum Siap Diambil. Periksa status sebelum mengirim notifikasi.');
    Exit;
  end;

  pesan := 'Halo ' + p.namaPelanggan + ', kami informasikan bahwa cucian kamu sudah siap diambil.' + #10 +
           'ID Pesanan: ' + p.idPesanan + #10 +
           'Layanan: ' + p.layanan + #10 +
           'Berat: ' + TeksBerat(p.beratKg) + #10 +
           'Total biaya: ' + Rupiah(p.totalBiaya) + #10 +
           'Status pembayaran: ' + p.statusBayar + #10 +
           'Silakan datang ke laundry untuk mengambil cucian. Terima kasih telah menggunakan SI-PANDRI.';
  TampilkanLinkWhatsApp(p.nomorWA, pesan);
end;

procedure LaporanAdmin;
var
  f: TFilePesanan;
  p: TPesanan;
  i: LongInt;
  jumlah, ditimbang, selesai, belumSelesai, lunas: Integer;
  totalPendapatan, totalBelumBayar: Real;
begin
  Judul('LAPORAN TRANSAKSI');
  jumlah := 0;
  ditimbang := 0;
  selesai := 0;
  belumSelesai := 0;
  lunas := 0;
  totalPendapatan := 0;
  totalBelumBayar := 0;

  if not FileExists(FILE_PESANAN) then Exit;
  AssignFile(f, FILE_PESANAN);
  try
    Reset(f);
    for i := 0 to FileSize(f) - 1 do
    begin
      Seek(f, i);
      Read(f, p);
      Inc(jumlah);
      if p.sudahDitimbang then
        Inc(ditimbang);
      if (p.statusCucian = STATUS_SELESAI) then
        Inc(selesai)
      else
        Inc(belumSelesai);

      if p.statusBayar = BAYAR_LUNAS then
      begin
        Inc(lunas);
        totalPendapatan := totalPendapatan + p.totalBiaya;
      end
      else if p.sudahDitimbang then
        totalBelumBayar := totalBelumBayar + p.totalBiaya;
    end;
  finally
    CloseFile(f);
  end;

  Writeln('Jumlah pesanan          : ', jumlah);
  Writeln('Pesanan sudah ditimbang : ', ditimbang);
  Writeln('Pesanan selesai         : ', selesai);
  Writeln('Pesanan belum selesai   : ', belumSelesai);
  Writeln('Pesanan berstatus lunas : ', lunas);
  Writeln('Pendapatan terkonfirmasi: ', Rupiah(totalPendapatan));
  Writeln('Tagihan belum lunas     : ', Rupiah(totalBelumBayar));
  Writeln;
  Writeln('Pendapatan dihitung dari transaksi yang status pembayarannya Lunas.');
end;

procedure TampilkanDaftarPelanggan;
var
  f: TFilePelanggan;
  p: TPelanggan;
  i: LongInt;
begin
  Judul('DAFTAR PELANGGAN');
  if not FileExists(FILE_PELANGGAN) then Exit;
  AssignFile(f, FILE_PELANGGAN);
  try
    Reset(f);
    if FileSize(f) = 0 then
      Writeln('Belum ada pelanggan terdaftar.')
    else
    begin
      for i := 0 to FileSize(f) - 1 do
      begin
        Seek(f, i);
        Read(f, p);
        Writeln(p.idPelanggan, ' | ', p.nama, ' | ', p.nomorWA, ' | username: ', p.username);
      end;
    end;
  finally
    CloseFile(f);
  end;
end;

procedure MenuAdmin;
var
  pilihan: Integer;
begin
  repeat
    Judul('MENU ADMIN SI-PANDRI');
    Writeln(' 1. Lihat semua pesanan');
    Writeln(' 2. Input berat aktual dan hitung biaya');
    Writeln(' 3. Pengaturan harga dan transfer');
    Writeln(' 4. Perbarui status pembayaran');
    Writeln(' 5. Perbarui status cucian');
    Writeln(' 6. Cari pesanan berdasarkan ID');
    Writeln(' 7. Siapkan pesan tagihan via WhatsApp');
    Writeln(' 8. Siapkan notifikasi cucian siap diambil');
    Writeln(' 9. Laporan transaksi');
    Writeln('10. Lihat daftar pelanggan');
    GarisTipis;
    Writeln('11. Logout');
    pilihan := BacaInteger('Pilih menu: ', 1, 11);

    case pilihan of
      1: TampilkanSemuaPesanan;
      2: InputBeratDanHitungBiaya;
      3: PengaturanHargaDanTransfer;
      4: UbahStatusPembayaran;
      5: UbahStatusCucian;
      6: CariDanTampilkanPesanan;
      7: SiapkanPesanTagihanWhatsApp;
      8: SiapkanPesanCucianSelesai;
      9: LaporanAdmin;
      10: TampilkanDaftarPelanggan;
      11: PesanSukses('Logout admin berhasil.');
    else
      PesanError('Pilihan tidak valid.');
    end;

    { Menu pengaturan sudah memiliki jeda sendiri di dalamnya. }
    if (pilihan <> 11) and (pilihan <> 3) then
      Jeda;
  until pilihan = 11;
end;

{ ===================== PROGRAM UTAMA ===================== }

var
  pilihanUtama: Integer;
begin
  FormatIndonesia := DefaultFormatSettings;
  FormatIndonesia.DecimalSeparator := ',';
  FormatIndonesia.ThousandSeparator := '.';

  AktifkanWarnaTerminal;
  SiapkanFileData;

  repeat
    TampilkanBanner;
    Writeln('  MENU UTAMA');
    Writeln('  1. Login Admin');
    Writeln('  2. Menu Pelanggan');
    Writeln('  3. Keluar');
    pilihanUtama := BacaInteger('Pilih menu utama: ', 1, 3);

    case pilihanUtama of
      1: begin
           if LoginAdmin then
             MenuAdmin
           else
             Jeda;
         end;
      2: GerbangPelanggan;
      3: PesanSukses('Terima kasih telah menggunakan SI-PANDRI.');
    else
      PesanError('Pilihan tidak valid.');
    end;
  until pilihanUtama = 3;
end.
