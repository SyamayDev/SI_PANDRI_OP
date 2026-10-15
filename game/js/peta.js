/* =====================================================================
   SI-PANDRI: Misi Laundry Beres! — peta.js
   Peta Babak bergaya peta petualangan pixel-art: jalan berkelok dari
   Parfait Laundry (Babak 1) sampai laundry yang lebih teratur (Babak 9).
   Bu Ratna berjalan menyusuri jalan ke babak yang dipilih.
   ===================================================================== */
(function () {
  'use strict';
  const D = window.DATA;
  const $ = (s, r = document) => r.querySelector(s);

  // Area inti peta (zona aman) 480×240 piksel virtual. Kanvas diberi tepi tambahan
  // agar sisa layar di sekitar peta tetap berisi gambar, bukan bidang kosong.
  const VW = 480, VH = 240, OX = 48, OY = 32;
  const CW = VW + OX * 2, CH = VH + OY * 2;

  // Titik kendali jalan. Angka ketiga = nomor babak yang berhenti di titik itu.
  const KENDALI = [
    [24, 166],
    [44, 176, 1],
    [66, 160], [76, 128],
    [96, 98, 2],
    [124, 108], [140, 140],
    [150, 170, 3],
    [172, 168], [186, 132],
    [200, 96, 4],
    [218, 112], [230, 146],
    [246, 172, 5],
    [256, 150], [268, 138], [290, 136], [300, 122],
    [308, 100, 6],
    [326, 118], [338, 150],
    [356, 172, 7],
    [376, 160], [382, 128],
    [404, 96, 8],
    [400, 128], [410, 158], [424, 174],
    [444, 172, 9]
  ];
  // Papan nama: di atas jalan untuk pemberhentian yang tinggi, di bawah untuk yang rendah.
  const PAPAN = { 1: 6, 9: -10 }; // geser horizontal agar tidak keluar peta

  /* ---------------- Geometri jalan ---------------- */
  // Kurva Catmull-Rom melewati semua titik kendali, diambil rapat (±0,5 px)
  function kurva(titik, langkah = 24) {
    const out = [];
    for (let i = 0; i < titik.length - 1; i++) {
      const p0 = titik[Math.max(0, i - 1)], p1 = titik[i], p2 = titik[i + 1], p3 = titik[Math.min(titik.length - 1, i + 2)];
      for (let s = 0; s < langkah; s++) {
        const t = s / langkah, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(titik[titik.length - 1].slice(0, 2));
    return out;
  }
  const JALUR = kurva(KENDALI);
  // Jarak kumulatif sepanjang jalan, untuk berjalan dengan kecepatan tetap
  const JARAK = [0];
  for (let i = 1; i < JALUR.length; i++) JARAK.push(JARAK[i - 1] + Math.hypot(JALUR[i][0] - JALUR[i - 1][0], JALUR[i][1] - JALUR[i - 1][1]));
  const HENTI = KENDALI.filter(k => k[2]).map(k => {
    let best = 0, d = Infinity;
    JALUR.forEach((p, i) => { const e = Math.hypot(p[0] - k[0], p[1] - k[1]); if (e < d) { d = e; best = i; } });
    return { x: k[0], y: k[1], idx: best, atas: k[1] < 140, dx: PAPAN[k[2]] || 0 };
  });

  // Sungai: garis tengah dari atas ke bawah peta
  const SUNGAI = kurva([[248, -40], [252, 20], [258, 70], [266, 108], [277, 137], [285, 170], [293, 205], [300, 290]], 30);
  function sungaiX(y) {
    let best = SUNGAI[0], d = Infinity;
    for (const p of SUNGAI) { const e = Math.abs(p[1] - y); if (e < d) { d = e; best = p; } }
    return best[0];
  }

  /* ---------------- Alat gambar piksel ---------------- */
  let ctx = null;
  function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function px(x, y, c) { rect(x, y, 1, 1, c); }
  function ell(cx, cy, rx, ry, c) {
    ctx.fillStyle = c;
    for (let y = Math.ceil(-ry); y <= Math.floor(ry); y++) {
      const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      ctx.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
    }
  }
  // Angka acak yang selalu sama setiap kali peta digambar
  function acak(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const dekatJalan = (x, y, r) => JALUR.some(p => Math.abs(p[0] - x) < r && Math.abs(p[1] - y) < r);

  function pohon(x, y, s = 7, jenis = 0) {
    ell(x, y + 1, s + 1, 2, '#5E8F4E');
    rect(x - 1, y - 5, 3, 6, '#6B4A2E');
    if (jenis === 1) { // cemara
      for (let i = 0; i < 3; i++) {
        const lebar = s - i * 2, yy = y - 5 - i * 5;
        for (let r = 0; r < 6; r++) rect(x - Math.round(lebar * (r / 6)), yy - 6 + r, Math.round(lebar * (r / 6)) * 2 + 1, 1, r === 5 ? '#2F6B3E' : '#3E8A4D');
      }
      px(x, y - 22, '#58A862');
      return;
    }
    ell(x, y - 5 - s * 0.8, s, s * 0.85, '#2F6B3E');
    ell(x, y - 6 - s * 0.8, s - 1, s * 0.85 - 1, '#3E8A4D');
    ell(x - s * 0.3, y - 7 - s, s * 0.45, s * 0.35, '#58A862');
    px(x + s * 0.4, y - 4 - s * 0.6, '#2F6B3E');
  }
  function semak(x, y, warna = '#4F9A5C') { ell(x, y, 4, 2.5, '#2F6B3E'); ell(x, y - 0.5, 3, 1.8, warna); }
  function bunga(x, y, c) { px(x, y, c); px(x - 1, y, c); px(x + 1, y, c); px(x, y - 1, c); px(x, y + 1, '#3E8A4D'); px(x, y, '#FFF6D8'); }
  function rumah(x, y, w, h, atap = '#C8553D') {
    ell(x + w / 2, y + 1, w / 2 + 3, 2, '#5E8F4E');
    rect(x, y - h, w, h, '#F1E4C6');
    rect(x + w - 3, y - h, 3, h, '#D9C7A0');
    const ra = Math.ceil(w / 2) + 1;
    for (let i = 0; i < ra - 1; i++) rect(x - 2 + i, y - h - 1 - i, w + 4 - i * 2, 1, i === 0 ? '#7E2F21' : atap);
    rect(x + Math.floor(w / 2) - 2, y - 6, 4, 6, '#6B4A2E');
    rect(x + 2, y - h + 3, 3, 3, '#9FD3E6');
    if (w > 14) rect(x + w - 7, y - h + 3, 3, 3, '#9FD3E6');
  }
  function pagar(x, y, n) {
    for (let i = 0; i < n; i++) rect(x + i * 4, y - 4, 1, 5, '#8A5A34');
    rect(x, y - 3, (n - 1) * 4 + 1, 1, '#A8784A');
    rect(x, y - 1, (n - 1) * 4 + 1, 1, '#A8784A');
  }

  /* ---------------- Menggambar peta ---------------- */
  function gambar(cv) {
    ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate(OX, OY);
    const r = acak(20261015);

    // Rumput dengan tekstur
    rect(-OX, -OY, CW, CH, '#7DB168');
    for (let i = 0; i < 70; i++) ell(-OX + r() * CW, -OY + r() * CH, 6 + r() * 16, 3 + r() * 7, r() < 0.5 ? '#76AA61' : '#84B870');
    for (let i = 0; i < 1400; i++) px(-OX + r() * CW, -OY + r() * CH, r() < 0.5 ? '#8DC277' : '#6C9E59');
    for (let i = 0; i < 160; i++) { const x = -OX + r() * CW, y = -OY + r() * CH; px(x, y, '#5E8F4E'); px(x + 1, y - 1, '#5E8F4E'); px(x + 2, y, '#5E8F4E'); }

    // Sungai dengan tepian pasir dan kilau air
    for (let y = -OY; y < VH + OY; y++) {
      const x = sungaiX(y);
      rect(x - 11, y, 22, 1, '#D8C391');
      rect(x - 9, y, 18, 1, '#3D74B0');
      rect(x - 8, y, 16, 1, '#4E8ED0');
      rect(x - 4, y, 8, 1, '#5C9CDB');
    }
    for (let i = 0; i < 60; i++) { const y = -OY + r() * CH, x = sungaiX(y) - 6 + r() * 10; rect(x, y, 2 + Math.round(r() * 2), 1, '#A9D4F5'); }

    // Kolam kecil
    ell(108, 150, 16, 9, '#D8C391');
    ell(108, 150, 14, 7.5, '#3D74B0');
    ell(108, 150, 13, 6.5, '#4E8ED0');
    rect(100, 147, 4, 1, '#A9D4F5'); rect(112, 152, 3, 1, '#A9D4F5');
    ell(116, 148, 2, 1.2, '#4F9A5C'); ell(101, 153, 2, 1.2, '#4F9A5C'); px(116, 147, '#F08AA0');

    // Jalan tanah: tepi gelap, isi, lalu bagian tengah yang lebih terang
    JALUR.forEach(p => ell(p[0], p[1], 7, 7, '#A88A5E'));
    JALUR.forEach(p => ell(p[0], p[1], 6, 6, '#D6BE93'));
    JALUR.forEach(p => ell(p[0], p[1], 3, 3, '#E2CDA6'));
    // Lapangan kecil di setiap pemberhentian
    HENTI.forEach(h => { ell(h.x, h.y, 10, 8, '#A88A5E'); ell(h.x, h.y, 9, 7, '#D6BE93'); ell(h.x, h.y, 6, 4.5, '#E2CDA6'); });
    for (let i = 0; i < 260; i++) { const p = JALUR[Math.floor(r() * JALUR.length)]; px(p[0] - 4 + r() * 8, p[1] - 4 + r() * 8, r() < 0.6 ? '#C2A57A' : '#EFE0C2'); }

    // Jembatan kayu di tempat jalan menyeberangi sungai
    const seberang = JALUR.filter(p => Math.abs(p[0] - sungaiX(p[1])) < 13);
    if (seberang.length) {
      const x0 = Math.min(...seberang.map(p => p[0])), x1 = Math.max(...seberang.map(p => p[0]));
      const yc = Math.round(seberang.reduce((s, p) => s + p[1], 0) / seberang.length);
      const w = Math.round(x1 - x0) + 4;
      rect(x0 - 2, yc - 7, w, 15, '#6B4428');
      rect(x0 - 2, yc - 6, w, 13, '#B07B49');
      for (let x = x0; x < x0 + w - 2; x += 3) rect(x, yc - 6, 1, 13, '#8E5D35');
      rect(x0 - 3, yc - 9, w + 2, 2, '#7A4E2C'); rect(x0 - 3, yc + 7, w + 2, 2, '#7A4E2C');
      for (let x = x0 - 3; x <= x0 + w - 2; x += 7) { rect(x, yc - 11, 2, 4, '#5A3920'); rect(x, yc + 6, 2, 4, '#5A3920'); }
    }

    // Parfait Laundry (Babak 1) — toko kecil berkanopi
    ell(26, 163, 26, 3, '#5E8F4E');
    rect(4, 124, 44, 38, '#F1E4C6');
    rect(43, 124, 5, 38, '#D9C7A0');
    rect(2, 116, 48, 8, '#7A4E2C');
    rect(8, 117, 36, 6, '#1F3A5F'); rect(12, 119, 28, 2, '#3CCAD9');
    for (let x = 2; x < 50; x += 6) { rect(x, 124, 3, 5, '#C8553D'); rect(x + 3, 124, 3, 5, '#F6EEDD'); }
    rect(7, 133, 13, 12, '#7A4E2C'); rect(8, 134, 11, 10, '#FFE7A8');
    ell(13.5, 140, 3, 3, '#8D96A3'); ell(13.5, 140, 2, 2, '#2F3E55'); px(12, 139, '#3CCAD9');
    rect(24, 140, 10, 22, '#7A4E2C'); rect(25, 141, 8, 21, '#A8784A'); px(31, 151, '#E6B85C');
    rect(37, 136, 8, 8, '#9FD3E6'); rect(37, 136, 8, 1, '#FFFFFF');
    semak(48, 160); semak(2, 160, '#58A862');

    // Laundry yang lebih teratur (Babak 9) — toko rapi dengan papan SI-PANDRI dan bendera finis
    ell(446, 163, 28, 3, '#5E8F4E');
    rect(422, 124, 46, 38, '#EAF3F6');
    rect(463, 124, 5, 38, '#C8DCE4');
    rect(420, 116, 50, 8, '#12253D');
    rect(426, 117, 38, 6, '#1F3A5F'); rect(430, 119, 30, 2, '#3CCAD9'); px(461, 119, '#E6B85C'); px(461, 120, '#E6B85C');
    rect(425, 131, 14, 13, '#12253D'); rect(426, 132, 12, 11, '#BFE6F5');
    ell(429, 138, 2.5, 2.5, '#8D96A3'); ell(435, 138, 2.5, 2.5, '#8D96A3'); px(429, 138, '#3CCAD9'); px(435, 138, '#3CCAD9');
    rect(440, 140, 9, 22, '#1F3A5F'); rect(441, 141, 7, 21, '#3F7FC4'); px(446, 151, '#E6B85C');
    rect(452, 131, 9, 9, '#BFE6F5'); rect(452, 131, 9, 1, '#FFFFFF');
    rect(474, 120, 1, 42, '#5A3920');
    for (let y = 0; y < 8; y++) for (let x = 0; x < 10; x++) px(475 + x, 120 + y, (Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? '#2B2118' : '#FFFFFF');
    semak(420, 160, '#58A862');

    // Jemuran (dekat Babak 4–5): tiang, tali, dan pakaian warna-warni
    rect(194, 136, 1, 18, '#6B4A2E'); rect(222, 136, 1, 18, '#6B4A2E');
    rect(194, 137, 29, 1, '#FFF6D8');
    [['#3CCAD9', 197, 6], ['#F08AA0', 204, 5], ['#E6B85C', 210, 6], ['#FFFFFF', 216, 4]].forEach(([c, x, h]) => { rect(x, 138, 5, h, c); rect(x, 138, 5, 1, '#00000022'); });

    // Rumah dan pagar
    rumah(306, 160, 16, 10, '#9B3B29'); pagar(300, 166, 7);
    rumah(156, 118, 14, 10);
    rumah(4, 96, 16, 11, '#3E6E9E'); rumah(26, 104, 12, 9);
    rumah(462, 92, 14, 10, '#9B3B29');

    // Pohon dan semak di area yang tidak dilewati jalan atau papan nama
    const pohonList = [
      [-30, 10, 8], [-20, 60, 9, 1], [-36, 110, 7], [-24, 168, 8], [-34, 220, 9, 1], [-14, 250, 7],
      [10, 20, 8], [34, 6, 7, 1], [52, 64, 7], [16, 70, 6, 1],
      [130, 20, 7, 1], [150, 6, 8], [146, 64, 7], [168, 84, 6, 1],
      [240, 16, 7], [236, 66, 7, 1], [226, 92, 5],
      [356, 16, 8, 1], [348, 66, 7], [364, 120, 6], [352, 140, 5, 1],
      [452, 26, 8, 1], [474, 60, 7], [500, 24, 9], [510, 100, 8, 1], [496, 170, 7], [512, 230, 9], [470, 236, 7, 1],
      [70, 236, 7], [100, 250, 8, 1], [196, 236, 7], [216, 252, 8], [326, 244, 7, 1], [396, 238, 8],
      [126, 186, 5], [178, 196, 5, 1], [308, 196, 5], [392, 192, 5, 1], [78, 190, 5]
    ];
    pohonList.forEach(([x, y, s, j]) => { if (!dekatJalan(x, y - 6, 8)) pohon(x, y, s, j || 0); });
    const semakList = [[60, 112], [120, 84], [178, 104], [288, 76], [330, 88], [384, 150], [92, 168], [212, 182], [270, 196], [420, 196]];
    semakList.forEach(([x, y]) => { if (!dekatJalan(x, y, 7)) semak(x, y, r() < 0.5 ? '#4F9A5C' : '#58A862'); });
    const warnaBunga = ['#F08AA0', '#F6D55C', '#FFFFFF', '#C79BE8'];
    for (let i = 0; i < 90; i++) {
      const x = -OX + r() * CW, y = -OY + r() * CH;
      if (!dekatJalan(x, y, 9) && Math.abs(x - sungaiX(y)) > 14) bunga(x, y, warnaBunga[Math.floor(r() * warnaBunga.length)]);
    }
    ctx.restore();
  }

  /* ---------------- Peta interaktif ---------------- */
  const STATUS = { selesai: '✔ Selesai', berjalan: '▶ Sedang dimainkan', tersedia: '● Tersedia', terkunci: '🔒 Terkunci' };
  let digambar = false, pilihan = 0, posisi = 0, animasi = 0, langkahke = 0;
  const dlg = () => $('#dlg-map');

  function aturRatna(idx) {
    posisi = idx;
    const p = JALUR[Math.max(0, Math.min(JALUR.length - 1, Math.round(idx)))];
    const el = $('#peta-ratna');
    el.style.setProperty('--x', p[0].toFixed(2));
    el.style.setProperty('--y', p[1].toFixed(2));
    el.dataset.x = p[0].toFixed(2); el.dataset.y = p[1].toFixed(2);
  }
  function frameRatna(pose) {
    const cv = $('#peta-ratna canvas'), c = cv.getContext('2d');
    c.clearRect(0, 0, 48, 64);
    c.drawImage(ART.sprite('ratna', pose === 'idle' ? 'smile' : 'happy', pose), 0, 0);
  }

  // Bu Ratna berjalan menyusuri titik-titik jalan (bukan garis lurus) ke pemberhentian tujuan
  function jalanKe(tujuan) {
    cancelAnimationFrame(animasi);
    const el = $('#peta-ratna');
    const dari = posisi, ke = HENTI[tujuan].idx;
    const jarakDari = jarakDi(dari), jarakKe = JARAK[ke];
    const total = Math.abs(jarakKe - jarakDari);
    if (total < 0.5 || G.reduced()) { aturRatna(ke); frameRatna('idle'); el.classList.remove('jalan'); return; }
    const durasi = Math.min(2600, Math.max(500, total * 9));
    const t0 = performance.now();
    el.classList.add('jalan');
    el.classList.toggle('ke-kiri', JALUR[ke][0] < JALUR[Math.round(dari)][0]);
    const tick = now => {
      const t = Math.min(1, (now - t0) / durasi);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const d = jarakDari + (jarakKe - jarakDari) * e;
      aturRatna(indeksDari(d));
      const fase = Math.floor(Math.abs(d - jarakDari) / 7) % 2;
      if (fase !== langkahke) { langkahke = fase; frameRatna(fase ? 'jalan1' : 'jalan2'); }
      if (t < 1) animasi = requestAnimationFrame(tick);
      else { el.classList.remove('jalan'); frameRatna('idle'); animasi = 0; }
    };
    frameRatna('jalan1'); langkahke = 0;
    animasi = requestAnimationFrame(tick);
  }
  function jarakDi(idx) {
    const i = Math.floor(idx), f = idx - i;
    if (i >= JARAK.length - 1) return JARAK[JARAK.length - 1];
    return JARAK[i] + (JARAK[i + 1] - JARAK[i]) * f;
  }
  function indeksDari(d) {
    let lo = 0, hi = JARAK.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (JARAK[m] <= d) lo = m; else hi = m; }
    const seg = JARAK[hi] - JARAK[lo];
    return lo + (seg > 0 ? (d - JARAK[lo]) / seg : 0);
  }

  function infoBabak(i) {
    const a = window.ACTS[i], st = G.actStatus(i);
    const presenter = G.mode === 'presenter';
    const lanjut = !presenter && st === 'berjalan' && G.prog.current.act === i && G.prog.current.part > 0;
    $('#pi-kicker').textContent = `Babak ${i + 1} dari ${D.ACTS.length} · ${STATUS[st].replace(/^\S+ /, '')}`;
    $('#pi-title').textContent = a.title;
    $('#pi-goal').textContent = a.goal;
    const ucap = presenter ? 'Mode Presenter: semua babak terbuka. Lompatan ini navigasi presenter, tidak mengubah save Mode Cerita.'
      : st === 'terkunci' ? `Babak ini masih terkunci. Selesaikan Babak ${i} dulu, ya.`
      : st === 'selesai' ? 'Babak ini sudah selesai. Boleh diulang kapan saja.'
      : lanjut ? `Kita berhenti di bagian ${G.prog.current.part + 1}. Mau lanjut dari situ?`
      : 'Babak ini sudah terbuka. Ayo kita mulai!';
    $('#pi-say').textContent = ucap;
    const face = $('#pi-face');
    face.getContext('2d').clearRect(0, 0, 40, 38);
    face.getContext('2d').drawImage(ART.portrait('ratna', st === 'terkunci' ? 'thinking' : 'smile'), 0, 0);

    const aksi = $('#pi-actions');
    aksi.innerHTML = '';
    if (st === 'terkunci') {
      aksi.appendChild(G.el('span', 'pi-locked', '🔒 Terkunci'));
      return;
    }
    const main = G.el('button', 'btn btn-primary btn-big', lanjut ? `Lanjutkan bagian ${G.prog.current.part + 1} ▶`
      : presenter ? 'Buka babak ▶' : st === 'selesai' ? 'Ulangi babak ▶' : 'Mainkan ▶');
    main.id = 'pi-play';
    main.addEventListener('click', () => mainkan(i, lanjut ? G.prog.current.part : 0));
    aksi.appendChild(main);
    if (lanjut) {
      const b0 = G.el('button', 'btn', 'Dari awal babak');
      b0.addEventListener('click', () => mainkan(i, 0));
      aksi.appendChild(b0);
    }
    if (presenter && a.parts.length > 1) {
      const row = G.el('div', 'pi-parts');
      a.partNames.forEach((nm, p) => {
        const bp = G.el('button', 'btn btn-small', `${p + 1}. ${G.esc(nm)}`);
        bp.addEventListener('click', () => mainkan(i, p));
        row.appendChild(bp);
      });
      aksi.appendChild(row);
    }
  }
  function mainkan(i, part) {
    cancelAnimationFrame(animasi);
    G.sfx.open();
    G.jumpTo(i, part);
  }

  function pilih(i, { jalan = true, fokus = false } = {}) {
    const st = G.actStatus(i);
    pilihan = i;
    document.querySelectorAll('#map-list .map-item').forEach((li, k) => li.classList.toggle('pilih', k === i));
    infoBabak(i);
    if (fokus) document.querySelectorAll('#map-list .peta-stop')[i].focus({ preventScroll: true });
    if (st === 'terkunci') {
      G.sfx.bad();
      const s = document.querySelectorAll('#map-list .map-item')[i];
      s.classList.remove('goyang'); void s.offsetWidth; s.classList.add('goyang');
      return;
    }
    G.sfx.click();
    if (jalan) jalanKe(i); else { aturRatna(HENTI[i].idx); frameRatna('idle'); }
  }

  function bangun() {
    const list = $('#map-list');
    list.innerHTML = '';
    D.ACTS.forEach((a, i) => {
      const h = HENTI[i], st = G.actStatus(i);
      const li = G.el('li', 'map-item ' + st + (h.atas ? ' atas' : ' bawah'));
      li.style.setProperty('--x', h.x);
      li.style.setProperty('--y', h.y);
      li.style.setProperty('--dx', h.dx);
      const b = G.el('button', 'peta-stop');
      b.type = 'button';
      b.setAttribute('aria-label', `Babak ${i + 1}: ${a.title} — ${STATUS[st].replace(/^\S+ /, '')}`);
      b.innerHTML = `<span class="ps-pin"><b>${i + 1}</b></span>
        <span class="ps-sign"><span class="ps-no">${i + 1}</span><span class="ps-nama">${G.esc(a.peta || a.title)}</span><span class="ps-status">${STATUS[st]}</span></span>`;
      b.addEventListener('click', () => {
        // Klik pemberhentian yang sudah dipilih = mainkan (seperti ketuk dua kali)
        if (pilihan === i && st !== 'terkunci' && !animasi) { mainkan(i, 0); return; }
        pilih(i);
      });
      li.appendChild(b);
      list.appendChild(li);
    });
  }

  function buka() {
    const d = dlg();
    if (!digambar) { gambar($('#peta-bg')); digambar = true; }
    const presenter = G.mode === 'presenter';
    const selesai = G.prog.completed.filter(Boolean).length;
    $('#map-mode').textContent = presenter ? 'Mode Presenter' : 'Mode Cerita';
    $('#map-mode').classList.toggle('presenter', presenter);
    $('#map-prog').textContent = presenter ? 'Semua babak terbuka' : `✔ ${selesai}/${D.ACTS.length} babak · ${G.prog.xp} XP`;
    $('#map-note').textContent = presenter
      ? 'Lompatan di sini adalah navigasi presenter, bukan penyelesaian misi, dan tidak mengubah save Mode Cerita.'
      : 'Babak berikutnya terbuka setelah misi babak sebelumnya selesai. Babak yang sudah terbuka dapat diulang.';
    bangun();
    let awal = G.actIndex >= 0 ? G.actIndex : presenter ? 0 : G.prog.current.act || 0;
    if (!presenter && !G.isUnlocked(awal)) awal = 0;
    cancelAnimationFrame(animasi); animasi = 0;
    $('#peta-ratna').classList.remove('jalan');
    pilihan = awal;
    aturRatna(HENTI[awal].idx);
    frameRatna('idle');
    document.querySelectorAll('#map-list .map-item').forEach((li, k) => li.classList.toggle('pilih', k === awal));
    infoBabak(awal);
    if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute('open', ''); } }
    G.sfx.open();
    document.querySelectorAll('#map-list .peta-stop')[awal].focus({ preventScroll: true });
  }

  // Keyboard: panah memindah pilihan, angka 1–9 langsung memilih babak, Enter memainkan
  function pasangKeyboard() {
    dlg().addEventListener('keydown', e => {
      const naik = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.target.closest('.pi-actions')) return;
      if (naik) {
        e.preventDefault();
        pilih((pilihan + naik + D.ACTS.length) % D.ACTS.length, { fokus: true });
      } else if (/^[1-9]$/.test(e.key) && +e.key <= D.ACTS.length) {
        e.preventDefault();
        pilih(+e.key - 1, { fokus: true });
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        pilih(e.key === 'Home' ? 0 : D.ACTS.length - 1, { fokus: true });
      }
    });
    dlg().addEventListener('close', () => { cancelAnimationFrame(animasi); animasi = 0; });
  }
  pasangKeyboard();

  window.PETA = { buka, pilih, JALUR, HENTI, VW, VH, get pilihan() { return pilihan; }, get berjalan() { return !!animasi; } };
})();
