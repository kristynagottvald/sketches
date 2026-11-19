const hypot = Math.hypot;
const C = {
  cream: '#fbf9f4', ink: '#0f0f42', white: '#FFFFFF',
  navy: '#0f0f42', blue: '#1f5fb4', sky: '#5aa0e6', hl: '#2f6fcf',
  pale: '#bbdcff', matte: '#cfe0f7', line: '#e4e7f0',
  lg: '#d6f0e2', dg: '#0e4a2d', gr: '#46b17a', be: '#d3c7b3', beInk: '#5b4a35', beige: '#efebdd'
};
const PAL = [
  { n: 'Midnight', bg: '#0f0f42', ink: '#fbf9f4' },
  { n: 'Reprise Blue', bg: '#1f5fb4', ink: '#fbf9f4' },
  { n: 'Sky', bg: '#5aa0e6', ink: '#0f0f42' },
  { n: 'Cream', bg: '#fbf9f4', ink: '#1f5fb4' },
  { n: 'Pale', bg: '#bbdcff', ink: '#0f0f42' },
  { n: 'Charcoal', bg: '#47443c', ink: '#fbf9f4' },
  { n: 'Light Green', bg: '#d6f0e2', ink: '#0e4a2d' },
  { n: 'Dark Green', bg: '#0e4a2d', ink: '#d6f0e2' },
  { n: 'Beige', bg: '#d3c7b3', ink: '#5b4a35' },
  { n: 'Green', bg: '#46b17a', ink: '#ffffff' }
];
const ROLE = ['Ground', 'Brand', 'Logo', 'Paper', 'Surface', 'Neutral', 'Growth', 'Depth', 'Earth', 'Accent'];
const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const SERIF = '"Roboto Serif", Georgia, "Times New Roman", serif';
const MONO = '"Courier New", Courier, Menlo, Consolas, monospace';
const WORDS = ['Make it yours', 'Edit any screen', 'Demos that feel real'];
const CYC = 2.6;

const LOGO_SVG = [
  "M23.5422 0L25.0998 14.1444C25.1837 14.9055 26.0747 15.2744 26.6721 14.7954L37.7748 5.89529L39.1892 7.30951L30.2889 18.4124C29.81 19.0098 30.1789 19.9007 30.9401 19.9845L30.9395 19.9849L45.0838 21.5421V23.5422L25.6785 25.6788L23.5419 45.084H21.5418L19.9845 30.9398C19.9007 30.1786 19.0098 29.8097 18.4124 30.2887L7.30951 39.1889L5.89529 37.7745L14.7954 26.6718C15.2744 26.0744 14.9055 25.1834 14.1444 25.0995L0 23.5422V21.5421L19.4055 19.4053L21.5421 0H23.5422ZM24.9703 19.5719C23.3515 19.4237 21.7324 19.4237 20.1136 19.5719C19.8427 19.5975 19.5975 19.8427 19.5719 20.1136C19.4237 21.7324 19.4237 23.3515 19.5719 24.9703C19.5974 25.2412 19.8427 25.4866 20.1136 25.5122C21.7324 25.6601 23.3515 25.6601 24.9703 25.5122C25.2412 25.4866 25.4866 25.2412 25.5122 24.9703C25.6604 23.3515 25.6604 21.7324 25.5122 20.1136C25.4866 19.8427 25.2412 19.5974 24.9703 19.5719Z",
  "M160.046 26.3455C160.046 19.6515 163.882 16.1916 169.767 16.1916C175.615 16.1916 179 19.7267 179 25.5746V27.5677H164.314C164.39 30.8207 166.402 33.096 169.749 33.096C172.983 33.096 174.393 31.366 174.694 29.8994H178.701L178.605 30.4635C178.079 33.0019 175.747 36.5182 169.805 36.5182C163.901 36.5182 160.046 33.0395 160.046 26.3455ZM164.371 24.2583H174.807C174.769 21.607 173.077 19.5763 169.711 19.5763C166.439 19.5763 164.615 21.6635 164.371 24.2583Z",
  "M141.34 21.9459C141.34 18.4297 144.349 16.2109 149.633 16.2109C154.935 16.2109 158.038 18.4297 158.357 22.0587V22.6228H154.296C154.164 20.3476 152.303 19.5579 149.651 19.5579C147.019 19.5579 145.571 20.3476 145.571 21.8519C145.571 23.3562 146.775 23.8451 148.448 24.1083L152.096 24.6724C155.969 25.2741 158.621 26.8724 158.621 30.4075C158.621 33.9425 155.819 36.4998 150.178 36.4998C144.537 36.4998 141.265 33.9425 140.983 30.5015V29.9374H145.12C145.308 32.2126 147.395 33.1528 150.178 33.1528C152.961 33.1528 154.371 32.175 154.371 30.6519C154.371 29.1476 153.149 28.5271 151.099 28.2075L147.451 27.6434C143.804 27.0793 141.34 25.4622 141.34 21.9459Z",
  "M134.695 16.5697H139.152L139.15 36.0669H134.694L134.695 16.5697Z",
  "M120.854 16.6429H125.122V18.695C125.122 18.7974 125.205 18.8805 125.307 18.8805C125.378 18.8805 125.442 18.8401 125.475 18.7776C126.182 17.4265 127.462 16.5676 130.048 16.5676H132.756V18.2531H130.067C126.758 18.2531 125.31 22.0019 125.31 25.6685V36.0668H120.854V16.6429Z",
  "M99.172 43.5879V16.6425H103.497V18.699C103.497 18.8094 103.586 18.8989 103.697 18.8989C103.76 18.8989 103.82 18.8684 103.858 18.8179C105.289 16.9417 107.463 16.2288 110.022 16.2288C114.967 16.2288 118.916 19.5383 118.916 26.3451C118.916 33.152 114.967 36.4802 110.022 36.4802C107.536 36.4802 105.397 35.7846 103.968 33.996C103.931 33.9503 103.876 33.9229 103.818 33.9229C103.713 33.9229 103.628 34.0077 103.628 34.1122V43.5879H99.172ZM103.44 26.3451C103.44 30.6135 105.64 32.9639 108.931 32.9639C112.222 32.9639 114.422 30.6135 114.422 26.3451C114.422 22.0955 112.222 19.7451 108.931 19.7451C105.64 19.7451 103.44 22.0955 103.44 26.3451Z",
  "M78.0286 26.3455C78.0286 19.6515 81.8645 16.1916 87.75 16.1916C93.5979 16.1916 96.9825 19.7267 96.9825 25.5746V27.5677H82.297C82.3722 30.8207 84.3842 33.096 87.7312 33.096C90.9654 33.096 92.3757 31.366 92.6765 29.8994H96.5876V30.4635C96.0611 33.0019 93.7295 36.5182 87.7876 36.5182C81.8833 36.5182 78.0286 33.0395 78.0286 26.3455ZM82.3534 24.2583H92.7893C92.7517 21.607 91.0594 19.5763 87.6936 19.5763C84.4218 19.5763 82.5979 21.6635 82.3534 24.2583Z",
  "M69.4671 8.9896C74.262 8.9896 78.0791 11.7349 78.0791 16.8306C78.0791 21.8888 74.45 24.6153 69.9936 24.6153H68.9287L78.0791 35.5025V36.0666H73.0388L63.8188 25.0415C63.5531 24.7237 63.16 24.5401 62.7457 24.5401H61.0808V36.0666H56.5115V8.9896H69.4671ZM61.0808 21.0426H68.7714C71.6107 21.0426 73.5663 19.6512 73.5663 16.9247C73.5663 14.217 71.6107 12.8067 68.7714 12.8067H61.0808V21.0426Z",
  "M134.694 10.3495C134.694 10.1287 134.873 9.94977 135.094 9.94977H138.752C138.973 9.94977 139.152 10.1287 139.152 10.3495V14.0059C139.152 14.2266 138.973 14.4056 138.752 14.4056H135.094C134.873 14.4056 134.694 14.2266 134.694 14.0059V10.3495Z"
];
let LOGO_PATHS = [];

const CARD_BG = {
  cert: C.pale,
  check: C.navy,
  layer: C.dg,
  spec: C.navy,
  palette: 'none',
  message: C.blue,
  expiry: C.cream,
  strip: () => { state.togP = lerp(state.togP, state.tog ? 1 : 0, 0.12); return tween(PAL[3].bg, C.navy, state.togP); },
  banner: '#47443c',
  duties: C.lg
};

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
let GAP = 14, MAR = 22, readyAt = 0;
const state = { role: [0, 1], specSkip: 0, paid: false, skip: 0, tog: true, togP: 1, clock: false };

function setup() {
  createCanvas(windowWidth, windowHeight - NAV_H);
  ctx = drawingContext;
  LOGO_PATHS = LOGO_SVG.map(d => new Path2D(d));
  readyAt = millis();
  loadFonts();
  layoutAll();
}

function loadFonts() {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https:\/\/fonts.googleapis.com/css2?family=Roboto+Serif:wght@400&display=swap';
  document.head.appendChild(l);
  l.onload = () => document.fonts.load('400 20px "Roboto Serif"');
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
  background(C.matte);
  hits = [];
  hot = false;
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
  if (bg !== 'none') fillRR(n.x, n.y, n.w, n.h, r, bg);
  if (bg !== 'none') { rr(n.x, n.y, n.w, n.h, r); ctx.clip(); }
  CARDS[n.k](n.x, n.y, n.w, n.h, n);
  ctx.restore();
}

const pad = (w, h) => constrain(min(w, h) * 0.09, 16, 36);
const seg = (t, a, b) => constrain((t - a) / (b - a), 0, 1);
const ease = t => { t = constrain(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2; };
const secs = () => (millis() - readyAt) / 1000;

function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, Array.isArray(r) ? r.map(v => max(0, v)) : max(0, r)); }
function fillRR(x, y, w, h, r, c) { rr(x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); }
function strokeRR(x, y, w, h, r, c, lw) {
  const i = lw / 2;
  rr(x + i, y + i, w - lw, h - lw, Array.isArray(r) ? r.map(v => max(0, v - i)) : max(0, r - i)); ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.stroke();
}
function font(size, weight = 500, ls = 0, fam = FONT) {
  ctx.font = weight + ' ' + size + 'px ' + fam;
  try { ctx.letterSpacing = (size * ls) + 'px'; } catch (e) {}
}
function tw(msg, size, weight = 500, ls = 0, fam = FONT) { font(size, weight, ls, fam); return ctx.measureText(msg).width; }
function mtxt(msg, x, y, size, weight, c, align = 'left', ls = 0) {
  ctx.font = weight + ' ' + size + 'px ' + MONO;
  try { ctx.letterSpacing = (size * ls) + 'px'; } catch (e) {}
  ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.fillText(msg, x, y);
}
function txt(msg, x, y, size, weight, c, align = 'left', ls = 0, fam = FONT) {
  font(size, weight, ls, fam);
  ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.fillText(msg, x, y);
}
function wrap(msg, maxW, size, weight, fam = FONT) {
  const lines = []; let cur = '';
  msg.split(' ').forEach(w => {
    const test = cur ? cur + ' ' + w : w;
    if (tw(test, size, weight, 0, fam) > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  });
  if (cur) lines.push(cur);
  return lines;
}
function disc(cx, cy, r, c) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TWO_PI); ctx.fillStyle = c; ctx.fill(); }
function inside(x, y, w, h) { return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h; }
const hexRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function tween(a, b, t) {
  const p = hexRGB(a), q = hexRGB(b);
  return 'rgb(' + p.map((v, i) => round(lerp(v, q[i], t))).join(',') + ')';
}

function drawLogo(x, y, h, c, full) {
  const s = h / 45.1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = c;
  const n = full ? LOGO_PATHS.length : 1;
  for (let i = 0; i < n; i++) ctx.fill(LOGO_PATHS[i], i === 0 ? 'evenodd' : 'nonzero');
  ctx.restore();
}

function burst(cx, cy, len, n, rgb, alpha, lw, spin) {
  const t = secs();
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t / 60 * TWO_PI * spin);
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = i * TWO_PI / n + 0.05;
    const k = 0.575 + 0.325 * sin(t * TWO_PI / 5.5 - i * 0.37 * TWO_PI / 5.5);
    ctx.strokeStyle = 'rgba(' + rgb + ',' + (alpha * k) + ')';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cos(a) * len, sin(a) * len); ctx.stroke();
  }
  ctx.restore();
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

function icon(kind, cx, cy, s, c) {
  ctx.strokeStyle = c; ctx.lineWidth = max(1.4, s * 0.11);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (kind === 'cal') {
    ctx.roundRect(cx - s * 0.44, cy - s * 0.34, s * 0.88, s * 0.78, s * 0.1);
    ctx.moveTo(cx - s * 0.44, cy - s * 0.08); ctx.lineTo(cx + s * 0.44, cy - s * 0.08);
  } else {
    ctx.arc(cx, cy, s * 0.42, 0, TWO_PI);
    ctx.moveTo(cx, cy - s * 0.22); ctx.lineTo(cx, cy); ctx.lineTo(cx + s * 0.16, cy + s * 0.1);
  }
  ctx.stroke();
}

const CARDS = { cert, check, layer, spec, palette, message, expiry, strip, banner, duties };

const ROLES = ['Editor', 'Viewer', 'Admin'];
const POOL = [['S', '#5aa0e6', '#0f0f42', 'Sales engineer'], ['M', '#2f6fcf', '#fbf9f4', 'Marketer']];

function cert(x, y, w, h) {
  burst(x + w / 2, y + h / 2, hypot(w, h), 72, '31,95,180', 0.55, 1.2, 1);

  const fs = constrain(min(w * 0.026, h * 0.04), 9, 14), q = fs * 1.4;
  const rowH = fs * 3.9, av = rowH * 0.86, gap = fs * 0.6;
  const cw = min(w * 0.72, fs * 33), ch = q + fs * 1.3 + fs * 2.1 + fs * 0.7 + rowH * 2 + q * 0.6;
  const cx = x + (w - cw) / 2, cy = y + (h - ch) / 2;
  fillRR(cx, cy, cw, ch, fs * 1.4, C.navy);
  const tb = cy + q + fs * 1.3, LABEL_COL = 'rgba(251,249,244,0.75)';
  txt('Who can edit this demo?', cx + q, tb, fs * 1.7, 400, C.cream, 'left', -0.01, SERIF);

  const hy = tb + fs * 2.1;
  const ax = cx + q, mx = ax + av + gap, mw = cx + cw - q - mx;
  txt('PEOPLE', ax, hy, fs * 0.75, 700, LABEL_COL, 'left', 0.1);

  for (let i = 0; i < 2; i++) {
    const [ini, bg, fg, name] = POOL[i], ry = hy + fs * 0.7 + i * rowH, ay = ry + (rowH - av) / 2;
    fillRR(ax, ay, av, av, fs * 0.9, bg);
    txt(ini, ax + av / 2, ay + av / 2 + fs * 0.45, fs * 1.4, 700, fg, 'center');

    const over = inside(mx, ay, mw, av);
    fillRR(mx, ay, mw, av, fs * 0.9, over ? '#e9f1fd' : C.cream);
    txt(name + ' (' + ROLES[state.role[i]] + ')', mx + fs * 1.1, ay + av / 2 + fs * 0.35, fs, 700, C.navy);
    ctx.strokeStyle = C.navy; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    ctx.moveTo(mx + mw - fs * 1.5, ay + av / 2 - fs * 0.15); ctx.lineTo(mx + mw - fs * 1.1, ay + av / 2 + fs * 0.2); ctx.lineTo(mx + mw - fs * 0.7, ay + av / 2 - fs * 0.15); ctx.stroke();
    hits.push({ id: 'role' + i, x: mx, y: ay, w: mw, h: av });
    if (over) hot = true;
  }
}

const PILLAR_BG = '#25533a';
const checkColors = () => ({ idx: 7 });

function check(x, y, w, h) {
  const t = secs(), p = pad(w, h), R = min(w, h) * (0.52 + 0.04 * sin(t * 0.8)), cx = x + w * 0.3, cy = y + h * 0.78, L = hypot(w, h) * 2, N = 90;
  ctx.fillStyle = PILLAR_BG;
  ctx.fillRect(x, y, w, h);
  ctx.save();
  ctx.globalAlpha *= 0.35;
  ctx.strokeStyle = C.cream;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const a = i * TWO_PI / N + t * 0.05, px = cx + cos(a) * R, py = cy + sin(a) * R, dx = -sin(a), dy = cos(a);
    ctx.moveTo(px - dx * L, py - dy * L);
    ctx.lineTo(px + dx * L, py + dy * L);
  }
  ctx.stroke();
  ctx.restore();
  let s = h * 0.3;
  while (s > 14 && tw('Scale', s, 500, -0.04) > w - p * 2) s -= 2;
  txt('Scale', x + p, y + h - p * 0.8, s, 500, C.white, 'left', -0.04);
}

const PROMPTS = [
  'Make the revenue data flat, then grow by 3× with medium variability.',
  'Rename the company to Acme and swap in their logo.',
  'Show 12,480 active users with a steady upward trend.'
];
function layer(x, y, w, h) {
  const t = secs(), T = 7.5, k = floor(t / T), lt = t - k * T, msg = PROMPTS[k % PROMPTS.length];
  const gs = constrain(min(w, h) * 0.14, 22, 44);
  ctx.save();
  ctx.strokeStyle = '#2a7d52';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = x + gs * 0.5; gx < x + w; gx += gs) { ctx.moveTo(round(gx) + 0.5, y); ctx.lineTo(round(gx) + 0.5, y + h); }
  for (let gy = y + gs * 0.5; gy < y + h; gy += gs) { ctx.moveTo(x, round(gy) + 0.5); ctx.lineTo(x + w, round(gy) + 0.5); }
  ctx.stroke();
  ctx.restore();
  const p = pad(w, h) * 1.1, s = constrain(min(w * 0.058, h * 0.1), 12, 26), ip = s * 1.1;
  const lines = wrap(msg, w - p * 2 - ip * 2, s, 500), lh = s * 1.4;
  const bh = lines.length * lh + ip * 2, by = y + (h - bh) / 2, r = constrain(s * 0.9, 12, 22);
  const n = floor(msg.length * seg(lt, 0.5, 4.5)), fade = 1 - seg(lt, 6.8, 7.5);
  ctx.save();
  ctx.globalAlpha *= fade;
  ctx.shadowColor = 'rgba(15,15,66,0.14)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
  rr(x + p, by, w - p * 2, bh, [r, r, 0, r]); ctx.fillStyle = '#f1f0ea'; ctx.fill();
  ctx.shadowColor = 'transparent';
  strokeRR(x + p, by, w - p * 2, bh, [r, r, 0, r], 'rgba(14,74,45,0.3)', 1.5);
  let used = 0, cx = x + p + ip, cy = by + ip;
  lines.forEach((l, i) => {
    const shown = l.slice(0, max(0, n - used));
    txt(shown, x + p + ip, cy + s * 1.05 + i * lh, s, 500, C.navy, 'left', -0.01);
    if (n >= used && n <= used + l.length + 1 && n < msg.length) { cx = x + p + ip + tw(shown, s, 500, -0.01); cy = by + ip + i * lh; }
    used += l.length + 1;
  });
  if (n < msg.length && floor(t * 2) % 2 === 0) { ctx.fillStyle = C.blue; ctx.fillRect(cx + 2, cy + s * 0.1, 2, s * 1.15); }
  ctx.restore();
}

const SPEC_LETTERS = ['R', 'E', 'P', 'S', 'G', 'A'];
function spec(x, y, w, h) {
  const p = pad(w, h), CY = 2.4, t = secs() + state.specSkip * CY;
  const i = ((floor(t / CY) % 6) + 6) % 6, f = (t % CY + CY) % CY / CY, L = SPEC_LETTERS[i];
  const al = min(seg(f, 0, 0.14), 1 - seg(f, 0.86, 1));
  let s = min(h * 1.0, w * 0.8);
  const pair = ch => tw(ch, s, 400, -0.04, SERIF) + tw(ch.toLowerCase(), s, 400, -0.04, SERIF) + s * 0.04;
  while (s > 20 && max(SPEC_LETTERS.map(pair)) > w * 0.86) s -= 2;
  const aw = tw(L, s, 400, -0.04, SERIF), gap = s * 0.04, tot = aw + tw(L.toLowerCase(), s, 400, -0.04, SERIF) + gap;
  const sx = x + (w - tot) / 2, by = y + h * 0.88 + (1 - al) * s * 0.06;
  ctx.save(); ctx.globalAlpha *= al;
  txt(L, sx, by, s, 400, C.hl, 'left', -0.04, SERIF);
  txt(L.toLowerCase(), sx + aw + gap, by, s, 400, C.hl, 'left', -0.04, SERIF);
  ctx.restore();
  const cap = constrain(min(w * 0.03, h * 0.05), 9, 15);
  mtxt('TYPE SPECIMEN © 2026 REPRISE', x + w / 2, y + h * 0.5 - cap * 0.2, cap, 700, C.pale, 'center', 0.05);
  mtxt('ROBOTO SERIF · ' + L + L.toLowerCase(), x + w / 2, y + h * 0.5 + cap * 1.2, cap, 700, C.pale, 'center', 0.05);
  txt('Aa Bb Cc Dd Ee Ff', x + p, y + p + cap, cap * 1.2, 400, C.pale, 'left', 0.02, SERIF);
  hits.push({ id: 'spec', x, y, w, h });
}

const stack = { order: PAL.map((_, i) => i), anim: null, last: 0 };

function palette(x, y, w, h) {
  const n = PAL.length, pw = constrain(w * 0.075, 30, 64);
  const cx = x, cy = y, cw = w, ch = h, W = cw - (n - 1) * pw;
  const r = constrain(min(w, h) * 0.13, 18, 34), o = stack.order;
  if (!stack.anim && secs() - stack.last > 1.8) stack.anim = { j: o.indexOf((o[n - 1] + 1) % n), t0: millis() };
  let a = stack.anim, e = 0;
  if (a) {
    const q = (millis() - a.t0) / 900;
    if (q >= 1) { o.push(o.splice(a.j, 1)[0]); stack.anim = a = null; stack.last = secs(); } else e = ease(q);
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
  hits.push({ id: 'pal', x, y, w, h, pw });
  if (inside(x, y, w, h)) hot = true;
}

function glyph(c, ox, oy, u) {
  const s = u * 0.62;
  drawLogo(ox + (u - s) / 2, oy + (u - s) / 2, s, c, false);
}

function paletteCard(x, y, W, h, r, id, pw) {
  const c = PAL[id], t = secs(), fs = constrain(h * 0.1, 9, 14), p = h * 0.1;
  ctx.save();
  fillRR(x, y, W, h, r, c.bg);
  rr(x, y, W, h, r); ctx.clip();
  strokeRR(x, y, W, h, r, tween(c.bg, c.ink, 0.25), 1);
  mtxt('0' + (id + 1), x + pw / 2, y + p + fs, fs, 700, c.ink, 'center', 0.04);
  ctx.save(); ctx.translate(x + pw / 2 + fs * 0.35, y + h - p); ctx.rotate(-HALF_PI);
  mtxt(c.bg.toUpperCase(), 0, 0, fs, 700, c.ink, 'left', 0.1); ctx.restore();
  const sq = min(h - p * 2, (W - pw) * 0.42), sx = x + pw, sy = y + (h - sq) / 2;
  fillRR(sx, sy, sq, sq, r * 0.6, tween(c.bg, c.ink, 0.13));
  ctx.save();
  ctx.translate(sq / 2, sq / 2);
  ctx.rotate(t * 0.15 + id);
  ctx.translate(-sq / 2, -sq / 2);
  ctx.restore();
  glyph(c.ink, sx, sy + sin(t * 1.6 + id) * sq * 0.015, sq);
  const tx = sx + sq + p;
  let ns = fs * 2.25;
  while (ns > 10 && tw(PAL[id].n, ns, 400, -0.02, SERIF) > x + W - tx - p) ns -= 0.5;
  txt(PAL[id].n, tx, sy + sq * 0.52, ns, 400, c.ink, 'left', -0.02, SERIF);
  let rs = fs * 0.7;
  while (rs > 7 && tw(ROLE[id].toUpperCase(), rs, 700, 0.1) > x + W - tx - p) rs -= 0.5;
  txt(ROLE[id].toUpperCase(), tx, sy + sq * 0.52 + fs * 1.6, rs, 700, tween(c.bg, c.ink, 0.6), 'left', 0.1);
  ctx.restore();
}

function message(x, y, w, h) {
  const lh = min(h * 0.3, w * 0.6 / 3.97);
  drawLogo(x + (w - lh * 3.97) / 2, y + (h - lh) / 2, lh, C.cream, true);
}

function expiry(x, y, w, h) {
  const rd = constrain(min(w, h) * 0.13, 18, 34);
  strokeRR(x, y, w, h, rd, '#cdc9c0', 1);
  const p = pad(w, h) * 1.5, fs = constrain(min(w * 0.04, h * 0.056), 9, 13), t = secs();
  const lw = (w - p * 3) * 0.6, rw = w - p * 3 - lw, rx = x + p * 2 + lw;
  const lt = t % 6, k = lt < 5 ? ease(seg(lt, 0.2, 2.6)) : 1 - ease(seg(lt, 5, 6));
  const num = v => Math.round(v).toLocaleString('en-US');

  const ts = fs * 1.9, tl = wrap('Your demo report', lw, ts, 400, SERIF);
  tl.forEach((l, i) => txt(l, x + p, y + p + ts * 0.85 + i * ts * 1.12, ts, 400, C.blue, 'left', -0.02, SERIF));
  const by = y + p + tl.length * ts * 1.12 + fs * 1.7, LAB = 'rgba(31,95,180,0.8)', t0 = by + fs * 0.75;
  let ms = fs * 3.3;
  while (ms > fs * 2 && (tw(num(1284), ms, 400, -0.03, SERIF) > lw || t0 + ms * 0.95 + fs * 4.5 > y + h - p)) ms -= 1;
  let ls = fs * 1.02;
  while (ls > 8 && tw('DEMO VIEWS THIS WEEK', ls, 500, 0.04) > lw) ls -= 0.5;
  txt('DEMO VIEWS THIS WEEK', x + p, t0, ls, 500, LAB, 'left', 0.04);
  txt(num(1284 * k), x + p, t0 + ms * 0.95, ms, 400, C.blue, 'left', -0.03, SERIF);
  txt('CALLS BOOKED', x + p, t0 + ms * 0.95 + fs * 2.9, ls, 500, LAB, 'left', 0.04);
  txt(num(124 * k), x + p, t0 + ms * 0.95 + fs * 4.5, fs * 1.4, 400, C.blue, 'left', 0, SERIF);

  const bth = fs * 2.9, bty = y + h - p - bth;
  btn('paid', state.paid ? 'Link copied ✓' : 'Share demo', rx, bty, bth, C.blue, C.cream, fs * 0.95, rw, undefined, '#2b6fc9');
  const gy0 = y + p, gh = bty - fs - gy0, ox = rx + rw / 2, oy = gy0 + gh, nl = 41;
  ctx.save();
  ctx.beginPath(); ctx.rect(rx, gy0, rw, gh); ctx.clip();
  ctx.lineCap = 'round'; ctx.lineWidth = max(1.4, rw * 0.012);
  for (let i = 0; i < nl; i++) {
    const a = PI + (i + 0.5) * PI / nl, v = 0.5 + 0.5 * sin(t * 1.4 + i * 0.55) * cos(t * 0.6 + i * 0.3);
    const len = hypot(rw, gh) * (0.3 + 0.7 * v);
    ctx.strokeStyle = 'rgba(31,95,180,' + (0.25 + 0.65 * v) + ')';
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + cos(a) * len, oy + sin(a) * len); ctx.stroke();
  }
  ctx.restore();
}

function strip(x, y, w, h) {
  const vert = h >= w, p = pad(w, h), n = 6, along = ((vert ? h : w) - p * 2) / n;
  const u = min(vert ? w * 0.74 : h * 0.74, along * 0.82), t = secs(), k = state.togP, bgc = tween(PAL[3].bg, C.navy, k);
  const item = (i, cx, cy) => {
    if (i === 0) {
      const tw2 = u, th = u * 0.5;
      fillRR(cx - tw2 / 2, cy - th / 2, tw2, th, th / 2, tween(C.be, C.gr, k));
      disc(cx - tw2 / 2 + th / 2 + k * (tw2 - th), cy, th * 0.38, tween(C.navy, C.cream, k));
      hits.push({ id: 'tog', x: cx - tw2 / 2, y: cy - th / 2, w: tw2, h: th });
      if (inside(cx - tw2 / 2, cy - th / 2, tw2, th)) hot = true;
    } else if (i === 1) {
      [tween(C.navy, C.cream, k), C.gr, C.blue].forEach((c, j) => { disc(cx + (j - 1) * u * 0.26, cy, u * 0.21, c); ctx.beginPath(); ctx.arc(cx + (j - 1) * u * 0.26, cy, u * 0.21, 0, TWO_PI); ctx.strokeStyle = bgc; ctx.lineWidth = 2; ctx.stroke(); });
    } else if (i === 2) {
      const lab = 'Product Tours', bw = min(u * 1.5, w * 0.86), bh = u * 0.5;
      let size = u * 0.22;
      while (size > 7 && tw(lab, size, 600) > bw - size * 1.4) size -= 0.5;
      fillRR(cx - bw / 2, cy - bh / 2, bw, bh, min(bh * 0.3, 9), tween(C.navy, '#cfdcf3', k));
      txt(lab, cx, cy + size * 0.35, size, 600, tween(C.cream, C.navy, k), 'center');
    } else if (i === 3) {
      const rad = u * 0.34, pr = 0.5 + 0.5 * sin(t * 0.9);
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TWO_PI); ctx.strokeStyle = tween(C.be, '#262a78', k); ctx.lineWidth = u * 0.12; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, rad, -HALF_PI, -HALF_PI + pr * TWO_PI); ctx.strokeStyle = C.gr; ctx.lineCap = 'round'; ctx.stroke();
      txt(round(pr * 100) + '%', cx, cy + u * 0.07, u * 0.2, 700, tween(C.navy, C.cream, k), 'center');
    } else if (i === 4) {
      [C.gr, C.blue, tween('#a89a82', C.be, k), C.sky].forEach((c, j) => {
        const bh = u * (0.25 + 0.3 * (0.5 + 0.5 * sin(t * 1.4 + j * 1.3))), bw = u * 0.16;
        ctx.fillStyle = c;
        ctx.fillRect(cx - u * 0.42 + j * u * 0.23, cy + u * 0.3 - bh, bw, bh);
      });
    } else {
      const lab = state.clock ? 'Live ✓' : 'Go live', bw = min(u * 1.1, w * 0.84), bh = u * 0.46;
      fillRR(cx - bw / 2, cy - bh / 2, bw, bh, bh / 2, state.clock ? C.gr : tween(C.navy, C.cream, k));
      txt(lab, cx, cy + u * 0.07, u * 0.2, 700, state.clock ? C.white : tween(C.cream, C.navy, k), 'center');
      hits.push({ id: 'clock', x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh });
      if (inside(cx - bw / 2, cy - bh / 2, bw, bh)) hot = true;
    }
  };
  for (let i = 0; i < n; i++) {
    const c = p + along * (i + 0.5);
    item(i, vert ? x + w / 2 : x + c, vert ? y + c : y + h / 2);
  }
  ctx.save();
  ctx.globalAlpha *= 1 - k;
  strokeRR(x, y, w, h, constrain(min(w, h) * 0.13, 18, 34), '#cdc9c0', 1);
  ctx.restore();
}

function duties(x, y, w, h) {
  const t = secs(), cx = x + w / 2, cy = y + h / 2, R = hypot(w, h) / 2, N = 44, steps = 70;
  const twist = 1.7 + 0.15 * sin(t * 0.4), spin = t * 0.05;
  ctx.save();
  ctx.strokeStyle = 'rgba(14,74,45,0.22)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  [1, -1].forEach(s => {
    for (let i = 0; i < N; i++) {
      const a0 = i * TWO_PI / N + spin * s;
      for (let j = 0; j <= steps; j++) {
        const f = j / steps, r = R * (0.02 + 0.98 * f * f), a = a0 + s * twist * log(1 + r / (R * 0.12));
        const px = cx + cos(a) * r, py = cy + sin(a) * r;
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    }
  });
  ctx.stroke();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55);
  g.addColorStop(0, C.lg);
  g.addColorStop(0.35, C.lg);
  g.addColorStop(1, 'rgba(214,240,226,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  const p = pad(w, h), word = 'Build Better Demos';
  let s = h * 0.34;
  while (s > 12 && tw(word, s, 400, -0.02, SERIF) > w - p * 2) s -= 1;
  txt(word, cx, cy + s * 0.32, s, 400, '#0e4a2d', 'center', -0.02, SERIF);
}

function banner(x, y, w, h) {
  const s = h * 0.62, sg = s * 0.2, base = y + h * 0.5 + s * 0.3, ls = s * 0.7;
  const ws = WORDS.map(t => tw(t, s, 400, -0.03, SERIF)), period = ws.reduce((a, b) => a + b, 0) + (sg * 2 + ls) * WORDS.length;
  let px = x - ((secs() * 90) % period);
  while (px < x + w) {
    WORDS.forEach((t, i) => {
      font(s, 400, -0.03, SERIF);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = C.cream; ctx.fillText(t, px, base);
      px += ws[i] + sg;
      drawLogo(px, base - ls, ls, C.cream, false);
      px += ls + sg;
    });
  }
}

function mousePressed() {
  for (let i = hits.length - 1; i >= 0; i--) {
    const b = hits[i];
    if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
      if (b.id.indexOf('role') === 0) { const i = +b.id.slice(4); state.role[i] = (state.role[i] + 1) % ROLES.length; }
      if (b.id === 'pal' && !stack.anim) { const k = constrain(floor((mouseX - b.x) / b.pw), 0, stack.order.length - 1); if (k < stack.order.length - 1) stack.anim = { j: k, t0: millis() }; }
      if (b.id === 'tog') state.tog = !state.tog;
      if (b.id === 'clock') state.clock = !state.clock;
      if (b.id === 'paid') state.paid = !state.paid;
      if (b.id === 'spec') state.specSkip++;
      return false;
    }
  }
}
