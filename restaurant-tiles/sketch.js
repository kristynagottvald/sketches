const C = {
  cream: '#F4F4F2', ink: '#14130F', gray: '#5D5A52', white: '#FFFFFF',
  bg: '#7D1550', panel: '#5A0E3A', char: '#1D1B18',
  accent: '#F7687B', green: '#1F5C4A',
  mint: '#D6F27F', mintDeep: '#B7DD4A', mintInk: '#26500F', mintMid: '#4B9A1E',
  lime: '#B8E236', salmon: '#FFC4CD', salmonDark: '#E8877A', salmonPale: '#FCDCD8', salmonTab: '#F2B0A6',
  paper: '#F6F1E4', sand: '#E9E4D8', grey: '#CDC9C0'
};
// The palette shown in the swatch tile and cycled by the guest check.
const PAL = [
  { n: 'Aubergine', bg: '#7D1550', ink: '#F4F4F2' },
  { n: 'Pistachio', bg: '#D6F27F', ink: '#26500F' },
  { n: 'Melon', bg: '#F7687B', ink: '#1D1B18' },
  { n: 'Basil', bg: '#1F5C4A', ink: '#D6F27F' },
  { n: 'Burrata', bg: '#F4F4F2', ink: '#7D1550' },
  { n: 'Espresso', bg: '#1D1B18', ink: '#F4F4F2' }
];
const FONT = '"Inter Tight", "Helvetica Neue", Helvetica, Arial, sans-serif';
const WORDS = ['Table stakes', 'Consuming the future', 'Food for thought'];
const TEAM = [['Phillip', 'P', '#E8877A', '#FFFFFF', 214], ['Lindsey', 'L', '#B7DD4A', '#26500F', 0], ['Cecilio', 'C', '#7D3F36', '#FFFFFF', 12]];
const CYC = 2.6;

// Tile backgrounds: a colour, a function, or 'clip' when the tile paints its own.
const CARD_BG = {
  cert: C.salmonPale, check: () => checkColors().bg, layer: C.green, spec: C.bg,
  palette: 'none', message: '#2F4F4A', expiry: C.accent, strip: () => { state.togP = lerp(state.togP, state.tog ? 1 : 0, 0.12); return tween('#FCDCD8', '#1D1B18', state.togP); }, banner: C.char, duties: C.mint
};

// Nested layout: row/col split their space by weight; leaves are tiles.
const leaf = k => ({ k, lift: 0 });
const row = (...c) => ({ d: 'h', c });
const col = (...c) => ({ d: 'v', c });

const WIDE = col(
  [70, row(
    [37, col([40, leaf('cert')], [60, leaf('spec')])],
    [47, col(
      [38, row([42, leaf('check')], [58, leaf('layer')])],
      [25, leaf('banner')],
      [37, row([40, leaf('message')], [60, leaf('expiry')])]
    )],
    [11, leaf('strip')]
  )],
  [30, row([70, leaf('palette')], [30, leaf('duties')])]
);
const TALL = col(
  [20, leaf('cert')], [16, row([1, leaf('check')], [1, leaf('layer')])],
  [18, leaf('spec')], [9, leaf('banner')], [9, leaf('strip')],
  [20, row([2, leaf('message')], [3, leaf('expiry')])], [13, row([3, leaf('palette')], [2, leaf('duties')])]
);

let ctx, leaves = [], hits = [], hot = false;
let GAP = 14, MAR = 22, readyAt = 0, fontReady = false;
const state = { split: 0, shown: 20, saved: false, specSkip: 0, duty: [4], dutyShown: [0], paid: false, course: false, filled: 0, skip: 0, tog: true, togP: 1, clock: false };

function setup() {
  createCanvas(windowWidth, windowHeight - NAV_H);
  ctx = drawingContext;
  loadFont7();
  layoutAll();
}

function loadFont7() {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap';
  const sheet = new Promise(res => { l.onload = res; l.onerror = res; });
  document.head.appendChild(l);
  sheet.then(() => Promise.all(['400', '500', '600', '700'].map(w => document.fonts.load(w + ' 20px "Inter Tight"'))))
    .catch(() => {}).then(() => { fontReady = true; readyAt = millis(); });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - NAV_H);
  layoutAll();
}

function layoutAll() {
  GAP = constrain(min(width, height) * 0.017, 8, 16);
  MAR = GAP * 1.6;
  leaves = [];
  const tall = width < height * 0.9 || width < 700;
  place(tall ? TALL : WIDE, MAR, MAR, width - MAR * 2, height - MAR * 2);
  // the duties card starts exactly where the earnings report starts
  const by = k => leaves.find(l => l.k === k), pal = by('palette'), dut = by('duties'), earn = by('expiry');
  if (pal && dut && earn && earn.x - GAP - pal.x > 120) {
    const right = dut.x + dut.w;
    pal.w = earn.x - GAP - pal.x;
    dut.x = earn.x; dut.w = right - earn.x;
  }
}

function place(n, x, y, w, h) {
  if (n.k) { Object.assign(n, { x, y, w, h }); leaves.push(n); return; }
  const total = n.c.reduce((s, c) => s + c[0], 0);
  const span = (n.d === 'h' ? w : h) - GAP * (n.c.length - 1);
  let o = 0;
  n.c.forEach(([r, child]) => {
    const size = span * r / total;
    if (n.d === 'h') place(child, x + o, y, size, h);
    else place(child, x, y + o, w, size);
    o += size + GAP;
  });
}

function draw() {
  background(C.cream);
  hits = [];
  hot = false;
  if (!fontReady) return;
  leaves.forEach(drawLeaf);
  cursor(hot ? HAND : ARROW);
}

function drawLeaf(n, i) {
  const t = constrain((millis() - readyAt - i * 80) / 700, 0, 1);
  const e = 1 - pow(1 - t, 3);
  n.lift = lerp(n.lift, inside(n.x, n.y, n.w, n.h) ? 1 : 0, 0.12);
  const r = constrain(min(n.w, n.h) * 0.13, 18, 34);
  let bg = CARD_BG[n.k];
  if (typeof bg === 'function') bg = bg();

  ctx.save();
  ctx.globalAlpha = e;
  ctx.translate(0, (1 - e) * 18 - n.lift * 3);
  if (bg !== 'clip' && bg !== 'none') fillRR(n.x, n.y, n.w, n.h, r, bg);
  if (bg !== 'none') { rr(n.x, n.y, n.w, n.h, r); ctx.clip(); }
  CARDS[n.k](n.x, n.y, n.w, n.h, n);
  ctx.restore();
}

// ---------- helpers ----------

const pad = (w, h) => constrain(min(w, h) * 0.09, 16, 36);
const seg = (t, a, b) => constrain((t - a) / (b - a), 0, 1);
const ease = t => { t = constrain(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2; };
const secs = () => (millis() - readyAt) / 1000;

function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function fillRR(x, y, w, h, r, col) { rr(x, y, w, h, r); ctx.fillStyle = col; ctx.fill(); }
function strokeRR(x, y, w, h, r, col, lw) {
  rr(x, y, w, h, r); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
}
function font(size, weight = 500, ls = 0) {
  ctx.font = weight + ' ' + size + 'px ' + FONT;
  try { ctx.letterSpacing = (size * ls) + 'px'; } catch (e) {}
}
function tw(msg, size, weight = 500, ls = 0) { font(size, weight, ls); return ctx.measureText(msg).width; }
function mtxt(msg, x, y, size, weight, col, align = 'left', ls = 0) {
  ctx.font = weight + ' ' + size + 'px ' + MONO;
  try { ctx.letterSpacing = (size * ls) + 'px'; } catch (e) {}
  ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.fillText(msg, x, y);
}
function txt(msg, x, y, size, weight, col, align = 'left', ls = 0) {
  font(size, weight, ls);
  ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.fillText(msg, x, y);
}
function wrap(msg, maxW, size, weight) {
  const lines = []; let cur = '';
  msg.split(' ').forEach(w => {
    const test = cur ? cur + ' ' + w : w;
    if (tw(test, size, weight) > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  });
  if (cur) lines.push(cur);
  return lines;
}
function para(msg, x, y, maxW, size, weight, col, lead = 1.4) {
  const lines = wrap(msg, maxW, size, weight);
  lines.forEach((l, i) => txt(l, x, y + size * 0.9 + i * size * lead, size, weight, col));
  return lines.length * size * lead;
}
function fitLines(lines, size, maxW, weight = 700, ls = -0.035) {
  while (size > 10 && max(lines.map(l => tw(l, size, weight, ls))) > maxW) size -= 1;
  return size;
}
function disc(cx, cy, r, col) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TWO_PI); ctx.fillStyle = col; ctx.fill(); }
function inside(x, y, w, h) { return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h; }
const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function tween(a, b, t) {
  const p = hexRGB(a), q = hexRGB(b);
  return 'rgb(' + p.map((v, i) => round(lerp(v, q[i], t))).join(',') + ')';
}

function btn(id, label, x, y, h, bg, fg, size, w, r, hov) {
  const bw = w || tw(label, size, 700) + h * 0.95;
  const over = inside(x, y, bw, h);
  fillRR(x, y, bw, h, r === undefined ? h / 2 : r, over && hov ? hov : bg);
  txt(label, x + bw / 2, y + h / 2 + size * 0.35, size, 700, fg, 'center');
  hits.push({ id, x, y, w: bw, h });
  if (over) hot = true;
  return bw;
}

function icon(kind, cx, cy, s, col) {
  ctx.strokeStyle = col; ctx.lineWidth = max(1.4, s * 0.11);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (kind === 'doc') {
    ctx.roundRect(cx - s * 0.32, cy - s * 0.44, s * 0.64, s * 0.88, s * 0.1);
    ctx.moveTo(cx + s * 0.04, cy - s * 0.44); ctx.lineTo(cx + s * 0.04, cy - s * 0.12); ctx.lineTo(cx + s * 0.32, cy - s * 0.12);
  } else if (kind === 'cal') {
    ctx.roundRect(cx - s * 0.44, cy - s * 0.34, s * 0.88, s * 0.78, s * 0.1);
    ctx.moveTo(cx - s * 0.44, cy - s * 0.08); ctx.lineTo(cx + s * 0.44, cy - s * 0.08);
  } else {
    ctx.arc(cx, cy, s * 0.42, 0, TWO_PI);
    ctx.moveTo(cx, cy - s * 0.22); ctx.lineTo(cx, cy); ctx.lineTo(cx + s * 0.16, cy + s * 0.1);
  }
  ctx.stroke();
}

// ---------- tiles ----------

const CARDS = { cert, check, layer, spec, palette, message, expiry, strip, banner, duties };

// Tip pool UI card.
const SPLITS = [20, 50, 80, 35];
const POOL = [['P', '#E8877A', '#FFFFFF', C.mint], ['H', '#4B9A1E', '#FFFFFF', C.salmon]];

function cert(x, y, w, h) {
  // guest check ruled lines
  const sp = constrain(h / 11, 13, 26);
  ctx.save(); ctx.strokeStyle = C.bg; ctx.globalAlpha *= 0.28; ctx.lineWidth = 1.2;
  for (let ly = y + sp * 1.2; ly < y + h; ly += sp) { ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + w, ly); ctx.stroke(); }
  [w * 0.17, w * 0.17 + 4, w * 0.8, w * 0.8 + 4].forEach(dx => { ctx.beginPath(); ctx.moveTo(x + dx, y); ctx.lineTo(x + dx, y + h); ctx.stroke(); });
  ctx.restore();

  // a small card, centred in the tile
  const fs = constrain(min(w * 0.026, h * 0.04), 9, 14), q = fs * 1.4;
  const rowH = fs * 3.9, av = rowH * 0.86, gap = fs * 0.6, rw = fs * 5.2;
  const cw = min(w * 0.72, fs * 33), ch = q + fs * 1.3 + fs * 2.1 + fs * 0.7 + rowH * 2 + q * 0.6;
  const cx = x + (w - cw) / 2, cy = y + (h - ch) / 2;
  fillRR(cx, cy, cw, ch, fs * 1.4, C.bg);
  const tb = cy + q + fs * 1.3, LABEL_COL = 'rgba(255,255,255,0.8)';
  txt('Who adds to the pool?', cx + q, tb, fs * 1.7, 700, C.white, 'left', -0.02);

  state.shown = lerp(state.shown, SPLITS[state.split], 0.15);
  const pct = [round(state.shown), 100 - round(state.shown)];
  const hy = tb + fs * 2.1;
  const ax = cx + q, mx = ax + av + gap, mw = cx + cw - q - rw - gap - mx, rx = mx + mw + gap;
  txt('Contributors', ax, hy, fs * 0.8, 600, LABEL_COL);
  txt('%', rx, hy, fs * 0.8, 600, LABEL_COL);

  for (let i = 0; i < 2; i++) {
    const [ini, bg, fg, dotCol] = POOL[i], ry = hy + fs * 0.7 + i * rowH, ay = ry + (rowH - av) / 2;
    fillRR(ax, ay, av, av, fs * 0.9, bg);
    txt(ini, ax + av / 2, ay + av / 2 + fs * 0.45, fs * 1.4, 700, fg, 'center');

    const over = inside(mx, ay, rx + rw - mx, av);
    fillRR(mx, ay, mw, av, fs * 0.9, over ? '#FFF4F5' : C.white);
    const cr = fs * 1.05, ccx = mx + fs * 0.7 + cr, ccy = ay + av / 2;
    disc(ccx, ccy, cr, dotCol);
    txt('S', ccx, ccy + fs * 0.38, fs * 1.1, 700, C.ink, 'center');
    txt('Server (Front of house)', ccx + cr + fs * 0.7, ccy + fs * 0.35, fs, 600, C.ink);
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    ctx.moveTo(mx + mw - fs * 1.5, ccy - fs * 0.15); ctx.lineTo(mx + mw - fs * 1.1, ccy + fs * 0.2); ctx.lineTo(mx + mw - fs * 0.7, ccy - fs * 0.15); ctx.stroke();

    fillRR(rx, ay, rw, av, fs * 0.9, over ? '#FFF4F5' : C.white);
    txt(pct[i] + '%', rx + rw / 2, ay + av / 2 + fs * 0.4, fs * 1.1, 700, C.ink, 'center');
    hits.push({ id: 'split', x: mx, y: ay, w: rx + rw - mx, h: av });
    if (over) hot = true;
  }
}

// Guest check line pattern; colours cycle through the palette.
function checkColors() {
  const t = secs() + state.skip * CYC, n = PAL.length;
  const idx = floor(t / CYC), f = ease(seg(t % CYC, CYC - 0.7, CYC));
  const a = PAL[((idx % n) + n) % n], b = PAL[(((idx + 1) % n) + n) % n];
  return { bg: tween(a.bg, b.bg, f), ink: tween(a.ink, b.ink, f), idx: ((idx % n) + n) % n };
}

function check(x, y, w, h) {
  const k = checkColors(), p = pad(w, h);
  const sp = constrain(h / 11, 13, 26);
  ctx.strokeStyle = k.ink; ctx.lineWidth = 1.2;
  ctx.save(); ctx.globalAlpha *= 0.55;
  for (let ly = y + sp * 2.6; ly < y + h - sp * 1.2; ly += sp) { ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + w, ly); ctx.stroke(); }
  [w * 0.17, w * 0.17 + 4, w * 0.8, w * 0.8 + 4].forEach(dx => { ctx.beginPath(); ctx.moveTo(x + dx, y + sp * 2.6); ctx.lineTo(x + dx, y + h - sp * 1.2); ctx.stroke(); });
  ctx.restore();
  mtxt('GUEST CHECK', x + p, y + sp * 1.3, sp * 0.62, 700, k.ink, 'left', 0.06);
  mtxt('N° 0417', x + w - p, y + sp * 1.3, sp * 0.8, 700, k.ink, 'right', 0);
  ctx.fillStyle = k.ink; ctx.save(); ctx.globalAlpha *= 0.55; ctx.fillRect(x + p, y + sp * 1.7, w - p * 2, 1.2); ctx.restore();
  mtxt(PAL[k.idx].n.toUpperCase(), x + p, y + h - sp * 0.45, sp * 0.62, 700, k.ink, 'left', 0.06);
  PAL.forEach((c, i) => {
    const cx = x + w - p - (PAL.length - 1 - i) * sp * 0.7 - sp * 0.2, cy = y + h - sp * 0.65;
    ctx.beginPath(); ctx.arc(cx, cy, sp * 0.16, 0, TWO_PI);
    if (i === k.idx) { ctx.fillStyle = k.ink; ctx.fill(); } else { ctx.strokeStyle = k.ink; ctx.lineWidth = 1.2; ctx.stroke(); }
  });
  hits.push({ id: 'check', x, y, w, h });
  if (inside(x, y, w, h)) hot = true;
}

// A kitchen ticket printing: each line types out, then the paper feeds up.
function layer(x, y, w, h) {
  const msg = 'SHIFT HAPPENS';
  const s = min(h * 0.26, w * 0.84 / (msg.length * 0.6)), lh = s * 1.2;
  const stars = '*'.repeat(floor(w * 0.84 / (s * 0.6))), T = 0.75;
  const tm = secs() / T, k = floor(tm), f = tm - k, feed = ease(seg(f, 0, 0.22));
  const yb = y + h - lh * 0.9;
  ctx.font = '400 ' + s + 'px ' + MONO;
  try { ctx.letterSpacing = '0px'; } catch (e) {}
  ctx.fillStyle = C.mint; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  for (let j = k; j >= 0; j--) {
    const ly = yb - (k - j) * lh + (1 - feed) * lh;
    if (ly < y - lh) break;
    const full = j % 6 === 5 ? stars : msg, n = j === k ? floor(full.length * seg(f, 0.2, 0.85)) : full.length;
    const left = x + w / 2 - ctx.measureText(full).width / 2;
    ctx.fillText(full.slice(0, n), left, ly);
  }
}

// Bold type specimen: layered Aa.
const SPEC_LETTERS = ['A', 'B', 'C', 'G', 'K', 'Z'];
function spec(x, y, w, h) {
  const p = pad(w, h), CY = 2.4, t = secs() + state.specSkip * CY;
  const i = ((floor(t / CY) % 6) + 6) % 6, f = (t % CY + CY) % CY / CY, L = SPEC_LETTERS[i];
  const al = min(seg(f, 0, 0.14), 1 - seg(f, 0.86, 1));
  // size so the widest pair, with its gap, fits the tile
  let s = min(h * 1.0, w * 0.8);
  const pair = ch => tw(ch, s, 700, -0.04) + tw(ch.toLowerCase(), s, 700, -0.04) + s * 0.04;
  while (s > 20 && max(SPEC_LETTERS.map(pair)) > w * 0.86) s -= 2;
  const aw = tw(L, s, 700, -0.04), gap = s * 0.04, tot = aw + tw(L.toLowerCase(), s, 700, -0.04) + gap;
  const sx = x + (w - tot) / 2, by = y + h * 0.88 + (1 - al) * s * 0.06;
  ctx.save(); ctx.globalAlpha *= al;
  txt(L, sx, by, s, 700, '#932060', 'left', -0.04);
  txt(L.toLowerCase(), sx + aw + gap, by, s, 700, '#932060', 'left', -0.04);
  ctx.restore();
  const cap = constrain(min(w * 0.03, h * 0.05), 9, 15);
  txt('TYPE SPECIMEN © 2026 7SHIFTS', x + w / 2, y + h * 0.5 - cap * 0.2, cap, 700, C.mint, 'center', 0.05);
  txt('INTER TIGHT BOLD · ' + L + L, x + w / 2, y + h * 0.5 + cap * 1.2, cap, 700, C.mint, 'center', 0.05);
  txt('Aa Bb Cc Gg Kk Zz', x + p, y + p + cap, cap, 700, C.mint, 'left', 0.02);
  hits.push({ id: 'spec', x, y, w, h });
}

// Palette: a sideways stack of colour cards. The card matching the guest check
// is pulled out of the stack and slid to the front.
const stack = { order: [0, 1, 2, 3, 4, 5], anim: null };
const ROLE = ['Brand', 'Highlight', 'Accent', 'Support', 'Ground', 'Ink'];

function palette(x, y, w, h) {
  const n = PAL.length, pw = constrain(w * 0.075, 30, 64);
  const cx = x, cy = y, cw = w, ch = h, W = cw - (n - 1) * pw;
  const r = constrain(min(w, h) * 0.13, 18, 34), o = stack.order, target = checkColors().idx;
  if (!stack.anim && o[n - 1] !== target) stack.anim = { j: o.indexOf(target), t0: millis() };
  let a = stack.anim, e = 0;
  if (a) {
    const q = (millis() - a.t0) / 900;
    if (q >= 1) { o.push(o.splice(a.j, 1)[0]); stack.anim = a = null; } else e = ease(q);
  }
  const j = a ? a.j : -1, slotX = s => cx + s * pw;
  o.forEach((id, k) => { if (k !== j) paletteCard(slotX(a && k > j ? k - e : k), cy, W, ch, r, id, pw); });
  if (a) {
    const mx = lerp(slotX(j), slotX(n - 1), e), lift = -ch * 0.07 * sin(PI * e);
    ctx.save();
    ctx.beginPath(); ctx.rect(mx - 12, cy + lift - 24, lerp(pw, W, seg(e, 0, 0.3)) + 12, ch + 48); ctx.clip();
    paletteCard(mx, cy + lift, W, ch, r, o[j], pw);
    ctx.restore();
  }
  hits.push({ id: 'check', x, y, w, h });
  if (inside(x, y, w, h)) hot = true;
}

// Restaurant emoji on each colour card.
const EMOJI = ['🍷', '🍋‍🟩', '🍉', '🥬', '🍇', '☕'];
function glyph(id, ox, oy, u) {
  ctx.save();
  ctx.font = (u * 0.56) + 'px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  try { ctx.letterSpacing = '0px'; } catch (e) {}
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(EMOJI[id], ox + u / 2, oy + u * 0.54);
  ctx.restore();
}

function paletteCard(x, y, W, h, r, id, pw) {
  const c = PAL[id], t = secs(), fs = constrain(h * 0.1, 9, 14), p = h * 0.1;
  ctx.save();
  fillRR(x, y, W, h, r, c.bg);
  rr(x, y, W, h, r); ctx.clip();
  strokeRR(x + 0.5, y + 0.5, W - 1, h - 1, r, tween(c.bg, c.ink, 0.25), 1);
  // spine: index and hex, reading upward
  txt('0' + (id + 1), x + pw / 2, y + p + fs, fs, 700, c.ink, 'center', 0.04);
  ctx.save(); ctx.translate(x + pw / 2 + fs * 0.35, y + h - p); ctx.rotate(-HALF_PI);
  txt(c.bg.toUpperCase(), 0, 0, fs, 700, c.ink, 'left', 0.1); ctx.restore();
  // body: glyph square, name, role
  const box = min(h - p * 2, (W - pw) * 0.42), sx = x + pw, sy = y + (h - box) / 2;
  fillRR(sx, sy, box, box, r * 0.6, tween(c.bg, c.ink, 0.13));
  glyph(id, sx, sy + sin(t * 1.6 + id) * box * 0.015, box);
  const tx = sx + box + p;
  txt(PAL[id].n, tx, sy + box * 0.52, fs * 2.25, 700, c.ink, 'left', -0.03);
  txt(ROLE[id].toUpperCase(), tx, sy + box * 0.52 + fs * 1.6, fs * 0.8, 700, tween(c.bg, c.ink, 0.6), 'left', 0.1);
  ctx.restore();
}

// Text tile: lime heading over a deep green ground.
function message(x, y, w, h) {
  const p = pad(w, h) * 1.9, mw = w - p * 2;
  let s = constrain(min(w * 0.075, h * 0.2), 14, 32);
  let lines = wrap('Running multiple restaurants in different cities?', mw, s, 700);
  const sub = constrain(s * 0.58, 11, 18);
  const body = wrap('Set up local labor rules per location, so each restaurant follows the right requirements.', mw, sub, 400);
  const total = lines.length * s * 1.15 + s * 0.35 + body.length * sub * 1.4;
  let ty = y + (h - total) / 2;
  lines.forEach((l, i) => txt(l, x + p, ty + s * 0.9 + i * s * 1.15, s, 700, '#CFFA9A', 'left', -0.03));
  ty += lines.length * s * 1.15 + s * 0.35;
  body.forEach((l, i) => txt(l, x + p, ty + sub * 0.9 + i * sub * 1.4, sub, 500, C.white, 'left', -0.01));
}

// UI feature: earnings report with an animated dot bar graph.
function expiry(x, y, w, h) {
  const p = pad(w, h) * 1.5, fs = constrain(min(w * 0.04, h * 0.056), 9, 13), t = secs();
  const lw = (w - p * 3) * 0.6, rw = w - p * 3 - lw, rx = x + p * 2 + lw;
  const lt = t % 6, k = lt < 5 ? ease(seg(lt, 0.2, 2.6)) : 1 - ease(seg(lt, 5, 6)), money = v => '$' + v.toFixed(2);

  // column 1: title and estimate block
  const ts = fs * 1.9, tl = wrap('Your earnings report', lw, ts, 700);
  tl.forEach((l, i) => txt(l, x + p, y + p + ts * 0.85 + i * ts * 1.12, ts, 700, C.white, 'left', -0.03));
  const by = y + p + tl.length * ts * 1.12 + fs * 1.7, LAB = 'rgba(255,255,255,0.85)', t0 = by + fs * 0.75;
  let ms = fs * 3.3;
  while (ms > fs * 2 && (tw(money(523.42), ms, 700, -0.04) > lw || t0 + ms * 0.95 + fs * 4.5 > y + h - p)) ms -= 1;
  let ls = fs * 1.02;
  while (ls > 8 && 'ESTIMATED WAGE EARNINGS'.length * 0.6 * ls > lw) ls -= 0.5;
  ctx.font = '400 ' + ls + 'px ' + MONO; try { ctx.letterSpacing = '0px'; } catch (e) {}
  ctx.fillStyle = LAB; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('ESTIMATED WAGE EARNINGS', x + p, t0);
  txt(money(523.42 * k), x + p, t0 + ms * 0.95, ms, 700, C.white, 'left', -0.04);
  ctx.font = '400 ' + ls + 'px ' + MONO; try { ctx.letterSpacing = '0px'; } catch (e) {}
  ctx.fillStyle = LAB; ctx.textAlign = 'left';
  ctx.fillText('TIP EARNINGS', x + p, t0 + ms * 0.95 + fs * 2.9);
  txt(money(124.42 * k), x + p, t0 + ms * 0.95 + fs * 4.5, fs * 1.3, 400, C.white);

  // column 2: dot bar graph over the button
  const bth = fs * 2.9, bty = y + h - p - bth;
  btn('paid', state.paid ? 'Paid early ✓' : 'Get paid early', rx, bty, bth, C.bg, C.white, fs * 0.95, rw, undefined, '#93226B');
  const gy0 = y + p, gh = bty - fs - gy0, pitch = fs * 1.05, nb = floor(rw / pitch), rows = floor(gh / pitch), dr = pitch * 0.3;
  const gx0 = rx + (rw - nb * pitch) / 2;
  for (let i = 0; i < nb; i++) {
    const hf = rows * (0.2 + 0.75 * (0.5 + 0.5 * sin(t * 1.4 + i * 0.75) * cos(t * 0.6 + i * 0.4))), cx = gx0 + pitch * (i + 0.5);
    for (let r = 0; r < rows; r++) {
      const fill = constrain(hf - r, 0, 1), cy = gy0 + gh - pitch * (r + 0.5);
      disc(cx, cy, dr * (0.8 + 0.2 * fill), 'rgba(125,21,80,' + (0.2 + 0.8 * fill) + ')');
    }
  }
}

// UI feature strip: small controls along the long axis.
function strip(x, y, w, h) {
  const vert = h >= w, p = pad(w, h), n = 6, along = ((vert ? h : w) - p * 2) / n;
  const u = min(vert ? w * 0.74 : h * 0.74, along * 0.82), t = secs(), k = state.togP, bgc = tween('#FCDCD8', '#1D1B18', k);
  const item = (i, cx, cy) => {
    if (i === 0) {
      const tw2 = u, th = u * 0.5;
      fillRR(cx - tw2 / 2, cy - th / 2, tw2, th, th / 2, tween('#7D1550', '#6B6A66', k));
      disc(cx - tw2 / 2 + th / 2 + k * (tw2 - th), cy, th * 0.38, tween('#FFFFFF', '#B8E236', k));
      hits.push({ id: 'tog', x: cx - tw2 / 2, y: cy - th / 2, w: tw2, h: th });
      if (inside(cx - tw2 / 2, cy - th / 2, tw2, th)) hot = true;
    } else if (i === 1) {
      [tween('#F4F4F2', '#FFC4CD', k), tween('#1F5C4A', '#D6F27F', k), '#F7687B'].forEach((c, j) => { disc(cx + (j - 1) * u * 0.26, cy, u * 0.21, c); ctx.beginPath(); ctx.arc(cx + (j - 1) * u * 0.26, cy, u * 0.21, 0, TWO_PI); ctx.strokeStyle = bgc; ctx.lineWidth = 2; ctx.stroke(); });
    } else if (i === 2) {
      txt('★★★★★', cx, cy + u * 0.1, u * 0.2, 400, C.accent, 'center', 0.02);
    } else if (i === 3) {
      const rad = u * 0.34, pr = 0.5 + 0.5 * sin(t * 0.9);
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TWO_PI); ctx.strokeStyle = tween('#F3B6BF', '#3A3633', k); ctx.lineWidth = u * 0.12; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, rad, -HALF_PI, -HALF_PI + pr * TWO_PI); ctx.strokeStyle = tween('#1F5C4A', '#D6F27F', k); ctx.lineCap = 'round'; ctx.stroke();
      txt(round(pr * 100) + '%', cx, cy + u * 0.07, u * 0.2, 700, tween('#14130F', '#F4F4F2', k), 'center');
    } else if (i === 4) {
      [['#7D1550', '#FFFFFF'], ['#FFFFFF', '#B23F82'], ['#E8877A', '#E8877A'], ['#7D1550', '#FFFFFF']].forEach(([lc, dc], j) => { const c = tween(lc, dc, k);
        const bh = u * (0.25 + 0.3 * (0.5 + 0.5 * sin(t * 1.4 + j * 1.3))), bw = u * 0.16;
        fillRR(cx - u * 0.42 + j * u * 0.23, cy + u * 0.3 - bh, bw, bh, 3, c);
      });
    } else {
      const lab = state.clock ? 'In ✓' : 'Clock in', bw = min(u * 1.1, w * 0.84), bh = u * 0.46;
      fillRR(cx - bw / 2, cy - bh / 2, bw, bh, bh / 2, state.clock ? C.green : tween('#1D1B18', '#F4F4F2', k));
      txt(lab, cx, cy + u * 0.07, u * 0.2, 700, state.clock ? C.mint : tween('#FFFFFF', '#1D1B18', k), 'center');
      hits.push({ id: 'clock', x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh });
      if (inside(cx - bw / 2, cy - bh / 2, bw, bh)) hot = true;
    }
  };
  for (let i = 0; i < n; i++) {
    const c = p + along * (i + 0.5);
    item(i, vert ? x + w / 2 : x + c, vert ? y + c : y + h / 2);
  }
}

// Dish washer duties: a centred card over a monospaced kitchen-ticket pattern.
const MONO = '"Courier New", Courier, Menlo, Consolas, monospace';
function duties(x, y, w, h) {
  const ts = constrain(min(w, h) * 0.05, 9, 13), lh = ts * 1.55, cols = floor((w - ts * 2) / (ts * 0.6));
  const d0 = new Date(), when = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d0.getMonth()] + ' ' + d0.getDate() + ', ' + d0.getFullYear() + ', 2:35 PM';
  const stars = '*'.repeat(max(8, cols)), dash = '- '.repeat(floor(max(8, cols) * 0.45)).trim();
  const ticket = [stars, '#DUTIES', stars, '', 'Sent: ' + when, 'Station: Dish Pit', 'Lead: Daniel Y.', 'Order: 461', '',
    'Course 1', '  - Scrape & rinse (S1)', '', '~' + dash, '', 'Course 2', '  - Load racks (S1)', '  - Run cycle (S1)', '  - Sanitize (S1)', '', ''];
  const cycle = ticket.length * lh, off = (secs() * lh * 0.6) % cycle;
  ctx.save();
  ctx.font = '400 ' + ts + 'px ' + MONO; ctx.textBaseline = 'alphabetic';
  try { ctx.letterSpacing = '0px'; } catch (e) {}
  for (let base = y - off; base < y + h + lh; base += cycle) {
    ticket.forEach((ln, i) => {
      const ly = base + (i + 1) * lh;
      if (ly < y - lh || ly > y + h + lh) return;
      ln = ln.toUpperCase();
      const m = ln.indexOf(': ');
      if (ln[0] === '#') { ctx.textAlign = 'center'; ctx.fillStyle = C.green; ctx.fillText(ln.slice(1), x + w / 2, ly); return; }
      ctx.textAlign = 'left';
      if (ln[0] === '~') { ctx.fillStyle = 'rgba(31,92,74,0.6)'; ctx.fillText(ln.slice(1), x + w / 2 - ctx.measureText(ln.slice(1)).width / 2, ly); return; }
      if (m > 0 && ln.indexOf('(') < 0) {
        ctx.fillStyle = 'rgba(31,92,74,0.55)'; ctx.fillText(ln.slice(0, m + 2), x + ts, ly);
        ctx.fillStyle = C.green; ctx.fillText(ln.slice(m + 2), x + ts + ctx.measureText(ln.slice(0, m + 2)).width, ly);
      } else { ctx.fillStyle = C.green; ctx.fillText(ln, x + ts, ly); }
    });
  }
  ctx.restore();

  // the card
  const cw = min(w * 0.82, 320), ch0 = cw * 0.7, pc = pad(cw, ch0), dh0 = constrain(min(cw * 0.065, ch0 * 0.075), 10, 18) * 2.7;
  const ch = min(h * 0.9, pc * 2 + dh0 + pc * 0.6 + cw * 0.28), cx = x + (w - cw) / 2, cy = y + (h - ch) / 2;
  fillRR(cx, cy, cw, ch, constrain(min(cw, ch) * 0.1, 14, 26), C.white);
  dutiesCard(cx, cy, cw, ch);
}

// UI feature: task progress rings.
const DUTIES = [['Dish Washer Duties', 5]];
function dutiesCard(x, y, w, h) {
  const p = pad(w, h), n = DUTIES.length;
  let fs = constrain(min(w * 0.065, h * 0.075), 10, 18);
  // today's date pill with a filter button
  const dt = new Date(), dstr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()] + ', ' +
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
  const dh = fs * 2.7;
  let df = fs;
  while (df > 8 && fs * 2.4 + tw(dstr, df, 600) + dh + fs * 0.8 > w - p * 2) df -= 0.5;
  const dw = min(w - p * 2 - dh - fs * 0.6, tw(dstr, df, 600) + fs * 3);
  fillRR(x + p, y + p, dw, dh, dh * 0.3, C.white);
  strokeRR(x + p, y + p, dw, dh, dh * 0.3, '#E4E0D8', 1.5);
  icon('cal', x + p + fs * 1.3, y + p + dh / 2, fs * 1.2, C.bg);
  txt(dstr, x + p + fs * 2.4, y + p + dh / 2 + df * 0.35, df, 600, C.ink);
  const bx = x + p + dw + fs * 0.6;
  fillRR(bx, y + p, dh, dh, dh * 0.3, C.mint);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  [0.5, 0.4, 0.28].forEach((f, i) => { ctx.beginPath(); ctx.moveTo(bx + dh / 2 - dh * f / 2, y + p + dh * (0.36 + i * 0.14)); ctx.lineTo(bx + dh / 2 + dh * f / 2, y + p + dh * (0.36 + i * 0.14)); ctx.stroke(); });

  const top = y + p + dh + p * 0.6, rowH = (y + h - p - top) / n;
  const r = min(rowH * 0.5, w * 0.14);
  while (fs > 9 && p + r * 2 + fs * 0.9 + tw(DUTIES[0][0], fs, 600) > w - p) fs -= 0.5;
  DUTIES.forEach(([name, tot], i) => {
    state.dutyShown[i] = lerp(state.dutyShown[i], state.duty[i], 0.1);
    const cy = top + rowH * (i + 0.5), cx = x + p + r, over = inside(x + p, cy - rowH / 2, w - p * 2, rowH);
    if (i > 0) { ctx.fillStyle = '#EEEAE2'; ctx.fillRect(x + p, cy - rowH / 2, w - p * 2, 1); }
    ctx.lineCap = 'round'; ctx.lineWidth = r * 0.3;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, TWO_PI); ctx.strokeStyle = '#E6E2DA'; ctx.stroke();
    const f = state.dutyShown[i] / tot;
    if (f > 0.004) { ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, -HALF_PI, -HALF_PI + f * TWO_PI); ctx.strokeStyle = C.bg; ctx.stroke(); }
    txt(round(state.dutyShown[i]) + '/' + tot, cx, cy + r * 0.2, r * 0.5, 700, C.ink, 'center');
    txt(name, cx + r + fs * 0.9, cy + fs * 0.35, fs, over ? 700 : 600, C.ink);
    hits.push({ id: 'duty' + i, x: x + p, y: cy - rowH / 2, w: w - p * 2, h: rowH });
    if (over) hot = true;
  });
}

// Huge marquee: white type, lime bullets.
function banner(x, y, w, h) {
  const s = h * 0.62, gap = s * 0.5, base = y + h * 0.5 + s * 0.36;
  const ws = WORDS.map(t => tw(t, s, 700, -0.045)), period = ws.reduce((a, b) => a + b, 0) + gap * 2 * WORDS.length;
  let px = x - ((secs() * 90) % period);
  while (px < x + w) {
    WORDS.forEach((t, i) => {
      font(s, 700, -0.045);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = C.white; ctx.fillText(t, px, base);
      px += ws[i] + gap;
      disc(px, base - s * 0.3, s * 0.07, C.lime);
      px += gap;
    });
  }
}

function mousePressed() {
  for (let i = hits.length - 1; i >= 0; i--) {
    const b = hits[i];
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      if (b.id === 'save') state.saved = !state.saved;
      if (b.id === 'course') state.course = !state.course;
      if (b.id === 'split') state.split = (state.split + 1) % SPLITS.length;
      if (b.id === 'check') state.skip++;
      if (b.id === 'tog') state.tog = !state.tog;
      if (b.id === 'clock') state.clock = !state.clock;
      if (b.id === 'paid') state.paid = !state.paid;
      if (b.id === 'spec') state.specSkip++;
      if (b.id.indexOf('duty') === 0) { const i = +b.id.slice(4); state.duty[i] = (state.duty[i] + 1) % (DUTIES[i][1] + 1); }
      return false;
    }
  }
}
