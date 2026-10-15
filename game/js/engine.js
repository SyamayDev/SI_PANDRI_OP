/* =====================================================================
   SI-PANDRI: Misi Laundry Beres! — engine.js
   Mesin cerita:
   - Simpan progres (localStorage) + Mode Presenter yang tidak mengubah save.
   - Dialog dengan efek mesin tik yang SELALU menunggu klik/Spasi (tanpa auto-lanjut).
   - Panggung karakter, latar pixel beranimasi ringan, panel misi.
   - Komponen mini-game: pilih banyak, kuis, pasangkan, kelompokkan, isian angka.
   - XP sekali per misi (anti-farming), achievement, jurnal, kartu pesanan.
   Setiap babak (acts.js) ditulis sebagai fungsi async; saat pemain pindah
   babak, semua janji (Promise) yang menunggu dibatalkan dengan aman.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const D = window.DATA;
  const STORE_KEY = 'sipandri-misi-laundry-v1';

  class Abort extends Error { constructor() { super('dibatalkan'); this.name = 'Abort'; } }

  const G = window.G = {
    Abort, mode: 'story', token: 0, actIndex: -1, partIndex: 0,
    prog: null, save: null, settings: null, actors: {}, cur: null, pending: null
  };

  /* ---------------- Utilitas format (sama dengan aturan di SI_PANDRI.pas) ---------------- */
  G.fmt = {
    rupiah(n) { return 'Rp ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
    berat(kg) { return String(Math.round(kg * 100) / 100).replace('.', ',') + ' kg'; },
    // NormalisasiNomorWA: ambil digit, 0 di depan diganti 62
    wa(nomor) {
      let d = String(nomor).replace(/\D/g, '');
      if (!d) return '';
      if (d[0] === '0') d = '62' + d.slice(1);
      else if (!d.startsWith('62')) d = '62' + d;
      return d;
    },
    // EncodeURL: huruf, angka, - _ . ~ tetap; spasi %20; lainnya %XX
    url(teks) {
      return [...teks].map(ch => /[A-Za-z0-9\-_.~]/.test(ch) ? ch : ch === ' ' ? '%20'
        : '%' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join('');
    },
    // Seperti BacaReal: koma boleh sebagai desimal, harus angka utuh
    angka(raw) {
      const t = String(raw).trim().replace(/,/g, '.');
      return /^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(t) ? parseFloat(t) : NaN;
    },
    uang(raw) {
      const t = String(raw).replace(/rp/i, '').replace(/[\s.]/g, '').trim();
      return /^\d+$/.test(t) ? parseInt(t, 10) : NaN;
    }
  };
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  // **tebal**, `kode`
  G.rich = function (text) {
    return esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>');
  };
  G.esc = esc;
  G.el = function (tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };

  /* ---------------- Penyimpanan ---------------- */
  function freshProgress() {
    return { started: false, current: { act: 0, part: 0 }, completed: [], xp: 0, rewards: {}, achievements: {}, journal: {}, sim: null, visited: {} };
  }
  function freshSettings() { return { sound: true, volume: 0.5, speed: 'normal', reduce: false, big: false, names: true, autoFull: true }; }
  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; } catch (e) { return null; }
  }
  G.load = function () {
    const raw = readStore() || {};
    G.save = Object.assign(freshProgress(), raw.progress || {});
    G.settings = Object.assign(freshSettings(), raw.settings || {});
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && !raw.settings) G.settings.reduce = true;
    G.prog = G.save;
  };
  G.persist = function () {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ version: 1, progress: G.save, settings: G.settings })); } catch (e) { /* penyimpanan tidak tersedia */ }
  };
  G.resetProgress = function () {
    G.save = freshProgress();
    if (G.mode === 'story') G.prog = G.save;
    G.persist();
  };
  G.hasSave = () => !!(G.save && G.save.started);

  // Mode Presenter memakai progres sementara di memori: save Mode Cerita tidak berubah.
  G.setMode = function (mode) {
    G.mode = mode;
    G.prog = mode === 'presenter' ? freshProgress() : G.save;
    document.body.classList.toggle('presenter', mode === 'presenter');
    G.emit('mode');
  };
  G.isUnlocked = i => G.mode === 'presenter' || i === 0 || !!G.prog.completed[i - 1];
  G.actStatus = function (i) {
    if (G.prog.completed[i]) return 'selesai';
    if (!G.isUnlocked(i)) return 'terkunci';
    if (G.prog.started && G.prog.current.act === i) return 'berjalan';
    return 'tersedia';
  };

  /* ---------------- Event sederhana ---------------- */
  const listeners = {};
  G.on = (n, fn) => { (listeners[n] = listeners[n] || []).push(fn); };
  G.emit = (n, a) => (listeners[n] || []).forEach(fn => fn(a));

  /* ---------------- Suara 8-bit (WebAudio, tanpa file; tidak pernah autoplay) ---------------- */
  let actx = null;
  function beep(seq, type = 'square', vol = 0.05) {
    if (!G.settings.sound || G.settings.volume <= 0) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      let t = actx.currentTime;
      const v = vol * G.settings.volume * 2;
      seq.forEach(([f, d]) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d); t += d * 0.9;
      });
    } catch (e) { /* audio tidak tersedia: game tetap berjalan */ }
  }
  G.sfx = {
    click: () => beep([[540, 0.04]], 'square', 0.025),
    good: () => beep([[660, 0.08], [990, 0.14]]),
    bad: () => beep([[240, 0.1], [170, 0.16]], 'sawtooth', 0.03),
    open: () => beep([[392, 0.05], [523, 0.08]], 'triangle', 0.06),
    xp: () => beep([[784, 0.06], [988, 0.06], [1318, 0.12]], 'triangle', 0.05),
    fanfare: () => beep([[523, 0.1], [659, 0.1], [784, 0.1], [1046, 0.32]], 'square', 0.045),
    scale: () => beep([[330, 0.05], [440, 0.07]], 'triangle', 0.05)
  };

  /* ---------------- Pembatalan & waktu ---------------- */
  G.reduced = () => !!G.settings.reduce;
  G.check = function (tok) { if (tok !== G.token) throw new Abort(); };
  G.wait = function (ms) {
    const tok = G.token;
    return new Promise((res, rej) => setTimeout(() => (tok === G.token ? res() : rej(new Abort())), G.reduced() ? Math.min(ms, 60) : ms));
  };
  G.abortAll = function () {
    G.token++;
    stopTyping();
    if (G.pending) { const p = G.pending; G.pending = null; p.reject(new Abort()); }
    if (G.cur) { const c = G.cur; G.cur = null; c.reject(new Abort()); }
    closeActivity();
    $('#dlg-choices').innerHTML = '';
    G.ticket.hide();
    G.thought(null);
  };

  /* ---------------- Latar ---------------- */
  const bg = $('#bg'), bgCtx = bg.getContext('2d');
  let bgName = 'calm', bgT = 0, bgTimer = null;
  G.bg = function (name) {
    bgName = name;
    $('#stage').dataset.bg = name;
    ART.drawBackground(bgCtx, bgName, bgT);
  };
  function bgLoop() {
    clearInterval(bgTimer);
    bgTimer = setInterval(() => {
      if (G.reduced() || document.hidden) return;
      bgT += 0.35;
      ART.drawBackground(bgCtx, bgName, bgT);
    }, 160);
  }

  /* ---------------- Karakter di panggung ---------------- */
  const POS = { farleft: 9, left: 20, midleft: 33, center: 50, midright: 67, right: 80, farright: 91 };
  const actorsEl = $('#actors');
  G.show = function (id, pos = 'center', expr = 'neutral', pose = 'idle') {
    let a = G.actors[id];
    if (!a) {
      const el = G.el('div', 'actor enter');
      el.dataset.id = id;
      const cv = document.createElement('canvas'); cv.width = 48; cv.height = 64;
      const tag = G.el('span', 'actor-name', esc(D.SPEAKERS[id] ? D.SPEAKERS[id].name : id));
      el.append(cv, tag);
      actorsEl.appendChild(el);
      a = G.actors[id] = { el, cv, expr, pose, pos };
      setTimeout(() => el.classList.remove('enter'), 450);
    }
    a.pos = pos; a.expr = expr; a.pose = pose;
    a.el.style.left = (POS[pos] !== undefined ? POS[pos] : pos) + '%';
    a.el.classList.remove('leaving');
    paintActor(id, false);
    crowd();
    return a;
  };
  function crowd() { actorsEl.classList.toggle('crowd', Object.keys(G.actors).length >= 4); }
  function paintActor(id, talking) {
    const a = G.actors[id];
    if (!a) return;
    const ctx = a.cv.getContext('2d');
    ctx.clearRect(0, 0, 48, 64);
    ctx.drawImage(ART.sprite(id, a.expr, a.pose, talking), 0, 0);
  }
  G.expr = function (id, expr, pose) {
    const a = G.actors[id];
    if (!a) return;
    if (expr) a.expr = expr;
    if (pose) a.pose = pose;
    paintActor(id, false);
  };
  G.hide = function (id) {
    const a = G.actors[id];
    if (!a) return;
    delete G.actors[id];
    crowd();
    a.el.classList.add('leaving');
    setTimeout(() => a.el.remove(), G.reduced() ? 0 : 350);
  };
  // Mengatur seluruh pemeran sekaligus: { id: [posisi, ekspresi, pose] }
  G.cast = function (map) {
    Object.keys(G.actors).forEach(id => { if (!map[id]) G.hide(id); });
    Object.entries(map).forEach(([id, v]) => G.show(id, v[0], v[1], v[2]));
  };
  G.scene = function ({ bg: b, cast }) { if (b) G.bg(b); if (cast) G.cast(cast); };

  // Gelembung pikiran (beban kerja Bu Ratna)
  G.thought = function (items, id = 'ratna') {
    const old = $('.thought');
    if (old) old.remove();
    if (!items || !G.actors[id]) return;
    const b = G.el('div', 'thought');
    items.forEach(t => b.appendChild(G.el('span', 'thought-chip', esc(t))));
    G.actors[id].el.appendChild(b);
  };

  /* ---------------- Dialog ---------------- */
  const dlg = $('#dialog'), dlgText = $('#dlg-text'), dlgName = $('#dlg-name'), dlgRole = $('#dlg-role'),
    dlgFace = $('#dlg-face'), btnNext = $('#btn-next'), dlgChoices = $('#dlg-choices');
  const SPEED = { lambat: [1, 45], normal: [2, 30], cepat: [4, 22], instan: [9999, 0] };
  let typing = null, talkTimer = null;
  G.log = [];

  function setSpeaker(who, expr) {
    const sp = D.SPEAKERS[who] || { name: who, color: '#333' };
    dlg.classList.toggle('narrator', who === 'narrator');
    dlgName.textContent = sp.name;
    dlgRole.textContent = sp.role || '';
    dlg.style.setProperty('--speaker', sp.color);
    const ctx = dlgFace.getContext('2d');
    ctx.clearRect(0, 0, dlgFace.width, dlgFace.height);
    if (who !== 'narrator' && ART.CHARS[who]) {
      const a = G.actors[who];
      ctx.drawImage(ART.portrait(who, expr || (a ? a.expr : 'neutral')), 0, 0);
    }
    Object.values(G.actors).forEach(a => a.el.classList.toggle('speaking', a.el.dataset.id === who));
  }
  function stopTyping() {
    if (typing) { clearInterval(typing.timer); typing = null; }
    clearInterval(talkTimer); talkTimer = null;
    Object.keys(G.actors).forEach(id => paintActor(id, false));
    updateNext();
  }
  G.finishTyping = function () {
    if (!typing) return false;
    typing.nodes.forEach((n, i) => { n.textContent = typing.full[i]; });
    stopTyping();
    return true;
  };
  function typeText(html, who) {
    stopTyping();
    dlgText.innerHTML = html;
    const [step, ms] = SPEED[G.settings.speed] || SPEED.normal;
    if (G.reduced() && G.settings.speed !== 'lambat') return updateNext();
    if (step >= 9999) return updateNext();
    const nodes = [], walker = document.createTreeWalker(dlgText, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const full = nodes.map(n => n.textContent);
    nodes.forEach(n => { n.textContent = ''; });
    let ni = 0, ci = 0;
    typing = { nodes, full, timer: setInterval(() => {
      for (let k = 0; k < step; k++) {
        if (ni >= nodes.length) { stopTyping(); return; }
        ci++; nodes[ni].textContent = full[ni].slice(0, ci);
        if (ci >= full[ni].length) { ni++; ci = 0; }
      }
    }, ms) };
    if (G.actors[who] && !G.reduced()) {
      let open = false;
      talkTimer = setInterval(() => { open = !open; paintActor(who, open); }, 130);
    }
    updateNext();
  }
  function updateNext() {
    const waiting = !!G.pending;
    btnNext.hidden = !waiting;
    btnNext.textContent = typing ? 'Tampilkan ▸' : 'Lanjut ▶';
    dlg.classList.toggle('is-typing', !!typing);
    dlg.classList.toggle('is-waiting', waiting && !typing);
  }
  function show(who, text, expr) {
    if (expr && G.actors[who]) G.expr(who, expr);
    setSpeaker(who, expr);
    dlg.hidden = false;
    G.log.push({ who, text });
    if (G.log.length > 200) G.log.shift();
    typeText(G.rich(text), who);
  }
  // Baris dialog yang menunggu pemain menekan Lanjut
  G.say = function (who, text, expr) {
    G.check(G.token);
    const tok = G.token;
    return new Promise((resolve, reject) => {
      G.pending = { resolve, reject, tok };
      dlgChoices.innerHTML = '';
      show(who, text, expr);
      updateNext();
    });
  };
  // Umpan balik saat misi berjalan (tidak menunggu)
  G.react = function (who, text, expr) {
    if (G.pending) return;
    dlgChoices.innerHTML = '';
    show(who, text, expr);
  };
  G.advance = function () {
    if (G.finishTyping()) return;
    if (G.pending) {
      const p = G.pending; G.pending = null;
      updateNext();
      G.sfx.click();
      p.resolve();
    }
  };
  // Pilihan di kotak dialog. options: [{text, value}]
  G.choose = function (who, text, options, expr) {
    const tok = G.token;
    G.check(tok);
    show(who, text, expr);
    G.finishTyping();
    return new Promise((resolve, reject) => {
      G.pending = null;
      G.cur = { reject, api: null };
      dlgChoices.innerHTML = '';
      options.forEach((o, i) => {
        const b = G.el('button', 'btn btn-choice', `<span class="letter">${'ABCDEF'[i]}</span><span>${G.rich(o.text)}</span>`);
        b.addEventListener('click', () => {
          if (tok !== G.token) return;
          G.sfx.click();
          dlgChoices.innerHTML = '';
          G.cur = null;
          resolve(o.value !== undefined ? o.value : i);
        });
        dlgChoices.appendChild(b);
      });
      updateNext();
      const first = dlgChoices.querySelector('button');
      if (first) first.focus({ preventScroll: true });
    });
  };

  /* ---------------- Panel misi (activity) ---------------- */
  const act = $('#activity'), actKicker = $('#act-kicker'), actTitle = $('#act-title'), actObj = $('#act-objective'),
    actBody = $('#act-body'), actFoot = $('#act-foot'), actHelp = $('#act-help'), actHelpBtn = $('#btn-act-help');
  function closeActivity() {
    act.hidden = true;
    act.classList.remove('wide');
    actBody.innerHTML = ''; actFoot.innerHTML = '';
    actHelp.hidden = true;
    document.body.classList.remove('has-activity');
  }
  // cfg: {kicker, title, objective, help, wide}; build(api) memanggil api.done(hasil)
  G.activity = function (cfg, build) {
    const tok = G.token;
    G.check(tok);
    return new Promise((resolve, reject) => {
      closeActivity();
      act.hidden = false;
      act.classList.toggle('wide', !!cfg.wide);
      document.body.classList.add('has-activity');
      actKicker.textContent = cfg.kicker || 'Misi';
      actTitle.textContent = cfg.title || '';
      actObj.innerHTML = cfg.objective ? G.rich(cfg.objective) : '';
      actHelp.innerHTML = cfg.help ? '<strong>Kenapa langkah ini perlu?</strong> ' + G.rich(cfg.help) : '';
      actHelpBtn.hidden = !cfg.help;
      act.scrollTop = 0;
      const api = {
        tok, body: actBody, foot: actFoot, solve: null,
        done(result) {
          if (tok !== G.token || G.cur !== entry) return;
          G.cur = null;
          closeActivity();
          resolve(result);
        },
        objective(t) { actObj.innerHTML = G.rich(t); },
        alive: () => tok === G.token && G.cur === entry
      };
      const entry = { reject, api };
      G.cur = entry;
      G.sfx.open();
      build(api);
      G.emit('activity');
    });
  };
  G.solveCurrent = function () {
    if (G.cur && G.cur.api && G.cur.api.solve) { G.cur.api.solve(); return true; }
    return false;
  };
  actHelpBtn.addEventListener('click', () => { actHelp.hidden = !actHelp.hidden; G.sfx.click(); });

  /* ---------------- Komponen mini-game ---------------- */
  G.ui = {};
  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  G.ui.shake = shake;
  // Gulir panel misi agar konten yang baru muncul terlihat
  G.reveal = function (el) {
    requestAnimationFrame(() => { try { el.scrollIntoView({ block: 'nearest', behavior: G.reduced() ? 'auto' : 'smooth' }); } catch (e) { /* abaikan */ } });
  };

  // Pilih semua kartu yang benar. items: [{text, correct, why}]
  G.ui.pickMany = function (api, box, { items, who = 'sarah', cols = 2, doneText }) {
    return new Promise(resolve => {
      const need = items.filter(i => i.correct).length;
      let found = 0, wrong = 0;
      const grid = G.el('div', 'pick-grid cols-' + cols);
      const counter = G.el('p', 'counter', `Ditemukan: 0 / ${need}`);
      const btns = items.map(it => {
        const b = G.el('button', 'card-btn', G.rich(it.text));
        b.addEventListener('click', () => pick(it, b));
        grid.appendChild(b);
        return b;
      });
      box.append(grid, counter);
      function pick(it, b) {
        if (b.disabled || !api.alive()) return;
        b.disabled = true;
        if (it.correct) {
          b.classList.add('is-right'); found++; G.sfx.good();
          G.react(who, it.why, 'happy');
        } else {
          b.classList.add('is-wrong'); wrong++; G.sfx.bad(); shake(b);
          G.react(who, it.why, 'thinking');
        }
        counter.textContent = `Ditemukan: ${found} / ${need}`;
        if (found === need) {
          btns.forEach(x => { x.disabled = true; });
          if (doneText) G.react(who, doneText, 'happy');
          setTimeout(() => resolve({ wrong }), 650);
        }
      }
      api.solve = () => items.forEach((it, i) => { if (it.correct && !btns[i].disabled) pick(it, btns[i]); });
    });
  };

  // Kuis satu jawaban dengan umpan balik dan coba lagi. options: [{text, correct, why}]
  G.ui.quiz = function (api, box, { q, options, who = 'gilbert', code }) {
    return new Promise(resolve => {
      let wrong = 0;
      const wrap = G.el('div', 'quiz');
      if (q) wrap.appendChild(G.el('p', 'quiz-q', G.rich(q)));
      if (code) wrap.appendChild(code);
      const list = G.el('div', 'quiz-options');
      const btns = options.map((o, i) => {
        const b = G.el('button', 'btn btn-choice', `<span class="letter">${'ABCDEF'[i]}</span><span>${G.rich(o.text)}</span>`);
        b.addEventListener('click', () => pick(i));
        list.appendChild(b);
        return b;
      });
      const fb = G.el('p', 'feedback', '');
      fb.setAttribute('role', 'status');
      wrap.append(list, fb);
      box.appendChild(wrap);
      function pick(i) {
        if (!api.alive() || btns[i].disabled) return;
        const o = options[i];
        if (o.correct) {
          btns.forEach(b => { b.disabled = true; });
          btns[i].classList.add('is-right');
          fb.className = 'feedback good'; fb.innerHTML = '✔ ' + G.rich(o.why);
          G.sfx.good(); G.react(who, o.why, 'happy');
          setTimeout(() => resolve({ wrong }), 700);
        } else {
          wrong++;
          btns[i].disabled = true; btns[i].classList.add('is-wrong'); shake(btns[i]);
          fb.className = 'feedback bad'; fb.innerHTML = '✘ ' + G.rich(o.why) + ' <em>Coba pilihan lain.</em>';
          G.sfx.bad(); G.react(who, o.why + ' Coba lagi, ya.', 'thinking');
        }
      }
      api.solve = () => pick(options.findIndex(o => o.correct));
    });
  };

  // Pasangkan kiri ↔ kanan. answer: {leftId: rightId}
  G.ui.match = function (api, box, { left, right, answer, who = 'gilbert', wrongText, rightText, leftLabel = 'Masalah', rightLabel = 'Kebutuhan sistem' }) {
    return new Promise(resolve => {
      let selL = null, wrong = 0, done = 0;
      const wrap = G.el('div', 'match');
      const colL = G.el('div', 'match-col', `<h3>${esc(leftLabel)}</h3>`);
      const colR = G.el('div', 'match-col', `<h3>${esc(rightLabel)}</h3>`);
      const status = G.el('p', 'counter', `Terpasang: 0 / ${left.length}`);
      const bL = {}, bR = {};
      left.forEach(l => {
        const b = G.el('button', 'card-btn match-item', l.html || G.rich(l.text));
        b.dataset.id = l.id;
        b.addEventListener('click', () => chooseL(l.id));
        colL.appendChild(b); bL[l.id] = b;
      });
      right.forEach(r => {
        const b = G.el('button', 'card-btn match-item', r.html || G.rich(r.text));
        b.dataset.id = r.id;
        b.addEventListener('click', () => chooseR(r.id));
        colR.appendChild(b); bR[r.id] = b;
      });
      wrap.append(colL, colR);
      box.append(G.el('p', 'hint', 'Klik satu kartu di kiri, lalu klik pasangannya di kanan.'), wrap, status);
      // Di HP kolom kanan berada di bawah kolom kiri: gulir otomatis agar tidak perlu mencari
      const sempit = () => window.matchMedia('(max-width: 720px)').matches;
      function chooseL(id) {
        if (!api.alive() || bL[id].classList.contains('is-right')) return;
        Object.values(bL).forEach(b => b.classList.remove('is-selected'));
        selL = id; bL[id].classList.add('is-selected'); G.sfx.click();
        if (sempit()) G.reveal(colR.querySelector('.match-item:not(.is-right)') || colR);
      }
      function chooseR(id) {
        if (!api.alive() || bR[id].classList.contains('is-right')) return;
        if (!selL) { G.react(who, 'Pilih dulu satu kartu di kolom kiri, lalu pasangannya di kanan.', 'neutral'); shake(bR[id]); return; }
        if (answer[selL] === id) {
          done++;
          [bL[selL], bR[id]].forEach(b => { b.classList.remove('is-selected'); b.classList.add('is-right'); b.disabled = true; b.dataset.pair = done; });
          G.sfx.good();
          G.react(who, rightText ? rightText(selL, id) : 'Pasangan tepat!', 'happy');
          selL = null;
          status.textContent = `Terpasang: ${done} / ${left.length}`;
          if (done === left.length) setTimeout(() => resolve({ wrong }), 700);
          else if (sempit()) G.reveal(colL.querySelector('.match-item:not(.is-right)'));
        } else {
          wrong++; shake(bR[id]); G.sfx.bad();
          G.react(who, wrongText ? wrongText(selL, id) : 'Belum cocok. Coba pasangan lain.', 'thinking');
        }
      }
      api.solve = () => { left.forEach(l => { if (!bL[l.id].disabled) { chooseL(l.id); chooseR(answer[l.id]); } }); };
    });
  };

  // Kelompokkan kartu ke kategori. cats: [{id,label}], items: [{text, cat, why}]
  G.ui.sort = function (api, box, { cats, items, who = 'gilbert' }) {
    return new Promise(resolve => {
      let wrong = 0, done = 0;
      const zones = G.el('div', 'sort-zones');
      const zoneEls = {};
      cats.forEach(c => {
        const z = G.el('div', 'sort-zone zone-' + c.id, `<h3>${esc(c.label)}</h3>`);
        zoneEls[c.id] = G.el('ul', 'sort-list'); z.appendChild(zoneEls[c.id]); zones.appendChild(z);
      });
      const pool = G.el('div', 'sort-pool');
      const cards = items.map(it => {
        const card = G.el('div', 'sort-card');
        card.appendChild(G.el('p', '', G.rich(it.text)));
        const row = G.el('div', 'sort-btns');
        cats.forEach(c => {
          const b = G.el('button', 'btn btn-small', esc(c.label));
          b.addEventListener('click', () => put(it, card, c.id, b));
          row.appendChild(b);
        });
        card.appendChild(row);
        pool.appendChild(card);
        return card;
      });
      box.append(G.el('p', 'hint', 'Pilih kelompok untuk setiap kartu.'), pool, zones);
      function put(it, card, catId, b) {
        if (!api.alive() || card.classList.contains('placed')) return;
        if (it.cat === catId) {
          done++; card.classList.add('placed'); G.sfx.good();
          zoneEls[catId].appendChild(G.el('li', 'fade-in', G.rich(it.text)));
          card.remove();
          G.react(who, it.why, 'happy');
          if (done === items.length) setTimeout(() => resolve({ wrong }), 700);
        } else {
          wrong++; shake(card); G.sfx.bad(); b.disabled = true;
          G.react(who, 'Hmm, kurang tepat. ' + it.why, 'thinking');
        }
      }
      api.solve = () => items.forEach((it, i) => {
        const card = cards[i];
        if (!card.classList.contains('placed')) put(it, card, it.cat, card.querySelector('button'));
      });
    });
  };

  // Isian angka. check(nilai, teks) -> {ok, msg}
  G.ui.numberAsk = function (api, box, { label, prefix = '', suffix = '', placeholder = '', check, who = 'syahril', inputmode = 'decimal', answer }) {
    return new Promise(resolve => {
      let wrong = 0;
      const id = 'in-' + Math.random().toString(36).slice(2, 8);
      const form = G.el('form', 'num-form');
      form.innerHTML = `<label for="${id}">${G.rich(label)}</label>
        <div class="num-row">${prefix ? `<span class="affix">${esc(prefix)}</span>` : ''}
        <input id="${id}" type="text" inputmode="${inputmode}" autocomplete="off" placeholder="${esc(placeholder)}">
        ${suffix ? `<span class="affix">${esc(suffix)}</span>` : ''}
        <button type="submit" class="btn btn-primary">Periksa</button></div>
        <p class="feedback" role="status"></p>`;
      box.appendChild(form);
      const input = form.querySelector('input'), fb = form.querySelector('.feedback');
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (!api.alive()) return;
        const r = check(input.value);
        if (r.ok) {
          input.disabled = true; form.querySelector('button').disabled = true;
          fb.className = 'feedback good'; fb.innerHTML = '✔ ' + G.rich(r.msg);
          G.sfx.good(); if (r.say !== false) G.react(who, r.msg, 'happy');
          setTimeout(() => resolve({ wrong, value: r.value !== undefined ? r.value : input.value }), 650);
        } else {
          wrong++; shake(input); G.sfx.bad();
          fb.className = 'feedback bad'; fb.innerHTML = '✘ ' + G.rich(r.msg);
          if (r.say !== false) G.react(who, r.msg, 'thinking');
          input.select();
        }
      });
      api.solve = () => { input.value = answer; form.requestSubmit(); };
      setTimeout(() => { if (api.alive()) input.focus({ preventScroll: true }); }, 50);
    });
  };

  // Tombol "lanjut" di dalam panel misi (dipakai setelah membaca hasil)
  G.ui.continueBtn = function (api, label = 'Lanjut') {
    return new Promise(resolve => {
      const b = G.el('button', 'btn btn-primary', esc(label) + ' ▶');
      b.addEventListener('click', () => { if (api.alive()) { G.sfx.click(); resolve(); } });
      api.foot.innerHTML = '';
      api.foot.appendChild(b);
      api.solve = () => b.click();
      b.focus({ preventScroll: true });
      G.reveal(b);
    });
  };

  // Cuplikan kode Pascal asli (dari kode-pascal.js) dengan nomor baris
  G.codeBlock = function (key, highlight) {
    const k = window.KODE_PASCAL && window.KODE_PASCAL[key];
    const pre = G.el('pre', 'code');
    if (!k) { pre.textContent = '(cuplikan tidak ditemukan)'; return pre; }
    let html = '';
    k.segments.forEach((seg, si) => {
      if (si > 0) html += '<span class="row"><span class="ln">⋮</span><span class="gap-line">  …</span></span>';
      seg.lines.forEach((ln, i) => {
        const hl = highlight && ln.includes(highlight) ? ' hl' : '';
        html += `<span class="row${hl}"><span class="ln">${seg.start + i}</span>${esc(ln) || ' '}</span>`;
      });
    });
    pre.innerHTML = html;
    pre.appendChild(G.el('span', 'code-src', 'SI_PANDRI.pas · ' + esc(k.judul)));
    return pre;
  };
  G.findLine = function (key, text) {
    const k = window.KODE_PASCAL && window.KODE_PASCAL[key];
    if (!k) return null;
    for (const seg of k.segments) {
      const i = seg.lines.indexOf(text);
      if (i >= 0) return seg.start + i;
    }
    return null;
  };

  /* ---------------- Toast, XP, achievement, jurnal ---------------- */
  const toasts = $('#toasts');
  G.toast = function (msg, kind = 'info', ms = 2600) {
    const t = G.el('div', 'toast ' + kind, G.rich(msg));
    toasts.appendChild(t);
    while (toasts.children.length > 3) toasts.firstChild.remove();
    setTimeout(() => t.classList.add('out'), ms);
    setTimeout(() => t.remove(), ms + 400);
  };
  // XP hanya diberikan sekali untuk setiap id misi
  G.award = function (id, xp, label) {
    if (G.prog.rewards[id]) return false;
    G.prog.rewards[id] = true;
    G.prog.xp += xp;
    G.persist();
    G.sfx.xp();
    G.toast(`+${xp} XP · ${label}` + (G.mode === 'presenter' ? ' (presenter, tidak disimpan)' : ''), 'xp');
    G.emit('xp');
    return true;
  };
  G.achieve = function (id) {
    if (G.prog.achievements[id]) return;
    G.prog.achievements[id] = Date.now();
    G.persist();
    const a = D.ACHIEVEMENTS[id];
    G.sfx.fanfare();
    G.toast(`🏅 Achievement: **${a.title}** — ${a.desc}`, 'achv', 4200);
    G.emit('xp');
  };
  G.note = function (actId, lines) {
    G.prog.journal[actId] = { waktu: new Date().toLocaleString('id-ID'), catatan: lines };
    G.persist();
  };

  /* ---------------- Kartu pesanan (Babak 5) ---------------- */
  const ticket = $('#ticket');
  G.ticket = {
    show(sim, changed) {
      if (!sim) return;
      ticket.hidden = false;
      const row = (k, label, v) => `<div class="t-row${changed === k ? ' flash' : ''}"><dt>${label}</dt><dd>${v}</dd></div>`;
      const st = s => `<span class="st st-${D.STATUS.indexOf(s)}">${esc(s)}</span>`;
      ticket.innerHTML = `<button class="ticket-toggle" aria-expanded="true">Kartu Pesanan <b>${esc(sim.id || '—')}</b></button>
        <dl>${row('nama', 'Pelanggan', sim.nama ? esc(sim.nama) : '—')}
        ${row('wa', 'WhatsApp', sim.wa ? esc(G.fmt.wa(sim.wa)) : '—')}
        ${row('layanan', 'Layanan', sim.layanan ? esc(sim.layanan) + ' · ' + G.fmt.rupiah(D.TARIF[sim.layanan]) + '/kg' : '—')}
        ${row('metode', 'Metode bayar', sim.metode ? esc(sim.metode) : '—')}
        ${row('berat', 'Berat aktual', sim.berat ? G.fmt.berat(sim.berat) : 'Belum ditimbang')}
        ${row('total', 'Total biaya', sim.total ? G.fmt.rupiah(sim.total) : 'Menunggu penimbangan')}
        ${row('bayar', 'Status bayar', sim.bayar ? esc(sim.bayar) : '—')}
        ${row('status', 'Status cucian', sim.status ? st(sim.status) : '—')}</dl>
        <p class="t-note">Simulasi pembelajaran · data fiktif</p>`;
      document.body.classList.add('has-ticket');
      const tg = ticket.querySelector('.ticket-toggle');
      const sempit = () => window.matchMedia('(max-width: 1679px)').matches;
      const sync = () => tg.setAttribute('aria-expanded', String(sempit() ? ticket.classList.contains('open') : !ticket.classList.contains('closed')));
      sync();
      tg.addEventListener('click', () => {
        // Layar sempit: kartu ringkas, klik untuk membuka. Layar lebar: tampil penuh, klik untuk menutup.
        ticket.classList.toggle(sempit() ? 'open' : 'closed');
        sync();
      });
    },
    hide() { ticket.hidden = true; ticket.classList.remove('open'); document.body.classList.remove('has-ticket'); }
  };

  /* ---------------- Menjalankan babak ---------------- */
  G.runAct = async function (i, part = 0) {
    G.abortAll();
    const tok = G.token;
    const A = window.ACTS[i];
    G.actIndex = i; G.partIndex = part;
    G.prog.started = true;
    G.prog.visited[i] = true;
    G.emit('act', i);
    try {
      for (let p = part; p < A.parts.length; p++) {
        G.check(tok);
        G.partIndex = p;
        G.prog.current = { act: i, part: p };
        G.persist();
        G.emit('part', p);
        await A.parts[p](G);
      }
      G.check(tok);
      const pertama = !G.prog.completed[i];
      G.prog.completed[i] = true;
      if (i + 1 < window.ACTS.length) G.prog.current = { act: i + 1, part: 0 };
      G.persist();
      G.emit('act', i);
      await G.actComplete(i, pertama);
    } catch (e) {
      if (!(e instanceof Abort)) {
        console.error(e);
        G.toast('Terjadi kesalahan: ' + e.message, 'bad', 5000);
      }
    }
  };
  G.restartPart = () => G.runAct(G.actIndex, G.partIndex);

  G.actComplete = function (i, pertama) {
    const meta = D.ACTS[i];
    const last = i === D.ACTS.length - 1;
    return G.activity({ kicker: `Babak ${i + 1} selesai`, title: meta.title, objective: '' }, api => {
      G.sfx.fanfare();
      const box = api.body;
      box.appendChild(G.el('p', 'lead', '<strong>Yang kita pelajari:</strong> ' + G.rich(meta.learn)));
      const ul = G.el('ul', 'summary');
      meta.summary.forEach(s => ul.appendChild(G.el('li', '', G.rich(s))));
      box.appendChild(ul);
      if (G.mode === 'presenter') box.appendChild(G.el('p', 'muted', 'Mode Presenter: progres, XP, dan achievement tidak dicatat ke save Mode Cerita.'));
      else if (!pertama) box.appendChild(G.el('p', 'muted', 'Babak ini sudah pernah diselesaikan. XP tidak ditambah lagi.'));
      const next = G.el('button', 'btn btn-primary', last ? 'Lihat Jurnal Perjalanan' : `Lanjut ke Babak ${i + 2} ▶`);
      const again = G.el('button', 'btn', 'Ulangi babak ini');
      const map = G.el('button', 'btn', 'Peta babak');
      next.addEventListener('click', () => { api.done(); if (last) G.emit('open', 'journal'); else G.runAct(i + 1); });
      again.addEventListener('click', () => { api.done(); G.runAct(i); });
      map.addEventListener('click', () => { G.emit('open', 'map'); });
      api.foot.append(next, again, map);
      api.solve = () => next.click();
      next.focus({ preventScroll: true });
      G.react('narrator', last ? 'Seluruh cerita selesai. Terima kasih sudah bermain!' : 'Babak selesai. Tekan tombol untuk melanjutkan cerita.');
    });
  };

  /* ---------------- Ukuran dialog → ruang untuk panel misi ---------------- */
  function measure() {
    const h = dlg.hidden ? 0 : dlg.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--dlg-h', Math.round(h) + 'px');
  }
  if (window.ResizeObserver) new ResizeObserver(measure).observe(dlg);
  window.addEventListener('resize', measure);

  G.start = function () {
    G.bg('calm');
    bgLoop();
    btnNext.addEventListener('click', e => { e.stopPropagation(); G.advance(); });
    dlgText.addEventListener('click', () => G.advance());
    updateNext();
  };
})();
