/* =====================================================================
   SI-PANDRI: Misi Laundry Beres! — main.js
   Layar judul, HUD, peta babak, jurnal, pengaturan, bantuan, riwayat
   dialog, Mode Presenter (navigasi bebas + catatan presenter), dan
   pintasan keyboard. Dimuat paling akhir.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const D = window.DATA, el = G.el, esc = G.esc;

  G.load();
  applySettings();
  G.start();

  /* ---------------- Pengaturan tampilan ---------------- */
  function applySettings() {
    const s = G.settings;
    document.body.classList.toggle('reduce-motion', !!s.reduce);
    document.body.classList.toggle('big-text', !!s.big);
    document.body.classList.toggle('hide-names', !s.names);
    const snd = $('#btn-sound');
    snd.setAttribute('aria-pressed', String(!!s.sound));
    snd.querySelector('.lbl').textContent = s.sound ? 'Suara' : 'Bisu';
    snd.classList.toggle('off', !s.sound);
    const ts = $('#tc-sound');
    if (ts) { ts.classList.toggle('off', !s.sound); ts.setAttribute('aria-pressed', String(!!s.sound)); }
    const sp = $('#pb-speed');
    if (sp) sp.value = s.speed;
  }
  G.applySettings = applySettings;

  /* ---------------- HUD ---------------- */
  const pips = $('#hud-pips');
  D.ACTS.forEach((a, i) => {
    const li = el('li');
    const b = el('button', 'pip', String(i + 1));
    b.title = `Babak ${i + 1}: ${a.title}`;
    b.setAttribute('aria-label', b.title);
    b.addEventListener('click', () => {
      if (G.mode === 'presenter' || G.isUnlocked(i)) jumpTo(i);
      else { G.toast(`Babak ${i + 1} masih terkunci. Selesaikan Babak ${i} dulu.`, 'bad'); openMap(); }
    });
    li.appendChild(b);
    pips.appendChild(li);
  });
  function updateHud() {
    const i = G.actIndex;
    $('#hud-act').textContent = i >= 0 ? `Babak ${i + 1}` : 'Menu';
    $('#hud-title').textContent = i >= 0 ? D.ACTS[i].title : 'SI-PANDRI: Misi Laundry Beres!';
    $$('.pip', pips).forEach((b, k) => {
      const st = G.actStatus(k);
      b.className = 'pip ' + st + (k === i ? ' now' : '');
    });
    $('#hud-xp').textContent = G.prog.xp + ' XP';
    $('#hud-mode').hidden = G.mode !== 'presenter';
    $('#presenter-bar').hidden = G.mode !== 'presenter';
    updatePresenterBar();
    updateNotes();
  }
  G.on('act', updateHud); G.on('part', updateHud); G.on('xp', updateHud); G.on('mode', updateHud);
  G.on('xp', () => { const x = $('#hud-xp'); x.classList.remove('pop'); void x.offsetWidth; x.classList.add('pop'); });
  G.on('open', what => { if (what === 'journal') openJournal(); if (what === 'map') openMap(); });

  function jumpTo(i, part = 0) {
    closeAllDialogs();
    hideTitle();
    G.runAct(i, part);
  }

  /* ---------------- Layar penuh ---------------- */
  // Browser hanya mengizinkan layar penuh setelah interaksi pengguna (klik/ketuk/tombol),
  // jadi layar penuh dimulai dari ketukan pertama di layar "Ketuk untuk mulai".
  const fsAktif = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const fsDidukung = () => !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  function masukLayarPenuh() {
    const root = document.documentElement;
    const req = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!req || fsAktif()) return;
    try { const p = req.call(root, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } catch (e) { /* tidak didukung */ }
  }
  function toggleFull() {
    if (!fsDidukung()) { G.toast('Browser ini tidak mendukung layar penuh. Di iPhone, pakai “Tambahkan ke Layar Utama”.'); return; }
    if (!fsAktif()) masukLayarPenuh();
    else (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  }
  function syncFull() {
    const on = fsAktif();
    $('#tc-full').setAttribute('aria-pressed', String(on));
    $('#tc-full').title = on ? 'Keluar layar penuh' : 'Layar penuh';
    $('#btn-full .lbl').textContent = on ? 'Keluar' : 'Penuh';
    document.body.classList.toggle('is-fullscreen', on);
  }
  document.addEventListener('fullscreenchange', syncFull);
  document.addEventListener('webkitfullscreenchange', syncFull);

  /* ---------------- Layar mulai ---------------- */
  const splash = $('#splash');
  if (!fsDidukung()) $('#sp-note').textContent = 'Tip: tambahkan ke Layar Utama agar tampil layar penuh';
  else if (!G.settings.autoFull) $('#sp-note').textContent = 'Tekan F atau tombol ⛶ untuk layar penuh';
  if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) $('#sp-press-text').textContent = 'Klik atau tekan tombol apa saja untuk mulai';
  function tutupSplash() {
    if (splash.hidden || splash.classList.contains('gone')) return;
    if (G.settings.autoFull) masukLayarPenuh();
    G.sfx.open();
    splash.classList.add('gone');
    document.body.classList.remove('splash-on');
    setTimeout(() => { splash.hidden = true; }, G.reduced() ? 0 : 450);
    const first = $$('.game-menu button').find(b => !b.hidden);
    if (first) first.focus({ preventScroll: true });
    jadwalNota();
  }
  splash.addEventListener('click', tutupSplash);
  G.tutupSplash = tutupSplash;

  /* ---------------- Layar judul ---------------- */
  const title = $('#title-screen');
  function renderTitleCast() {
    const row = $('#title-cast');
    row.innerHTML = '';
    [['ratna', 'happy', 'wave'], ['gilbert', 'smile', 'prop'], ['sarah', 'smile', 'prop'], ['syahril', 'smile', 'prop']].forEach(([id, ex, pose], i) => {
      const fig = el('figure', 'title-char');
      fig.style.setProperty('--i', i);
      const cv = document.createElement('canvas'); cv.width = 48; cv.height = 64;
      cv.getContext('2d').drawImage(ART.sprite(id, ex, pose), 0, 0);
      fig.title = D.SPEAKERS[id].name + ' — ' + D.SPEAKERS[id].role;
      fig.append(cv, el('figcaption', '', `<b>${esc(D.SPEAKERS[id].name)}</b>`));
      row.appendChild(fig);
    });
  }
  function showTitle() {
    G.abortAll();
    G.actIndex = -1;
    Object.keys(G.actors).forEach(id => G.hide(id));
    $('#dialog').hidden = true;
    G.bg('storefront');
    title.hidden = false;
    document.body.classList.add('on-title');
    const cont = $('#btn-continue');
    if (G.mode === 'story' && G.hasSave()) {
      const c = G.save.current;
      const selesai = G.save.completed.filter(Boolean).length;
      cont.hidden = false;
      cont.querySelector('.gm-label').textContent = selesai === D.ACTS.length ? 'Main Lagi' : 'Lanjutkan';
      $('#continue-detail').textContent = selesai === D.ACTS.length ? 'Semua babak selesai · mulai dari Babak 1'
        : `Babak ${c.act + 1}${c.part ? ' · bagian ' + (c.part + 1) : ''} · ${D.ACTS[c.act].title}`;
      $('#start-label').textContent = 'Mulai dari Awal';
      $('#title-progress').textContent = `Progres tersimpan: ${selesai} dari ${D.ACTS.length} babak selesai · ${G.save.xp} XP`;
    } else {
      cont.hidden = true;
      $('#start-label').textContent = 'Mulai Cerita';
      $('#title-progress').textContent = '';
    }
    updateHud();
    if (!splash.hidden) nota.classList.remove('muat'); else jadwalNota();
    if (splash.hidden) setTimeout(() => (cont.hidden ? $('#btn-start') : cont).focus({ preventScroll: true }), 30);
  }
  function hideTitle() {
    title.hidden = true;
    document.body.classList.remove('on-title');
  }
  // Kartu "nota manual → kode" hanya ditampilkan bila muat tanpa menimpa panel menu,
  // tokoh, atau baris petunjuk. Dicoba pada ukuran normal lalu diperkecil; kalau tetap
  // bertumpuk, kartu disembunyikan.
  const nota = $('.title-note');
  const bertumpuk = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  function aturNota() {
    nota.classList.remove('muat');
    if (title.hidden || !matchMedia('(min-width: 1100px) and (min-height: 700px)').matches) return;
    const jarak = 10;
    const halangan = [$('.title-panel'), ...$$('.title-char'), $('.title-hints')]
      .filter(x => x && x.offsetParent)
      .map(x => { const r = x.getBoundingClientRect(); return { left: r.left - jarak, right: r.right + jarak, top: r.top - jarak, bottom: r.bottom + jarak }; });
    nota.style.animation = 'none'; // ukur posisi akhir, bukan posisi saat animasi masuk
    nota.classList.add('muat');
    let muat = false;
    for (const skala of [1, 0.85, 0.72]) {
      nota.style.setProperty('--skala', skala);
      const r = nota.getBoundingClientRect();
      if (r.top >= 0 && !halangan.some(h => bertumpuk(r, h))) { muat = true; break; }
    }
    nota.style.animation = '';
    if (!muat) nota.classList.remove('muat');
  }
  let notaTimer = 0;
  // Panel dan tokoh punya animasi masuk; ukur setelah animasinya selesai
  const jadwalNota = (ms = 1200) => { clearTimeout(notaTimer); notaTimer = setTimeout(aturNota, ms); };
  window.addEventListener('resize', () => jadwalNota(200));
  document.addEventListener('fullscreenchange', () => jadwalNota(300));
  // Navigasi menu ala game: panah atas/bawah memindah pilihan
  title.addEventListener('keydown', e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = $$('.game-menu button', title).filter(b => !b.hidden);
    const i = items.indexOf(document.activeElement);
    const n = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[n].focus(); G.sfx.click(); e.preventDefault();
  });
  $('#tc-sound').addEventListener('click', () => $('#btn-sound').click());
  $('#tc-full').addEventListener('click', toggleFull);
  G.showTitle = showTitle;
  $('#btn-start').addEventListener('click', () => { G.setMode('story'); jumpTo(0); });
  $('#btn-continue').addEventListener('click', () => {
    G.setMode('story');
    const c = G.save.current;
    const selesaiSemua = G.save.completed.filter(Boolean).length === D.ACTS.length;
    if (selesaiSemua) jumpTo(0); else jumpTo(c.act, c.part);
  });
  $('#btn-presenter-start').addEventListener('click', () => { enterPresenter(); });
  $('#btn-title-map').addEventListener('click', openMap);
  $('#btn-title-settings').addEventListener('click', () => openDialog('dlg-settings'));
  $('#btn-title-help').addEventListener('click', () => openDialog('dlg-help'));
  $('#hud-home').addEventListener('click', () => {
    if (G.mode === 'presenter') { openMap(); return; }
    showTitle();
  });

  /* ---------------- Dialog (modal) ---------------- */
  function openDialog(id) {
    const d = $('#' + id);
    if (id === 'dlg-settings') fillSettings();
    if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute('open', ''); } }
    G.sfx.open();
  }
  function closeAllDialogs() { $$('dialog[open]').forEach(d => d.close()); }
  $$('dialog').forEach(d => {
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    $$('[data-close]', d).forEach(b => b.addEventListener('click', () => d.close()));
  });

  function confirmBox(text, okLabel = 'Ya') {
    return new Promise(res => {
      const d = $('#dlg-confirm');
      $('#confirm-text').textContent = text;
      const ok = $('#confirm-ok'), no = $('#confirm-no');
      ok.textContent = okLabel;
      let selesai = false;
      const done = v => {
        if (selesai) return;
        selesai = true;
        ok.onclick = no.onclick = d.onclose = null;
        if (d.open) d.close();
        res(v);
      };
      ok.onclick = () => done(true);
      no.onclick = () => done(false);
      // Event "close" dari dialog sebelumnya bisa datang terlambat; abaikan jika dialog sedang terbuka.
      d.onclose = () => { if (!d.open) done(false); };
      openDialog('dlg-confirm');
      no.focus();
    });
  }

  /* ---------------- Peta babak ---------------- */
  function openMap() {
    const list = $('#map-list');
    list.innerHTML = '';
    $('#map-note').textContent = G.mode === 'presenter'
      ? 'Mode Presenter: semua babak terbuka. Lompatan di sini adalah navigasi presenter, bukan penyelesaian misi, dan tidak mengubah save Mode Cerita.'
      : 'Mode Cerita: babak berikutnya terbuka setelah misi babak sebelumnya selesai. Babak yang sudah terbuka dapat diulang.';
    const LABEL = { selesai: 'Selesai', berjalan: 'Sedang dimainkan', tersedia: 'Tersedia', terkunci: 'Terkunci' };
    window.ACTS.forEach((a, i) => {
      const st = G.actStatus(i);
      const li = el('li', 'map-item ' + st);
      li.innerHTML = `<div class="map-head"><span class="map-no">${i + 1}</span><div><h3>${esc(a.title)}</h3><p>${esc(a.goal)}</p></div><span class="badge st-${st}">${LABEL[st]}</span></div>`;
      const row = el('div', 'btn-row');
      if (st === 'terkunci') {
        row.appendChild(el('span', 'muted', `Selesaikan Babak ${i} untuk membuka.`));
      } else {
        const lanjut = G.mode === 'story' && st === 'berjalan' && G.prog.current.part > 0;
        const b = el('button', 'btn btn-primary', lanjut ? `Lanjutkan (bagian ${G.prog.current.part + 1})` : st === 'selesai' ? 'Ulangi babak' : 'Mainkan');
        b.addEventListener('click', () => jumpTo(i, lanjut ? G.prog.current.part : 0));
        row.appendChild(b);
        if (lanjut) {
          const b0 = el('button', 'btn', 'Dari awal babak');
          b0.addEventListener('click', () => jumpTo(i, 0));
          row.appendChild(b0);
        }
        if (G.mode === 'presenter' && a.parts.length > 1) {
          a.partNames.forEach((nm, p) => {
            if (p === 0) return;
            const bp = el('button', 'btn btn-small', `${p + 1}. ${esc(nm)}`);
            bp.addEventListener('click', () => jumpTo(i, p));
            row.appendChild(bp);
          });
        }
      }
      li.appendChild(row);
      list.appendChild(li);
    });
    openDialog('dlg-map');
  }
  $('#btn-map').addEventListener('click', openMap);

  /* ---------------- Jurnal, XP, achievement ---------------- */
  function openJournal() {
    const p = G.prog;
    const done = p.completed.filter(Boolean).length;
    const ach = Object.keys(D.ACHIEVEMENTS);
    const got = ach.filter(k => p.achievements[k]).length;
    $('#journal-stats').innerHTML = `<div class="stat"><b>${done}/${D.ACTS.length}</b><span>babak selesai</span></div>
      <div class="stat"><b>${p.xp}</b><span>XP</span></div><div class="stat"><b>${got}/${ach.length}</b><span>achievement</span></div>`
      + (G.mode === 'presenter' ? '<p class="muted">Mode Presenter: jurnal ini sementara dan tidak tersimpan.</p>' : '');
    const grid = $('#journal-ach');
    grid.innerHTML = '';
    ach.forEach(k => {
      const a = D.ACHIEVEMENTS[k], on = !!p.achievements[k];
      grid.appendChild(el('li', 'ach ' + (on ? 'on' : 'off'), `<b>${on ? '🏅' : '🔒'} ${esc(a.title)}</b><span>${esc(a.desc)}</span>`));
    });
    const log = $('#journal-entries');
    log.innerHTML = '';
    let ada = false;
    D.ACTS.forEach((a, i) => {
      const j = p.journal[a.id];
      if (!j) return;
      ada = true;
      const li = el('li', 'entry');
      li.innerHTML = `<h4>Babak ${i + 1} · ${esc(a.title)}</h4><ul>${j.catatan.map(c => `<li>${esc(c)}</li>`).join('')}</ul><small>${esc(j.waktu)}</small>`;
      log.appendChild(li);
    });
    if (!ada) log.appendChild(el('li', 'muted', 'Jurnal masih kosong. Catatan muncul otomatis saat babak selesai.'));
    openDialog('dlg-journal');
  }
  $('#btn-journal').addEventListener('click', openJournal);

  /* ---------------- Pengaturan ---------------- */
  function fillSettings() {
    const s = G.settings;
    $('#set-sound').checked = !!s.sound;
    $('#set-volume').value = Math.round(s.volume * 100);
    $('#set-speed').value = s.speed;
    $('#set-reduce').checked = !!s.reduce;
    $('#set-big').checked = !!s.big;
    $('#set-names').checked = !!s.names;
    $('#set-autofull').checked = !!s.autoFull;
  }
  function bindSetting(id, key, conv) {
    $(id).addEventListener('input', e => {
      G.settings[key] = conv(e.target);
      G.persist(); applySettings();
    });
  }
  bindSetting('#set-sound', 'sound', t => t.checked);
  bindSetting('#set-volume', 'volume', t => Number(t.value) / 100);
  bindSetting('#set-speed', 'speed', t => t.value);
  bindSetting('#set-reduce', 'reduce', t => t.checked);
  bindSetting('#set-big', 'big', t => t.checked);
  bindSetting('#set-names', 'names', t => t.checked);
  bindSetting('#set-autofull', 'autoFull', t => t.checked);
  $('#set-volume').addEventListener('change', () => G.sfx.click());
  $('#btn-settings').addEventListener('click', () => openDialog('dlg-settings'));
  $('#btn-reset').addEventListener('click', async () => {
    const ok = await confirmBox('Hapus semua progres Mode Cerita (babak selesai, XP, achievement, jurnal)? Pengaturan suara dan tampilan tetap disimpan.', 'Ya, hapus progres');
    if (!ok) return;
    G.resetProgress();
    G.toast('Progres Mode Cerita sudah direset.', 'info');
    if (G.mode === 'story') showTitle();
  });
  $('#btn-sound').addEventListener('click', () => {
    G.settings.sound = !G.settings.sound;
    G.persist(); applySettings();
    G.toast(G.settings.sound ? 'Suara hidup' : 'Suara mati');
  });

  /* ---------------- Bantuan & riwayat dialog ---------------- */
  $('#btn-help').addEventListener('click', () => openDialog('dlg-help'));
  function openLog() {
    const ul = $('#log-list');
    ul.innerHTML = '';
    if (!G.log.length) ul.appendChild(el('li', 'muted', 'Belum ada dialog.'));
    G.log.slice(-80).forEach(l => {
      const sp = D.SPEAKERS[l.who] || { name: l.who, color: '#333' };
      ul.appendChild(el('li', '', `<b style="color:${sp.color}">${esc(sp.name)}</b> ${G.rich(l.text)}`));
    });
    openDialog('dlg-log');
    ul.scrollTop = ul.scrollHeight;
  }
  $('#btn-log').addEventListener('click', e => { e.stopPropagation(); openLog(); });

  $('#btn-full').addEventListener('click', toggleFull);

  /* ---------------- Mode Presenter ---------------- */
  function enterPresenter() {
    G.setMode('presenter');
    hideTitle();
    G.toast('Mode Presenter aktif. Semua babak terbuka; save Mode Cerita tidak berubah.', 'info', 3600);
    openMap();
    updateHud();
  }
  async function exitPresenter() {
    G.setMode('story');
    closeNotes();
    showTitle();
    G.toast('Kembali ke Mode Cerita.');
  }
  $('#btn-presenter').addEventListener('click', () => { if (G.mode === 'presenter') exitPresenter(); else enterPresenter(); });

  const pbAct = $('#pb-act'), pbPart = $('#pb-part');
  D.ACTS.forEach((a, i) => pbAct.appendChild(new Option(`${i + 1}. ${a.title}`, i)));
  function updatePresenterBar() {
    if (G.mode !== 'presenter') return;
    pbAct.value = G.actIndex >= 0 ? G.actIndex : 0;
    const A = window.ACTS[G.actIndex >= 0 ? G.actIndex : 0];
    pbPart.innerHTML = '';
    A.partNames.forEach((nm, p) => pbPart.appendChild(new Option(`${p + 1}. ${nm}`, p)));
    pbPart.value = G.partIndex;
    pbPart.disabled = A.parts.length < 2;
    $('#pb-speed').value = G.settings.speed;
  }
  pbAct.addEventListener('change', () => jumpTo(+pbAct.value));
  pbPart.addEventListener('change', () => jumpTo(G.actIndex >= 0 ? G.actIndex : +pbAct.value, +pbPart.value));
  $('#pb-prev').addEventListener('click', () => stepAct(-1));
  $('#pb-next').addEventListener('click', () => stepAct(1));
  function stepAct(d) {
    const i = Math.min(D.ACTS.length - 1, Math.max(0, (G.actIndex < 0 ? 0 : G.actIndex) + d));
    jumpTo(i);
  }
  $('#pb-speed').addEventListener('change', e => { G.settings.speed = e.target.value; G.persist(); applySettings(); G.toast('Kecepatan dialog: ' + e.target.selectedOptions[0].text); });
  $('#pb-solve').addEventListener('click', solveNow);
  $('#pb-restart').addEventListener('click', () => { if (G.actIndex >= 0) G.restartPart(); });
  $('#pb-big').addEventListener('click', () => { G.settings.big = !G.settings.big; G.persist(); applySettings(); });
  $('#pb-exit').addEventListener('click', exitPresenter);
  function solveNow() {
    if (G.mode !== 'presenter') return;
    if (G.solveCurrent()) G.toast('Jawaban ditampilkan (navigasi presenter).', 'info');
    else G.toast('Tidak ada misi aktif yang bisa diselesaikan otomatis di sini.');
  }

  // Catatan presenter
  const notes = $('#notes');
  function updateNotes() {
    if (notes.hidden) return;
    const i = Math.max(0, G.actIndex);
    const a = D.ACTS[i], P = a.presenter;
    $('#notes-body').innerHTML = `
      <h3>Babak ${i + 1} · ${esc(a.title)}</h3>
      <p class="muted">Durasi saran: ${esc(P.durasi)}</p>
      <h4>Tujuan cerita</h4><p>${esc(a.goal)}</p>
      <h4>Tujuan pembelajaran</h4><p>${esc(a.learn)}</p>
      <h4>Ringkasan untuk disampaikan</h4><p>${G.rich(P.ringkas)}</p>
      <h4>Hubungkan dengan aplikasi Pascal</h4><p>${G.rich(P.pascal)}</p>
      <h4>Kalimat transisi</h4><p class="transisi">${esc(P.transisi)}</p>
      <h4>Alur presentasi</h4><ol class="alur">${D.ALUR_PRESENTASI.map(x => `<li class="${x.babak === i ? 'now' : ''}">${esc(x.teks)}</li>`).join('')}</ol>`;
  }
  function openNotes() { notes.hidden = false; document.body.classList.add('notes-open'); updateNotes(); }
  function closeNotes() { notes.hidden = true; document.body.classList.remove('notes-open'); }
  $('#pb-notes').addEventListener('click', () => (notes.hidden ? openNotes() : closeNotes()));
  $('#notes-close').addEventListener('click', closeNotes);

  /* ---------------- Menu ringkas (HUD di layar HP) ---------------- */
  $('#btn-more').addEventListener('click', () => openDialog('dlg-more'));
  $$('#dlg-more [data-act]').forEach(b => b.addEventListener('click', () => {
    $('#dlg-more').close();
    const aksi = {
      map: openMap, journal: openJournal, settings: () => openDialog('dlg-settings'), full: toggleFull,
      presenter: () => $('#btn-presenter').click(), help: () => openDialog('dlg-help'), log: openLog,
      home: () => $('#hud-home').click()
    };
    aksi[b.dataset.act]();
  }));

  /* ---------------- Keyboard ---------------- */
  document.addEventListener('keydown', e => {
    // Layar mulai: tombol apa pun (selain tombol pengubah) membuka menu
    if (!splash.hidden && !splash.classList.contains('gone')) {
      if (['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault(); tutupSplash(); return;
    }
    const t = e.target;
    const typingField = t.closest && t.closest('input, textarea, select');
    const onButton = t.closest && t.closest('button, summary, a, [role="button"]');
    const modal = $('dialog[open]');
    if (e.key === 'Escape') { if (!notes.hidden && !modal) closeNotes(); return; }
    if (typingField || e.ctrlKey || e.metaKey || e.altKey) return;
    if (modal) return;
    const k = e.key;
    if ((k === ' ' || k === 'Enter') && onButton) return; // biarkan tombol bekerja normal
    if (k === ' ' || k === 'Enter' || k === 'ArrowRight' || k === 'PageDown') {
      if (!title.hidden) return;
      e.preventDefault(); G.advance();
    } else if ((k === 'ArrowLeft' || k === 'PageUp') && G.mode === 'presenter' && G.actIndex >= 0) {
      e.preventDefault();
      if (G.partIndex > 0) jumpTo(G.actIndex, G.partIndex - 1); else if (G.actIndex > 0) jumpTo(G.actIndex - 1);
    } else if (k === 'h' || k === 'H' || k === '?') openDialog('dlg-help');
    else if (k === 'j' || k === 'J') openJournal();
    else if (k === 'b' || k === 'B') openMap();
    else if (k === 'l' || k === 'L') openLog();
    else if (k === 'm' || k === 'M') $('#btn-sound').click();
    else if (k === 'f' || k === 'F') toggleFull();
    else if ((k === 'n' || k === 'N') && G.mode === 'presenter') $('#pb-notes').click();
    else if ((k === 's' || k === 'S') && G.mode === 'presenter') solveNow();
    else if ((k === 'r' || k === 'R') && G.actIndex >= 0 && title.hidden) G.restartPart();
  });

  // Mulai: tampilkan layar judul. #babak-3 di URL membuka babak tersebut (jika sudah terbuka).
  // Manifest (Tambahkan ke Layar Utama, tampil layar penuh) hanya dimuat lewat http/https,
  // karena browser memblokirnya saat game dibuka langsung dari file.
  if (/^https?:/.test(location.protocol)) {
    const ln = document.createElement('link');
    ln.rel = 'manifest'; ln.href = 'manifest.webmanifest';
    document.head.appendChild(ln);
  }
  renderTitleCast();
  showTitle();
  syncFull();
  const m = location.hash.match(/^#babak-(\d)$/);
  if (m) {
    const i = +m[1] - 1;
    if (i >= 0 && i < D.ACTS.length && G.isUnlocked(i)) { splash.hidden = true; document.body.classList.remove('splash-on'); jumpTo(i); }
  }
})();
