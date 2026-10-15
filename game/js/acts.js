/* =====================================================================
   SI-PANDRI: Misi Laundry Beres! — acts.js
   Naskah 9 babak. Setiap babak terdiri dari beberapa "bagian" (parts).
   Progres disimpan per bagian, sehingga pemain bisa melanjutkan dari
   bagian terakhir dan presenter bisa melompat ke bagian tertentu.
   Cerita dan tokoh bersifat ilustratif; semua data pelanggan fiktif.
   ===================================================================== */
(function () {
  'use strict';
  const D = window.DATA, F = G.fmt;
  const say = (who, text, expr) => G.say(who, text, expr);
  const el = G.el, esc = G.esc;

  // Layar terminal tiruan. Baris diawali [OK] / [X] / [!] diberi warna seperti di aplikasi Pascal.
  function term(lines, label = 'Tampilan meniru SI_PANDRI.exe · simulasi') {
    const pre = el('pre', 'term');
    pre.innerHTML = lines.map(l => {
      const cls = l.startsWith('[OK]') ? 'ok' : l.startsWith('[X]') ? 'err' : l.startsWith('[!]') ? 'warn' : /^[=+|]/.test(l) ? 'head' : '';
      return `<span class="${cls}">${esc(l)}</span>`;
    }).join('\n');
    const wrap = el('figure', 'term-wrap');
    wrap.appendChild(pre);
    if (label) wrap.appendChild(el('figcaption', '', esc(label)));
    return wrap;
  }
  const BANNER = [
    '+--------------------------------------------------------------------+',
    '|                         S I - P A N D R I                          |',
    '|                 Sistem Pengelolaan Parfait Laundry                 |',
    '|                Laundry Lebih Mudah, Lebih Teratur.                 |',
    '+--------------------------------------------------------------------+'
  ];
  function info(html, kind = 'note') { return el('div', 'callout ' + kind, html); }
  function shuffleFixed(arr, order) { return order.map(i => arr[i]); }

  /* ---------------- Simulasi pesanan Babak 5 ---------------- */
  function freshSim() {
    const p = D.B5_PELANGGAN;
    return { nama: p.nama, wa: p.wa, username: p.username, idPelanggan: null, id: null, layanan: null, metode: null, berat: null, total: null, bayar: null, status: null };
  }
  // Jika presenter melompat ke langkah tengah, isi data yang dibutuhkan dengan contoh wajar.
  function ensureSim(step) {
    let s = G.prog.sim;
    if (!s || step === 0) s = G.prog.sim = freshSim();
    if (step >= 1 && !s.idPelanggan) s.idPelanggan = 'PL0001';
    if (step >= 2 && !s.id) Object.assign(s, { id: 'PD00001', layanan: s.layanan || 'Reguler', metode: s.metode || 'Transfer', bayar: 'Belum Dibayar', status: 'Menunggu Ditimbang' });
    if (step >= 3 && !s.berat) Object.assign(s, { berat: 3.5, status: 'Menunggu Diproses' });
    if (step >= 4 && !s.total) s.total = Math.round(s.berat * D.TARIF[s.layanan]);
    if (step >= 5 && D.STATUS.indexOf(s.status) < 2) s.status = 'Sedang Diproses';
    if (step >= 6 && s.bayar !== 'Lunas') s.bayar = 'Lunas';
    G.persist();
    return s;
  }
  function pesanTagihan(s) {
    const r = D.REKENING_CONTOH;
    const dasar = `Halo ${s.nama}, berikut informasi pesanan SI-PANDRI.\nID Pesanan: ${s.id}\nBerat: ${F.berat(s.berat)}\nLayanan: ${s.layanan}\nTotal biaya: ${F.rupiah(s.total)}\n`;
    return s.metode === 'Transfer'
      ? dasar + `Metode: Transfer bank\nBank: ${r.bank}\nNomor rekening: ${r.nomor}\nAtas nama: ${r.atasNama}\nMohon lakukan pembayaran dan kirim konfirmasi kepada admin. Status akan diperbarui setelah transfer diverifikasi. Terima kasih.`
      : dasar + 'Metode pembayaran: Tunai. Silakan lakukan pembayaran kepada admin sesuai kesepakatan. Terima kasih.';
  }
  function pesanSiap(s) {
    return `Halo ${s.nama}, kami informasikan bahwa cucian kamu sudah siap diambil.\nID Pesanan: ${s.id}\nLayanan: ${s.layanan}\nBerat: ${F.berat(s.berat)}\nTotal biaya: ${F.rupiah(s.total)}\nStatus pembayaran: ${s.bayar}\nSilakan datang ke laundry untuk mengambil cucian. Terima kasih telah menggunakan SI-PANDRI.`;
  }
  function waPreview(s, pesan) {
    const box = el('div', 'wa-preview');
    box.innerHTML = `<div class="wa-head">Pratinjau pesan WhatsApp <span class="badge">belum terkirim</span></div>
      <div class="wa-bubble">${esc(pesan).replace(/\n/g, '<br>')}</div>
      <p class="wa-link"><span>Tautan yang dicetak program:</span><code>https://wa.me/${esc(F.wa(s.wa))}?text=${esc(F.url(pesan).slice(0, 90))}…</code></p>`;
    return box;
  }
  const WA_NOTE = 'Program hanya <strong>menyiapkan tautan</strong>. Di aplikasi asli, admin membuka tautan, memeriksa isi chat, lalu menekan <strong>Kirim</strong> sendiri. Game ini tidak mengirim pesan apa pun.';

  // Pemilih status cucian dengan aturan yang sama seperti UbahStatusCucian di Pascal
  function statusPicker(api, box, s, target, { who = 'gilbert', alasan } = {}) {
    return new Promise(resolve => {
      const row = el('div', 'status-row');
      const fb = el('p', 'feedback'); fb.setAttribute('role', 'status');
      const btns = D.STATUS.map((st, i) => {
        const b = el('button', 'status-btn st-' + i, `<small>${i}</small>${esc(st)}`);
        if (st === s.status) b.classList.add('current');
        b.addEventListener('click', () => pick(i, b));
        row.appendChild(b);
        return b;
      });
      box.append(row, fb);
      G.reveal(fb);
      function pick(i, b) {
        if (!api.alive()) return;
        const lama = D.STATUS.indexOf(s.status);
        if (i === 0) {
          fb.className = 'feedback bad';
          fb.innerHTML = '✘ “Menunggu Ditimbang” tidak ada di pilihan menu 5, karena cucian ini sudah ditimbang.';
          G.ui.shake(b); G.sfx.bad(); return;
        }
        if (i === lama) {
          fb.className = 'feedback warn';
          fb.innerHTML = '[!] Status yang dipilih sama dengan status saat ini. Tidak ada perubahan.';
          G.sfx.bad(); return;
        }
        if (i > lama + 1) {
          fb.className = 'feedback bad';
          fb.innerHTML = `[X] Status tidak boleh melompati tahap. Dari “${esc(s.status)}” lanjutkan dulu ke tahap berikutnya.`;
          G.ui.shake(b); G.sfx.bad();
          G.react(who, 'Program menolak lompatan tahap. Cari tahap tepat sesudah status sekarang.', 'thinking');
          return;
        }
        if (i < lama) {
          fb.className = 'feedback warn';
          fb.innerHTML = '[!] Itu koreksi mundur. Program mengizinkannya untuk memperbaiki salah pilih, tetapi situasinya tidak membutuhkan itu.';
          G.sfx.bad(); return;
        }
        if (D.STATUS[i] !== target) {
          fb.className = 'feedback bad'; fb.innerHTML = '✘ Belum sesuai situasinya.'; G.sfx.bad(); return;
        }
        s.status = target;
        btns.forEach(x => { x.classList.remove('current'); x.disabled = true; });
        b.classList.add('current', 'is-right');
        fb.className = 'feedback good';
        fb.innerHTML = `[OK] Status cucian diperbarui menjadi: ${esc(target)}`;
        G.sfx.good();
        if (alasan) G.react(who, alasan, 'happy');
        G.persist(); G.ticket.show(s, 'status');
        setTimeout(() => resolve(), 700);
      }
      api.solve = () => { const i = D.STATUS.indexOf(target); pick(i, btns[i]); };
    });
  }

  /* =====================================================================
     BABAK 1 — Sebuah Laundry Kecil yang Sibuk
     ===================================================================== */
  const b1 = [
    async function pagi() {
      G.scene({ bg: 'calm', cast: { ratna: ['center', 'smile'] } });
      await say('narrator', 'Pagi hari di **Parfait Laundry**, sebuah usaha laundry kecil di ujung gang.');
      await say('narrator', 'Pemiliknya, **Bu Ratna**, mengurus hampir semuanya sendiri: menerima cucian, menimbang, menghitung biaya, sampai mengingat cucian siapa yang sudah selesai.');
      await say('ratna', 'Bismillah. Semoga hari ini lancar, ya.', 'happy');
      G.show('dimas', 'left', 'smile', 'prop');
      await say('dimas', 'Pagi, Bu! Mau laundry kiloan, ya. Yang Reguler saja.');
      await say('ratna', 'Siap, Mas Dimas. Saya catat dulu di buku, ya.', 'smile');
      await G.activity({
        kicker: 'Babak 1 · Misi 1', title: 'Apa yang perlu dicatat sekarang?',
        objective: 'Bantu Bu Ratna memilih **3 informasi** yang memang perlu dicatat saat cucian diterima.',
        help: 'Data di awal menentukan pesanan milik siapa, cara menghubungi pelanggan, dan tarif yang dipakai. Data yang belum diketahui tidak boleh dikarang.'
      }, async api => {
        api.body.appendChild(info('Mas Dimas menyerahkan sekantong cucian. Cucian <strong>belum ditimbang</strong>.'));
        const r = await G.ui.pickMany(api, api.body, { items: D.B1_CATAT, who: 'ratna', cols: 3, doneText: 'Nama, nomor WhatsApp, dan layanan sudah tercatat.' });
        G.award('b1-catat', 10, 'Mencatat data pesanan');
        api.done(r);
      });
      G.expr('ratna', 'focused');
      await say('ratna', 'Sekarang cuciannya kita timbang dulu.', 'focused');
      G.sfx.scale();
      await say('narrator', 'Timbangan menunjukkan **4 kg**. Di papan harga tertulis **Reguler Rp 6.000 per kg**.');
      await G.activity({
        kicker: 'Babak 1 · Misi 2', title: 'Hitung total biaya',
        objective: 'Bu Ratna sedang melayani pelanggan lain. Bantu hitung total untuk **4 kg** layanan **Reguler**.',
        help: 'Laundry kiloan dihitung per kilogram. Total yang salah bisa merugikan pelanggan atau laundry.'
      }, async api => {
        const card = el('div', 'formula');
        card.innerHTML = '<span class="f-box">4 kg</span><span class="f-op">×</span><span class="f-box">Rp 6.000 / kg</span><span class="f-op">=</span><span class="f-box f-q">?</span>';
        api.body.appendChild(card);
        const r = await G.ui.numberAsk(api, api.body, {
          label: 'Total biaya yang harus dibayar Mas Dimas', prefix: 'Rp', placeholder: 'contoh: 10.000', inputmode: 'numeric', answer: '24.000', who: 'ratna',
          check: v => {
            const n = F.uang(v);
            if (isNaN(n)) return { ok: false, msg: 'Tulis dalam angka, misalnya 24000 atau 24.000.' };
            if (n === 24000) return { ok: true, msg: 'Pas! 4 × Rp 6.000 = Rp 24.000.' };
            if (n === 6004 || n === 6000) return { ok: false, msg: 'Hmm, beratnya belum dikalikan. Total = berat × tarif.' };
            if (n === 40000) return { ok: false, msg: 'Itu memakai tarif Express. Mas Dimas memilih Reguler.' };
            return { ok: false, msg: 'Belum tepat. Ingat: total = berat × tarif per kg.' };
          }
        });
        G.award('b1-hitung', 10, 'Menghitung biaya');
        G.achieve('asisten-kasir');
        api.done(r);
      });
      await say('dimas', 'Siap, Bu. Nanti kabari saya kalau sudah selesai, ya.', 'smile');
      G.hide('dimas');
      await say('ratna', 'Untung dibantu. Biasanya saya menghitung pakai kalkulator sambil melayani yang lain.', 'smile');
    },
    async function siang() {
      G.scene({ bg: 'busy', cast: { ratna: ['center', 'neutral', 'prop'] } });
      await say('narrator', 'Menjelang siang, pelanggan berdatangan. Tumpukan cucian bertambah dan buku catatan mulai penuh.');
      G.thought(['Catat pesanan', 'Timbang', 'Hitung biaya']);
      G.show('lala', 'right', 'neutral', 'prop');
      await say('lala', 'Bu, cucian saya yang hari Senin sudah selesai belum? Yang Express.');
      await say('ratna', 'Sebentar ya, Kak Lala. Saya cari dulu catatannya...', 'worried');
      let dicek = 1;
      await G.activity({
        kicker: 'Babak 1 · Misi 3', title: 'Cari catatan Kak Lala',
        objective: 'Temukan catatan **Kak Lala, hari Senin, layanan Express** di buku Bu Ratna.',
        help: 'Saat catatan menumpuk, mencari satu pesanan butuh waktu dan mudah keliru karena nama yang mirip.'
      }, async api => {
        const book = el('div', 'notebook');
        api.body.appendChild(book);
        const r = await G.ui.pickMany(api, book, { items: D.B1_BUKU, who: 'ratna', cols: 2 });
        dicek = r.wrong + 1;
        G.award('b1-cari', 10, 'Menemukan catatan');
        api.done(r);
      });
      await say('ratna', 'Ketemu. Tapi di sini cuma tertulis “dicuci?”. Saya sendiri lupa, sudah selesai atau belum...', 'tired');
      await say('lala', 'Waduh. Ya sudah, Bu, nanti saya tanya lagi.', 'worried');
      G.hide('lala');
      G.thought(['Catat pesanan', 'Timbang', 'Hitung biaya', 'Status cucian?']);
      await say('narrator', 'Masalah pertama terlihat: **status cucian** tidak tercatat dengan jelas.');
      await say('narrator', 'Ponsel Bu Ratna berbunyi. Seorang pelanggan menulis: “Bu, total saya berapa? Nomor rekeningnya juga, ya.”');
      await say('ratna', 'Totalnya berapa, ya? Saya harus cari catatannya lagi, lalu menghitung ulang...', 'tired');
      G.thought(['Catat pesanan', 'Timbang', 'Hitung biaya', 'Status cucian?', 'Total & rekening?']);
      await say('narrator', 'Masalah kedua: setiap pertanyaan pelanggan berarti **membuka catatan dan menghitung ulang**.');
      await say('ratna', 'Hari baru setengah jalan, tapi kepala saya sudah penuh catatan dan angka...', 'tired');
      G.thought(null);
      const RANTAI = [
        ['Catat', 'Tanpa data pelanggan yang jelas, cucian bisa tertukar dan pelanggan sulit dihubungi.'],
        ['Timbang', 'Jika berat hanya ditebak, total biaya ikut meleset.'],
        ['Hitung', 'Salah hitung bisa merugikan pelanggan atau laundry.'],
        ['Proses', 'Jika status tidak dicatat, Bu Ratna lupa cucian mana yang sudah selesai.'],
        ['Bayar', 'Tanpa catatan pembayaran, sulit tahu siapa yang sudah lunas.'],
        ['Serahkan', 'Pelanggan perlu dikabari agar cucian diambil tepat waktu.']
      ];
      await G.activity({
        kicker: 'Babak 1 · Misi 4', title: 'Rantai pekerjaan Bu Ratna',
        objective: 'Klik **keenam tahap** untuk melihat apa yang terjadi jika satu tahap kacau.',
        help: 'Tahap-tahap ini saling tersambung. Kesalahan di satu tahap ikut terbawa ke tahap berikutnya.'
      }, async api => {
        const chain = el('div', 'chain');
        const out = el('p', 'chain-out', 'Pilih satu tahap.');
        out.setAttribute('role', 'status');
        const seen = new Set();
        const cnt = el('p', 'counter', 'Dibuka: 0 / 6');
        RANTAI.forEach(([nama, akibat], i) => {
          const b = el('button', 'chain-node', `<b>${i + 1}</b>${esc(nama)}`);
          b.addEventListener('click', () => {
            if (!api.alive()) return;
            chain.querySelectorAll('.chain-node').forEach(x => x.classList.remove('is-selected'));
            b.classList.add('is-selected', 'seen'); seen.add(i); G.sfx.click();
            out.innerHTML = `<strong>Jika tahap “${esc(nama)}” kacau:</strong> ${esc(akibat)}`;
            cnt.textContent = `Dibuka: ${seen.size} / 6`;
            if (seen.size === 6 && !api.foot.firstChild) G.ui.continueBtn(api, 'Saya paham').then(() => api.done());
          });
          chain.appendChild(b);
        });
        api.body.append(chain, out, cnt);
        api.solve = () => chain.querySelectorAll('.chain-node').forEach(b => b.click());
      });
      G.note('b1', [
        'Membantu mencatat nama, nomor WhatsApp, dan layanan saat cucian diterima.',
        'Menghitung total manual: 4 kg × Rp 6.000 = Rp 24.000.',
        `Mencari catatan Kak Lala: ${dicek} catatan diperiksa sebelum ketemu, dan statusnya tetap tidak jelas.`,
        'Memahami rantai: catat → timbang → hitung → proses → bayar → serahkan.'
      ]);
      G.award('b1-selesai', 20, 'Babak 1 selesai');
    }
  ];

  /* =====================================================================
     BABAK 2 — Tiga Orang Menawarkan Bantuan
     ===================================================================== */
  const b2 = [
    async function datang() {
      G.scene({ bg: 'evening', cast: { ratna: ['midleft', 'tired', 'prop'] } });
      await say('narrator', 'Sore harinya, Bu Ratna masih membolak-balik buku catatan.');
      G.show('gilbert', 'midright', 'neutral');
      await G.wait(200);
      G.show('sarah', 'right', 'smile');
      await G.wait(200);
      G.show('syahril', 'farright', 'neutral');
      await say('narrator', 'Tiga mahasiswa yang biasa mencuci di sini datang: **Gilbert**, **Sarah**, dan **Syahril**.');
      await say('gilbert', 'Sore, Bu Ratna. Wah, kelihatannya sedang banyak pesanan, ya?', 'smile');
      await say('ratna', 'Iya, Nak. Dari pagi belum sempat duduk.', 'tired');
      let pilihan = null, salah = 0;
      while (pilihan !== 'dengar') {
        pilihan = await G.choose('narrator', 'Menurutmu, apa yang sebaiknya dilakukan ketiganya lebih dulu?', [
          { text: 'Langsung menawarkan aplikasi canggih dengan banyak fitur', value: 'fitur' },
          { text: 'Bertanya dan mendengarkan kendala Bu Ratna', value: 'dengar' },
          { text: 'Menyarankan Bu Ratna menambah karyawan', value: 'karyawan' }
        ]);
        if (pilihan === 'fitur') { salah++; G.sfx.bad(); await say('sarah', 'Tunggu dulu. Kalau kita belum tahu masalahnya, kita bisa membuat fitur yang tidak dibutuhkan.', 'thinking'); }
        if (pilihan === 'karyawan') { salah++; G.sfx.bad(); await say('syahril', 'Itu keputusan usaha Bu Ratna. Kita fokus pada hal yang bisa kita bantu: cara mengelola pesanan.', 'thinking'); }
      }
      G.sfx.good();
      G.award('b2-dengar', 10, 'Memilih mendengarkan');
      G.achieve('pendengar');
      G.prog.b2salah = salah;
      await say('sarah', 'Setuju. Kita dengarkan dulu.', 'happy');
      await say('gilbert', 'Bu, boleh kami tahu? Bagian mana yang paling sulit saat mengelola laundry?', 'neutral');
      await say('ratna', 'Kalau pelanggan mulai ramai, saya harus mencatat pesanan, menghitung biaya, dan mengingat status setiap cucian.', 'worried');
      await say('ratna', 'Kadang semuanya terasa menumpuk.', 'tired');
    },
    async function wawancara() {
      G.scene({ bg: 'evening', cast: { ratna: ['midleft', 'worried'], gilbert: ['midright', 'neutral'], sarah: ['right', 'smile', 'prop'], syahril: ['farright', 'neutral'] } });
      await say('sarah', 'Boleh saya catat, Bu? Ceritakan saja. Nanti kami pilah mana yang bisa dibantu sistem.', 'smile');
      let temuan = [];
      await G.activity({
        kicker: 'Babak 2 · Misi', title: 'Catatan wawancara Sarah',
        objective: 'Bu Ratna bercerita banyak hal. Bantu Sarah mencatat **4 kendala** yang berhubungan dengan pengelolaan pesanan.',
        help: 'Tidak semua yang diceritakan pengguna adalah kebutuhan sistem. Memilah informasi adalah bagian dari analisis kebutuhan.'
      }, async api => {
        const r = await G.ui.pickMany(api, api.body, { items: D.B2_TEMUAN, who: 'sarah', cols: 2, doneText: 'Empat kendala sudah tercatat. Terima kasih, Bu.' });
        temuan = D.B2_TEMUAN.filter(t => t.correct).map(t => t.text);
        G.award('b2-catat', 10, 'Mencatat temuan wawancara');
        api.done(r);
      });
      await say('sarah', 'Jadi, Ibu sebenarnya sudah punya alur kerja. Hanya pencatatan dan pengelolaan pesanannya yang masih merepotkan, ya?', 'neutral');
      await say('ratna', 'Betul. Saya ingin semuanya lebih teratur, supaya tidak kesulitan memeriksa pesanan pelanggan.', 'neutral');
      await say('syahril', 'Kalau begitu, bagaimana kalau kami bantu membuat sistem sederhana untuk mengelola pesanan laundry Ibu?', 'smile');
      await say('ratna', 'Memangnya bisa? Saya mau sistem yang mudah dipakai, bukan yang malah bikin pekerjaan tambah rumit.', 'surprised');
      await say('sarah', 'Itu justru yang ingin kami usahakan, Bu. Kita mulai dari kebutuhan Ibu, lalu sistemnya kita kenalkan pelan-pelan.', 'happy');
      await say('ratna', 'Baiklah. Saya mau coba.', 'smile');
      G.note('b2', ['Tim memilih mendengarkan sebelum menawarkan solusi' + (G.prog.b2salah ? ` (setelah ${G.prog.b2salah} pilihan lain dipertimbangkan).` : '.'), 'Temuan wawancara:', ...temuan]);
      G.award('b2-selesai', 20, 'Babak 2 selesai');
    }
  ];

  /* =====================================================================
     BABAK 3 — Menemukan Akar Permasalahan
     ===================================================================== */
  const b3 = [
    async function papan() {
      G.scene({ bg: 'board', cast: { gilbert: ['left', 'focused', 'prop'], ratna: ['midright', 'neutral'], sarah: ['right', 'smile', 'prop'], syahril: ['farright', 'neutral'] } });
      await say('gilbert', 'Mari kita uraikan pekerjaan Ibu, dari cucian datang sampai diambil.', 'focused');
      await say('gilbert', 'Kendala dari catatan Sarah kita tempel di papan. Lalu kita cari kebutuhan sistem yang menjawabnya.', 'neutral');
      const M = Object.fromEntries(D.B3_MASALAH.map(m => [m.id, m]));
      const K = Object.fromEntries(D.B3_KEBUTUHAN.map(k => [k.id, k]));
      let salah = 0;
      await G.activity({
        kicker: 'Babak 3 · Misi 1', title: 'Pasangkan masalah dengan kebutuhan sistem', wide: true,
        objective: 'Pasangkan **6 masalah** di papan dengan **kebutuhan sistem** yang paling tepat.',
        help: 'Kebutuhan sistem yang baik selalu menjawab masalah nyata. Fitur tanpa masalah yang jelas hanya menambah rumit.'
      }, async api => {
        const r = await G.ui.match(api, api.body, {
          left: D.B3_MASALAH, right: shuffleFixed(D.B3_KEBUTUHAN, [3, 0, 5, 2, 4, 1]), answer: D.B3_JAWABAN, who: 'gilbert',
          wrongText: (l, r2) => `Kebutuhan itu gunanya untuk ${K[r2].guna}. Masalah ini tentang ${M[l].kunci}.`,
          rightText: (l, r2) => `Tepat: ${M[l].kunci} → ${K[r2].text}.`
        });
        salah = r.wrong;
        G.award('b3-pasang', 20, 'Memasangkan masalah dan kebutuhan');
        G.achieve('detektif');
        api.done(r);
      });
      await say('ratna', 'Oh, jadi masalah saya bisa dipecah satu per satu begitu.', 'surprised');
      await G.activity({
        kicker: 'Babak 3 · Misi 2', title: 'Solusi seperti apa yang cocok?',
        objective: 'Pilih arah solusi yang paling sesuai dengan kebutuhan Bu Ratna.',
        help: 'Solusi yang terlalu rumit bisa ditinggalkan pengguna. Bu Ratna sendiri meminta sistem yang mudah dipakai.'
      }, async api => {
        const r = await G.ui.quiz(api, api.body, {
          q: 'Jadi, sistem seperti apa yang dibutuhkan Parfait Laundry?', who: 'syahril',
          options: [
            { text: 'Aplikasi dengan banyak fitur canggih agar terlihat modern', correct: false, why: 'Fitur yang tidak dibutuhkan justru membuat rumit. Ingat pesan Bu Ratna.' },
            { text: 'Sistem sederhana dan konsisten yang mengikuti alur kerja laundry', correct: true, why: 'Tepat. Sistem mengikuti alur kerja Bu Ratna, bukan sebaliknya.' },
            { text: 'Buku catatan yang lebih tebal', correct: false, why: 'Masalahnya bukan kurang halaman, tetapi catatan yang sulit diperiksa.' }
          ]
        });
        G.award('b3-arah', 10, 'Menentukan arah solusi');
        api.done(r);
      });
      await say('syahril', 'Kesimpulannya: kita butuh sistem yang **sederhana, konsisten, dan sesuai alur kerja** laundry.', 'smile');
      G.note('b3', [
        `Enam masalah dipasangkan dengan enam kebutuhan sistem (${salah} kali mencoba pasangan yang kurang tepat).`,
        ...D.B3_MASALAH.map(m => `${m.text} → ${K[D.B3_JAWABAN[m.id]].text}`),
        'Arah solusi: sederhana, konsisten, dan sesuai alur kerja.'
      ]);
      G.award('b3-selesai', 20, 'Babak 3 selesai');
    }
  ];

  /* =====================================================================
     BABAK 4 — Memperkenalkan SI-PANDRI
     ===================================================================== */
  const b4 = [
    async function perkenalan() {
      G.scene({ bg: 'calm', cast: { ratna: ['left', 'neutral'], syahril: ['center', 'smile', 'prop'], gilbert: ['midright', 'neutral'], sarah: ['right', 'smile'] } });
      await say('syahril', 'Bu, ini rancangan kami. Programnya berjalan di komputer, lewat jendela terminal.', 'smile');
      await say('ratna', 'Terminal? Yang layarnya gelap berisi tulisan itu?', 'surprised');
      await say('syahril', 'Betul. Tampilannya sederhana, tetapi menunya jelas. Coba kita nyalakan.', 'happy');
      G.bg('tech');
      await G.activity({
        kicker: 'Babak 4', title: 'Menyalakan SI-PANDRI',
        objective: 'Program Pascal dikompilasi, lalu dijalankan.',
        help: 'Kode Pascal (SI_PANDRI.pas) diubah menjadi program (SI_PANDRI.exe) oleh compiler Free Pascal, lalu dijalankan di terminal.'
      }, async api => {
        const lines = ['> fpc SI_PANDRI.pas', 'Linking SI_PANDRI.exe', '> SI_PANDRI.exe', '', ...BANNER, '  MENU UTAMA', '  1. Login Admin', '  2. Menu Pelanggan', '  3. Keluar', 'Pilih menu utama: _'];
        const t = term([]);
        api.body.appendChild(t);
        const pre = t.querySelector('pre');
        for (let i = 0; i < lines.length; i++) {
          if (!api.alive()) return;
          const span = document.createElement('span');
          span.className = /^[+|]/.test(lines[i]) ? 'head' : lines[i].startsWith('>') ? 'cmd' : '';
          span.textContent = lines[i] + '\n';
          pre.appendChild(span);
          await new Promise(r => setTimeout(r, G.reduced() ? 0 : 110));
        }
        const logo = el('div', 'logo-reveal', '<span class="logo-mark">SI-PANDRI</span><span class="logo-sub">Sistem Pengelolaan Parfait Laundry</span><span class="logo-tag">Laundry Lebih Mudah, Lebih Teratur.</span>');
        api.body.appendChild(logo);
        G.sfx.fanfare();
        await G.ui.continueBtn(api, 'Lanjut');
        api.done();
      });
      await say('gilbert', 'Namanya **SI-PANDRI**: Sistem Pengelolaan Parfait Laundry.', 'smile');
      await say('gilbert', 'Masalah yang dibantu sama seperti di papan tadi: data pelanggan, berat, biaya, status, dan pesan untuk pelanggan.', 'neutral');
      await say('sarah', 'Manfaatnya untuk Ibu: pesanan tercatat di satu tempat, total dihitung program, dan status bisa dicek dengan ID pesanan.', 'happy');
      await say('sarah', 'Tapi kami tidak menjanjikan semuanya beres sendiri, ya, Bu. Ketelitian saat mengetik data tetap penting.', 'neutral');
      await say('syahril', 'Cara pakainya lewat menu bernomor. Ada menu untuk **admin**, yaitu Ibu, dan menu untuk **pelanggan**.', 'smile');
    },
    async function jelajahMenu() {
      G.scene({ bg: 'tech', cast: { ratna: ['left', 'thinking'], syahril: ['right', 'smile', 'prop'] } });
      await say('syahril', 'Coba jelajahi menunya. Ada tiga pertanyaan dari Bu Ratna. Temukan menu yang tepat untuk masing-masing.', 'smile');
      await G.activity({
        kicker: 'Babak 4 · Misi', title: 'Jelajahi menu SI-PANDRI', wide: true,
        objective: '',
        help: 'Menu di sini sama dengan teks menu di SI_PANDRI.pas. Memahami menu membantu Bu Ratna tahu harus memilih apa.'
      }, async api => {
        let layar = 'utama', misi = 0, klik = 0;
        const quest = el('div', 'quest');
        const t = el('div', 'menu-term');
        const desc = el('p', 'menu-desc', 'Klik menu untuk membuka atau melihat penjelasannya.');
        desc.setAttribute('role', 'status');
        api.body.append(quest, t, desc);
        function renderQuest() {
          quest.innerHTML = D.B4_MISI.map((m, i) => `<div class="quest-item ${i < misi ? 'done' : i === misi ? 'now' : ''}"><b>${i < misi ? '✔' : i + 1}</b>${esc(m.tanya)}</div>`).join('');
          api.objective(misi < D.B4_MISI.length ? `Pertanyaan ${misi + 1} dari 3: ${D.B4_MISI[misi].tanya}` : 'Semua pertanyaan terjawab!');
        }
        function render() {
          const m = D.MENU[layar];
          t.innerHTML = '';
          const pre = el('div', 'menu-screen');
          if (layar === 'utama') pre.appendChild(el('pre', 'term-banner', esc(BANNER.join('\n'))));
          pre.appendChild(el('div', 'menu-title', '==== ' + esc(m.judul) + ' ===='));
          m.items.forEach(it => {
            const b = el('button', 'menu-item', `<span class="no">${String(it.no).padStart(2, ' ')}.</span> ${esc(it.text)}`);
            b.addEventListener('click', () => choose(it, b));
            pre.appendChild(b);
          });
          t.appendChild(pre);
          t.appendChild(el('p', 'term-cap', 'Teks menu sama dengan SI_PANDRI.pas · simulasi'));
        }
        function choose(it, b) {
          if (!api.alive()) return;
          klik++;
          const target = D.B4_MISI[misi];
          if (target && layar === target.layar && it.no === target.no) {
            G.sfx.good(); b.classList.add('is-right');
            desc.innerHTML = '✔ ' + esc(target.benar);
            G.react('syahril', target.benar, 'happy');
            misi++; renderQuest();
            if (misi === D.B4_MISI.length) {
              G.award('b4-menu', 20, 'Menjelajahi menu');
              G.achieve('penjelajah');
              G.ui.continueBtn(api, 'Lanjut').then(() => api.done({ klik }));
            }
            return;
          }
          G.sfx.click();
          desc.innerHTML = `<strong>${esc(it.text)}:</strong> ${esc(it.info)}`;
          if (it.go) {
            if (it.go === 'admin') desc.innerHTML += '<br><span class="muted">Login admin berhasil (simulasi).</span>';
            layar = it.go; render();
          }
        }
        renderQuest(); render();
        api.solve = () => {
          const target = D.B4_MISI[misi];
          if (!target) return;
          layar = target.layar; render();
          const b = [...t.querySelectorAll('.menu-item')][D.MENU[layar].items.findIndex(x => x.no === target.no)];
          choose(D.MENU[layar].items.find(x => x.no === target.no), b);
        };
      });
      await say('ratna', 'Oh, jadi ada menu untuk saya sebagai admin, dan menu untuk pelanggan. Nomor-nomornya jelas.', 'happy');
      await say('narrator', 'Catatan: SI-PANDRI asli adalah program Free Pascal yang berjalan di satu komputer. Yang kamu lihat di game ini adalah simulasi untuk menjelaskannya.');
      G.note('b4', ['Mengenal SI-PANDRI — Sistem Pengelolaan Parfait Laundry (program terminal Free Pascal).', 'Menemukan: Menu Admin → 2 (berat), Menu Pelanggan → 1 (pesanan), Menu Admin → 8 (kabar cucian siap).']);
      G.award('b4-selesai', 20, 'Babak 4 selesai');
    }
  ];

  /* =====================================================================
     BABAK 5 — Simulasi Perjalanan Satu Pesanan (7 langkah)
     ===================================================================== */
  const b5 = [
    // Langkah 1: Pelanggan datang → registrasi
    async function pelangganDatang() {
      const s = ensureSim(0);
      G.scene({ bg: 'calm', cast: { sarah: ['farleft', 'neutral'], ratna: ['midleft', 'smile'], nadia: ['right', 'smile', 'prop'] } });
      G.ticket.show(s);
      await say('narrator', 'Hari pertama memakai SI-PANDRI. Pelanggan pertama datang: **Kak Nadia**.');
      await say('nadia', 'Bu, saya mau laundry. Saya baru pertama kali ke sini.', 'smile');
      await say('ratna', 'Selamat datang, Kak. Cuciannya saya terima, ya.', 'smile');
      await say('sarah', 'Karena Kak Nadia pelanggan baru, ia perlu **registrasi akun** dulu. Bu Ratna bisa membantu di komputer kasir.', 'neutral');
      await G.activity({
        kicker: 'Babak 5 · Langkah 1 dari 7', title: 'Pelanggan datang: registrasi akun',
        objective: 'Isi data pelanggan **fiktif** lalu tekan **Daftar**. Coba juga mengosongkan nama atau mengetik nomor pendek untuk melihat validasinya.',
        help: 'Data pelanggan (nama dan nomor WhatsApp) dipakai di setiap pesanan dan untuk menyiapkan pesan. Username membuat setiap pelanggan hanya melihat pesanannya sendiri.'
      }, api => {
        api.body.appendChild(info('Gunakan data fiktif. Jangan memasukkan nomor WhatsApp asli. Game hanya menyimpan nama, nomor fiktif, dan username di browser ini; password tidak disimpan.', 'warn'));
        const f = el('form', 'reg-form');
        f.innerHTML = `
          <div class="menu-path">Menu Pelanggan → 1. Registrasi akun baru</div>
          <label>Nama lengkap <input name="nama" value="${esc(s.nama)}" autocomplete="off"></label>
          <label>Nomor WhatsApp (contoh 081234567890) <input name="wa" value="${esc(s.wa)}" inputmode="tel" autocomplete="off"></label>
          <label>Buat username (minimal 3 karakter) <input name="username" value="${esc(s.username)}" autocomplete="off"></label>
          <label>Buat password (minimal 4 karakter) <input name="password" type="password" value="demo1234" autocomplete="new-password"></label>
          <button class="btn btn-primary" type="submit">Daftar</button>`;
        const out = el('div', 'reg-out');
        out.setAttribute('role', 'status');
        api.body.append(f, out);
        const TERPAKAI = ['budi', 'dimas', 'lala', 'joko'];
        f.addEventListener('submit', e => {
          e.preventDefault();
          if (!api.alive()) return;
          const v = Object.fromEntries(new FormData(f));
          const err = [];
          const wa = F.wa(v.wa);
          if (!v.nama.trim()) err.push('[X]  Nama tidak boleh kosong.');
          if (!wa || wa.length < 10) err.push('[X]  Nomor WhatsApp belum valid. Masukkan kembali.');
          if (v.username.trim().length < 3) err.push('[X]  Username minimal 3 karakter.');
          else if (TERPAKAI.includes(v.username.trim().toLowerCase())) err.push('[X]  Username tersebut sudah digunakan. Pilih username lain.');
          if (v.password.length < 4) err.push('[X]  Password minimal 4 karakter.');
          out.innerHTML = '';
          if (err.length) {
            out.appendChild(term(err, 'Pesan validasi yang sama dengan aplikasi Pascal'));
            G.sfx.bad(); G.ui.shake(f);
            G.react('sarah', 'Program menolak data yang belum valid dan meminta kita mengisinya lagi. Perbaiki yang ditandai, ya.', 'thinking');
            return;
          }
          Object.assign(s, { nama: v.nama.trim().slice(0, 50), wa: v.wa.trim(), username: v.username.trim(), idPelanggan: 'PL0001' });
          G.persist();
          out.appendChild(term(['[OK] Registrasi berhasil!', 'ID Pelanggan: PL0001', `Nomor WhatsApp disimpan sebagai: ${wa}`]));
          f.querySelectorAll('input,button').forEach(x => { x.disabled = true; });
          G.sfx.good();
          G.ticket.show(s, 'nama');
          G.react('sarah', `Registrasi berhasil. Perhatikan: nomor ${v.wa.trim()} disimpan sebagai ${wa}, format yang dipakai tautan WhatsApp.`, 'happy');
          G.award('b5-registrasi', 10, 'Registrasi pelanggan');
          G.ui.continueBtn(api, 'Lanjut').then(() => api.done());
        });
        api.solve = () => {
          f.nama.value = D.B5_PELANGGAN.nama; f.wa.value = D.B5_PELANGGAN.wa; f.username.value = D.B5_PELANGGAN.username; f.password.value = 'demo1234';
          f.requestSubmit();
        };
      });
      await say('sarah', 'Di aplikasi asli, ini **Menu Pelanggan → 1. Registrasi akun baru**.', 'happy');
    },
    // Langkah 2: Buat pesanan
    async function dataPesanan() {
      const s = ensureSim(1);
      G.scene({ bg: 'calm', cast: { syahril: ['farleft', 'smile', 'prop'], ratna: ['midleft', 'smile'], nadia: ['right', 'neutral', 'prop'] } });
      G.ticket.show(s);
      await say('syahril', `Sekarang ${s.nama.split(' ')[0]} login, lalu memilih **1. Buat pesanan laundry**.`, 'smile');
      await G.activity({
        kicker: 'Babak 5 · Langkah 2 dari 7', title: 'Data pesanan dicatat',
        objective: 'Pilih **layanan** dan **metode pembayaran**, lalu simpan pesanan.',
        help: 'Layanan menentukan tarif per kg. Metode pembayaran menentukan isi pesan tagihan nanti. Berat belum diisi karena cucian belum ditimbang.'
      }, api => {
        let layanan = s.layanan, metode = s.metode;
        const f = el('div', 'order-form');
        f.innerHTML = `<div class="menu-path">Menu Pelanggan → 1. Buat pesanan laundry</div>
          <fieldset><legend>Pilih layanan</legend><div class="opt-row" data-k="layanan">
            <button class="opt" data-v="Reguler"><b>Reguler</b><span>${F.rupiah(D.TARIF.Reguler)} per kg</span></button>
            <button class="opt" data-v="Express"><b>Express</b><span>${F.rupiah(D.TARIF.Express)} per kg</span></button></div></fieldset>
          <fieldset><legend>Pilih metode pembayaran</legend><div class="opt-row" data-k="metode">
            <button class="opt" data-v="Tunai"><b>Tunai</b><span>bayar ke admin</span></button>
            <button class="opt" data-v="Transfer"><b>Transfer</b><span>transfer bank, diverifikasi admin</span></button></div></fieldset>`;
        const sum = el('div', 'order-sum');
        api.body.append(f, sum);
        f.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
          if (!api.alive() || sum.dataset.saved) return;
          const k = b.parentElement.dataset.k;
          b.parentElement.querySelectorAll('.opt').forEach(x => x.classList.remove('is-selected'));
          b.classList.add('is-selected'); G.sfx.click();
          if (k === 'layanan') layanan = b.dataset.v; else metode = b.dataset.v;
          renderSum();
        }));
        function renderSum() {
          sum.innerHTML = '';
          if (!layanan || !metode) { sum.appendChild(el('p', 'muted', 'Pilih layanan dan metode pembayaran.')); return; }
          sum.appendChild(term(['[ Ringkasan pesanan ]', 'ID pesanan : PD00001', 'Layanan    : ' + layanan, 'Pembayaran : ' + metode, 'Berat      : menunggu ditimbang admin', 'Total      : menunggu berat aktual', 'Simpan pesanan ini? (Y untuk ya): ']));
          const row = el('div', 'btn-row');
          const yes = el('button', 'btn btn-primary', 'Y · Simpan');
          const no = el('button', 'btn', 'Batal');
          yes.addEventListener('click', save);
          no.addEventListener('click', () => {
            sum.appendChild(term(['[!]  Pesanan dibatalkan dan tidak disimpan.'], ''));
            G.react('syahril', 'Kalau tidak menekan Y, pesanan tidak disimpan. Konfirmasi ini mencegah pesanan tersimpan tanpa sengaja. Silakan pilih lagi.', 'neutral');
            G.sfx.bad();
          });
          row.append(yes, no);
          sum.appendChild(row);
        }
        function save() {
          if (!api.alive() || sum.dataset.saved) return;
          sum.dataset.saved = '1';
          Object.assign(s, { layanan, metode, id: 'PD00001', bayar: 'Belum Dibayar', status: 'Menunggu Ditimbang' });
          G.persist();
          sum.innerHTML = '';
          sum.appendChild(term(['[OK] Pesanan berhasil disimpan. Catat ID pesanan: PD00001', 'Silakan bawa cucian ke admin untuk ditimbang.']));
          G.sfx.good(); G.ticket.show(s, 'layanan');
          G.react('nadia', `Oke, saya pilih ${layanan} dan bayar ${metode === 'Tunai' ? 'tunai' : 'lewat transfer'}.`, 'smile');
          G.award('b5-pesanan', 10, 'Membuat pesanan');
          G.ui.continueBtn(api, 'Lanjut').then(() => api.done());
        }
        renderSum();
        api.solve = () => { layanan = layanan || 'Reguler'; metode = metode || 'Transfer'; save(); };
      });
      await say('syahril', 'Pesanan tersimpan dengan ID **PD00001**. Statusnya **Menunggu Ditimbang**, karena beratnya belum diketahui.', 'neutral');
    },
    // Langkah 3: Cucian ditimbang
    async function ditimbang() {
      const s = ensureSim(2);
      G.scene({ bg: 'calm', cast: { gilbert: ['left', 'focused', 'prop'], ratna: ['center', 'focused'], nadia: ['farright', 'smile'] } });
      G.ticket.show(s);
      await say('gilbert', 'Sekarang giliran admin. Cucian ditimbang dulu. Berat tidak boleh ditebak dari besar kantong.', 'focused');
      await G.activity({
        kicker: 'Babak 5 · Langkah 3 dari 7', title: 'Cucian ditimbang', wide: true,
        objective: 'Taruh **semua cucian** di timbangan, lalu ketik berat aktualnya seperti di **Menu Admin → 2**.',
        help: 'Total biaya bergantung pada berat. Karena itu admin memasukkan berat aktual dari timbangan, bukan dari perkiraan pelanggan.'
      }, async api => {
        const wrap = el('div', 'scale-game');
        const items = el('div', 'clothes');
        const scale = el('div', 'scale');
        scale.innerHTML = '<div class="scale-plate"></div><div class="scale-body"><div class="scale-lcd"><span class="lcd-num">0,0</span><span class="lcd-unit">kg</span></div><span class="scale-state">Kosong</span></div>';
        wrap.append(items, scale);
        api.body.appendChild(wrap);
        const plate = scale.querySelector('.scale-plate'), lcd = scale.querySelector('.lcd-num'), state = scale.querySelector('.scale-state');
        let berat = 0, placed = 0;
        const target = D.B5_CUCIAN.reduce((a, c) => a + c.berat, 0);
        D.B5_CUCIAN.forEach(c => {
          const b = el('button', 'cloth', `<i style="background:${c.warna}"></i>${esc(c.nama)}`);
          b.addEventListener('click', () => {
            if (!api.alive() || b.disabled) return;
            b.disabled = true; placed++; G.sfx.scale();
            const chip = el('span', 'on-plate', `<i style="background:${c.warna}"></i>`);
            plate.appendChild(chip);
            const from = berat; berat = Math.round((berat + c.berat) * 10) / 10;
            animateNum(from, berat);
            state.textContent = placed === D.B5_CUCIAN.length ? 'Stabil ✔' : 'Menimbang…';
            if (placed === D.B5_CUCIAN.length) G.react('gilbert', `Timbangan stabil di ${F.berat(berat)}. Sekarang ketik angka itu sebagai berat aktual.`, 'happy');
          });
          items.appendChild(b);
        });
        function animateNum(a, b) {
          if (G.reduced()) { lcd.textContent = String(b).replace('.', ','); return; }
          const t0 = performance.now();
          const step = now => {
            const k = Math.min(1, (now - t0) / 380);
            lcd.textContent = (a + (b - a) * k).toFixed(1).replace('.', ',');
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
        const termBox = el('div');
        termBox.appendChild(term(['Masukkan ID pesanan: PD00001', '(detail pesanan ditampilkan)'], 'Menu Admin → 2. Input berat aktual dan hitung biaya'));
        api.body.appendChild(termBox);
        api.body.appendChild(el('p', 'hint', 'Coba juga ketik <code>0</code>, <code>-1</code>, atau <code>abc</code> untuk melihat validasi program.'));
        const tanya = G.ui.numberAsk(api, api.body, {
          label: 'Masukkan berat aktual (kg):', suffix: 'kg', placeholder: 'contoh: 2,5', answer: String(target).replace('.', ','), who: 'gilbert',
          check: v => {
            const n = F.angka(v);
            if (isNaN(n)) return { ok: false, msg: '[X]  Input angka tidak valid. Gunakan titik atau koma untuk desimal.' };
            if (n < 0.01 || n > 500) return { ok: false, msg: '[X]  Nilai harus antara 0,01 dan 500.' };
            if (placed < D.B5_CUCIAN.length) return { ok: false, msg: 'Angkanya valid untuk program, tetapi masih ada cucian di luar timbangan. Timbang semuanya dulu.' };
            if (Math.abs(n - target) > 0.001) return { ok: false, msg: `Program akan menerima ${String(n).replace('.', ',')} karena angkanya valid, tetapi tidak sama dengan timbangan (${F.berat(target)}). Program hanya menyimpan yang diketik admin, jadi admin harus teliti.` };
            return { ok: true, value: n, msg: `Berat aktual ${F.berat(n)} dicatat.` };
          }
        });
        // Presenter: taruh semua cucian di timbangan dulu, baru ketik beratnya
        const isiBerat = api.solve;
        api.solve = () => { items.querySelectorAll('.cloth:not(:disabled)').forEach(b => b.click()); isiBerat(); };
        const r = await tanya;
        api.solve = null;
        Object.assign(s, { berat: r.value, status: 'Menunggu Diproses' });
        G.persist(); G.ticket.show(s, 'berat');
        G.award('b5-timbang', 15, 'Menimbang cucian');
        G.achieve('penimbang');
        api.done(r);
      });
      await say('gilbert', `Berat aktual **${F.berat(s.berat)}** tersimpan. Statusnya otomatis berubah menjadi **Menunggu Diproses**.`, 'happy');
      await say('gilbert', 'Di langkah yang sama, program langsung menghitung totalnya. Kita lihat cara hitungnya di langkah berikutnya.', 'neutral');
    },
    // Langkah 4: Biaya dihitung
    async function dihitung() {
      const s = ensureSim(3);
      const tarif = D.TARIF[s.layanan];
      const total = Math.round(s.berat * tarif);
      G.scene({ bg: 'calm', cast: { ratna: ['midleft', 'thinking'], syahril: ['right', 'smile', 'prop'] } });
      G.ticket.show(s);
      await say('syahril', 'Rumusnya sederhana. Coba Ibu hitung dulu, nanti kita cocokkan dengan program.', 'smile');
      await G.activity({
        kicker: 'Babak 5 · Langkah 4 dari 7', title: 'Biaya dihitung',
        objective: `Hitung total untuk **${F.berat(s.berat)}** layanan **${s.layanan}**.`,
        help: 'Total biaya = berat aktual × tarif per kilogram. Tarif dipilih sesuai layanan pesanan.'
      }, async api => {
        const card = el('div', 'formula big');
        card.innerHTML = `<div class="f-label">Total biaya = Berat aktual × Tarif per kilogram</div>
          <div><span class="f-box">${F.berat(s.berat)}</span><span class="f-op">×</span><span class="f-box">${F.rupiah(tarif)} / kg</span><span class="f-op">=</span><span class="f-box f-q">?</span></div>`;
        api.body.appendChild(card);
        let percobaan = 0;
        const r = await G.ui.numberAsk(api, api.body, {
          label: 'Total biaya', prefix: 'Rp', inputmode: 'numeric', placeholder: 'contoh: 15.000', answer: String(total), who: 'syahril',
          check: v => {
            const n = F.uang(v);
            if (isNaN(n)) return { ok: false, msg: 'Tulis dalam angka rupiah, misalnya 21000 atau 21.000.' };
            if (n === total) return { ok: true, msg: `Benar! ${F.berat(s.berat)} × ${F.rupiah(tarif)} = ${F.rupiah(total)}.` };
            percobaan++;
            const bulat = Math.floor(s.berat), sisa = Math.round((s.berat - bulat) * 100) / 100;
            if (percobaan === 1) return { ok: false, msg: `Belum tepat. Pecah saja: ${bulat} kg × ${F.rupiah(tarif)} = ${F.rupiah(bulat * tarif)}` + (sisa ? `, lalu ${String(sisa).replace('.', ',')} kg × ${F.rupiah(tarif)} = ${F.rupiah(sisa * tarif)}.` : '.') };
            return { ok: false, msg: `Jumlahkan bagian-bagiannya: ${F.rupiah(bulat * tarif)} + ${F.rupiah(Math.round(sisa * tarif))}.` };
          }
        });
        if (G.cur && G.cur.api === api) G.cur.api.solve = null;
        s.total = total; G.persist(); G.ticket.show(s, 'total');
        api.body.appendChild(el('h3', 'sub', 'Bagian kode Pascal yang menghitungnya'));
        api.body.appendChild(G.codeBlock('hitung', 'p.totalBiaya := berat * hargaPerKg;'));
        api.body.appendChild(el('h3', 'sub', 'Output yang dicetak program'));
        api.body.appendChild(term(['[OK] Data penimbangan berhasil disimpan.', 'Berat aktual : ' + F.berat(s.berat), 'Tarif per kg : ' + F.rupiah(tarif), 'Total biaya  : ' + F.rupiah(total), 'Status cucian: ' + s.status]));
        G.award('b5-hitung', 15, 'Menghitung total');
        await G.ui.continueBtn(api, 'Lanjut');
        api.done(r);
      });
      await say('ratna', 'Jadi saya tidak perlu menghitung manual lagi, asal beratnya diketik dengan benar.', 'happy');
      await say('syahril', 'Betul, Bu. Total disimpan bersama pesanan. Kalau tarif diubah nanti, total pesanan yang sudah ditimbang tidak ikut berubah.', 'smile');
    },
    // Langkah 5: Pesanan dikelola
    async function dikelola() {
      const s = ensureSim(4);
      G.scene({ bg: 'busy', cast: { gilbert: ['left', 'neutral'], ratna: ['center', 'focused'], sarah: ['right', 'smile'] } });
      G.ticket.show(s);
      await say('sarah', 'Siang ini pesanan bertambah. Mari lihat daftar semua pesanan di **Menu Admin → 1**.', 'smile');
      await G.activity({
        kicker: 'Babak 5 · Langkah 5 dari 7', title: 'Pesanan dikelola', wide: true,
        objective: 'Klik pesanan yang masih **Menunggu Ditimbang**.',
        help: 'Dengan daftar pesanan, admin langsung tahu pesanan mana yang perlu ditimbang, diproses, atau diserahkan—tanpa membolak-balik buku.'
      }, async api => {
        const rows = [{ id: s.id, nama: s.nama, layanan: s.layanan, berat: s.berat, total: s.total, bayar: s.bayar === 'Lunas' ? 'Lunas' : 'Belum', status: s.status }, ...D.B5_DAFTAR_LAIN];
        const tbl = el('table', 'orders');
        tbl.innerHTML = '<caption>DAFTAR SEMUA PESANAN (simulasi)</caption><thead><tr><th>ID</th><th>Nama</th><th>Layanan</th><th>Berat</th><th>Total</th><th>Bayar</th><th>Status cucian</th></tr></thead>';
        const tb = el('tbody');
        tbl.appendChild(tb);
        api.body.appendChild(el('div', 'table-wrap')).appendChild(tbl);
        const fb = el('p', 'feedback'); fb.setAttribute('role', 'status');
        api.body.appendChild(fb);
        let selesai = false;
        const trs = rows.map(r => {
          const tr = el('tr');
          tr.innerHTML = `<td>${esc(r.id)}</td><td>${esc(r.nama.slice(0, 13))}</td><td>${esc(r.layanan)}</td><td>${r.berat ? F.berat(r.berat) : '-'}</td><td>${r.total ? F.rupiah(r.total) : 'belum'}</td><td>${esc(r.bayar)}</td><td><span class="st st-${D.STATUS.indexOf(r.status)}">${esc(r.status)}</span></td>`;
          tr.tabIndex = 0;
          tr.setAttribute('role', 'button');
          const pick = () => {
            if (!api.alive() || selesai) return;
            if (r.status === 'Menunggu Ditimbang') {
              selesai = true; tr.classList.add('is-right'); G.sfx.good();
              fb.className = 'feedback good'; fb.innerHTML = `✔ ${esc(r.id)} belum ditimbang. Berat dan totalnya masih kosong.`;
              G.react('sarah', `Betul, ${r.id} masih Menunggu Ditimbang. Daftar seperti ini membantu admin tahu pekerjaan berikutnya.`, 'happy');
              done1();
            } else {
              tr.classList.add('is-wrong'); G.sfx.bad(); G.ui.shake(tr);
              fb.className = 'feedback bad'; fb.innerHTML = `✘ ${esc(r.id)} berstatus “${esc(r.status)}”. Lihat kolom Status cucian.`;
            }
          };
          tr.addEventListener('click', pick);
          tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
          tb.appendChild(tr);
          return { tr, r, pick };
        });
        api.solve = () => trs.find(x => x.r.status === 'Menunggu Ditimbang').pick();
        let lanjut;
        const tahap1 = new Promise(res => { lanjut = res; });
        function done1() { setTimeout(lanjut, 700); }
        await tahap1;
        api.body.appendChild(el('h3', 'sub', 'Menu Admin → 5. Perbarui status cucian'));
        api.body.appendChild(info(`Mesin cuci kosong. Cucian ${esc(s.nama.split(' ')[0])} (${esc(s.id)}) <strong>mulai dicuci</strong>. Pilih status barunya.`));
        api.objective(`Perbarui status ${s.id}: cucian mulai dicuci. Coba juga klik tahap yang terlalu jauh untuk melihat aturan program.`);
        await statusPicker(api, api.body, s, 'Sedang Diproses', { alasan: 'Status sekarang Sedang Diproses. Siapa pun yang mengecek PD00001 melihat status yang sama.' });
        G.award('b5-kelola', 15, 'Mengelola status pesanan');
        await G.ui.continueBtn(api, 'Lanjut');
        api.done();
      });
      await say('gilbert', 'Perhatikan aturannya: status hanya boleh maju **satu tahap**. Program menolak lompatan supaya urutannya tetap masuk akal.', 'focused');
    },
    // Langkah 6: Pembayaran diinformasikan
    async function pembayaran() {
      const s = ensureSim(5);
      G.scene({ bg: 'calm', cast: { sarah: ['farleft', 'smile'], ratna: ['midleft', 'neutral', 'prop'], nadia: ['right', 'neutral', 'prop'] } });
      G.ticket.show(s);
      await say('sarah', 'Totalnya sudah ada. Sekarang Bu Ratna memberi tahu tagihannya kepada pelanggan.', 'smile');
      await G.activity({
        kicker: 'Babak 5 · Langkah 6 dari 7', title: 'Pembayaran diinformasikan', wide: true,
        objective: 'Pilih menu admin yang menyiapkan **pesan tagihan**.',
        help: 'Pelanggan perlu tahu total dan cara membayar. Program menyusun teksnya agar admin tidak mengetik ulang setiap kali.'
      }, async api => {
        await G.ui.quiz(api, api.body, {
          q: 'Menu admin mana yang menyiapkan pesan tagihan?', who: 'sarah',
          options: [
            { text: '4. Perbarui status pembayaran', correct: false, why: 'Menu 4 untuk menandai Lunas setelah dibayar, bukan untuk memberi tahu tagihan.' },
            { text: '7. Siapkan pesan tagihan via WhatsApp', correct: true, why: 'Tepat. Menu 7 menyusun teks berisi total dan cara bayar.' },
            { text: '8. Siapkan notifikasi cucian siap diambil', correct: false, why: 'Cucian belum siap. Menu 8 menolak jika status belum Siap Diambil.' }
          ]
        });
        api.body.innerHTML = '';
        api.objective(`Periksa pesan tagihan untuk metode **${s.metode}**.`);
        api.body.appendChild(waPreview(s, pesanTagihan(s)));
        api.body.appendChild(info(WA_NOTE, 'warn'));
        if (s.metode === 'Transfer') api.body.appendChild(el('p', 'muted', 'Nomor rekening di atas adalah data contoh bawaan program, bukan rekening sungguhan.'));
        await G.ui.continueBtn(api, 'Pesan sudah dikirim admin');
        api.done();
      });
      G.expr('nadia', 'happy');
      await say('nadia', s.metode === 'Transfer' ? 'Sudah saya transfer ya, Bu!' : 'Saya bayar tunai sekarang saja ya, Bu.', 'happy');
      await G.activity({
        kicker: 'Babak 5 · Langkah 6 dari 7', title: 'Verifikasi pembayaran', wide: true,
        objective: 'Apa yang dilakukan Bu Ratna sebelum menandai **Lunas**?',
        help: 'Memilih metode Transfer bukan bukti pembayaran. Status Lunas hanya ditandai setelah admin memeriksa uangnya benar-benar diterima.'
      }, async api => {
        if (s.metode === 'Transfer') {
          const mut = el('table', 'orders mutasi');
          mut.innerHTML = `<caption>Mutasi rekening (contoh fiktif)</caption><thead><tr><th>Waktu</th><th>Keterangan</th><th>Masuk</th></tr></thead>
            <tbody><tr><td>09.12</td><td>TRF DIMAS PRATAMA</td><td>Rp 24.000</td></tr><tr class="hl"><td>14.37</td><td>TRF ${esc(s.nama.toUpperCase())}</td><td>${F.rupiah(s.total)}</td></tr></tbody>`;
          api.body.appendChild(el('div', 'table-wrap')).appendChild(mut);
        } else {
          api.body.appendChild(info(`Kak Nadia menyerahkan uang tunai sebesar <strong>${F.rupiah(s.total)}</strong>.`));
        }
        await G.ui.quiz(api, api.body, {
          q: 'Langkah yang benar:', who: 'ratna',
          options: [
            { text: 'Langsung tandai Lunas karena pelanggan sudah bilang', correct: false, why: 'Ucapan pelanggan belum bukti. Program pun bertanya “Sudah diverifikasi?”.' },
            { text: s.metode === 'Transfer' ? 'Cocokkan nominal di mutasi dengan total, lalu tandai Lunas' : 'Hitung uang yang diterima sama dengan total, lalu tandai Lunas', correct: true, why: 'Tepat. Periksa dulu, baru tandai Lunas.' },
            { text: 'Tandai Lunas besok saja, sekalian semua pesanan', correct: false, why: 'Menunda membuat status tidak sesuai kenyataan. Periksa dan perbarui saat pembayaran diterima.' }
          ]
        });
        api.body.appendChild(el('h3', 'sub', 'Menu Admin → 4. Perbarui status pembayaran'));
        api.body.appendChild(term(['1. Tandai Lunas', 'Pilihan: 1', '[!]  Pastikan pembayaran tunai sudah diterima atau transfer sudah diverifikasi.', 'Sudah diverifikasi? (Y untuk ya): ']));
        const row = el('div', 'btn-row');
        const y = el('button', 'btn btn-primary', 'Y · Sudah diverifikasi');
        const n = el('button', 'btn', 'Belum');
        row.append(y, n);
        api.body.appendChild(row);
        await new Promise(res => {
          n.addEventListener('click', () => { G.sfx.click(); G.react('ratna', 'Kalau belum yakin, status tidak diubah. Tapi tadi sudah saya cek, jadi aman.', 'neutral'); });
          y.addEventListener('click', () => { if (api.alive()) res(); });
          api.solve = () => y.click();
        });
        row.remove();
        s.bayar = 'Lunas'; G.persist(); G.ticket.show(s, 'bayar');
        api.body.appendChild(term(['[OK] Status pembayaran sekarang: Lunas']));
        G.sfx.good();
        G.award('b5-bayar', 15, 'Memverifikasi pembayaran');
        await G.ui.continueBtn(api, 'Lanjut');
        api.done();
      });
      await say('ratna', 'Lunas. Dan status bayar terpisah dari status cucian, ya. Cuciannya sendiri masih diproses.', 'smile');
    },
    // Langkah 7: Pesanan selesai
    async function selesai() {
      const s = ensureSim(6);
      G.scene({ bg: 'tidy', cast: { syahril: ['left', 'smile', 'prop'], ratna: ['center', 'smile'] } });
      G.ticket.show(s);
      await say('narrator', 'Sore hari, cucian Kak Nadia sudah kering, dilipat, dan dikemas rapi.');
      await G.activity({
        kicker: 'Babak 5 · Langkah 7 dari 7', title: 'Pesanan selesai', wide: true,
        objective: 'Cucian sudah siap. Kabari pelanggan dengan urutan yang benar.',
        help: 'Notifikasi hanya dikirim jika status benar-benar Siap Diambil, supaya pelanggan tidak datang sia-sia.'
      }, async api => {
        const menu = el('div', 'admin-actions');
        const out = el('div', 'action-out');
        out.setAttribute('role', 'status');
        api.body.append(el('div', 'menu-path', 'Menu Admin SI-PANDRI'), menu, out);
        let tahap = 0; // 0: perlu status Siap, 1: perlu notifikasi
        const AKSI = [
          { no: 5, text: 'Perbarui status cucian' },
          { no: 8, text: 'Siapkan notifikasi cucian siap diambil' },
          { no: 9, text: 'Laporan transaksi' }
        ];
        const btns = AKSI.map(a => {
          const b = el('button', 'menu-item', `<span class="no">${a.no}.</span> ${esc(a.text)}`);
          b.addEventListener('click', () => aksi(a.no));
          menu.appendChild(b);
          return b;
        });
        let selesaiTahap;
        const semua = new Promise(r => { selesaiTahap = r; });
        async function aksi(no) {
          if (!api.alive() || menu.dataset.busy) return;
          out.innerHTML = '';
          if (no === 9) {
            G.sfx.click();
            out.appendChild(info('Laporan berguna untuk rekap pendapatan, tetapi belum dibutuhkan untuk mengabari pelanggan.'));
            return;
          }
          if (no === 8) {
            if (s.status !== 'Siap Diambil') {
              G.sfx.bad();
              out.appendChild(term(['Masukkan ID pesanan: ' + s.id, '[X]  Status cucian belum Siap Diambil. Periksa status sebelum mengirim notifikasi.']));
              G.react('syahril', 'Program menolak, karena statusnya masih ' + s.status + '. Perbarui statusnya dulu lewat menu 5.', 'thinking');
              return;
            }
            G.sfx.good();
            out.appendChild(waPreview(s, pesanSiap(s)));
            out.appendChild(info(WA_NOTE, 'warn'));
            tahap = 2;
            btns.forEach(b => { b.disabled = true; });
            G.react('syahril', 'Pesan siap diambil sudah disiapkan. Bu Ratna tinggal memeriksa dan menekan Kirim.', 'happy');
            setTimeout(selesaiTahap, 600);
            return;
          }
          if (no === 5) {
            if (s.status === 'Siap Diambil') { out.appendChild(info('Status sudah Siap Diambil. Sekarang siapkan notifikasinya.')); return; }
            menu.dataset.busy = '1';
            out.appendChild(info('Cucian sudah kering dan dikemas. Pilih status barunya.'));
            await statusPicker(api, out, s, 'Siap Diambil', { who: 'syahril', alasan: 'Status Siap Diambil. Sekarang notifikasi boleh disiapkan.' });
            delete menu.dataset.busy;
            tahap = 1;
          }
        }
        // Presenter: aksi(5) memasang solve milik pemilih status, jadi langsung dipanggil lalu lanjut ke menu 8
        const solveSemua = () => {
          if (s.status === 'Siap Diambil') { aksi(8); return; }
          const p = aksi(5);
          if (api.solve && api.solve !== solveSemua) api.solve();
          p.then(() => aksi(8));
        };
        api.solve = solveSemua;
        await semua;
        await G.ui.continueBtn(api, 'Lanjut');
        api.done({ tahap });
      });
      G.show('nadia', 'right', 'happy', 'prop');
      await say('nadia', 'Bu, saya dapat kabar cucian sudah siap. Saya ambil, ya!', 'happy');
      await say('ratna', 'Ini, Kak. Sudah rapi dan wangi.', 'happy');
      await G.activity({
        kicker: 'Babak 5 · Langkah 7 dari 7', title: 'Cucian diserahkan',
        objective: 'Cucian sudah diterima Kak Nadia. Perbarui status terakhirnya.',
        help: 'Status terakhir menandai pesanan tuntas. Laporan transaksi menghitung pesanan selesai dari status ini.'
      }, async api => {
        await statusPicker(api, api.body, s, 'Selesai/Diserahkan', { who: 'ratna', alasan: 'Selesai! Pesanan PD00001 tuntas dari awal sampai akhir.' });
        G.award('b5-selesai', 25, 'Pesanan tuntas');
        G.achieve('admin-tertib');
        await G.ui.continueBtn(api, 'Lanjut');
        api.done();
      });
      G.hide('nadia');
      G.expr('ratna', 'proud');
      await say('ratna', 'Dari datang sampai diambil, semuanya tercatat. Saya tidak perlu mengingat-ingat lagi.', 'proud');
      G.note('b5', [
        `Pesanan ${s.id} atas nama ${s.nama} (data fiktif), layanan ${s.layanan}, bayar ${s.metode}.`,
        `Berat aktual ${F.berat(s.berat)} × ${F.rupiah(D.TARIF[s.layanan])} = ${F.rupiah(s.total)}.`,
        'Status: Menunggu Ditimbang → Menunggu Diproses → Sedang Diproses → Siap Diambil → Selesai/Diserahkan.',
        'Pembayaran ditandai Lunas setelah diverifikasi; pesan WhatsApp hanya disiapkan, dikirim manual.'
      ]);
      G.ticket.hide();
    }
  ];

  /* =====================================================================
     BABAK 6 — Sebelum dan Sesudah
     ===================================================================== */
  const b6 = [
    async function bandingkan() {
      G.scene({ bg: 'calm', cast: { gilbert: ['left', 'neutral'], ratna: ['center', 'smile'], sarah: ['right', 'smile'] } });
      await say('gilbert', 'Sekarang mari kita bandingkan dengan jujur: apa yang berubah, dan apa yang tetap sama.', 'focused');
      await G.activity({
        kicker: 'Babak 6 · Misi', title: 'Sebelum, sesudah, atau tetap sama?', wide: true,
        objective: 'Kelompokkan **9 kartu** ke kolom yang tepat.',
        help: 'Perbandingan yang adil menyebut juga hal yang tidak berubah. Itu mencegah klaim berlebihan.'
      }, async api => {
        const r = await G.ui.sort(api, api.body, { cats: D.B6_SORT.cats, items: D.B6_SORT.items, who: 'gilbert' });
        api.body.innerHTML = '';
        api.objective('Perhatikan perubahan alur kerjanya.');
        const viz = el('div', 'flow-compare');
        viz.innerHTML = `<div class="lane before"><h3>Sebelum</h3><div class="scatter">
            <span>Buku catatan</span><span>Kalkulator</span><span>Ingatan</span><span>Ketik ulang pesan</span><span>Cari halaman</span></div></div>
          <div class="lane after"><h3>Sesudah SI-PANDRI</h3><ol class="flow">
            <li>Registrasi</li><li>Buat pesanan</li><li>Timbang</li><li>Hitung</li><li>Status</li><li>Bayar</li><li>Kabari</li></ol></div>`;
        api.body.appendChild(viz);
        G.award('b6-banding', 20, 'Membandingkan dengan adil');
        G.achieve('adil');
        await G.ui.continueBtn(api, 'Lanjut');
        api.done(r);
      });
      await say('gilbert', 'Perhatikan: kita tidak bilang SI-PANDRI menghapus semua kesalahan. Kalau berat yang diketik salah, totalnya ikut salah.', 'neutral');
      await say('sarah', 'Kami juga belum mengukur berapa menit yang dihemat, jadi kami tidak menulis angka persen. Yang jelas: alurnya lebih tertata.', 'smile');
      await say('ratna', 'Saya suka penjelasan yang jujur begitu.', 'happy');
      G.note('b6', ['Sebelum: catatan tulisan tangan, hitung manual, cari halaman, ketik ulang pesan.', 'Sesudah: pesanan tersimpan di file lokal, dicari dengan ID, total dihitung program, teks WhatsApp disiapkan.', 'Tetap sama: cucian tetap ditimbang dan dicuci manusia; input harus benar.']);
      G.award('b6-selesai', 15, 'Babak 6 selesai');
    }
  ];

  /* =====================================================================
     BABAK 7 — Logika di Balik Sistem (kode asli dari SI_PANDRI.pas)
     ===================================================================== */
  const KONSEP = [
    { id: 'io', judul: 'Input & Output', kode: ['input', 'output'], teks: '`Readln` membaca ketikan pengguna. `Write`/`Writeln` menampilkan teks. Fungsi BacaTeks dipakai hampir di semua menu.' },
    { id: 'if', judul: 'Percabangan', kode: ['pilihLayanan', 'syaratTimbang'], teks: '`case-of` memilih tindakan sesuai nomor pilihan. `if-then` memeriksa syarat, misalnya cucian harus sudah ditimbang.' },
    { id: 'nested', judul: 'Nested-if', kode: ['statusUrut'], teks: 'Rangkaian `if … else if` memastikan status tidak sama dan tidak melompati tahap.' },
    { id: 'loop', judul: 'Perulangan', kode: ['validasi', 'ulangFor', 'menuRepeat'], teks: '`while-do` mengulang input sampai valid, `for-to-do` membaca setiap pesanan, `repeat-until` menampilkan menu sampai Logout.' },
    { id: 'hitung', judul: 'Perhitungan', kode: ['hitung'], teks: 'Tarif dipilih sesuai layanan, lalu total = berat × tarif.' },
    { id: 'cari', judul: 'Pencarian & Break', kode: ['cariBreak'], teks: 'Pesanan dibaca satu per satu sampai ID cocok, lalu `Break` menghentikan pencarian.' },
    { id: 'data', judul: 'Tipe data & File', kode: ['recordPesanan', 'simpanFile'], teks: '`record` mengelompokkan data satu pesanan. `Seek` dan `Write` menyimpan perubahan ke file lokal.' },
    { id: 'wa', judul: 'Tautan WhatsApp', kode: ['linkWA'], teks: 'Program hanya menyusun tautan wa.me berisi teks. Tidak ada pengiriman otomatis.' }
  ];
  const b7 = [
    async function konsep() {
      G.scene({ bg: 'tech', cast: { syahril: ['left', 'smile', 'prop'], gilbert: ['right', 'focused'] } });
      await say('syahril', 'Sekarang kita intip isi programnya. Semua cuplikan di sini diambil dari **SI_PANDRI.pas** yang asli, lengkap dengan nomor barisnya.', 'smile');
      await G.activity({
        kicker: 'Babak 7 · Misi 1', title: 'Kartu konsep Dasar Pemrograman', wide: true,
        objective: 'Buka **kedelapan kartu** konsep untuk melihat kode aslinya.',
        help: 'Memahami di mana setiap konsep dipakai membantu menjelaskan program saat presentasi dan saat ditanya dosen.'
      }, api => {
        const tabs = el('div', 'tabs');
        tabs.setAttribute('role', 'tablist');
        const panel = el('div', 'tab-panel');
        panel.setAttribute('role', 'tabpanel');
        const cnt = el('p', 'counter', 'Dibuka: 0 / ' + KONSEP.length);
        const seen = new Set();
        KONSEP.forEach(k => {
          const b = el('button', 'tab', esc(k.judul));
          b.setAttribute('role', 'tab');
          b.addEventListener('click', () => open(k, b));
          tabs.appendChild(b);
        });
        api.body.append(tabs, cnt, panel);
        function open(k, b) {
          if (!api.alive()) return;
          tabs.querySelectorAll('.tab').forEach(x => x.setAttribute('aria-selected', 'false'));
          b.setAttribute('aria-selected', 'true'); b.classList.add('seen');
          seen.add(k.id); G.sfx.click();
          panel.innerHTML = '';
          panel.appendChild(el('p', 'lead', G.rich(k.teks)));
          k.kode.forEach(c => panel.appendChild(G.codeBlock(c)));
          cnt.textContent = `Dibuka: ${seen.size} / ${KONSEP.length}`;
          if (seen.size === KONSEP.length && !api.foot.firstChild) {
            G.react('gilbert', 'Semua kartu sudah dibuka. Konsep dasar ternyata cukup untuk membuat sistem yang berguna.', 'happy');
            G.ui.continueBtn(api, 'Lanjut').then(() => api.done());
          }
        }
        api.solve = () => tabs.querySelectorAll('.tab').forEach(b => b.click());
        tabs.querySelector('.tab').click();
      });
    },
    async function pasangkan() {
      G.scene({ bg: 'tech', cast: { syahril: ['left', 'smile', 'prop'], gilbert: ['right', 'focused'] } });
      await say('gilbert', 'Uji pemahaman, yuk. Pasangkan baris kode dengan fungsinya.', 'focused');
      await G.activity({
        kicker: 'Babak 7 · Misi 2', title: 'Pasangkan kode dengan fungsinya', wide: true,
        objective: 'Pasangkan **6 baris kode asli** dengan fungsinya.',
        help: 'Membaca kode berarti memahami tugas setiap baris, bukan menghafal sintaks.'
      }, async api => {
        const left = D.B7_FUNGSI.map((f, i) => {
          const ln = G.findLine(f.kode, f.baris);
          return { id: 'k' + i, html: `<code>${esc(f.baris.trim())}</code><small>baris ${ln || '?'}</small>` };
        });
        const right = shuffleFixed(D.B7_FUNGSI.map((f, i) => ({ id: 'f' + i, text: f.fungsi })), [2, 4, 0, 5, 1, 3]);
        const answer = Object.fromEntries(D.B7_FUNGSI.map((f, i) => ['k' + i, 'f' + i]));
        const r = await G.ui.match(api, api.body, {
          left, right, answer, who: 'gilbert', leftLabel: 'Baris kode (SI_PANDRI.pas)', rightLabel: 'Fungsinya',
          wrongText: () => 'Belum cocok. Baca lagi kata kuncinya: Readln, :=, case, while, for, atau Write(f, …).',
          rightText: (l, r2) => `Cocok: ${D.B7_FUNGSI[+l.slice(1)].fungsi.toLowerCase()}.`
        });
        G.award('b7-pasang', 20, 'Memasangkan kode');
        api.done(r);
      });
    },
    async function tebak() {
      G.scene({ bg: 'tech', cast: { syahril: ['left', 'smile', 'prop'], gilbert: ['right', 'focused'] } });
      await say('syahril', 'Terakhir, tebak apa yang dilakukan program dalam beberapa situasi.', 'smile');
      let salah = 0;
      await G.activity({
        kicker: 'Babak 7 · Misi 3', title: 'Tebak perilaku program', wide: true,
        objective: 'Jawab **4 pertanyaan** tentang perilaku SI-PANDRI.',
        help: 'Memprediksi output adalah cara menguji pemahaman logika sebelum menjalankan program.'
      }, async api => {
        for (let i = 0; i < D.B7_TEBAK.length; i++) {
          api.body.innerHTML = '';
          api.objective(`Pertanyaan ${i + 1} dari ${D.B7_TEBAK.length}`);
          const r = await G.ui.quiz(api, api.body, { q: D.B7_TEBAK[i].q, options: D.B7_TEBAK[i].options, who: 'syahril' });
          salah += r.wrong;
        }
        G.award('b7-tebak', 20, 'Memprediksi perilaku program');
        G.achieve('pembaca-kode');
        api.done();
      });
      await say('gilbert', 'Jadi program ini memakai materi Dasar Pemrograman: input-output, percabangan, perulangan, perhitungan, validasi, dan file.', 'happy');
      G.note('b7', ['Membuka 8 kartu konsep dengan kode asli SI_PANDRI.pas.', 'Memasangkan 6 baris kode dengan fungsinya.', `Menjawab 4 pertanyaan perilaku program (${salah} jawaban keliru sebelum benar).`]);
      G.award('b7-selesai', 15, 'Babak 7 selesai');
    }
  ];

  /* =====================================================================
     BABAK 8 — Bu Ratna Mencoba Sendiri
     ===================================================================== */
  const b8 = [
    async function mencoba() {
      G.scene({ bg: 'calm', cast: { gilbert: ['farleft', 'smile'], sarah: ['left', 'smile'], ratna: ['center', 'worried', 'prop'], syahril: ['farright', 'smile'] } });
      await say('sarah', 'Bu Ratna, sekarang giliran Ibu mencoba sendiri. Kami mendampingi dari belakang.', 'smile');
      await say('ratna', 'Aduh, deg-degan juga. Bantu saya kalau salah, ya.', 'worried');
      let pertamaBenar = 0;
      await G.activity({
        kicker: 'Babak 8 · Misi', title: 'Bu Ratna menghadapi pelanggan', wide: true,
        objective: '',
        help: 'Memilih tindakan yang tepat sesuai situasi adalah tanda pengguna sudah memahami alur sistem.'
      }, async api => {
        const meter = el('div', 'meter');
        meter.innerHTML = '<span>Kepercayaan diri Bu Ratna</span><div class="meter-bar"><i style="width:0%"></i></div>';
        const area = el('div');
        api.body.append(meter, area);
        const ekspresi = ['worried', 'thinking', 'neutral', 'smile', 'happy', 'proud'];
        const n = D.B8_SKENARIO.length;
        for (let i = 0; i < n; i++) {
          const sk = D.B8_SKENARIO[i];
          api.objective(`Situasi ${i + 1} dari ${n}`);
          Object.keys(G.actors).filter(id => ['joko', 'lala', 'dimas'].includes(id)).forEach(id => { if (id !== sk.who) G.hide(id); });
          G.show(sk.who, 'midright', 'neutral', 'prop');
          area.innerHTML = '';
          area.appendChild(el('p', 'situasi', `<span class="who">${esc(D.SPEAKERS[sk.who].name)}</span> ${G.rich(sk.situasi)}`));
          let r;
          if (sk.angka) {
            r = await G.ui.numberAsk(api, area, {
              label: 'Total biaya', prefix: 'Rp', inputmode: 'numeric', answer: String(sk.angka), who: 'ratna',
              check: v => {
                const x = F.uang(v);
                if (isNaN(x)) return { ok: false, msg: 'Tulis dalam angka rupiah.' };
                return x === sk.angka ? { ok: true, msg: `Benar, 4,5 × Rp 6.000 = ${F.rupiah(sk.angka)}.` } : { ok: false, msg: 'Belum tepat. Hitung 4 kg × Rp 6.000, lalu tambahkan 0,5 kg × Rp 6.000.' };
              }
            });
          } else {
            r = await G.ui.quiz(api, area, { options: sk.options, who: 'ratna' });
          }
          if (r.wrong === 0) pertamaBenar++;
          meter.querySelector('i').style.width = Math.round((i + 1) / n * 100) + '%';
          G.expr('ratna', ekspresi[Math.min(i + 1, ekspresi.length - 1)]);
          await new Promise(res => setTimeout(res, G.reduced() ? 0 : 500));
        }
        G.hide('joko'); G.hide('lala'); G.hide('dimas');
        area.innerHTML = '';
        area.appendChild(info(`Semua situasi selesai. Benar pada percobaan pertama: <strong>${pertamaBenar} dari ${n}</strong>.`, 'good'));
        G.award('b8-skenario', 30, 'Mendampingi Bu Ratna');
        G.achieve('mentor');
        if (pertamaBenar === n) G.achieve('tanpa-ragu');
        await G.ui.continueBtn(api, 'Lanjut');
        api.done();
      });
      G.expr('ratna', 'proud');
      await say('ratna', 'Ternyata kalau alurnya jelas, saya tidak perlu mengingat semuanya sendiri.', 'proud');
      await say('gilbert', 'Ibu sudah bisa sendiri. Kami cukup jadi cadangan.', 'happy');
      G.note('b8', [`Bu Ratna menghadapi ${D.B8_SKENARIO.length} situasi: pelanggan baru, input berat, cek tarif, hitung total, cek status, dan verifikasi transfer.`, `Benar pada percobaan pertama: ${pertamaBenar} dari ${D.B8_SKENARIO.length}.`]);
    }
  ];

  /* =====================================================================
     BABAK 9 — Penutup: Laundry yang Lebih Teratur
     ===================================================================== */
  const b9 = [
    async function penutup() {
      G.scene({ bg: 'tidy', cast: { gilbert: ['farleft', 'happy'], sarah: ['left', 'happy'], ratna: ['center', 'proud'], syahril: ['right', 'happy'] } });
      await say('narrator', 'Beberapa minggu kemudian, Parfait Laundry terlihat lebih rapi. Cucian tersusun, dan setiap pesanan punya ID.');
      await say('ratna', 'Terima kasih, Nak. Pekerjaannya tetap banyak, tetapi sekarang saya tahu harus mulai dari mana.', 'happy');
      await say('gilbert', 'Kami juga belajar banyak, Bu. Masalah nyata membuat kode yang kami tulis jadi punya arti.', 'smile');
      await say('sarah', 'SI-PANDRI bukan sekadar program. Ia penerapan konsep pemrograman untuk kebutuhan sehari-hari.', 'happy');
      await say('syahril', 'Dan semuanya dibangun dari materi dasar: input, percabangan, perulangan, perhitungan, dan file.', 'smile');
      await G.activity({ kicker: 'Pesan penutup', title: 'SI-PANDRI', wide: true, objective: '' }, async api => {
        const q = el('blockquote', 'closing-quote', '“Teknologi yang baik bukan sekadar terlihat canggih, tetapi mampu membantu menyelesaikan masalah nyata dengan cara yang sederhana dan mudah dipahami.”');
        api.body.appendChild(q);
        G.sfx.fanfare();
        await G.ui.continueBtn(api, 'Lihat rangkuman');
        api.done();
      });
    },
    async function rangkuman() {
      G.scene({ bg: 'tidy', cast: { gilbert: ['farleft', 'smile'], sarah: ['left', 'smile'], ratna: ['center', 'proud'], syahril: ['right', 'smile'] } });
      await G.activity({
        kicker: 'Babak 9', title: 'Rangkuman perjalanan SI-PANDRI', wide: true,
        objective: 'Buka setiap bagian untuk melihat rangkuman proyek.'
      }, async api => {
        const U = D.HASIL_UJI;
        const konsepBaris = [
          ['Input/output (Readln, Write, Writeln)', 'input'], ['Percabangan case-of', 'pilihLayanan'], ['Nested-if', 'statusUrut'],
          ['while-do (validasi)', 'validasi'], ['for-to-do (membaca data)', 'ulangFor'], ['repeat-until (menu)', 'menuRepeat'],
          ['Perhitungan total', 'hitung'], ['Pencarian + Break', 'cariBreak'], ['Record & file lokal', 'simpanFile']
        ];
        const SEC = [
          ['Permasalahan', `<ul>${D.B3_MASALAH.map(m => `<li>${esc(m.text)}</li>`).join('')}</ul>`],
          ['Solusi', `<p><strong>SI-PANDRI — Sistem Pengelolaan Parfait Laundry</strong>: program terminal Free Pascal yang menyimpan data di file lokal (pandri_pelanggan.dat, pandri_pesanan.dat, pandri_pengaturan.dat).</p><ul>${D.B3_KEBUTUHAN.map(k => `<li>${esc(k.text)}</li>`).join('')}</ul>`],
          ['Cara kerja', `<ol><li>Pelanggan registrasi (Menu Pelanggan → 1)</li><li>Pelanggan membuat pesanan: layanan & metode bayar</li><li>Admin menimbang dan mengetik berat aktual (Menu Admin → 2)</li><li>Program menghitung total = berat × tarif</li><li>Admin memperbarui status cucian satu tahap demi satu tahap (Menu Admin → 5)</li><li>Admin menyiapkan pesan tagihan, memverifikasi pembayaran, menandai Lunas (Menu Admin → 7, 4)</li><li>Admin menyiapkan notifikasi siap diambil, lalu status Selesai/Diserahkan (Menu Admin → 8, 5)</li></ol>`],
          ['Konsep pemrograman', `<table class="mini"><thead><tr><th>Konsep</th><th>Lokasi di SI_PANDRI.pas</th></tr></thead><tbody>${konsepBaris.map(([k, id]) => {
            const kp = window.KODE_PASCAL[id];
            return `<tr><td>${esc(k)}</td><td>baris ${kp.segments.map(s => s.start + (s.lines.length > 1 ? '–' + (s.start + s.lines.length - 1) : '')).join(', ')} · ${esc(kp.judul)}</td></tr>`;
          }).join('')}</tbody></table>`],
          ['Hasil pengujian', `<p>${esc(U.catatan)}</p><p><code>${esc(U.perintah)}</code> · dijalankan ${esc(U.tanggal)} · <strong>${U.hasil.length} dari ${U.hasil.length} skenario lulus</strong></p><ul class="tests">${U.hasil.map(h => `<li><span class="pass">LULUS</span> ${esc(h)}</li>`).join('')}</ul><p class="muted">Pengujian game (simulasi di browser) terpisah dari pengujian aplikasi Pascal di atas. Jalankan ulang skrip sebelum presentasi untuk memastikan hasil terbaru.</p>`],
          ['Manfaat (sesuai fitur yang ada)', '<ul><li>Pesanan tercatat di file lokal dan dapat dicari dengan ID.</li><li>Total dihitung program dari berat aktual × tarif layanan.</li><li>Status cucian memakai tahap yang sama untuk semua pesanan dan tidak boleh melompat.</li><li>Status pembayaran terpisah dari status cucian; Lunas butuh verifikasi admin.</li><li>Teks WhatsApp untuk tagihan dan cucian siap disiapkan program.</li><li>Pelanggan hanya bisa melihat pesanan miliknya.</li></ul>'],
          ['Keterbatasan', `<ul>${D.KETERBATASAN.map(k => `<li>${esc(k)}</li>`).join('')}</ul>`]
        ];
        const acc = el('div', 'accordion');
        SEC.forEach(([judul, html], i) => {
          const d = el('details');
          if (i === 0) d.open = true;
          d.innerHTML = `<summary>${esc(judul)}</summary><div class="acc-body">${html}</div>`;
          d.addEventListener('toggle', () => { if (d.open) G.sfx.click(); });
          acc.appendChild(d);
        });
        api.body.appendChild(acc);
        await G.ui.continueBtn(api, 'Selesaikan misi');
        api.done();
      });
      G.award('b9-selesai', 30, 'Misi selesai');
      G.achieve('misi-beres');
      G.note('b9', ['Menutup cerita: Parfait Laundry lebih teratur, Bu Ratna lebih percaya diri.', 'Pesan: teknologi yang baik membantu menyelesaikan masalah nyata secara sederhana.']);
      await say('narrator', 'Dari masalah sehari-hari, menjadi solusi yang terstruktur. **Misi Laundry Beres!**');
    }
  ];

  const PARTS = [b1, b2, b3, b4, b5, b6, b7, b8, b9];
  window.ACTS = D.ACTS.map((meta, i) => Object.assign({}, meta, { parts: PARTS[i], partNames: meta.parts || PARTS[i].map((f, k) => 'Bagian ' + (k + 1)) }));
})();
