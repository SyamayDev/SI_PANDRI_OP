/* =====================================================================
   SI-PANDRI: Misi Laundry Beres! — art.js
   Semua grafis pixel digambar dengan kode (tanpa file gambar):
   - Karakter 48×64 pixel: Bu Ratna, Gilbert, Sarah, Syahril, pelanggan.
   - Ekspresi (mata, alis, mulut) dan pose (diam, melambai, membawa alat).
   - Latar 320×180 pixel: laundry sibuk/rapi, sore, papan diskusi, ruang kode.
   Gambar kecil ini diperbesar di layar tanpa smoothing (image-rendering: pixelated).
   ===================================================================== */
(function () {
  'use strict';

  const OUT = '#2B1D16';
  const EYE = '#1E1612';

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  function rect(ctx, x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function px(ctx, x, y, col) { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
  // Elips penuh. cx=24 berarti sumbu simetri di antara pixel 23 dan 24.
  function ell(ctx, cx, cy, rx, ry, col) {
    ctx.fillStyle = col;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      const dy = (y + 0.5 - cy) / ry;
      if (Math.abs(dy) > 1) continue;
      const w = rx * Math.sqrt(1 - dy * dy);
      const x0 = Math.round(cx - w), x1 = Math.round(cx + w);
      if (x1 > x0) ctx.fillRect(x0, y, x1 - x0, 1);
    }
  }
  // Garis tepi bawah elips (dagu) agar kepala terpisah dari badan.
  function ellBottomEdge(ctx, cx, cy, rx, ry, col) {
    ctx.fillStyle = col;
    for (let x = Math.round(cx - rx) + 1; x < Math.round(cx + rx) - 1; x++) {
      const dx = (x + 0.5 - cx) / rx;
      if (Math.abs(dx) > 1) continue;
      const y = Math.floor(cy + ry * Math.sqrt(1 - dx * dx) - 0.5);
      ctx.fillRect(x, y, 1, 1);
    }
  }
  function mirror(x, w = 1) { return 48 - x - w; }
  function sym(ctx, x, y, w, h, col) { rect(ctx, x, y, w, h, col); rect(ctx, mirror(x, w), y, w, h, col); }
  function outline(ctx, w, h, col) {
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    const solid = i => d[i * 4 + 3] > 40;
    const marks = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (solid(i)) continue;
      if ((x > 0 && solid(i - 1)) || (x < w - 1 && solid(i + 1)) || (y > 0 && solid(i - w)) || (y < h - 1 && solid(i + w))) marks.push(i);
    }
    ctx.fillStyle = col;
    marks.forEach(i => ctx.fillRect(i % w, Math.floor(i / w), 1, 1));
  }
  function hex(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, t) {
    const A = hex(a), B = hex(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }

  /* ---------------- Huruf pixel 3×5 (untuk papan nama di latar) ---------------- */
  const FONT = {
    A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'], C: ['011', '100', '100', '100', '011'],
    D: ['110', '101', '101', '101', '110'], E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'],
    G: ['011', '100', '101', '101', '011'], H: ['101', '101', '111', '101', '101'], I: ['111', '010', '010', '010', '111'],
    J: ['001', '001', '001', '101', '010'], K: ['101', '101', '110', '101', '101'], L: ['100', '100', '100', '100', '111'],
    M: ['10001', '11011', '10101', '10001', '10001'], N: ['1001', '1101', '1011', '1001', '1001'], O: ['010', '101', '101', '101', '010'],
    P: ['110', '101', '110', '100', '100'], Q: ['010', '101', '101', '110', '011'], R: ['110', '101', '110', '101', '101'],
    S: ['011', '100', '010', '001', '110'], T: ['111', '010', '010', '010', '010'], U: ['101', '101', '101', '101', '111'],
    V: ['101', '101', '101', '101', '010'], W: ['10001', '10001', '10101', '11011', '10001'], X: ['101', '101', '010', '101', '101'],
    Y: ['101', '101', '010', '010', '010'], Z: ['111', '001', '010', '100', '111'],
    0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['110', '001', '010', '100', '111'],
    3: ['110', '001', '010', '001', '110'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '110', '001', '110'],
    6: ['011', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'], 8: ['111', '101', '111', '101', '111'],
    9: ['111', '101', '111', '001', '110'], '.': ['0', '0', '0', '0', '1'], ',': ['0', '0', '0', '1', '1'],
    '/': ['001', '001', '010', '100', '100'], ':': ['0', '1', '0', '1', '0'], '-': ['000', '000', '111', '000', '000'],
    ' ': ['00', '00', '00', '00', '00'], '=': ['000', '111', '000', '111', '000'], '>': ['100', '010', '001', '010', '100'],
    '_': ['000', '000', '000', '000', '111']
  };
  function textWidth(str) { return [...str].reduce((s, ch) => s + (FONT[ch] || FONT[' '])[0].length + 1, -1); }
  function pxText(ctx, str, x, y, col) {
    let cx = x;
    for (const ch of str.toUpperCase()) {
      const g = FONT[ch] || FONT[' '];
      g.forEach((row, ry) => [...row].forEach((b, rx) => { if (b === '1') px(ctx, cx + rx, y + ry, col); }));
      cx += g[0].length + 1;
    }
  }

  /* =====================================================================
     KARAKTER
     ===================================================================== */
  const CHARS = {
    // Gilbert — harimau jantan berkacamata (teliti, mengamati detail)
    gilbert: {
      kind: 'animal', fur: '#EC8B2E', furS: '#C46519', light: '#FFF2DE', mark: '#3A2316',
      earIn: '#FFE2C4', nose: '#4B2A1D', pattern: 'tiger', ears: 'tiger',
      glasses: 'square', glassC: '#1F2B3A', tail: 'tiger',
      shirt: '#9CC8EA', top: '#24476E', topS: '#1A3452', vest: true,
      pants: '#3A3F4C', shoe: '#272A31', prop: 'magnifier'
    },
    // Sarah — snow leopard betina berkacamata (komunikatif, memandu)
    sarah: {
      kind: 'animal', fur: '#E9EDF2', furS: '#B9C2CE', light: '#FFFFFF', mark: '#56606E',
      earIn: '#F3C4CF', nose: '#D9879A', pattern: 'leopard', ears: 'small',
      glasses: 'round', glassC: '#7B3A6C', tail: 'leopard', lashes: true, clip: '#E8678C',
      shirt: '#FFFFFF', top: '#9B7CCB', topS: '#795BA7', cardigan: true,
      pants: '#4A4161', shoe: '#3A2D4A', prop: 'clipboard'
    },
    // Syahril — beruang putih jantan tanpa kacamata (merancang alur & program)
    syahril: {
      kind: 'animal', fur: '#F7F7F1', furS: '#CED1C8', light: '#EDE2CA', mark: null,
      earIn: '#E2D3BE', nose: '#2A2421', pattern: null, ears: 'bear',
      glasses: null, tail: null, big: true,
      shirt: '#1F3A5F', top: '#1F3A5F', topS: '#152A45', hoodie: true, string: '#3CCAD9',
      pants: '#394150', shoe: '#1E2228', prop: 'laptop'
    },
    // Bu Ratna — pemilik Parfait Laundry (tokoh manusia, berhijab, memakai celemek)
    ratna: {
      kind: 'human', skin: '#E2A986', skinS: '#C48964', hijab: '#C8553D', hijabS: '#9B3B29',
      top: '#4E8C5A', topS: '#3A6B45', apron: '#F3E7C9', apronS: '#D8C69F', skirt: '#5C4A6E', shoe: '#3A2E26',
      prop: 'notebook'
    },
    // Pelanggan fiktif
    dimas: { kind: 'human', skin: '#D9A07A', skinS: '#B9805C', hair: '#2B1E17', hairStyle: 'short', top: '#3F7FC4', topS: '#2F62A0', pants: '#3B3B48', shoe: '#2A2A2E', prop: 'bag' },
    lala: { kind: 'human', skin: '#F0C3A0', skinS: '#D4A07C', hair: '#4A2C1E', hairStyle: 'long', top: '#E8B33C', topS: '#C48F22', skirt: '#4F7FA8', shoe: '#5B3A2A', prop: 'phone' },
    nadia: { kind: 'human', skin: '#E7B28E', skinS: '#C99270', hijab: '#3E8F86', hijabS: '#2C6C65', top: '#F3E7C9', topS: '#D8C69F', skirt: '#2F4A6B', shoe: '#2A2A2E', prop: 'bag' },
    joko: { kind: 'human', skin: '#C98E68', skinS: '#A8704C', hair: '#8C8C8C', hairStyle: 'short', mustache: true, top: '#8A5A3C', topS: '#6B432B', pants: '#3E3A34', shoe: '#2A221C', prop: 'bag' }
  };

  const EXPR = {
    neutral: { eyes: 'open', brows: 'normal', mouth: 'smile' },
    smile: { eyes: 'open', brows: 'normal', mouth: 'grin' },
    happy: { eyes: 'happy', brows: 'up', mouth: 'open', blush: true },
    proud: { eyes: 'happy', brows: 'normal', mouth: 'grin', blush: true, sparkle: true },
    worried: { eyes: 'open', brows: 'worried', mouth: 'worry', sweat: true },
    tired: { eyes: 'tired', brows: 'worried', mouth: 'flat', sweat: true },
    surprised: { eyes: 'wide', brows: 'up', mouth: 'o' },
    thinking: { eyes: 'side', brows: 'raise', mouth: 'flat' },
    focused: { eyes: 'open', brows: 'focused', mouth: 'flat' }
  };

  /* ---------- Bagian tubuh ---------- */
  function drawTail(ctx, c) {
    if (!c.tail) return;
    const pts = c.tail === 'tiger'
      ? [[37, 55], [39, 55], [41, 54], [42, 52], [43, 50], [43, 48], [42, 46], [41, 45]]
      : [[37, 56], [39, 56], [41, 55], [43, 53], [44, 51], [44, 48], [44, 45], [43, 42], [41, 41]];
    const r = c.tail === 'tiger' ? 1.6 : 2.3;
    pts.forEach(([x, y], i) => {
      const col = c.tail === 'tiger' ? (i % 3 === 2 ? c.mark : c.fur) : c.fur;
      ell(ctx, x + 0.5, y + 0.5, r, r, col);
    });
    if (c.tail === 'leopard') {
      [[40, 55], [43, 50], [43, 44]].forEach(([x, y]) => px(ctx, x, y, c.mark));
      ell(ctx, 41.5, 41.5, 2, 2, c.mark);
    }
  }

  function drawBody(ctx, c, pose) {
    const skin = c.kind === 'human' ? c.skin : c.fur;
    const skinS = c.kind === 'human' ? c.skinS : c.furS;
    // Kaki / rok
    if (c.skirt) {
      rect(ctx, 15, 52, 18, 8, c.skirt);
      rect(ctx, 29, 52, 4, 8, mix(c.skirt, '#000000', 0.2));
      sym(ctx, 17, 60, 6, 3, c.shoe);
    } else {
      sym(ctx, 17, 53, 6, 7, c.pants);
      rect(ctx, 25, 53, 2, 7, mix(c.pants, '#000000', 0.25));
      sym(ctx, 16, 59, 7, 4, c.shoe);
    }
    // Badan
    ell(ctx, 24, 38, c.big ? 12 : 11, 5, c.top);
    rect(ctx, c.big ? 12 : 13, 37, c.big ? 24 : 22, 17, c.top);
    rect(ctx, c.big ? 32 : 31, 38, 4, 15, c.topS);
    if (c.vest) { // kemeja biru muda + rompi navy
      rect(ctx, 21, 34, 6, 8, c.shirt);
      px(ctx, 23, 42, c.shirt); px(ctx, 24, 42, c.shirt);
      rect(ctx, 23, 35, 2, 9, '#C8E2F5');
      px(ctx, 22, 46, '#E6B85C'); px(ctx, 22, 49, '#E6B85C');
    }
    if (c.cardigan) { // atasan putih + kardigan ungu
      rect(ctx, 20, 34, 8, 20, c.shirt);
      rect(ctx, 27, 36, 1, 18, '#E3E3EA');
      sym(ctx, 19, 36, 1, 18, c.topS);
      px(ctx, 18, 44, '#FFFFFF'); px(ctx, 18, 48, '#FFFFFF');
    }
    if (c.hoodie) { // hoodie navy dengan tali cyan dan saku
      ell(ctx, 24, 35, 9, 3, c.topS);
      sym(ctx, 21, 36, 1, 7, c.string);
      sym(ctx, 21, 43, 1, 1, '#FFFFFF');
      rect(ctx, 17, 46, 14, 5, c.topS);
      rect(ctx, 18, 46, 12, 1, mix(c.top, '#FFFFFF', 0.12));
    }
    if (c.apron) { // celemek Parfait Laundry
      rect(ctx, 17, 40, 14, 15, c.apron);
      rect(ctx, 28, 41, 3, 14, c.apronS);
      rect(ctx, 20, 47, 8, 4, c.apronS);
      rect(ctx, 21, 48, 6, 1, '#C8553D');
      sym(ctx, 17, 38, 1, 3, c.apron);
    }
    // Lengan & tangan sesuai pose
    if (pose === 'prop') {
      sym(ctx, 10, 37, 4, 8, c.top);
      rect(ctx, 34, 37, 4, 8, c.topS);
      sym(ctx, 13, 43, 7, 4, c.top);
      ell(ctx, 20.5, 46, 2.6, 2.3, skin); ell(ctx, 27.5, 46, 2.6, 2.3, skin);
    } else {
      rect(ctx, 10, 37, 4, 13, c.top);
      if (pose === 'wave') {
        // Lengan kanan terangkat miring keluar dari bahu, telapak di samping kepala
        rect(ctx, 34, 36, 4, 5, c.topS);
        rect(ctx, 36, 32, 4, 5, c.top);
        rect(ctx, 38, 28, 4, 5, c.top);
        rect(ctx, 39, 30, 3, 6, c.topS);
        rect(ctx, 38, 27, 4, 1, mix(c.top, '#FFFFFF', 0.25));
        ell(ctx, 40.5, 24.5, 2.9, 2.7, skin);
        px(ctx, 39, 22, skin); px(ctx, 41, 21, skin); px(ctx, 42, 22, skin);
        px(ctx, 42, 25, skinS); px(ctx, 41, 26, skinS);
      } else {
        rect(ctx, 34, 37, 4, 13, c.topS);
        ell(ctx, 36, 51, 2.6, 2.4, skin);
      }
      ell(ctx, 12, 51, 2.6, 2.4, skin);
      px(ctx, 11, 52, skinS); px(ctx, 13, 52, skinS);
    }
  }

  function drawProp(ctx, c) {
    switch (c.prop) {
      case 'magnifier':
        rect(ctx, 26, 45, 2, 6, '#7A4E2C');
        ell(ctx, 30, 41, 4.5, 4.5, '#2F3640');
        ell(ctx, 30, 41, 3.3, 3.3, '#BFE6F5');
        px(ctx, 28, 39, '#FFFFFF'); px(ctx, 29, 39, '#FFFFFF'); px(ctx, 28, 40, '#FFFFFF');
        break;
      case 'clipboard':
        rect(ctx, 17, 38, 14, 12, '#A8763E');
        rect(ctx, 18, 40, 12, 9, '#FFFDF6');
        rect(ctx, 21, 37, 6, 2, '#5E6672');
        [41, 43, 45, 47].forEach(y => rect(ctx, 19, y, y === 47 ? 6 : 9, 1, '#8B93A3'));
        px(ctx, 28, 43, '#3FA36B'); px(ctx, 27, 44, '#3FA36B');
        break;
      case 'laptop':
        rect(ctx, 15, 37, 18, 11, '#2D3540');
        rect(ctx, 16, 38, 16, 9, '#0F2238');
        [39, 41, 43].forEach((y, i) => rect(ctx, 17, y, [9, 12, 7][i], 1, i === 1 ? '#3CCAD9' : '#9FE6EE'));
        rect(ctx, 13, 48, 22, 2, '#8D96A3');
        break;
      case 'notebook':
        rect(ctx, 16, 41, 16, 9, '#F8F1DE');
        rect(ctx, 23, 41, 2, 9, '#C9B98F');
        [43, 45, 47].forEach(y => { rect(ctx, 17, y, 5, 1, '#7C8AA0'); rect(ctx, 26, y, 5, 1, '#7C8AA0'); });
        break;
      case 'bag':
        ell(ctx, 24, 46, 8, 5, '#D96C4A');
        rect(ctx, 17, 44, 14, 6, '#D96C4A');
        rect(ctx, 22, 39, 1, 4, '#A04A30'); rect(ctx, 25, 39, 1, 4, '#A04A30'); rect(ctx, 22, 39, 4, 1, '#A04A30');
        rect(ctx, 19, 43, 3, 2, '#7FB0E0'); rect(ctx, 25, 42, 4, 2, '#F2D16B');
        break;
      case 'phone':
        rect(ctx, 22, 40, 5, 8, '#2D3540');
        rect(ctx, 23, 41, 3, 5, '#7FD0E0');
        break;
    }
  }

  function drawAnimalHead(ctx, c) {
    // Telinga
    if (c.ears === 'tiger') {
      ell(ctx, 13, 12, 4.6, 4.6, c.fur); ell(ctx, 35, 12, 4.6, 4.6, c.fur);
      ell(ctx, 13, 12.5, 2.4, 2.4, c.earIn); ell(ctx, 35, 12.5, 2.4, 2.4, c.earIn);
      px(ctx, 11, 9, c.mark); px(ctx, 36, 9, c.mark);
    } else if (c.ears === 'small') {
      ell(ctx, 14, 12.5, 3.8, 3.6, c.fur); ell(ctx, 34, 12.5, 3.8, 3.6, c.fur);
      ell(ctx, 14, 13, 1.8, 1.8, c.earIn); ell(ctx, 34, 13, 1.8, 1.8, c.earIn);
    } else {
      ell(ctx, 12.5, 12.5, 4.4, 4.2, c.fur); ell(ctx, 35.5, 12.5, 4.4, 4.2, c.fur);
      ell(ctx, 12.5, 13, 2.2, 2, c.earIn); ell(ctx, 35.5, 13, 2.2, 2, c.earIn);
    }
    // Kepala dengan bayangan kanan-bawah
    const rx = c.big ? 15.5 : 15, ry = c.big ? 12.5 : 12;
    ell(ctx, 24, 22.5, rx, ry, c.furS);
    ell(ctx, 23.4, 21.8, rx - 0.8, ry - 0.8, c.fur);
    // Pipi berbulu (harimau & snow leopard): tonjolan bulat, bukan pixel tunggal
    if (c.pattern) {
      ell(ctx, 10, 26.5, 2.6, 2.8, c.fur); ell(ctx, 38, 26.5, 2.6, 2.8, c.fur);
      px(ctx, 39, 28, c.furS); px(ctx, 39, 27, c.furS);
    }
    // Moncong
    ell(ctx, 24, 28.6, 7.4, 4.6, c.light);
    if (c.pattern === 'tiger') { ell(ctx, 18, 19.5, 3.4, 2, c.light); ell(ctx, 30, 19.5, 3.4, 2, c.light); }
    // Motif
    if (c.pattern === 'tiger') {
      rect(ctx, 23, 11, 2, 4, c.mark); rect(ctx, 20, 12, 1, 3, c.mark); rect(ctx, 27, 12, 1, 3, c.mark);
      sym(ctx, 10, 21, 3, 1, c.mark); sym(ctx, 10, 24, 3, 1, c.mark); sym(ctx, 9, 27, 3, 1, c.mark);
    } else if (c.pattern === 'leopard') {
      // Roset terbuka (seperti huruf C) yang dicerminkan kiri-kanan
      const roset = (x, y) => [[0, 0], [1, 0], [-1, 1], [-1, 2]].forEach(([dx, dy]) => {
        px(ctx, x + dx, y + dy, c.mark); px(ctx, 47 - (x + dx), y + dy, c.mark);
      });
      roset(16, 13); roset(12, 24);
      rect(ctx, 23, 11, 2, 1, c.mark);
      px(ctx, 20, 11, c.mark); px(ctx, 27, 11, c.mark);
    }
    // Hidung
    if (c.ears === 'bear') {
      ell(ctx, 24, 26.5, 3, 1.8, c.nose);
      px(ctx, 22, 25, '#6A615C');
    } else {
      rect(ctx, 22, 26, 4, 1, c.nose); rect(ctx, 23, 27, 2, 1, c.nose);
    }
    ellBottomEdge(ctx, 24, 22.5, rx, ry, OUT);
  }

  function drawHumanHead(ctx, c) {
    if (c.hijab) {
      // Hijab: bagian belakang kepala + menutup bahu dengan ujung membulat
      for (let y = 30; y <= 42; y++) {
        let w = Math.min(13, 10 + (y - 30) * 0.45);
        if (y === 41) w -= 1;
        if (y === 42) w -= 2.5;
        rect(ctx, Math.round(24 - w), y, Math.round(w * 2), 1, y > 38 ? c.hijabS : c.hijab);
      }
      ell(ctx, 24, 21, 13.5, 14, c.hijabS);
      ell(ctx, 23.5, 20.5, 13, 13.4, c.hijab);
      ell(ctx, 24, 23.5, 9, 10, c.skinS);
      ell(ctx, 23.6, 23.1, 8.5, 9.5, c.skin);
      ell(ctx, 24, 15, 10, 3.6, c.hijab); // dahi tertutup
      rect(ctx, 15, 15, 18, 2, c.hijab);
    } else {
      sym(ctx, 13, 21, 2, 4, c.skin); // telinga
      ell(ctx, 24, 22.5, 10, 11, c.skinS);
      ell(ctx, 23.6, 22.1, 9.5, 10.5, c.skin);
      if (c.hairStyle === 'long') {
        ell(ctx, 24, 17, 11.5, 8, c.hair);
        sym(ctx, 12, 17, 4, 16, c.hair);
        rect(ctx, 16, 15, 16, 3, c.hair);
      } else {
        ell(ctx, 24, 16, 11, 6.5, c.hair);
        rect(ctx, 14, 15, 20, 3, c.hair);
        sym(ctx, 13, 17, 2, 4, c.hair);
      }
      ellBottomEdge(ctx, 24, 22.5, 10, 11, OUT);
    }
    px(ctx, 23, 26, c.skinS); px(ctx, 24, 26, c.skinS);
    if (c.mustache) { rect(ctx, 21, 28, 6, 1, c.hair); px(ctx, 20, 29, c.hair); px(ctx, 27, 29, c.hair); }
  }

  /* ---------- Wajah: mata, alis, mulut ---------- */
  function face(c) {
    return c.kind === 'human'
      ? { eL: 19, eR: 27, eY: 22, bY: 19, mY: 29, w: 2, h: 2 }
      : { eL: 17, eR: 29, eY: 21, bY: 17, mY: 29.5, w: 2, h: 3 };
  }
  function drawEyes(ctx, c, kind) {
    const f = face(c), browCol = c.kind === 'human' ? (c.hair || '#3A2418') : (c.mark || c.furS);
    [f.eL, f.eR].forEach((x, side) => {
      const y = f.eY;
      switch (kind) {
        case 'happy':
          px(ctx, x - 1, y + 1, EYE); px(ctx, x, y, EYE); px(ctx, x + 1, y, EYE); px(ctx, x + 2, y + 1, EYE);
          break;
        case 'tired':
          rect(ctx, x, y + 1, f.w, f.h - 1, EYE);
          rect(ctx, x - 1, y, f.w + 2, 1, browCol);
          break;
        case 'wide':
          rect(ctx, x - 1, y - 1, f.w + 2, f.h + 1, '#FFFFFF');
          rect(ctx, x, y, f.w, f.h, EYE);
          break;
        case 'side':
          rect(ctx, x + (side ? 1 : 0), y, f.w, f.h, EYE);
          px(ctx, x + (side ? 1 : 0), y, '#FFFFFF');
          break;
        default:
          rect(ctx, x, y, f.w, f.h, EYE);
          px(ctx, x, y, '#FFFFFF');
      }
      if (c.lashes) { px(ctx, side ? x + 2 : x - 1, y - 1, EYE); }
    });
  }
  function drawBrows(ctx, c, kind) {
    const f = face(c);
    const col = c.kind === 'human' ? (c.hijab ? c.hijabS : c.hair) : (c.mark || '#9EA39A');
    [f.eL, f.eR].forEach((x, side) => {
      const y = f.bY, inner = side ? x - 1 : x + 2, outer = side ? x + 2 : x - 1;
      switch (kind) {
        case 'up': rect(ctx, x - 1, y - 1, 4, 1, col); break;
        case 'worried': px(ctx, inner, y - 1, col); px(ctx, x, y, col); px(ctx, x + 1, y, col); px(ctx, outer, y + 1, col); break;
        case 'focused': px(ctx, outer, y - 1, col); px(ctx, x, y, col); px(ctx, x + 1, y, col); px(ctx, inner, y + 1, col); break;
        case 'raise': rect(ctx, x - 1, side ? y - 2 : y, 4, 1, col); break;
        default: rect(ctx, x - 1, y, 4, 1, col);
      }
    });
  }
  function drawMouth(ctx, c, kind) {
    const f = face(c), y = Math.round(f.mY), dark = '#5A2A24', tongue = '#E9878A';
    switch (kind) {
      case 'grin':
        px(ctx, 21, y, dark); rect(ctx, 22, y + 1, 4, 1, dark); px(ctx, 26, y, dark);
        break;
      case 'open':
        rect(ctx, 22, y, 4, 1, dark); rect(ctx, 22, y + 1, 4, 1, tongue); rect(ctx, 23, y + 2, 2, 1, dark);
        break;
      case 'flat': rect(ctx, 22, y + 1, 4, 1, dark); break;
      case 'worry': px(ctx, 21, y + 1, dark); px(ctx, 22, y, dark); px(ctx, 23, y + 1, dark); px(ctx, 24, y, dark); px(ctx, 25, y + 1, dark); px(ctx, 26, y, dark); break;
      case 'o': rect(ctx, 23, y, 2, 2, dark); break;
      default: // smile kecil
        px(ctx, 22, y, dark); rect(ctx, 23, y + 1, 2, 1, dark); px(ctx, 25, y, dark);
    }
  }
  function drawGlasses(ctx, c) {
    if (!c.glasses) return;
    const g = c.glassC;
    if (c.glasses === 'square') {
      [14, 26].forEach(x => {
        rect(ctx, x, 18, 8, 1, g); rect(ctx, x, 24, 8, 1, g);
        rect(ctx, x, 18, 1, 7, g); rect(ctx, x + 7, 18, 1, 7, g);
        px(ctx, x + 5, 19, '#FFFFFF'); px(ctx, x + 6, 20, '#FFFFFF');
      });
      rect(ctx, 22, 20, 4, 1, g);
      sym(ctx, 10, 20, 4, 1, g);
    } else {
      [[18, 22], [30, 22]].forEach(([cx, cy]) => {
        for (let y = cy - 5; y <= cy + 5; y++) for (let x = cx - 5; x <= cx + 5; x++) {
          const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
          if (d >= 3.4 && d < 4.4) px(ctx, x, y, g);
        }
        px(ctx, cx + 1, cy - 3, '#FFFFFF'); px(ctx, cx + 2, cy - 2, '#FFFFFF');
      });
      rect(ctx, 22, 21, 4, 1, g);
      sym(ctx, 10, 21, 4, 1, g);
    }
  }
  // Bagian yang ikut diberi garis tepi (pipi merona, jepit bunga Sarah)
  function drawExtras(ctx, c, e) {
    if (e.blush) { sym(ctx, c.kind === 'human' ? 16 : 13, 26, 2, 1, '#F09A9A'); }
    if (c.clip) {
      px(ctx, 12, 9, c.clip); px(ctx, 11, 10, c.clip); px(ctx, 13, 10, c.clip); px(ctx, 12, 11, c.clip);
      px(ctx, 12, 10, '#FFE08A');
    }
  }
  // Efek melayang digambar SETELAH garis tepi agar tidak menjadi kotak hitam
  function drawEffects(ctx, e) {
    if (e.sweat) {
      px(ctx, 39, 12, '#BFE8F8'); rect(ctx, 38, 13, 3, 2, '#9FD8F2'); rect(ctx, 38, 15, 3, 1, '#6FB8DE');
      px(ctx, 38, 13, '#FFFFFF');
    }
    if (e.sparkle) {
      px(ctx, 42, 7, '#F7D46B'); px(ctx, 42, 11, '#F7D46B'); px(ctx, 40, 9, '#F7D46B'); px(ctx, 44, 9, '#F7D46B');
      px(ctx, 42, 8, '#FFE9A8'); px(ctx, 42, 10, '#FFE9A8'); px(ctx, 41, 9, '#FFE9A8'); px(ctx, 43, 9, '#FFE9A8');
      px(ctx, 42, 9, '#FFFFFF');
    }
  }

  const cache = new Map();
  // Menggambar satu karakter: id, ekspresi, pose ('idle'|'wave'|'prop'), mulut terbuka (bicara)
  function sprite(id, exprName = 'neutral', pose = 'idle', talking = false) {
    const key = [id, exprName, pose, talking].join(':');
    if (cache.has(key)) return cache.get(key);
    const c = CHARS[id];
    const e = Object.assign({}, EXPR[exprName] || EXPR.neutral);
    if (talking) e.mouth = e.mouth === 'open' ? 'grin' : 'open';
    const cv = canvas(48, 64), ctx = cv.getContext('2d');
    drawTail(ctx, c);
    drawBody(ctx, c, pose);
    if (c.kind === 'animal') drawAnimalHead(ctx, c); else drawHumanHead(ctx, c);
    drawEyes(ctx, c, e.eyes);
    drawBrows(ctx, c, e.brows);
    drawMouth(ctx, c, e.mouth);
    drawGlasses(ctx, c);
    if (pose === 'prop') drawProp(ctx, c);
    drawExtras(ctx, c, e);
    outline(ctx, 48, 64, OUT);
    drawEffects(ctx, e);
    cache.set(key, cv);
    return cv;
  }
  // Potret kepala untuk kotak dialog
  function portrait(id, exprName = 'neutral', talking = false) {
    const src = sprite(id, exprName, 'idle', talking);
    const cv = canvas(40, 38), ctx = cv.getContext('2d');
    ctx.drawImage(src, 4, 3, 40, 38, 0, 0, 40, 38);
    return cv;
  }

  /* =====================================================================
     LATAR (320×180)
     ===================================================================== */
  const W = 320, H = 180;

  function wall(ctx, base, stripe, h = 118) {
    rect(ctx, 0, 0, W, h, base);
    for (let x = 4; x < W; x += 10) rect(ctx, x, 0, 1, h, stripe);
    rect(ctx, 0, 0, W, 4, mix(base, '#000000', 0.15));
    rect(ctx, 0, h - 14, W, 1, mix(base, '#000000', 0.12));
    rect(ctx, 0, h - 13, W, 11, mix(base, '#FFFFFF', 0.18));
    rect(ctx, 0, h - 3, W, 3, '#8E5A3C');
  }
  function floor(ctx, a, b, y0 = 118) {
    for (let y = y0; y < H; y += 8) for (let x = 0; x < W; x += 16) {
      const odd = ((x / 16) + ((y - y0) / 8)) % 2 === 1;
      rect(ctx, x, y, 16, 8, odd ? a : b);
    }
    for (let y = y0; y < H; y++) {
      const t = (y - y0) / (H - y0);
      if (t > 0.5) for (let x = (y % 2); x < W; x += 2) px(ctx, x, y, 'rgba(60,30,20,' + ((t - 0.5) * 0.35).toFixed(2) + ')');
    }
  }
  function windowFrame(ctx, x, y, w, h, sky) {
    rect(ctx, x - 3, y - 3, w + 6, h + 6, '#8E5A3C');
    for (let i = 0; i < h; i++) rect(ctx, x, y + i, w, 1, mix(sky[0], sky[1], i / h));
    rect(ctx, x + w / 2 - 1, y, 2, h, '#F6EEDD');
    rect(ctx, x, y + h / 2 - 1, w, 2, '#F6EEDD');
    rect(ctx, x - 5, y + h + 2, w + 10, 3, '#A26B47');
    // tanaman di ambang jendela
    rect(ctx, x + 4, y + h - 6, 8, 8, '#C8553D');
    ell(ctx, x + 8, y + h - 9, 6, 5, '#4E8C5A'); ell(ctx, x + 6, y + h - 12, 3, 3, '#6FAE6A');
  }
  function washer(ctx, x, y, t, clothes) {
    rect(ctx, x, y, 44, 52, '#C9CED6');
    rect(ctx, x, y, 42, 50, '#F1F3F6');
    rect(ctx, x, y, 42, 9, '#DDE2E8');
    rect(ctx, x + 4, y + 3, 10, 3, '#3F4A57'); rect(ctx, x + 5, y + 4, 4, 1, '#3CCAD9');
    ell(ctx, x + 33, y + 4.5, 2.2, 2.2, '#9AA3AE'); ell(ctx, x + 27, y + 4.5, 2.2, 2.2, '#9AA3AE');
    ell(ctx, x + 21, y + 29, 14, 14, '#AAB4BF');
    ell(ctx, x + 21, y + 29, 11.5, 11.5, '#2C3E50');
    // isi drum berputar
    if (clothes) {
      const cols = ['#E8B33C', '#D96C4A', '#7FB0E0', '#F3E7C9', '#9B7CCB'];
      for (let i = 0; i < 5; i++) {
        const a = t * 0.9 + i * 1.256;
        ell(ctx, x + 21 + Math.cos(a) * 6, y + 31 + Math.sin(a) * 5, 3.2, 2.4, cols[i]);
      }
    }
    px(ctx, x + 15, y + 22, '#FFFFFF'); px(ctx, x + 16, y + 21, '#FFFFFF'); px(ctx, x + 14, y + 23, '#FFFFFF');
    rect(ctx, x + 2, y + 50, 40, 2, '#9AA3AE');
  }
  function shelf(ctx, x, y, w, items) {
    rect(ctx, x, y, w, 3, '#8E5A3C'); rect(ctx, x, y + 3, w, 1, '#6B4229');
    items.forEach(([dx, hgt, col, kind]) => {
      if (kind === 'fold') {
        for (let k = 0; k < hgt; k++) rect(ctx, x + dx, y - 3 - k * 3, 12, 3, k % 2 ? mix(col, '#FFFFFF', 0.25) : col);
      } else {
        rect(ctx, x + dx, y - hgt, 7, hgt, col);
        rect(ctx, x + dx + 2, y - hgt - 2, 3, 2, '#F1F3F6');
        rect(ctx, x + dx + 1, y - hgt + 3, 5, 3, '#FFFFFF');
      }
    });
  }
  function pile(ctx, x, y, seed, big) {
    const cols = ['#E8B33C', '#D96C4A', '#7FB0E0', '#F3E7C9', '#9B7CCB', '#4E8C5A', '#E46A8C'];
    let s = seed;
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const n = big ? 14 : 8;
    for (let i = 0; i < n; i++) ell(ctx, x + (r() - 0.5) * (big ? 30 : 20), y - r() * (big ? 14 : 9), 5 + r() * 4, 3 + r() * 2, cols[Math.floor(r() * cols.length)]);
  }
  function basket(ctx, x, y, full) {
    if (full) pile(ctx, x + 12, y + 2, x * 7 + 3, false);
    rect(ctx, x, y, 24, 14, '#C99A5B');
    for (let i = 0; i < 24; i += 4) rect(ctx, x + i, y, 1, 14, '#A87C42');
    rect(ctx, x, y + 6, 24, 1, '#A87C42');
    rect(ctx, x - 1, y, 26, 2, '#B8874A');
  }
  function counter(ctx, x, y, w, opts) {
    rect(ctx, x, y, w, 6, '#B8875A');
    rect(ctx, x, y + 6, w, H - y - 6, '#8E5A3C');
    for (let i = x + 6; i < x + w; i += 22) rect(ctx, i, y + 10, 16, H - y - 14, '#7A4C31');
    rect(ctx, x, y + 6, w, 1, '#6B4229');
    // timbangan
    rect(ctx, x + 10, y - 3, 22, 3, '#5E6672');
    rect(ctx, x + 13, y - 9, 16, 6, '#8D96A3');
    rect(ctx, x + 15, y - 8, 9, 3, '#173A2A'); rect(ctx, x + 16, y - 7, 6, 1, '#4CE08A');
    ell(ctx, x + 21, y - 12, 9, 2.4, '#C9CED6');
    // buku catatan / laptop
    if (opts.laptop) {
      rect(ctx, x + 44, y - 16, 26, 16, '#2D3540');
      rect(ctx, x + 46, y - 14, 22, 12, '#0F2238');
      rect(ctx, x + 48, y - 12, 12, 1, '#3CCAD9'); rect(ctx, x + 48, y - 9, 16, 1, '#9FE6EE'); rect(ctx, x + 48, y - 6, 9, 1, '#9FE6EE');
      rect(ctx, x + 41, y - 1, 32, 2, '#8D96A3');
    } else {
      rect(ctx, x + 44, y - 4, 24, 4, '#F8F1DE'); rect(ctx, x + 55, y - 4, 2, 4, '#C9B98F');
      rect(ctx, x + 46, y - 3, 7, 1, '#7C8AA0'); rect(ctx, x + 59, y - 3, 7, 1, '#7C8AA0');
    }
    if (opts.papers) {
      [[x + 74, y - 2, '#FFF6D8'], [x + 80, y - 3, '#F8F1DE'], [x + 72, y - 4, '#FFFDF6']].forEach(([a, b, col]) => rect(ctx, a, b, 10, 3, col));
      rect(ctx, x + 88, y - 7, 8, 7, '#D9D9D9'); rect(ctx, x + 89, y - 6, 6, 2, '#2F4A6B');
    }
  }
  function priceBoard(ctx, x, y) {
    rect(ctx, x - 2, y - 2, 70, 34, '#8E5A3C');
    rect(ctx, x, y, 66, 30, '#24384A');
    pxText(ctx, 'HARGA PER KG', x + 4, y + 3, '#F7D46B');
    pxText(ctx, 'REGULER 6.000', x + 4, y + 12, '#F3E7C9');
    pxText(ctx, 'EXPRESS 10.000', x + 4, y + 20, '#F3E7C9');
  }
  function sign(ctx, x, y) {
    const text = 'PARFAIT LAUNDRY', w = textWidth(text) + 10;
    rect(ctx, x - 1, y - 1, w + 2, 13, '#0E2033');
    rect(ctx, x, y, w, 11, '#1F3A5F');
    pxText(ctx, text, x + 5, y + 3, '#7FE6F0');
    rect(ctx, x + 4, y - 5, 1, 4, '#5E6672'); rect(ctx, x + w - 5, y - 5, 1, 4, '#5E6672');
  }
  function notesOnFloor(ctx) {
    [[96, 150, 3], [140, 166, -2], [60, 158, 1], [176, 156, 2]].forEach(([x, y]) => {
      rect(ctx, x, y, 9, 6, '#FFFDF6'); rect(ctx, x + 1, y + 2, 6, 1, '#9AA3AE');
    });
  }
  function whiteboard(ctx, x, y) {
    rect(ctx, x - 3, y - 3, 92, 62, '#9AA3AE');
    rect(ctx, x, y, 86, 56, '#FBFBF7');
    pxText(ctx, 'PAPAN MASALAH', x + 4, y + 3, '#1F3A5F');
    const notes = [['#F7D46B', 6, 14], ['#F2A0B5', 30, 14], ['#9FE6EE', 54, 14], ['#B8E0A0', 6, 34], ['#F7D46B', 30, 34], ['#F2A0B5', 54, 34]];
    notes.forEach(([col, dx, dy]) => {
      rect(ctx, x + dx, y + dy, 20, 15, col);
      rect(ctx, x + dx + 3, y + dy + 4, 13, 1, '#5E6672'); rect(ctx, x + dx + 3, y + dy + 8, 9, 1, '#5E6672');
    });
    rect(ctx, x + 26, y + 21, 4, 1, '#C8553D'); rect(ctx, x + 50, y + 41, 4, 1, '#C8553D');
    rect(ctx, x + 6, y + 58, 74, 2, '#7C8592');
  }

  function drawLaundry(ctx, v, t) {
    const evening = v === 'evening';
    const tidy = v === 'tidy';
    const busy = v === 'busy';
    wall(ctx, evening ? '#EFD6B7' : '#F4E5C8', evening ? '#E6C9A5' : '#EAD8B4');
    floor(ctx, '#C97B5D', '#E2A586');
    if (v === 'board') whiteboard(ctx, 10, 18);
    else windowFrame(ctx, 16, 22, 58, 46, evening ? ['#5B4A7A', '#F2A06A'] : ['#9BD3F0', '#E3F4FB']);
    sign(ctx, 112, 8);
    priceBoard(ctx, 92, 28);
    washer(ctx, 168, 66, t, true);
    washer(ctx, 214, 66, t + 1.7, !tidy || true);
    washer(ctx, 260, 66, t + 3.1, busy);
    shelf(ctx, 166, 46, 140, tidy
      ? [[4, 3, '#7FB0E0', 'fold'], [20, 4, '#F3E7C9', 'fold'], [36, 3, '#E8B33C', 'fold'], [56, 14, '#3CCAD9'], [66, 18, '#C8553D'], [76, 12, '#4E8C5A'], [96, 4, '#9B7CCB', 'fold'], [112, 3, '#E46A8C', 'fold']]
      : [[4, 14, '#3CCAD9'], [14, 18, '#C8553D'], [24, 12, '#4E8C5A'], [40, 16, '#E8B33C'], [52, 10, '#9B7CCB'], [72, 18, '#3CCAD9'], [86, 14, '#C8553D'], [104, 2, '#F3E7C9', 'fold'], [120, 12, '#7FB0E0']]);
    if (busy) {
      pile(ctx, 34, 130, 11, true); pile(ctx, 70, 124, 29, true);
      basket(ctx, 96, 120, true); basket(ctx, 6, 134, true); basket(ctx, 130, 130, true);
      notesOnFloor(ctx);
    } else if (tidy) {
      basket(ctx, 96, 122, false);
      for (let k = 0; k < 4; k++) rect(ctx, 20, 124 - k * 4, 22, 4, ['#7FB0E0', '#F3E7C9', '#E8B33C', '#9B7CCB'][k]);
      for (let k = 0; k < 3; k++) rect(ctx, 50, 128 - k * 4, 22, 4, ['#E46A8C', '#4E8C5A', '#F3E7C9'][k]);
      rect(ctx, 22, 108, 8, 4, '#FFFFFF'); rect(ctx, 52, 116, 8, 4, '#FFFFFF');
      rect(ctx, 140, 124, 10, 10, '#C8553D'); ell(ctx, 145, 118, 8, 7, '#4E8C5A'); ell(ctx, 142, 114, 4, 4, '#6FAE6A');
    } else {
      pile(ctx, 40, 128, 17, false); basket(ctx, 96, 122, true); basket(ctx, 10, 132, false);
    }
    counter(ctx, 196, 132, 124, { laptop: v === 'tech' || v === 'tidy' || v === 'counterLaptop', papers: busy });
    if (evening) {
      for (let y = 0; y < H; y += 1) for (let x = (y % 2); x < W; x += 2) px(ctx, x, y, 'rgba(240,140,70,0.07)');
    }
    if (tidy) for (let i = 0; i < 18; i++) px(ctx, 30 + i * 7 % 260, 24 + (i * 13) % 70, 'rgba(255,255,230,0.65)');
  }

  function drawTech(ctx, t) {
    for (let y = 0; y < H; y++) rect(ctx, 0, y, W, 1, mix('#0B1626', '#16314F', y / H));
    for (let x = 0; x < W; x += 16) rect(ctx, x, 0, 1, H, 'rgba(60,202,217,0.10)');
    for (let y = 0; y < H; y += 16) rect(ctx, 0, y, W, 1, 'rgba(60,202,217,0.10)');
    // jendela terminal dekoratif
    [[18, 20, 70, 40], [238, 30, 66, 46], [30, 120, 58, 34], [246, 118, 56, 38]].forEach(([x, y, w, h], i) => {
      rect(ctx, x, y, w, h, '#0F2238'); rect(ctx, x, y, w, 5, '#1F3A5F');
      px(ctx, x + 2, y + 2, '#E8678C'); px(ctx, x + 5, y + 2, '#F7D46B'); px(ctx, x + 8, y + 2, '#4CE08A');
      for (let k = 0; k < (h - 10) / 5; k++) rect(ctx, x + 4, y + 9 + k * 5, 10 + ((k * 7 + i * 5) % (w - 18)), 1, k % 3 === 0 ? '#3CCAD9' : '#5C7A99');
    });
    const blink = Math.floor(t * 2) % 2 === 0;
    if (blink) rect(ctx, 70, 52, 3, 4, '#3CCAD9');
    rect(ctx, 0, 150, W, 30, '#0A1320');
    rect(ctx, 0, 150, W, 1, '#3CCAD9');
  }

  /* ---------- Halaman utama: tampak depan Parfait Laundry saat senja ---------- */
  const LANGIT = ['#121733', '#222B55', '#433C70', '#8E577E', '#D97F69', '#F2A86E'];
  function langitDi(y) {
    const t = Math.min(0.999, Math.max(0, y / 132)) * (LANGIT.length - 1), k = Math.floor(t);
    return mix(LANGIT[k], LANGIT[k + 1], t - k);
  }
  function ring(ctx, cx, cy, r, tebal, col) {
    for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d <= r && d > r - tebal) px(ctx, x, y, col);
    }
  }
  function drawStorefront(ctx, t) {
    // Langit bertingkat
    for (let y = 0; y < 132; y++) rect(ctx, 0, y, W, 1, langitDi(y));
    // Bintang berkelip
    let s = 7;
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < 70; i++) {
      const x = r() * W, y = r() * 70, b = r();
      const nyala = Math.sin(t * 1.3 + i * 2.1) > -0.3;
      if (!nyala) continue;
      px(ctx, x, y, b > 0.8 ? '#FFF6D8' : b > 0.45 ? '#C9CDE8' : '#7A80A8');
      if (b > 0.93) { px(ctx, x + 1, y, '#7A80A8'); px(ctx, x - 1, y, '#7A80A8'); px(ctx, x, y + 1, '#7A80A8'); px(ctx, x, y - 1, '#7A80A8'); }
    }
    // Bulan sabit
    ell(ctx, 58, 26, 9, 9, '#F6E7B0');
    for (let y = 16; y <= 36; y++) for (let x = 50; x <= 72; x++) {
      if (Math.hypot(x + 0.5 - 62, y + 0.5 - 23) < 8.2) px(ctx, x, y, langitDi(y));
    }
    // Siluet kota lapis jauh & dekat dengan jendela menyala
    const kota = [[0, 26, 64], [24, 20, 82], [42, 30, 58], [70, 22, 92], [90, 26, 70], [114, 30, 84], [142, 20, 60]];
    kota.forEach(([x, w, h], i) => {
      const top = 132 - h;
      rect(ctx, x, top, w, h, i % 2 ? '#1E2547' : '#252D55');
      rect(ctx, x, top, w, 2, '#2E376A');
      for (let wy = top + 6; wy < 128; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 6) {
        const k = (wx * 7 + wy * 13 + i * 5) % 11;
        const lit = k < 4 && !((k + Math.floor(t * 0.6)) % 9 === 0);
        rect(ctx, wx, wy, 3, 4, lit ? (k % 2 ? '#F2C66D' : '#F7D98E') : '#151B3A');
      }
    });
    // Jalan & trotoar
    rect(ctx, 0, 132, W, 18, '#3A3550');
    for (let x = 4; x < W; x += 26) rect(ctx, x, 140, 12, 2, '#6E6880');
    rect(ctx, 0, 148, W, 3, '#A9A3B5');
    for (let y = 151; y < H; y += 10) for (let x = 0; x < W; x += 18) {
      const o = ((y - 151) / 10) % 2 ? 9 : 0;
      rect(ctx, x + o, y, 17, 9, ((x / 18 + (y - 151) / 10) % 2) ? '#6A6679' : '#625E72');
    }
    // Lampu jalan
    rect(ctx, 122, 72, 2, 78, '#2B2F45');
    rect(ctx, 116, 68, 14, 4, '#2B2F45');
    rect(ctx, 118, 72, 10, 2, '#FFE9A8');
    for (let y = 74; y < 150; y++) {
      const w = (y - 74) * 0.32 + 4;
      for (let x = Math.round(123 - w); x < 123 + w; x += 2) if ((x + y) % 2 === 0) px(ctx, x, y, 'rgba(255,220,140,0.10)');
    }
    // Sepeda dengan keranjang cucian
    ring(ctx, 72, 140, 8, 1.6, '#1C1F2E'); ring(ctx, 100, 140, 8, 1.6, '#1C1F2E');
    ring(ctx, 72, 140, 2, 2, '#8D96A3'); ring(ctx, 100, 140, 2, 2, '#8D96A3');
    for (let i = 0; i <= 14; i++) { px(ctx, 72 + i, 140 - i * 0.7, '#3CCAD9'); px(ctx, 86 + i, 130 + i * 0.7, '#3CCAD9'); }
    rect(ctx, 80, 130, 14, 2, '#3CCAD9'); rect(ctx, 79, 127, 6, 2, '#2B2118'); rect(ctx, 96, 126, 2, 6, '#3CCAD9');
    rect(ctx, 62, 124, 18, 8, '#C99A5B');
    for (let i = 0; i < 18; i += 3) rect(ctx, 62 + i, 124, 1, 8, '#A87C42');
    ell(ctx, 66, 123, 4, 2.4, '#7FB0E0'); ell(ctx, 72, 122, 4, 2.6, '#E8B33C'); ell(ctx, 77, 123, 3, 2.2, '#E46A8C');
    // Bangunan laundry
    rect(ctx, 148, 38, 172, 112, '#E8CFA6');
    for (let y = 44; y < 146; y += 6) for (let x = 148 + ((y / 6) % 2) * 6; x < W; x += 12) rect(ctx, x, y, 11, 1, '#DDC093');
    rect(ctx, 144, 32, 176, 7, '#8E5A3C'); rect(ctx, 144, 31, 176, 1, '#B8875A');
    // Papan nama menyala
    const text = 'PARFAIT LAUNDRY', tw = textWidth(text);
    const sx = 158, sw = 150, sy = 41;
    rect(ctx, sx - 2, sy - 2, sw + 4, 17, 'rgba(60,202,217,0.25)');
    rect(ctx, sx - 1, sy - 1, sw + 2, 15, '#0E2033');
    rect(ctx, sx, sy, sw, 13, '#1F3A5F');
    pxText(ctx, text, Math.round(sx + (sw - tw) / 2), sy + 4, Math.sin(t * 2) > -0.95 ? '#7FE6F0' : '#4FB8C4');
    // Kanopi bergaris dengan tepi bergelombang
    for (let x = 146; x < W; x += 10) {
      const col = ((x - 146) / 10) % 2 ? '#F3E7C9' : '#C8553D';
      rect(ctx, x, 60, 10, 11, col);
      ell(ctx, x + 5, 71, 5, 3, col);
    }
    rect(ctx, 146, 58, 174, 2, '#9B3B29');
    // Lampu hias berkedip
    rect(ctx, 146, 77, 174, 1, '#2B2118');
    const warna = ['#F7D46B', '#E8678C', '#7FE6F0', '#9BE07A'];
    for (let i = 0, x = 150; x < W; x += 12, i++) {
      const on = Math.sin(t * 2.2 + i * 1.7) > -0.2;
      rect(ctx, x, 78, 2, 3, on ? warna[i % 4] : '#5A5068');
      if (on) px(ctx, x, 77, 'rgba(255,255,255,0.6)');
    }
    // Jendela kaca: dua mesin cuci berputar
    rect(ctx, 155, 85, 94, 54, '#6B4229');
    for (let y = 88; y < 136; y++) rect(ctx, 158, y, 88, 1, mix('#FFE8B8', '#F2C084', (y - 88) / 48));
    shelf(ctx, 160, 98, 84, [[4, 8, '#3CCAD9'], [14, 10, '#C8553D'], [62, 9, '#4E8C5A'], [72, 7, '#9B7CCB']]);
    [[166, 104], [204, 104]].forEach(([x, y], i) => {
      rect(ctx, x, y, 32, 32, '#C9CED6'); rect(ctx, x, y, 31, 31, '#F1F3F6'); rect(ctx, x, y, 31, 6, '#DDE2E8');
      rect(ctx, x + 3, y + 2, 7, 2, '#3F4A57');
      ell(ctx, x + 15.5, y + 19, 10, 10, '#AAB4BF'); ell(ctx, x + 15.5, y + 19, 8, 8, '#2C3E50');
      const cols = ['#E8B33C', '#D96C4A', '#7FB0E0', '#F3E7C9'];
      for (let k = 0; k < 4; k++) {
        const a = t * (i ? 1.1 : 0.85) + k * 1.57;
        ell(ctx, x + 15.5 + Math.cos(a) * 4, y + 20 + Math.sin(a) * 3.5, 2.6, 2, cols[k]);
      }
    });
    for (let k = 0; k < 3; k++) for (let i = 0; i < 26; i++) px(ctx, 172 + k * 30 + i, 132 - i * 1.6, 'rgba(255,255,255,0.28)');
    rect(ctx, 152, 139, 100, 3, '#8E5A3C');
    // Pintu dengan tanda BUKA
    rect(ctx, 258, 86, 38, 64, '#6B4229');
    rect(ctx, 261, 89, 32, 61, '#8E5A3C');
    rect(ctx, 264, 92, 26, 28, '#F7D9A4');
    rect(ctx, 264, 106, 26, 1, '#8E5A3C');
    rect(ctx, 266, 110, 22, 9, '#FFFDF6');
    pxText(ctx, 'BUKA', 270, 112, '#C8553D');
    rect(ctx, 288, 126, 3, 5, '#E6B85C');
    // Lampu dinding & tanaman
    rect(ctx, 302, 94, 6, 6, '#2B2F45'); rect(ctx, 303, 100, 4, 3, '#FFE9A8');
    ell(ctx, 305, 104, 10, 8, 'rgba(255,220,140,0.12)');
    [[250, 138], [304, 138]].forEach(([x, y]) => {
      rect(ctx, x, y, 10, 10, '#C8553D'); rect(ctx, x, y, 10, 2, '#9B3B29');
      ell(ctx, x + 5, y - 4, 7, 6, '#4E8C5A'); ell(ctx, x + 3, y - 7, 3, 3, '#6FAE6A');
    });
    rect(ctx, 148, 146, 172, 4, '#7A4C31');
  }

  // Latar dapat beranimasi ringan (drum mesin cuci berputar, kursor berkedip)
  function drawBackground(ctx, name, t = 0) {
    ctx.clearRect(0, 0, W, H);
    if (name === 'tech') drawTech(ctx, t);
    else if (name === 'storefront') drawStorefront(ctx, t);
    else drawLaundry(ctx, name, t);
  }

  window.ART = { sprite, portrait, drawBackground, CHARS, EXPR, BG_W: W, BG_H: H };
})();
