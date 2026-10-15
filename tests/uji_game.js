/* =====================================================================
   Uji otomatis game SI-PANDRI: Misi Laundry Beres! di Chrome/Edge headless.
   Tanpa dependensi npm: memakai Chrome DevTools Protocol lewat WebSocket
   bawaan Node.js 22+.

   node tests/uji_game.js                 -> jalankan semua pemeriksaan
   node tests/uji_game.js --shots <dir>   -> juga simpan tangkapan layar

   Yang diperiksa: tidak ada error JavaScript, gating babak di Mode Cerita,
   umpan balik jawaban salah, seluruh cerita bisa ditamatkan lewat UI,
   XP tidak bertambah saat babak diulang, progres tersimpan setelah reload,
   Mode Presenter tidak mengubah save, reset progres, dan tidak ada
   overflow horizontal di beberapa ukuran layar.
   Variabel lingkungan CHROME_PATH dapat menunjuk ke browser lain.
   ===================================================================== */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const PAGE = pathToFileURL(path.join(ROOT, 'game', 'index.html')).href;
const shotsIdx = process.argv.indexOf('--shots');
const SHOTS = shotsIdx > 0 ? path.resolve(process.argv[shotsIdx + 1]) : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

function cariChrome() {
  const calon = [process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  return calon.find(p => fs.existsSync(p));
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

let lulus = 0, gagal = 0;
function cek(nama, kondisi, info = '') {
  if (kondisi) { lulus++; console.log('  LULUS  ' + nama); }
  else { gagal++; console.log('  GAGAL  ' + nama + (info ? ' — ' + info : '')); }
}

async function main() {
  const chrome = cariChrome();
  if (!chrome) { console.error('Chrome/Edge tidak ditemukan. Set CHROME_PATH.'); process.exit(2); }
  if (typeof WebSocket === 'undefined') { console.error('Butuh Node.js 22+ (WebSocket bawaan).'); process.exit(2); }
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'sipandri-chrome-'));
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--allow-file-access-from-files', `--remote-debugging-port=${port}`, `--user-data-dir=${profil}`, 'about:blank'], { stdio: 'ignore' });
  const batas = setTimeout(() => { console.log('  GAGAL  Batas waktu uji (7 menit) habis'); proc.kill(); process.exit(1); }, 420000);
  batas.unref();

  let target = null;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(200);
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch (e) { /* belum siap */ }
  }
  if (!target) { console.error('Tidak dapat terhubung ke browser.'); proc.kill(); process.exit(2); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  let nextId = 0;
  const waiting = new Map(), errors = [];
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' '));
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(m.params.entry.text + ' ' + (m.params.entry.url || ''));
  });
  const send = (method, params = {}) => new Promise(res => { const id = ++nextId; waiting.set(id, res); ws.send(JSON.stringify({ id, method, params })); });
  const ev = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) throw new Error('evaluate: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 400));
    return r.result && r.result.result ? r.result.result.value : undefined;
  };
  const viewport = (w, h, mobile = false) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
  const shot = async (nama) => {
    if (!SHOTS) return;
    const r = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(SHOTS, nama + '.png'), Buffer.from(r.result.data, 'base64'));
  };
  const tunggu = async (expr, ms = 8000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { if (await ev(expr)) return true; await sleep(60); }
    return false;
  };
  const muat = async () => {
    await send('Page.navigate', { url: PAGE });
    await tunggu('document.readyState === "complete" && !!window.G && !!window.G.prog');
    await sleep(150);
  };
  const noOverflow = () => ev('document.documentElement.scrollWidth <= window.innerWidth + 1 && document.body.scrollWidth <= window.innerWidth + 1');

  // Pemain otomatis di halaman: lanjut dialog, pilih "mendengarkan", dan memakai jalur solve misi.
  const AUTO = `window.__autoStep = function () {
      if (!document.querySelector('#title-screen').hidden) return 'title';
      if (document.querySelector('dialog[open]')) return 'modal';
      const ch = [...document.querySelectorAll('#dlg-choices button')];
      if (ch.length) { (ch.find(b => /mendengarkan/.test(b.textContent)) || ch[0]).click(); return 'choice'; }
      if (G.pending) { G.advance(); G.advance(); return 'say'; }
      if (G.cur && G.cur.api && G.cur.api.solve) { G.cur.api.solve(); return 'solve'; }
      return 'idle';
    };`;
  const mainkanSampai = async (kondisi, maks = 4000) => {
    for (let i = 0; i < maks; i++) {
      if (await ev(kondisi)) return true;
      await ev('window.__autoStep()');
      await sleep(25);
    }
    return false;
  };

  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await viewport(1600, 900);
  await muat();
  await ev('localStorage.clear()');
  await muat();
  await ev(AUTO);
  await ev(`G.settings.speed = 'instan'; G.settings.reduce = true; G.settings.sound = false; G.persist(); G.applySettings();`);

  console.log('SI-PANDRI · uji game di browser headless');
  console.log('Halaman: ' + PAGE + '\n');

  // 0. Layar mulai (ketukan pertama membuka layar penuh)
  cek('Layar "ketuk untuk mulai" tampil saat game dibuka', await ev(`!document.querySelector('#splash').hidden && document.body.classList.contains('splash-on')`));
  await shot('00-layar-mulai');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  cek('Tombol apa pun menutup layar mulai dan fokus ke menu', await tunggu(`document.querySelector('#splash').hidden && document.activeElement && document.activeElement.closest('.game-menu')`));
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
  cek('Panah bawah memindah pilihan menu', await ev(`document.activeElement.id === 'btn-presenter-start'`));

  // 1. Layar judul
  cek('Layar judul tampil dengan 4 tokoh', await ev(`!document.querySelector('#title-screen').hidden && document.querySelectorAll('#title-cast canvas').length === 4`));
  cek('Aset font lokal termuat', await ev(`document.fonts.ready.then(() => document.fonts.check('16px "Pixelify Sans"') && document.fonts.check('16px "Atkinson Hyperlegible"'))`));
  cek('Cuplikan kode Pascal termuat (13 cuplikan)', await ev(`Object.keys(window.KODE_PASCAL).length === 13`));
  cek('Semua baris kode di mini-game Babak 7 ditemukan di cuplikan asli', await ev(`DATA.B7_FUNGSI.every(f => G.findLine(f.kode, f.baris))`));
  cek('Tidak ada pixel kuning (bros) di bawah dagu Bu Ratna', await ev(`(() => {
      const d = ART.sprite('ratna', 'smile').getContext('2d').getImageData(20, 31, 9, 6).data;
      for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] > 160 && d[i + 2] < 120) return false;
      return true;
    })()`));
  await shot('01-judul-1600');

  // 2. Gating Mode Cerita
  cek('Babak 2 terkunci sebelum Babak 1 selesai', await ev(`!G.isUnlocked(1) && G.actStatus(1) === 'terkunci'`));
  await ev(`document.querySelectorAll('.pip')[1].click()`);
  cek('Klik babak terkunci membuka peta dengan status Terkunci', await tunggu(`document.querySelector('#dlg-map').open && document.querySelectorAll('.map-item')[1].classList.contains('terkunci')`));
  await ev(`document.querySelector('#dlg-map').close()`);

  // 3. Mulai cerita + umpan balik jawaban salah
  await ev(`document.querySelector('#btn-start').click()`);
  cek('Mulai Cerita membuka Babak 1', await tunggu(`G.actIndex === 0 && document.querySelector('#title-screen').hidden`));
  await mainkanSampai(`!!(G.cur && G.cur.api && document.querySelector('.pick-grid'))`);
  await shot('02-babak1-misi');
  await ev(`[...document.querySelectorAll('.card-btn')].find(b => b.textContent.includes('Total biaya')).click()`);
  cek('Jawaban salah ditandai dan dijelaskan (bukan sekadar "Salah")', await ev(`document.querySelector('.card-btn.is-wrong') && /Total baru diketahui setelah cucian ditimbang/.test(document.querySelector('#dlg-text').textContent)`));
  cek('Misi tidak selesai hanya karena menekan tombol (tombol Lanjut tersembunyi saat misi)', await ev(`document.querySelector('#btn-next').hidden && !!G.cur`));
  await ev(`document.querySelector('#hud-home').click()`);
  cek('Progres per bagian tersimpan sebelum babak selesai', await ev(`JSON.parse(localStorage.getItem('sipandri-misi-laundry-v1')).progress.started === true`));
  await ev(`document.querySelector('#btn-continue').click()`);

  // 4. Tamatkan Babak 1 dan periksa XP
  const b1 = await mainkanSampai(`G.prog.completed[0] === true && !!document.querySelector('#act-kicker') && /selesai/.test(document.querySelector('#act-kicker').textContent)`);
  cek('Babak 1 dapat diselesaikan', b1);
  const xp1 = await ev('G.save.xp');
  cek('XP Babak 1 = 50 (4 misi)', xp1 === 50, 'XP=' + xp1);
  cek('Babak 2 terbuka setelah Babak 1 selesai', await ev('G.isUnlocked(1)'));
  await shot('03-babak1-selesai');
  // Ulangi babak 1: XP tidak boleh bertambah
  await ev(`[...document.querySelectorAll('#act-foot button')].find(b => /Ulangi/.test(b.textContent)).click()`);
  await tunggu('G.actIndex === 0 && !G.cur');
  await mainkanSampai(`/selesai/.test((document.querySelector('#act-kicker') || {}).textContent || '') && !document.querySelector('#activity').hidden`);
  cek('Mengulang babak tidak menambah XP (anti-farming)', (await ev('G.save.xp')) === 50, 'XP=' + await ev('G.save.xp'));
  cek('Kartu babak selesai menyebut XP tidak ditambah lagi', await ev(`/XP tidak ditambah lagi/.test(document.querySelector('#act-body').textContent)`));

  // 5. Tamatkan seluruh cerita lewat UI
  const shotsPerAct = {};
  for (let i = 1; i < 9; i++) {
    await ev(`[...document.querySelectorAll('#act-foot button')].find(b => /Lanjut ke Babak/.test(b.textContent)).click()`);
    await tunggu(`G.actIndex === ${i}`);
    if (SHOTS) {
      await mainkanSampai(`!!(G.cur && G.cur.api)`, 400);
      await shot(`04-babak${i + 1}-misi`);
      shotsPerAct[i] = true;
    }
    const ok = await mainkanSampai(`G.prog.completed[${i}] === true && /selesai/.test((document.querySelector('#act-kicker') || {}).textContent || '') && !document.querySelector('#activity').hidden`);
    cek(`Babak ${i + 1} dapat diselesaikan`, ok);
    if (!ok) { console.log('         (berhenti di babak ' + (i + 1) + ', bagian ' + await ev('G.partIndex') + ')'); break; }
  }
  const akhir = await ev(`({ selesai: G.save.completed.filter(Boolean).length, xp: G.save.xp, ach: Object.keys(G.save.achievements).length, jurnal: Object.keys(G.save.journal).length })`);
  cek('Kesembilan babak selesai', akhir.selesai === 9, JSON.stringify(akhir));
  cek('Semua 11 achievement terbuka setelah tamat', akhir.ach === 11, JSON.stringify(akhir));
  cek('Jurnal berisi catatan dari 9 babak', akhir.jurnal === 9, JSON.stringify(akhir));
  const xpTamat = akhir.xp;
  await ev(`document.querySelector('#act-foot .btn-primary').click()`);
  cek('Tombol akhir membuka Jurnal Perjalanan', await tunggu(`document.querySelector('#dlg-journal').open && document.querySelectorAll('#journal-entries .entry').length === 9`));
  await shot('05-jurnal');
  await ev(`document.querySelector('#dlg-journal').close()`);

  // 6. Reload: progres tetap ada
  await muat(); await ev(AUTO);
  await ev(`document.querySelector('#splash').click()`);
  await tunggu(`document.querySelector('#splash').hidden`);
  cek('Setelah reload, progres dan XP tetap tersimpan', await ev(`G.save.completed.filter(Boolean).length === 9 && G.save.xp === ${xpTamat}`));
  cek('Layar judul menawarkan main lagi', await ev(`!document.querySelector('#btn-continue').hidden`));

  // 7. Mode Presenter: lompat ke Babak 5 langkah 3, selesaikan, save tidak berubah
  const saveSebelum = await ev(`localStorage.getItem('sipandri-misi-laundry-v1')`);
  await ev(`document.querySelector('#btn-presenter-start').click()`);
  cek('Mode Presenter membuka peta dengan semua babak terbuka', await tunggu(`G.mode === 'presenter' && document.querySelector('#dlg-map').open && !document.querySelector('.map-item.terkunci')`));
  cek('Peta presenter menampilkan tombol langkah Babak 5', await ev(`[...document.querySelectorAll('#map-list button')].some(b => /3\\. Cucian ditimbang/.test(b.textContent))`));
  await ev(`[...document.querySelectorAll('#map-list button')].find(b => /3\\. Cucian ditimbang/.test(b.textContent)).click()`);
  cek('Lompat langsung ke Babak 5, langkah 3', await tunggu(`G.actIndex === 4 && G.partIndex === 2`));
  cek('Bilah presenter tampil', await ev(`!document.querySelector('#presenter-bar').hidden && !document.querySelector('#hud-mode').hidden`));
  await mainkanSampai(`!!document.querySelector('.scale-game')`, 400);
  await shot('06-presenter-timbang');
  await ev(`document.querySelector('#pb-notes').click()`);
  cek('Catatan presenter berisi ringkasan dan kalimat transisi', await ev(`!document.querySelector('#notes').hidden && /Kalimat transisi/.test(document.querySelector('#notes-body').textContent)`));
  await shot('07-presenter-catatan');
  await ev(`document.querySelector('#notes-close').click()`);
  // jawaban salah di timbangan: angka valid tetapi tidak sama dengan timbangan
  await ev(`document.querySelectorAll('.cloth').forEach(b => b.click())`);
  await ev(`{ const f = document.querySelector('.num-form'); f.querySelector('input').value = '0'; f.requestSubmit(); }`);
  cek('Validasi berat 0 memakai pesan aplikasi Pascal', await tunggu(`/Nilai harus antara 0,01 dan 500/.test(document.querySelector('.num-form .feedback').textContent)`));
  await ev(`{ const f = document.querySelector('.num-form'); f.querySelector('input').value = 'abc'; f.requestSubmit(); }`);
  cek('Validasi berat bukan angka', await tunggu(`/Input angka tidak valid/.test(document.querySelector('.num-form .feedback').textContent)`));
  await ev(`{ const f = document.querySelector('.num-form'); f.querySelector('input').value = '4'; f.requestSubmit(); }`);
  cek('Berat valid tapi beda dengan timbangan ditolak dengan penjelasan', await tunggu(`/tidak sama dengan timbangan/.test(document.querySelector('.num-form .feedback').textContent)`));
  await ev(`document.querySelector('#pb-solve').click()`);
  cek('Tombol "Tampilkan jawaban" menyelesaikan misi aktif', await tunggu(`G.prog.sim && G.prog.sim.berat === 3.5`));
  await mainkanSampai(`G.partIndex === 3 && !!document.querySelector('.formula.big')`, 600);
  await ev(`{ const f = document.querySelector('.num-form'); f.querySelector('input').value = '20000'; f.requestSubmit(); }`);
  cek('Hitung total salah memberi petunjuk bertahap', await tunggu(`/Pecah saja/.test(document.querySelector('.num-form .feedback').textContent)`));
  await ev(`{ const f = document.querySelector('.num-form'); f.querySelector('input').value = '21.000'; f.requestSubmit(); }`);
  cek('Total dihitung nyata: 3,5 kg × Rp 6.000 = Rp 21.000', await tunggu(`G.prog.sim.total === 21000 && /Total biaya  : Rp 21.000/.test(document.querySelector('#act-body').textContent)`));
  await shot('08-presenter-hitung');
  await mainkanSampai(`G.partIndex === 4 && !!document.querySelector('.status-row')`, 800);
  await ev(`[...document.querySelectorAll('.status-btn')].find(b => /Selesai/.test(b.textContent)).click()`);
  cek('Status tidak boleh melompati tahap (aturan yang sama dengan Pascal)', await ev(`/Status tidak boleh melompati tahap/.test(document.querySelector('.status-row + .feedback').textContent)`));
  await shot('09-status');
  const progSesudah = await ev(`JSON.stringify(JSON.parse(localStorage.getItem('sipandri-misi-laundry-v1')).progress)`);
  cek('Mode Presenter tidak mengubah save Mode Cerita', progSesudah === JSON.stringify(JSON.parse(saveSebelum).progress));
  const progSave = await ev(`JSON.parse(localStorage.getItem('sipandri-misi-laundry-v1')).progress`);
  cek('XP dan babak selesai di save tetap sama setelah presenter', progSave.xp === xpTamat && progSave.completed.filter(Boolean).length === 9);
  // 7b. Jalur pemain manual (masih di Mode Presenter, jadi save tidak terpengaruh)
  const lompat = async (babak, bagian) => {
    await ev(`void G.runAct(${babak}, ${bagian}); true`);
    await tunggu(`G.actIndex === ${babak} && G.partIndex === ${bagian}`);
  };
  await lompat(1, 0);
  await mainkanSampai(`document.querySelectorAll('#dlg-choices button').length > 0`, 300);
  await ev(`[...document.querySelectorAll('#dlg-choices button')].find(b => /canggih/.test(b.textContent)).click()`);
  cek('Babak 2: pilihan "aplikasi canggih" dijelaskan Sarah, lalu pilihan muncul lagi', await tunggu(`/fitur yang tidak dibutuhkan/.test(document.querySelector('#dlg-text').textContent)`) &&
    await mainkanSampai(`document.querySelectorAll('#dlg-choices button').length === 3`, 50));
  await lompat(4, 0);
  await mainkanSampai(`!!document.querySelector('.reg-form')`, 300);
  await ev(`{ const f = document.querySelector('.reg-form'); f.nama.value = ''; f.wa.value = '12'; f.username.value = 'lala'; f.password.value = '12'; f.requestSubmit(); }`);
  cek('Registrasi: nama kosong, WA pendek, username terpakai, password pendek ditolak', await tunggu(`(() => { const t = document.querySelector('.reg-out').textContent; return /Nama tidak boleh kosong/.test(t) && /Nomor WhatsApp belum valid/.test(t) && /sudah digunakan/.test(t) && /Password minimal 4/.test(t); })()`));
  await lompat(4, 1);
  await mainkanSampai(`!!document.querySelector('.order-form')`, 300);
  await ev(`document.querySelector('.opt[data-v="Express"]').click(); document.querySelector('.opt[data-v="Tunai"]').click();`);
  await ev(`[...document.querySelectorAll('.order-sum button')].find(b => b.textContent === 'Batal').click()`);
  cek('Buat pesanan: Batal tidak menyimpan pesanan', await ev(`/Pesanan dibatalkan dan tidak disimpan/.test(document.querySelector('.order-sum').textContent) && G.prog.sim.layanan !== 'Express'`));
  await ev(`[...document.querySelectorAll('.order-sum button')].find(b => /Simpan/.test(b.textContent)).click()`);
  cek('Buat pesanan: Y menyimpan PD00001 Express/Tunai', await tunggu(`G.prog.sim.id === 'PD00001' && G.prog.sim.layanan === 'Express' && G.prog.sim.metode === 'Tunai' && G.prog.sim.status === 'Menunggu Ditimbang'`));
  await lompat(4, 3);
  await mainkanSampai(`!!document.querySelector('.formula.big')`, 300);
  cek('Langkah biaya memakai tarif Express (3,5 × Rp 10.000)', await ev(`/Rp 10\\.000 \\/ kg/.test(document.querySelector('.formula.big').textContent)`));
  await lompat(4, 6);
  await mainkanSampai(`!!document.querySelector('.admin-actions')`, 300);
  await ev(`[...document.querySelectorAll('.admin-actions .menu-item')].find(b => /notifikasi/.test(b.textContent)).click()`);
  cek('Notifikasi sebelum status Siap Diambil ditolak seperti di Pascal', await tunggu(`/Status cucian belum Siap Diambil/.test(document.querySelector('.action-out').textContent)`));
  await lompat(3, 1);
  await mainkanSampai(`!!document.querySelector('.menu-term')`, 300);
  await ev(`[...document.querySelectorAll('.menu-item')].find(b => /Login Admin/.test(b.textContent)).click()`);
  await ev(`[...document.querySelectorAll('.menu-item')].find(b => /Lihat semua pesanan/.test(b.textContent)).click()`);
  cek('Jelajah menu: menu lain menampilkan penjelasan tanpa menyelesaikan misi', await ev(`/Tabel ringkas/.test(document.querySelector('.menu-desc').textContent) && !document.querySelector('.quest-item.done')`));
  await ev(`[...document.querySelectorAll('.menu-item')].find(b => /Input berat aktual/.test(b.textContent)).click()`);
  cek('Jelajah menu: Menu Admin → 2 menjawab pertanyaan pertama', await ev(`document.querySelectorAll('.quest-item.done').length === 1`));
  await lompat(5, 0);
  await mainkanSampai(`!!document.querySelector('.sort-card')`, 300);
  await ev(`[...document.querySelector('.sort-card').querySelectorAll('button')].find(b => /Sesudah/.test(b.textContent)).click()`);
  cek('Kelompokkan: kategori salah diberi penjelasan', await ev(`/kurang tepat/.test(document.querySelector('#dlg-text').textContent)`));
  await lompat(0, 0);
  await tunggu('!!G.pending');
  const logAwal = await ev('G.log.length');
  await ev(`document.activeElement && document.activeElement.blur()`);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
  cek('Tombol Spasi melanjutkan dialog', await tunggu(`G.log.length === ${logAwal + 1}`));
  // Teks tombol tetap terbaca saat kursor di atasnya (dulu Riwayat di dialog narator jadi putih semua)
  const kontrasHover = async (sel, siapkan = '') => {
    await ev(`(() => { ${siapkan} })()`);
    const pos = await ev(`(() => { const r = document.querySelector('${sel}').getBoundingClientRect(); return JSON.stringify([r.left + r.width / 2, r.top + r.height / 2]); })()`);
    const [x, y] = JSON.parse(pos);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await sleep(80);
    return ev(`(() => {
      const rgba = s => { const m = s.match(/[\\d.]+/g).map(Number); return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1]; };
      const b = document.querySelector('${sel}');
      // warna latar efektif: tumpuk latar transparan dengan latar induknya
      const lapisan = [];
      for (let n = b; n && n.nodeType === 1; n = n.parentElement) { const c = rgba(getComputedStyle(n).backgroundColor); lapisan.push(c); if (c[3] >= 1) break; }
      let bg = [255, 255, 255];
      for (const c of lapisan.reverse()) bg = bg.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
      const fg = rgba(getComputedStyle(b).color);
      const L = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
      const a = L(bg), z = L(fg);
      return Math.round((Math.max(a, z) + .05) / (Math.min(a, z) + .05) * 10) / 10;
    })()`);
  };
  const kLog = await kontrasHover('#btn-log', `document.querySelector('#dialog').classList.add('narrator')`);
  const kPb = await kontrasHover('#presenter-bar .btn');
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 });
  cek('Tombol Riwayat (narator) & bilah presenter tetap terbaca saat di-hover', kLog >= 3 && kPb >= 3, `kontras Riwayat ${kLog}, presenter ${kPb}`);
  await ev(`document.querySelector('#btn-log').click()`);
  cek('Riwayat dialog dapat dibuka', await tunggu(`document.querySelector('#dlg-log').open && document.querySelectorAll('#log-list li').length >= 2`));
  await ev(`document.querySelector('#dlg-log').close()`);
  const progSesudah2 = await ev(`JSON.stringify(JSON.parse(localStorage.getItem('sipandri-misi-laundry-v1')).progress)`);
  cek('Semua percobaan presenter tetap tidak mengubah save', progSesudah2 === JSON.stringify(JSON.parse(saveSebelum).progress));

  await ev(`document.querySelector('#pb-exit').click()`);
  cek('Keluar presenter kembali ke Mode Cerita', await tunggu(`G.mode === 'story' && !document.querySelector('#title-screen').hidden && G.prog.xp === ${xpTamat}`));

  // 8. Ukuran layar
  const ukuran = [[1920, 1080], [1366, 768], [1024, 768], [390, 844, true]];
  for (const [w, h, mob] of ukuran) {
    await viewport(w, h, !!mob);
    await sleep(200);
    cek(`Tanpa overflow horizontal di layar judul ${w}×${h}`, await noOverflow());
    await ev(`document.querySelector('#btn-continue').click()`);
    await tunggu('G.actIndex === 0');
    await mainkanSampai(`!!(G.cur && G.cur.api && document.querySelector('.pick-grid'))`, 300);
    await sleep(150);
    cek(`Panel misi & dialog muat di ${w}×${h}`, await noOverflow() && await ev(`(() => { const a = document.querySelector('#activity').getBoundingClientRect(), d = document.querySelector('#dialog').getBoundingClientRect(); return a.right <= innerWidth + 1 && a.left >= -1 && d.right <= innerWidth + 1 && a.bottom <= d.top + 2; })()`));
    await shot(`10-misi-${w}x${h}`);
    await ev(`document.querySelector('#hud-home').click()`);
    await sleep(100);
  }
  // 8a. Menu utama layar lebar: tokoh tidak masuk ke belakang panel, kartu nota tidak menimpa apa pun
  const tataJudul = `(() => {
      const kotak = el => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
      const tumpuk = (a, b) => a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
      const panel = kotak(document.querySelector('.title-panel'));
      const tokoh = [...document.querySelectorAll('.title-char')].map(kotak);
      const nota = document.querySelector('.title-note');
      const notaTampil = getComputedStyle(nota).display !== 'none';
      const hint = document.querySelector('.title-hints');
      const lain = [panel, ...tokoh, ...(getComputedStyle(hint).display !== 'none' ? [kotak(hint)] : [])];
      const salah = [];
      if (tokoh.some(t => tumpuk(t, panel))) salah.push('tokoh menumpuk panel');
      if (notaTampil && lain.some(x => tumpuk(kotak(nota), x))) salah.push('nota menumpuk');
      return JSON.stringify({ salah, notaTampil });
    })()`;
  const notaTampilDi = [];
  for (const [w, h] of [[1920, 1200], [1920, 1080], [1536, 960], [1440, 900], [1366, 768], [1280, 720], [1024, 768], [2560, 1440]]) {
    await viewport(w, h);
    await sleep(1600); // tunggu kartu nota diukur ulang setelah resize
    const r = JSON.parse(await ev(tataJudul));
    if (r.notaTampil) notaTampilDi.push(`${w}×${h}`);
    cek(`Menu utama ${w}×${h}: tokoh & kartu nota tidak saling menimpa`, r.salah.length === 0, r.salah.join(', '));
    if (w === 1536 || w === 2560) await shot(`13-judul-${w}x${h}`);
  }
  console.log('        kartu nota tampil di: ' + (notaTampilDi.join(', ') || '(tidak ada)'));

  // 8b. Handphone: setiap babak dan setiap bagian harus muat di layar HP (tegak & mendatar)
  const HP = [[390, 844, 'tegak'], [844, 390, 'mendatar']];
  const muatPanel = `(() => {
      const act = document.querySelector('#activity'), dl = document.querySelector('#dialog');
      if (act.hidden) return 'ok';
      const a = act.getBoundingClientRect(), d = dl.getBoundingClientRect();
      const ok = a.left >= -1 && a.right <= innerWidth + 1 && d.left >= -1 && d.right <= innerWidth + 1 && a.bottom <= d.top + 2
        && a.height >= 110 && act.scrollWidth <= act.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1;
      return ok ? 'ok' : JSON.stringify({ act: [Math.round(a.left), Math.round(a.right), Math.round(a.top), Math.round(a.bottom)], dlgTop: Math.round(d.top), sw: act.scrollWidth, cw: act.clientWidth });
    })()`;
  for (const [w, h, arah] of HP) {
    await viewport(w, h, true);
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await sleep(250);
    cek(`HP ${arah} ${w}×${h}: menu utama tanpa overflow dan tidak bertumpuk dengan tokoh`, await noOverflow() && await ev(`(() => {
      const p = document.querySelector('.title-panel').getBoundingClientRect(), c = document.querySelector('#title-cast').getBoundingClientRect();
      const tumpang = !(c.top >= p.bottom - 2 || c.left >= p.right - 2);
      return p.right <= innerWidth + 1 && p.bottom <= innerHeight + 1 && !tumpang;
    })()`));
    await shot(`11-hp-${arah}-menu`);
    await ev(`document.querySelector('#btn-presenter-start').click()`);
    await tunggu(`G.mode === 'presenter'`);
    await ev(`document.querySelector('#dlg-map').close()`);
    const masalah = [];
    for (let i = 0; i < 9; i++) {
      const jml = await ev(`window.ACTS[${i}].parts.length`);
      for (let p = 0; p < jml; p++) {
        await ev(`void G.runAct(${i}, ${p}); true`);
        await tunggu(`G.actIndex === ${i} && G.partIndex === ${p}`, 3000);
        await mainkanSampai(`!!(G.cur && G.cur.api) || G.partIndex !== ${p} || G.actIndex !== ${i}`, 400);
        await sleep(120);
        const r = await ev(muatPanel);
        if (r !== 'ok') masalah.push(`B${i + 1}.${p + 1} ${r}`);
        if (p === 0 || i === 4) await shot(`12-hp-${arah}-b${i + 1}-${p + 1}`);
      }
    }
    cek(`HP ${arah} ${w}×${h}: panel misi semua babak & bagian muat di layar`, masalah.length === 0, masalah.slice(0, 4).join(' | '));
    await ev(`document.querySelector('#pb-exit').click()`);
    await tunggu(`G.mode === 'story'`);
    await send('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
  await viewport(1600, 900);

  // 9. Reset progres dengan konfirmasi
  await ev(`document.querySelector('#btn-title-settings').click()`);
  await ev(`document.querySelector('#btn-reset').click()`);
  cek('Reset progres meminta konfirmasi', await tunggu(`document.querySelector('#dlg-confirm').open`));
  await ev(`document.querySelector('#confirm-no').click()`);
  cek('Batal reset: progres tetap', await ev(`G.save.xp === ${xpTamat}`));
  await ev(`document.querySelector('#btn-reset').click()`);
  await tunggu(`document.querySelector('#dlg-confirm').open`);
  await ev(`document.querySelector('#confirm-ok').click()`);
  cek('Reset progres menghapus XP dan babak selesai', await tunggu(`G.save.xp === 0 && G.save.completed.length === 0 && document.querySelector('#btn-continue').hidden`), await ev(`JSON.stringify({ xp: G.save.xp, c: G.save.completed, started: G.save.started, mode: G.mode, cont: document.querySelector('#btn-continue').hidden, act: G.actIndex })`));
  cek('Pengaturan tetap tersimpan setelah reset', await ev(`JSON.parse(localStorage.getItem('sipandri-misi-laundry-v1')).settings.speed === 'instan'`));

  cek('Tidak ada error JavaScript selama pengujian', errors.length === 0, errors.slice(0, 5).join(' | '));

  console.log(`\nHasil: ${lulus} lulus, ${gagal} gagal.`);
  ws.close(); proc.kill();
  try { fs.rmSync(profil, { recursive: true, force: true }); } catch (e) { /* profil masih dikunci browser */ }
  process.exit(gagal ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
