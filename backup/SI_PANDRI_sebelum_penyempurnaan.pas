program SI_PANDRI;

{$mode objfpc}{$H+}

uses
  SysUtils;

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

procedure Garis;
begin
  Writeln('======================================================================');
end;

procedure Judul(const teks: string);
begin
  Writeln;
  Garis;
  Writeln('  ', teks);
  Garis;
end;

procedure Jeda;
var
  tombol: Char;
begin
  Writeln;
  Write('Tekan satu karakter lalu ENTER untuk melanjutkan... ');
  Read(tombol);
  Readln;
end;

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
        Writeln('Pilihan harus berada di antara ', nilaiMin, ' dan ', nilaiMaks, '.');
        valid := False;
      end;
    end
    else
      Writeln('Input harus berupa angka bulat. Coba lagi.');
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
        Writeln('Nilai harus antara ', nilaiMin:0:2, ' dan ', nilaiMaks:0:2, '.');
        valid := False;
      end;
    end
    else
      Writeln('Input angka tidak valid. Gunakan titik atau koma untuk desimal.');
  end;
  Result := angka;
end;

function Rupiah(nilai: Real): string;
begin
  Result := 'Rp ' + FormatFloat('#,##0', nilai, FormatIndonesia);
end;

function TanggalSekarang: string;
begin
  Result := FormatDateTime('dd/mm/yyyy hh:nn', Now);
end;

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
  Writeln('Pesan sudah disiapkan. Buka atau salin tautan berikut ke browser:');
  Writeln(LinkWhatsApp(nomor, pesan));
  Writeln;
  Writeln('Catatan: pesan belum terkirim otomatis. Periksa chat, lalu tekan tombol Kirim di WhatsApp.');
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

procedure MuatPengaturan;
var
  f: TFilePengaturan;
begin
  if not FileExists(FILE_PENGATURAN) then
  begin
    Pengaturan.hargaReguler := 6000;
    Pengaturan.hargaExpress := 10000;
    Pengaturan.nomorWAAdmin := '6281234567890';
    Pengaturan.namaBank := 'BCA';
    Pengaturan.nomorRekening := '1234567890';
    Pengaturan.pemilikRekening := 'Parfait Laundry';
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
      begin
        Pengaturan.hargaReguler := 6000;
        Pengaturan.hargaExpress := 10000;
        Pengaturan.nomorWAAdmin := '6281234567890';
        Pengaturan.namaBank := 'BCA';
        Pengaturan.nomorRekening := '1234567890';
        Pengaturan.pemilikRekening := 'Parfait Laundry';
      end;
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

procedure TampilkanDetailPesanan(const p: TPesanan);
begin
  Garis;
  Writeln('ID Pesanan       : ', p.idPesanan);
  Writeln('Nama Pelanggan   : ', p.namaPelanggan);
  Writeln('Nomor WhatsApp   : ', p.nomorWA);
  Writeln('Layanan          : ', p.layanan);
  if p.sudahDitimbang then
  begin
    Writeln('Berat Aktual     : ', FormatFloat('0.##', p.beratKg, FormatIndonesia), ' kg');
    Writeln('Total Biaya      : ', Rupiah(p.totalBiaya));
  end
  else
  begin
    Writeln('Berat Aktual     : Belum ditimbang oleh admin');
    Writeln('Total Biaya      : Menunggu hasil penimbangan');
  end;
  Writeln('Metode Pembayaran: ', p.metodeBayar);
  Writeln('Status Pembayaran: ', p.statusBayar);
  Writeln('Status Cucian    : ', p.statusCucian);
  Writeln('Tanggal Masuk    : ', p.tanggalMasuk);
  Writeln('Terakhir Diubah  : ', p.tanggalUpdate);
  Garis;
end;

function StatusPendek(const status: string): string;
begin
  if status = STATUS_MENUNGGU_TIMBANG then
    Result := 'Menunggu Ditimbang'
  else if status = STATUS_MENUNGGU_PROSES then
    Result := 'Menunggu Diproses'
  else if status = STATUS_PROSES then
    Result := 'Sedang Diproses'
  else if status = STATUS_SIAP then
    Result := 'Siap Diambil'
  else if status = STATUS_SELESAI then
    Result := 'Selesai/Diserahkan'
  else
    Result := status;
end;

function LoginAdmin: Boolean;
var
  percobaan: Integer;
  username, password: string;
begin
  percobaan := 0;
  Result := False;
  while (percobaan < 3) and (not Result) do
  begin
    Writeln;
    username := BacaTeks('Username admin: ');
    password := BacaTeks('Password admin: ');
    if (username = USER_ADMIN) and (password = PASS_ADMIN) then
      Result := True
    else
    begin
      Inc(percobaan);
      Writeln('Username atau password salah. Percobaan ', percobaan, ' dari 3.');
    end;
  end;
  if Result then
    Writeln('Login admin berhasil.')
  else
    Writeln('Login gagal. Kembali ke menu utama.');
end;

procedure RegistrasiPelanggan;
var
  pelanggan, cek: TPelanggan;
  posisi: LongInt;
  nomorAsli: string;
begin
  Judul('REGISTRASI PELANGGAN');
  pelanggan.idPelanggan := BuatIDPelanggan;
  pelanggan.nama := BacaTeks('Nama lengkap: ');
  while pelanggan.nama = '' do
  begin
    Writeln('Nama tidak boleh kosong.');
    pelanggan.nama := BacaTeks('Nama lengkap: ');
  end;

  nomorAsli := BacaTeks('Nomor WhatsApp (contoh 081234567890): ');
  pelanggan.nomorWA := NormalisasiNomorWA(nomorAsli);
  while (pelanggan.nomorWA = '') or (Length(pelanggan.nomorWA) < 10) do
  begin
    Writeln('Nomor WhatsApp belum valid. Masukkan kembali.');
    nomorAsli := BacaTeks('Nomor WhatsApp: ');
    pelanggan.nomorWA := NormalisasiNomorWA(nomorAsli);
  end;

  pelanggan.username := BacaTeks('Buat username (minimal 3 karakter): ');
  while Length(pelanggan.username) < 3 do
  begin
    Writeln('Username minimal 3 karakter.');
    pelanggan.username := BacaTeks('Buat username: ');
  end;

  if CariPelangganUsername(pelanggan.username, cek, posisi) then
  begin
    Writeln('Username tersebut sudah digunakan. Silakan registrasi ulang dengan username berbeda.');
    Exit;
  end;

  pelanggan.password := BacaTeks('Buat password: ');
  while Length(pelanggan.password) < 4 do
  begin
    Writeln('Password minimal 4 karakter.');
    pelanggan.password := BacaTeks('Buat password: ');
  end;

  TambahPelanggan(pelanggan);
  Writeln;
  Writeln('Registrasi berhasil!');
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
  Result := False;
  percobaan := 0;

  while (percobaan < 3) and (not Result) do
  begin
    Writeln;
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
        Writeln('Password salah. Percobaan ', percobaan, ' dari 3.');
      end;
    end
    else
    begin
      Inc(percobaan);
      Writeln('Username tidak ditemukan. Percobaan ', percobaan, ' dari 3.');
    end;
  end;

  if Result then
    Writeln('Selamat datang, ', pelangganAktif.nama, '!')
  else
    Writeln('Login gagal.');
end;

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
  Writeln('Catatan: berat dan total final baru ditentukan setelah admin menimbang cucian.');

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
  Writeln('Ringkasan pesanan:');
  Writeln('ID pesanan : ', p.idPesanan);
  Writeln('Layanan    : ', p.layanan);
  Writeln('Pembayaran : ', p.metodeBayar);
  Writeln('Berat      : menunggu ditimbang admin');
  Writeln('Total      : menunggu berat aktual');
  konfirmasi := BacaTeks('Simpan pesanan ini? (Y untuk ya): ');

  if SameText(konfirmasi, 'Y') then
  begin
    TambahPesanan(p);
    Writeln('Pesanan berhasil disimpan. Catat ID pesanan: ', p.idPesanan);
    Writeln('Silakan bawa cucian ke admin untuk ditimbang.');
  end
  else
    Writeln('Pesanan dibatalkan dan tidak disimpan.');
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
      Writeln('Pesanan tersebut bukan milik akun yang sedang login.');
  end
  else
    Writeln('ID pesanan tidak ditemukan. Periksa kembali ID yang dimasukkan.');
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
    Writeln('Pesanan tidak ditemukan.');
    Exit;
  end;

  if p.idPelanggan <> pelangganAktif.idPelanggan then
  begin
    Writeln('Pesanan tersebut bukan milik akun yang sedang login.');
    Exit;
  end;

  if p.statusBayar = BAYAR_LUNAS then
  begin
    Writeln('Metode pembayaran tidak dapat diubah karena pesanan sudah lunas.');
    Exit;
  end;

  Writeln('Metode sekarang: ', p.metodeBayar);
  p.metodeBayar := PilihMetodePembayaran;
  p.tanggalUpdate := TanggalSekarang;
  SimpanPerubahanPesanan(posisi, p);
  Writeln('Metode pembayaran diperbarui menjadi: ', p.metodeBayar);
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
    Writeln('Pesanan tidak ditemukan.');
    Exit;
  end;

  if p.idPelanggan <> pelangganAktif.idPelanggan then
  begin
    Writeln('Pesanan tersebut bukan milik akun yang sedang login.');
    Exit;
  end;

  if p.metodeBayar <> METODE_TRANSFER then
  begin
    Writeln('Pesanan ini tidak menggunakan metode transfer.');
    Writeln('Kamu dapat mengubah metode pembayaran jika pesanan belum lunas.');
    Exit;
  end;

  if not p.sudahDitimbang then
    Writeln('Catatan: biaya final belum tersedia karena cucian belum ditimbang.');

  pesan := 'Halo Admin SI-PANDRI, saya ingin meminta informasi pembayaran transfer.' + #10 +
           'ID Pesanan: ' + p.idPesanan + #10 +
           'Nama: ' + p.namaPelanggan + #10 +
           'Layanan: ' + p.layanan + #10;
  if p.sudahDitimbang then
    pesan := pesan + 'Berat aktual: ' + FormatFloat('0.##', p.beratKg, FormatIndonesia) + ' kg' + #10 +
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
    Writeln('6. Logout');
    pilihan := BacaInteger('Pilih menu: ', 1, 6);

    case pilihan of
      1: BuatPesanan(pelangganAktif);
      2: LihatPesananPelanggan(pelangganAktif);
      3: CekStatusPesananPelanggan(pelangganAktif);
      4: UbahMetodePembayaranPelanggan(pelangganAktif);
      5: HubungiAdminUntukTransfer(pelangganAktif);
      6: Writeln('Logout pelanggan berhasil.');
    else
      Writeln('Pilihan tidak valid.');
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
      Writeln('Pilihan tidak valid.');
    end;
  until pilihan = 3;
end;

procedure TampilkanSemuaPesanan;
var
  f: TFilePesanan;
  p: TPesanan;
  i: LongInt;
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
      for i := 0 to FileSize(f) - 1 do
      begin
        Seek(f, i);
        Read(f, p);
        Writeln('ID: ', p.idPesanan, ' | ', p.namaPelanggan, ' | ', p.layanan,
          ' | ', p.statusCucian, ' | ', p.statusBayar);
        if p.sudahDitimbang then
          Writeln('   Berat: ', FormatFloat('0.##', p.beratKg, FormatIndonesia), ' kg | Total: ', Rupiah(p.totalBiaya))
        else
          Writeln('   Berat dan total belum ditentukan (menunggu admin menimbang).');
        Writeln;
      end;
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
    Writeln('Pesanan tidak ditemukan.');
    Exit;
  end;

  TampilkanDetailPesanan(p);
  berat := BacaReal('Masukkan berat aktual (kg): ', 0.01, 500);

  if SameText(p.layanan, LAYANAN_EXPRESS) then
    hargaPerKg := Pengaturan.hargaExpress
  else
    hargaPerKg := Pengaturan.hargaReguler;

  p.beratKg := berat;
  p.sudahDitimbang := True;
  p.totalBiaya := berat * hargaPerKg;
  if p.statusCucian = STATUS_MENUNGGU_TIMBANG then
    p.statusCucian := STATUS_MENUNGGU_PROSES;
  p.tanggalUpdate := TanggalSekarang;
  SimpanPerubahanPesanan(posisi, p);

  Writeln;
  Writeln('Data penimbangan berhasil disimpan.');
  Writeln('Berat aktual : ', FormatFloat('0.##', p.beratKg, FormatIndonesia), ' kg');
  Writeln('Tarif per kg : ', Rupiah(hargaPerKg));
  Writeln('Total biaya  : ', Rupiah(p.totalBiaya));
  Writeln('Status cucian: ', p.statusCucian);
end;

procedure PengaturanHargaDanTransfer;
var
  pilihan: Integer;
  teks: string;
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
    Writeln('5. Kembali');
    pilihan := BacaInteger('Pilih pengaturan: ', 1, 5);

    case pilihan of
      1: Pengaturan.hargaReguler := BacaReal('Harga reguler per kg: Rp ', 1, 10000000);
      2: Pengaturan.hargaExpress := BacaReal('Harga express per kg: Rp ', 1, 10000000);
      3: begin
           teks := BacaTeks('Nomor WhatsApp admin: ');
           teks := NormalisasiNomorWA(teks);
           if Length(teks) >= 10 then
             Pengaturan.nomorWAAdmin := teks
           else
             Writeln('Nomor tidak valid; perubahan dibatalkan.');
         end;
      4: begin
           Pengaturan.namaBank := BacaTeks('Nama bank: ');
           Pengaturan.nomorRekening := BacaTeks('Nomor rekening: ');
           Pengaturan.pemilikRekening := BacaTeks('Nama pemilik rekening: ');
           if (Pengaturan.namaBank = '') or (Pengaturan.nomorRekening = '') or
              (Pengaturan.pemilikRekening = '') then
             Writeln('Peringatan: ada data kosong. Periksa kembali pengaturan rekening.');
         end;
      5: Writeln('Kembali ke menu admin.');
    else
      Writeln('Pilihan tidak valid.');
    end;

    if pilihan <> 5 then
    begin
      SimpanPengaturan;
      Writeln('Pengaturan disimpan.');
      Jeda;
    end;
  until pilihan = 5;
end;

procedure UbahStatusPembayaran;
var
  id: string;
  p: TPesanan;
  posisi: LongInt;
  pilihan: Integer;
begin
  Judul('PERBARUI STATUS PEMBAYARAN');
  id := BacaTeks('Masukkan ID pesanan: ');
  if not CariPesananID(id, p, posisi) then
  begin
    Writeln('Pesanan tidak ditemukan.');
    Exit;
  end;

  TampilkanDetailPesanan(p);
  Writeln('1. Tandai Lunas');
  Writeln('2. Tandai Belum Dibayar');
  Writeln('3. Batal');
  pilihan := BacaInteger('Pilihan: ', 1, 3);

  case pilihan of
    1: begin
         Writeln('Pastikan pembayaran tunai sudah diterima atau transfer sudah diverifikasi.');
         if SameText(BacaTeks('Sudah diverifikasi? (Y untuk ya): '), 'Y') then
           p.statusBayar := BAYAR_LUNAS
         else
           Writeln('Status tidak diubah.');
       end;
    2: p.statusBayar := BAYAR_BELUM;
    3: Writeln('Perubahan dibatalkan.');
  else
    Writeln('Pilihan tidak valid.');
  end;

  if pilihan in [1, 2] then
  begin
    p.tanggalUpdate := TanggalSekarang;
    SimpanPerubahanPesanan(posisi, p);
    Writeln('Status pembayaran sekarang: ', p.statusBayar);
  end;
end;

procedure UbahStatusCucian;
var
  id: string;
  p: TPesanan;
  posisi: LongInt;
  pilihan: Integer;
begin
  Judul('PERBARUI STATUS CUCIAN');
  id := BacaTeks('Masukkan ID pesanan: ');
  if not CariPesananID(id, p, posisi) then
  begin
    Writeln('Pesanan tidak ditemukan.');
    Exit;
  end;

  if not p.sudahDitimbang then
  begin
    Writeln('Status belum dapat diproses karena cucian belum ditimbang.');
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
    1: p.statusCucian := STATUS_MENUNGGU_PROSES;
    2: p.statusCucian := STATUS_PROSES;
    3: p.statusCucian := STATUS_SIAP;
    4: p.statusCucian := STATUS_SELESAI;
    5: Writeln('Status tidak diubah.');
  else
    Writeln('Pilihan tidak valid.');
  end;

  if pilihan <> 5 then
  begin
    p.tanggalUpdate := TanggalSekarang;
    SimpanPerubahanPesanan(posisi, p);
    Writeln('Status cucian diperbarui menjadi: ', p.statusCucian);
  end;
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
    Writeln('Pesanan tidak ditemukan.');
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
    Writeln('Pesanan tidak ditemukan.');
    Exit;
  end;

  if not p.sudahDitimbang then
  begin
    Writeln('Cucian harus ditimbang terlebih dahulu sebelum total biaya dikirim.');
    Exit;
  end;

  if p.metodeBayar = METODE_TRANSFER then
    pesan := 'Halo ' + p.namaPelanggan + ', berikut informasi pesanan SI-PANDRI.' + #10 +
             'ID Pesanan: ' + p.idPesanan + #10 +
             'Berat: ' + FormatFloat('0.##', p.beratKg, FormatIndonesia) + ' kg' + #10 +
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
             'Berat: ' + FormatFloat('0.##', p.beratKg, FormatIndonesia) + ' kg' + #10 +
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
    Writeln('Pesanan tidak ditemukan.');
    Exit;
  end;

  if (p.statusCucian <> STATUS_SIAP) and (p.statusCucian <> STATUS_SELESAI) then
  begin
    Writeln('Status cucian belum Siap Diambil. Periksa status sebelum mengirim notifikasi.');
    Exit;
  end;

  pesan := 'Halo ' + p.namaPelanggan + ', kami informasikan bahwa cucian kamu sudah siap diambil.' + #10 +
           'ID Pesanan: ' + p.idPesanan + #10 +
           'Layanan: ' + p.layanan + #10 +
           'Berat: ' + FormatFloat('0.##', p.beratKg, FormatIndonesia) + ' kg' + #10 +
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
    Writeln('1. Lihat semua pesanan');
    Writeln('2. Input berat aktual dan hitung biaya');
    Writeln('3. Pengaturan harga dan transfer');
    Writeln('4. Perbarui status pembayaran');
    Writeln('5. Perbarui status cucian');
    Writeln('6. Cari pesanan berdasarkan ID');
    Writeln('7. Siapkan pesan tagihan via WhatsApp');
    Writeln('8. Siapkan notifikasi cucian siap diambil');
    Writeln('9. Laporan transaksi');
    Writeln('10. Lihat daftar pelanggan');
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
      11: Writeln('Logout admin berhasil.');
    else
      Writeln('Pilihan tidak valid.');
    end;

    if pilihan <> 11 then
      Jeda;
  until pilihan = 11;
end;

var
  pilihanUtama: Integer;
begin
  FormatIndonesia := DefaultFormatSettings;
  FormatIndonesia.DecimalSeparator := ',';
  FormatIndonesia.ThousandSeparator := '.';

  SiapkanFileData;

  repeat
    Judul('SI-PANDRI - SISTEM PENGELOLAAN PARFAIT LAUNDRY');
    Writeln('Laundry lebih mudah, lebih teratur.');
    Writeln;
    Writeln('1. Login Admin');
    Writeln('2. Menu Pelanggan');
    Writeln('3. Keluar');
    pilihanUtama := BacaInteger('Pilih menu utama: ', 1, 3);

    case pilihanUtama of
      1: begin
           if LoginAdmin then
             MenuAdmin
           else
             Jeda;
         end;
      2: GerbangPelanggan;
      3: Writeln('Terima kasih telah menggunakan SI-PANDRI.');
    else
      Writeln('Pilihan tidak valid.');
    end;
  until pilihanUtama = 3;
end.