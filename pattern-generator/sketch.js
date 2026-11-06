const CSS = "\n  :root {\n    --bg: #0f1315; --plate: #1d2326; --fg: #ffffff; --grey: #9aa0a3; --line: rgba(255,255,255,.14);\n    --orange: #ff4a14; --yellow: #f5b800; --blue: #009dff; --green: #006837; --purple: #7a2fb4; --ink: #26292b;\n  }\n  * { box-sizing: border-box; }\n  html, body { margin: 0; height: 100%; background: var(--bg); color: var(--fg); font-family: Arial, Helvetica, sans-serif; }\n  #panel { position: fixed; left: 0; top: " + NAV_H + "px; bottom: 0; width: 344px; z-index: 5; overflow-y: auto; padding: 22px 22px 40px; background: var(--bg); border-right: 1px solid var(--line); }\n  #caption { position: fixed; left: 344px; right: 0; bottom: 0; height: 46px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 20px; background: var(--bg); border-top: 1px solid var(--line); font-size: 13px; color: var(--grey); }\n  #caption b { color: #fff; letter-spacing: 1.2px; font-size: 11px; margin-right: 10px; }\n  #caption .r { white-space: nowrap; font-size: 12px; }\n\n  .eyebrow { font-size: 11px; letter-spacing: 1.4px; color: var(--grey); margin: 0 0 6px; }\n  #panel h1 { font: 400 46px/1 'Instrument Serif', Georgia, serif; margin: 0 0 4px; }\n  .rule4 { height: 4px; background: #fff; margin-bottom: 16px; }\n\n  #panel section { border-top: 1px solid var(--line); padding: 16px 0 6px; margin-top: 14px; }\n  #panel h3 { margin: 0 0 12px; font-size: 11px; letter-spacing: 1.4px; font-weight: 700; color: #fff; display: flex; gap: 10px; }\n  #panel h3 span { color: var(--grey); font-weight: 400; }\n  .group { margin-bottom: 14px; transition: opacity .15s; }\n  .group.off { opacity: .3; pointer-events: none; }\n  .hide { display: none !important; }\n  .lbl { font-size: 10px; letter-spacing: 1.2px; color: var(--grey); margin: 0 0 7px; display: block; }\n\n  .motifs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }\n  .motifs button { text-align: left; padding: 11px 12px; background: var(--plate); color: #fff; border: 0; font: 700 13px Arial; cursor: pointer; display: flex; gap: 9px; border-radius: 0; }\n  .motifs button b { opacity: .45; font-weight: 700; }\n  .motifs button:hover { background: #283034; }\n  .motifs button.on { background: var(--c); color: var(--ci); }\n  .motifs button.on b { opacity: .6; }\n\n  .seg { display: flex; gap: 0; background: var(--plate); }\n  .seg button { flex: 1; padding: 10px 6px; background: transparent; color: var(--grey); border: 0; font: 700 12px Arial; cursor: pointer; border-radius: 0; }\n  .seg button:hover { color: #fff; }\n  .seg button.on { background: #fff; color: var(--bg); }\n\n  .dirs { display: grid; grid-template-columns: repeat(3, 44px); gap: 4px; }\n  .dirs button { height: 44px; background: var(--plate); color: #fff; border: 0; font-size: 18px; cursor: pointer; border-radius: 0; }\n  .dirs button:hover { background: #283034; }\n  .dirs button.on { background: var(--orange); }\n  .dirrow { display: flex; gap: 18px; align-items: flex-start; }\n\n  .chip { display: inline-flex; align-items: center; gap: 8px; padding: 9px 12px; background: var(--plate); color: var(--grey); font: 700 12px Arial; border: 0; cursor: pointer; border-radius: 0; }\n  .chip i { width: 10px; height: 10px; border: 2px solid var(--grey); display: block; }\n  .chip.on { color: #fff; } .chip.on i { background: var(--orange); border-color: var(--orange); }\n\n  .sl { display: grid; grid-template-columns: 1fr auto; row-gap: 5px; margin-bottom: 13px; font-size: 12px; color: #fff; }\n  .sl span { font-size: 10px; letter-spacing: 1.2px; color: var(--grey); }\n  .sl output { font-size: 11px; color: #fff; font-variant-numeric: tabular-nums; }\n  .sl input { grid-column: 1 / 3; width: 100%; margin: 0; accent-color: var(--orange); }\n\n  input[type=text] { width: 100%; padding: 10px 12px; background: var(--plate); border: 1px solid transparent; color: #fff; font: 700 13px Arial; letter-spacing: 1px; border-radius: 0; margin-top: 8px; }\n  input[type=text]:focus { outline: none; border-color: var(--orange); }\n\n  .sw { display: flex; flex-wrap: wrap; gap: 6px; }\n  .sw button { width: 30px; height: 30px; border: 1px solid rgba(255,255,255,.35); cursor: pointer; padding: 0; border-radius: 0; }\n  .sw button.on { outline: 2px solid #fff; outline-offset: 2px; }\n  .sw .multi { background: conic-gradient(var(--orange) 0 25%, var(--green) 0 50%, var(--blue) 0 75%, var(--yellow) 0); }\n\n  .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 18px; }\n  .actions button { padding: 12px; border: 0; font: 700 12px Arial; letter-spacing: .5px; cursor: pointer; background: var(--plate); color: #fff; border-radius: 0; }\n  .actions button:hover { background: #283034; }\n  .actions .primary { background: #fff; color: var(--bg); grid-column: 1 / 3; }\n  .actions .primary:hover { background: #e8e8e8; }\n\n  \n  html, body { overflow: hidden; }\n";


const PAL = {
  Orange: '#ff4a14', Yellow: '#f5b800', Blue: '#009dff', Green: '#006837', Purple: '#7a2fb4',
  Ink: '#26292b', Dark: '#0f1315', Paper: '#f2f1ed', White: '#ffffff',
};
const PAL_KEYS = Object.keys(PAL);
const OBJ_KEYS = [...PAL_KEYS, 'Multi'];

const MOTIFS = [
  { id: 'binary',  name: 'Binary Wave',   color: PAL.Blue,   ci: '#fff',    hint: '0s and 1s whose brightness rolls across the grid as a wave.' },
  { id: 'ticker',  name: 'Ticker Tape',   color: PAL.Yellow, ci: PAL.Ink,   hint: 'Stock symbols and prices drifting in rows, brightness rolling down the lines.' },
  { id: 'cmd',     name: 'Command Lines', color: PAL.Green,  ci: '#fff',    hint: 'Terminal commands for draft, review and autocomplete, scrolling in lines.' },
  { id: 'clause',  name: 'Clause Text',   color: PAL.Orange, ci: '#fff',    hint: 'Contract language set in mono type, running in lines like a redline.' },
  { id: 'rain',    name: 'Data Rain',     color: PAL.Purple, ci: '#fff',    hint: 'Streaks of code symbols with a bright head and a fading trail.' },
  { id: 'shade',   name: 'Shade Ramp',    color: PAL.Blue,   ci: '#fff',    hint: 'A soft field built from a character ramp, light to heavy.' },
  { id: 'lattice', name: 'Lattice',       color: PAL.Yellow, ci: PAL.Ink,   hint: 'A quiet grid of plus signs and dots that pulses.' },
];

const DIRS = [[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1]];
const ARROWS = ['↖','↑','↗','←','•','→','↙','↓','↘'];

const DEFAULTS = {
  motif: 'binary', cover: 'mix', shape: 'gem', text: 'SPELLBOOK',
  dir: 5, alt: false, speed: 1,
  density: 6, fill: 0.85, rowGap: 1, colGap: 1, hRules: 0, vRules: 0, gain: 1.2,
  size: 0.55, mixDim: 0.3, invert: false, ox: 0.5, oy: 0.5,
  bg: 'Green', ink: 'White', obj: 'White', paused: false,
};
const S = Object.assign({}, DEFAULTS);

const TICKERS = ['AAPL','MSFT','NVDA','GOOG','AMZN','META','TSLA','JPM','GS','BAC','XOM','CVX','UNH','LLY','V','MA','KO','PEP','WMT','COST','HD','DIS','NFLX','AMD','ORCL','CRM'];
function tickerRow(r) {
  let out = '';
  for (let k = 0; k < 9; k++) {
    const h = (r * 31 + k * 17) % 97, sym = TICKERS[(r * 5 + k * 7) % TICKERS.length];
    const price = (20 + (h * 37) % 480 + (h % 10) / 10).toFixed(2), chg = ((h * 13) % 40) / 10;
    out += sym + ' ' + price + ' ' + (h % 2 ? '+' : '-') + chg.toFixed(1) + '%   ';
  }
  return out;
}
const DRAFT_CMDS = [
  ['$ spellbook draft clause --type indemnity', '> reading contract context ........ ok', '> matching playbook positions ..... 14', '> drafting clause 12.4 ............ done', '> checking defined terms .......... ok', '> inserting at cursor ............. done'],
  ['$ spellbook draft document --template msa', '> collecting parties and terms .... ok', '> selecting standard clauses ...... 18', '> assembling sections ............. done', '> cross-referencing definitions ... ok', '> exporting to Word ............... done'],
  ['$ spellbook autocomplete --cursor 4821', '> reading preceding text .......... ok', '> matching house style ............ ok', '> predicting next sentence ........ done', '> checking against playbook ....... ok', '> inserting suggestion ............ done'],
];
const CLAUSES = [
  'Customer shall not copy, reverse engineer, or decompile the Services',
  'Each party understands that the Disclosing Party has disclosed or may disclose confidential information',
  'Either party may terminate the agreement by providing at least thirty (30) days\' notice',
  'The indemnification obligations of this section shall be mutual and subject to the cap in section 12.4',
  'Receiving Party shall not use or divulge any Proprietary Information except in performance of this Agreement',
  'Company shall have no obligation to monitor the Services, but may do so at its sole discretion',
];
const RAIN = '01+-<>/\\{}[]$%#=*';
const RAMP = ' .:-=+*#%@';
let tickerRows, cmdRows, clauseRows;
(function buildRows() {
  tickerRows = Array.from({ length: 48 }, (_, r) => tickerRow(r));
  cmdRows = Array.from({ length: 24 }, (_, r) => DRAFT_CMDS[r % 3].join('    ') + '    ');
  const long = CLAUSES.join('   §   ') + '   §   ';
  clauseRows = Array.from({ length: 28 }, (_, r) => { const o = (r * 53) % long.length; return long.slice(o) + long.slice(0, o); });
})();

const wrapN = (a, n) => ((a % n) + n) % n;
const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

let T = 0, COLS = 0, ROWS = 0;
let FX = 0, FY = 0, GCH = '', GA = 0;
let maskCv = null, maskData = null, maskKey = '', fontsReady = 0;
let cnv, dragging = false;

const PANEL_W = 344, CAP_H = 46;

function setup() {
  const st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);
  ['Anton', 'Instrument+Serif'].forEach(f => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + f + '&display=swap';
    document.head.appendChild(l);
  });
  document.body.style.margin = '0';
  document.body.style.background = '#0f1315';
  const panel = document.createElement('aside');
  panel.id = 'panel';
  panel.innerHTML = '<p class="eyebrow">SPELLBOOK DESIGN SYSTEM</p><h1>Pattern Generator</h1><div class="rule4"></div>';
  document.body.appendChild(panel);
  const cap = document.createElement('div');
  cap.id = 'caption';
  cap.innerHTML = '<div><b id="capName"></b><span id="capHint"></span></div><div class="r" id="capR"></div>';
  document.body.appendChild(cap);
  cnv = createCanvas(max(400, windowWidth), max(300, windowHeight - NAV_H));
  cnv.position(0, NAV_H);
  pixelDensity(min(2, displayDensity()));
  if (document.fonts) document.fonts.load('40px Anton').then(() => { fontsReady = 1; });
  buildUI();
  const hs = document.createElement('script');
  hs.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  hs.onload = () => { queueSnap(); setInterval(snapPanel, 2500); };
  document.head.appendChild(hs);
  panel.addEventListener('scroll', queueSnap);
  panel.addEventListener('input', queueSnap);
  panel.addEventListener('click', queueSnap);
}

let panelImg = null, snapBusy = false, snapTimer = 0;

function snapPanel() {
  if (!window.html2canvas || snapBusy) return;
  snapBusy = true;
  html2canvas(document.getElementById('panel'), { backgroundColor: '#0f1315', scale: 1, logging: false }).then(c => { panelImg = c; snapBusy = false; }).catch(() => { snapBusy = false; });
}

function queueSnap() {
  clearTimeout(snapTimer);
  snapTimer = setTimeout(snapPanel, 150);
}

function drawChrome(ctx) {
  const W = width - PANEL_W, H = height - CAP_H;
  if (panelImg) ctx.drawImage(panelImg, 0, 0, panelImg.width * (PANEL_W / panelImg.width), min(height, panelImg.height * (PANEL_W / panelImg.width)));
  else { ctx.fillStyle = '#0f1315'; ctx.fillRect(0, 0, PANEL_W, height); }
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(PANEL_W - 1, 0, 1, height);
  ctx.fillStyle = '#0f1315';
  ctx.fillRect(PANEL_W, H, W, CAP_H);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(PANEL_W, H, W, 1);
  const m = MOTIFS.find(x => x.id === S.motif);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = '700 11px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(m.name.toUpperCase(), PANEL_W + 20, H + CAP_H / 2);
  const nw = ctx.measureText(m.name.toUpperCase()).width;
  ctx.font = '13px Arial';
  ctx.fillStyle = '#9aa0a3';
  ctx.font = '12px Arial';
  const rw = S.cover !== 'wall' ? ctx.measureText('Drag on the artboard to move the object').width + 40 : 20;
  ctx.font = '13px Arial';
  const avail = width - rw - (PANEL_W + 30 + nw);
  let hint = m.hint;
  while (hint.length > 4 && ctx.measureText(hint).width > avail) hint = hint.slice(0, -2);
  if (hint !== m.hint) hint = hint.trim() + '...';
  ctx.fillText(hint, PANEL_W + 20 + nw + 10, H + CAP_H / 2);
  if (S.cover !== 'wall') {
    ctx.textAlign = 'right';
    ctx.font = '12px Arial';
    ctx.fillText('Drag on the artboard to move the object', width - 20, H + CAP_H / 2);
  }
}

function windowResized() {
  resizeCanvas(max(400, windowWidth), max(300, windowHeight - NAV_H));
  queueSnap();
}

function flow(gx, gy) {
  const d = DIRS[S.dir], dx = d[0], dy = d[1], k = (dx && dy) ? 0.7071 : 1, off = T * 6;
  if (S.alt) {
    if (Math.abs(dx) >= Math.abs(dy)) { const s = (gy & 1) ? -1 : 1; FX = gx - s * dx * off; FY = gy; }
    else { const s = (gx & 1) ? -1 : 1; FX = gx; FY = gy - s * dy * off; }
  } else { FX = gx - dx * k * off; FY = gy - dy * k * off; }
}

function glyph(gx, gy) {
  flow(gx, gy);
  const d = DIRS[S.dir], stat = !d[0] && !d[1], vert = Math.abs(d[1]) > Math.abs(d[0]);
  const ix = Math.floor(FX), iy = Math.floor(FY);
  switch (S.motif) {
    case 'binary': {
      GCH = wrapN(ix * 7 + iy * 13 + ix * iy * 3, 5) < 2 ? '1' : '0';
      const w = 0.5 + 0.5 * Math.sin(FX * 0.55 + FY * 0.35 - (stat ? T * 1.6 : 0));
      GA = 0.1 + 0.75 * w * w; break;
    }
    case 'ticker': case 'cmd': case 'clause': {
      const arr = S.motif === 'ticker' ? tickerRows : S.motif === 'cmd' ? cmdRows : clauseRows;
      const across = vert ? gx : gy, along = vert ? FY : FX;
      const L = arr[wrapN(across, arr.length)];
      GCH = L[wrapN(Math.floor(along), L.length)];
      GA = 0.16 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(across * 0.45 - T * 1.2), 2); break;
    }
    case 'rain': {
      const across = vert ? gx : gy, pos = vert ? gy : gx, M = vert ? ROWS : COLS;
      let sgn = vert ? (d[1] || 1) : (d[0] || 1);
      if (S.alt && (across & 1)) sgn = -sgn;
      const p = sgn > 0 ? pos : M - 1 - pos;
      const sp = 0.5 + h2(across, 7) * 1.1, trail = 8 + h2(across, 3) * 16, cyc = M + trail + 10;
      const head = wrapN(T * 7 * sp + h2(across, 11) * cyc, cyc), dd = head - p;
      GA = (dd >= 0 && dd <= trail) ? Math.pow(1 - dd / trail, 1.4) : 0.05;
      if (dd >= 0 && dd < 1.2) GA = 1;
      GCH = RAIN[Math.floor(h2(across * 3.1 + pos, Math.floor(T * 3 + across) * 1.3) * RAIN.length)]; break;
    }
    case 'shade': {
      const v = 0.5 + 0.25 * Math.sin(FX * 0.17 + FY * 0.11 - (stat ? T * 0.8 : 0)) + 0.25 * Math.sin(FY * 0.23 - FX * 0.07 + 1.7 + (stat ? T * 0.5 : 0));
      GCH = RAMP[Math.floor(constrain(v, 0, 0.999) * RAMP.length)];
      GA = 0.2 + 0.7 * v; break;
    }
    default: {
      const ex = wrapN(ix, 2) === 0, ey = wrapN(iy, 2) === 0;
      GCH = ex && ey ? '+' : (ey ? '-' : (ex ? '|' : '.'));
      GA = 0.2 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(ix * 0.3 + iy * 0.22 - (stat ? T * 2 : 0)), 2);
    }
  }
}

function buildMask(cols, rows, cw, ch, x0, y0, W, H) {
  const mk = [cols, rows, cw.toFixed(2), ch.toFixed(2), S.shape, S.size, S.text, S.ox.toFixed(3), S.oy.toFixed(3), fontsReady].join('|');
  if (mk === maskKey) return;
  maskKey = mk;
  if (!maskCv) maskCv = document.createElement('canvas');
  maskCv.width = cols; maskCv.height = rows;
  const c = maskCv.getContext('2d', { willReadFrequently: true });
  c.clearRect(0, 0, cols, rows);
  c.setTransform(1 / cw, 0, 0, 1 / ch, -x0 / cw, -y0 / ch);
  c.fillStyle = '#000';
  const cx = S.ox * W, cy = S.oy * H, R = Math.min(W, H) * S.size * 0.5;
  const diamond = (r) => { c.moveTo(cx, cy - r); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r, cy); c.closePath(); };
  c.beginPath();
  if (S.shape === 'gem') { diamond(R * 1.15); diamond(R * 0.46); c.fill('evenodd'); }
  else if (S.shape === 'circle') { c.arc(cx, cy, R, 0, Math.PI * 2); c.fill(); }
  else if (S.shape === 'ring') { c.arc(cx, cy, R, 0, Math.PI * 2); c.moveTo(cx + R * 0.55, cy); c.arc(cx, cy, R * 0.55, 0, Math.PI * 2); c.fill('evenodd'); }
  else if (S.shape === 'square') { c.rect(cx - R * 0.85, cy - R * 0.85, R * 1.7, R * 1.7); c.fill(); }
  else {
    const t = (S.text || ' ').toUpperCase();
    c.font = '100px Anton, Impact, "Arial Black", sans-serif';
    const w = c.measureText(t).width || 1;
    const fs = Math.min(100 * (W * 0.95 * S.size) / w, H * 0.9);
    c.font = fs + 'px Anton, Impact, "Arial Black", sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(t, cx, cy + fs * 0.04);
  }
  const d = c.getImageData(0, 0, cols, rows).data;
  maskData = new Uint8Array(cols * rows);
  for (let i = 0; i < maskData.length; i++) maskData[i] = d[i * 4 + 3] > 110 ? 1 : 0;
}

const MULTI_COL = { ne: PAL.Orange, se: PAL.Green, sw: PAL.Blue, nw: PAL.Yellow };

function draw() {
  const W = width - PANEL_W, H = height - CAP_H, ctx = drawingContext;
  background('#0f1315');
  ctx.save();
  ctx.translate(PANEL_W, 0);
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  ctx.fillStyle = PAL[S.bg];
  ctx.fillRect(0, 0, W, H);
  if (!S.paused) T += Math.min(deltaTime, 50) / 1000 * S.speed;

  const fs = map(S.density, 1, 10, 46, 13);
  const cw = fs * 0.6 * S.colGap, ch = fs * 1.15 * S.rowGap;
  COLS = Math.ceil(W / cw) + 1; ROWS = Math.ceil(H / ch) + 1;
  const x0 = (W - COLS * cw) / 2, y0 = (H - ROWS * ch) / 2;
  const useMask = S.cover !== 'wall';
  if (useMask) buildMask(COLS, ROWS, cw, ch, x0, y0, W, H);

  const wallCol = PAL[S.ink], objPx = S.ox * W, objPy = S.oy * H;
  ctx.save();
  ctx.font = '700 ' + fs + 'px "Courier New", Courier, monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let lastCol = '';
  for (let gy = 0; gy < ROWS; gy++) {
    const py = y0 + (gy + 0.5) * ch;
    for (let gx = 0; gx < COLS; gx++) {
      let isObj = false;
      if (useMask) { isObj = maskData[gy * COLS + gx] === 1; if (S.invert) isObj = !isObj; }
      if (S.cover === 'object' && !isObj) continue;
      if (h2(gx, gy) > (isObj ? Math.min(1, S.fill * 1.4) : S.fill)) continue;
      glyph(gx, gy);
      if (GCH === ' ' || GCH === undefined) continue;
      const a = Math.min(1, GA * S.gain * ((S.cover === 'mix' && !isObj) ? S.mixDim : 1));
      if (a < 0.02) continue;
      const px = x0 + (gx + 0.5) * cw;
      let col = wallCol;
      if (isObj) {
        if (S.obj === 'Multi') col = px >= objPx ? (py < objPy ? MULTI_COL.ne : MULTI_COL.se) : (py < objPy ? MULTI_COL.nw : MULTI_COL.sw);
        else col = PAL[S.obj];
      }
      if (col !== lastCol) { ctx.fillStyle = col; lastCol = col; }
      ctx.globalAlpha = a;
      ctx.fillText(GCH, px, py);
    }
  }
  if (S.hRules || S.vRules) {
    ctx.globalAlpha = 0.6; ctx.strokeStyle = wallCol; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 1; i <= S.hRules; i++) { const y = Math.round(H * i / (S.hRules + 1)) + 0.5; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    for (let i = 1; i <= S.vRules; i++) { const x = Math.round(W * i / (S.vRules + 1)) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
  drawChrome(ctx);
  cursor(S.cover !== 'wall' ? (dragging ? 'grabbing' : 'grab') : 'default');
}

function moveObj() { S.ox = constrain((mouseX - PANEL_W) / (width - PANEL_W), 0, 1); S.oy = constrain(mouseY / (height - CAP_H), 0, 1); }
function mousePressed(e) {
  if (e && e.target !== cnv.elt) return;
  if (S.cover !== 'wall') { dragging = true; moveObj(); }
}
function mouseDragged() { if (dragging) moveObj(); }
function mouseReleased() { dragging = false; }

const refreshers = [];
const $ = (id) => document.getElementById(id);
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

function section(num, title) {
  const s = el('section', null, '<h3><span>' + num + '</span>' + title + '</h3>');
  $('panel').append(s); return s;
}
function group(parent, label) {
  const g = el('div', 'group'); if (label) g.append(el('span', 'lbl', label)); parent.append(g); return g;
}
function segmented(parent, opts, prop) {
  const w = el('div', 'seg');
  opts.forEach(([v, l]) => { const b = el('button', null, l); b.onclick = () => { S[prop] = v; syncUI(); }; b._v = v; w.append(b); });
  parent.append(w);
  refreshers.push(() => [...w.children].forEach(b => b.classList.toggle('on', b._v === S[prop])));
}
function slider(parent, label, prop, min, max, step, fmt) {
  const row = el('label', 'sl', '<span>' + label + '</span><output></output>');
  const inp = el('input'); inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step;
  const out = row.querySelector('output');
  inp.oninput = () => { S[prop] = +inp.value; out.textContent = fmt ? fmt(S[prop]) : S[prop]; };
  row.append(inp); parent.append(row);
  refreshers.push(() => { inp.value = S[prop]; out.textContent = fmt ? fmt(S[prop]) : S[prop]; });
  return row;
}
function chip(parent, label, prop) {
  const b = el('button', 'chip', '<i></i>' + label);
  b.onclick = () => { S[prop] = !S[prop]; syncUI(); };
  parent.append(b);
  refreshers.push(() => b.classList.toggle('on', !!S[prop]));
}
function swatches(parent, label, prop, keys) {
  const g = group(parent, label), w = el('div', 'sw');
  keys.forEach(k => {
    const b = el('button', k === 'Multi' ? 'multi' : ''); b.title = k;
    if (k !== 'Multi') b.style.background = PAL[k];
    b.onclick = () => { S[prop] = k; syncUI(); };
    b._k = k; w.append(b);
  });
  g.append(w);
  refreshers.push(() => [...w.children].forEach(b => b.classList.toggle('on', b._k === S[prop])));
}

let objGroup, textInput, mixRow, dimGroup;
function buildUI() {
  let s = section('01', 'MOTIF');
  const grid = el('div', 'motifs');
  MOTIFS.forEach((m, i) => {
    const b = el('button', null, '<b>' + (i + 1) + '</b>' + m.name);
    b.style.setProperty('--c', m.color); b.style.setProperty('--ci', m.ci);
    b.onclick = () => { S.motif = m.id; syncUI(); };
    b._id = m.id; grid.append(b);
  });
  s.append(grid);
  refreshers.push(() => [...grid.children].forEach(b => b.classList.toggle('on', b._id === S.motif)));

  s = section('02', 'COVERAGE');
  let g = group(s, 'ASCII FILLS');
  segmented(g, [['wall', 'Wall to wall'], ['object', 'Object'], ['mix', 'Mix']], 'cover');
  objGroup = group(s, 'OBJECT');
  segmented(objGroup, [['gem', 'Gem'], ['circle', 'Circle'], ['ring', 'Ring'], ['square', 'Square'], ['text', 'Text']], 'shape');
  textInput = el('input'); textInput.type = 'text'; textInput.value = S.text; textInput.maxLength = 24;
  textInput.oninput = () => { S.text = textInput.value; };
  objGroup.append(textInput);
  const sz = el('div'); sz.style.marginTop = '14px'; objGroup.append(sz);
  slider(sz, 'SIZE', 'size', 0.2, 1, 0.01, v => Math.round(v * 100) + '%');
  dimGroup = el('div'); objGroup.append(dimGroup);
  mixRow = slider(dimGroup, 'WALL BEHIND OBJECT', 'mixDim', 0, 1, 0.01, v => Math.round(v * 100) + '%');
  const chips = el('div'); objGroup.append(chips);
  chip(chips, 'Invert (knock out)', 'invert');

  s = section('03', 'DIRECTION');
  const row = el('div', 'dirrow'); s.append(row);
  const pad = el('div', 'dirs');
  ARROWS.forEach((a, i) => { const b = el('button', null, a); b.onclick = () => { S.dir = i; syncUI(); }; pad.append(b); });
  row.append(pad);
  refreshers.push(() => [...pad.children].forEach((b, i) => b.classList.toggle('on', i === S.dir)));
  const right = el('div'); right.style.flex = '1'; row.append(right);
  chip(right, 'Alternate lines', 'alt');
  const sp = el('div'); sp.style.marginTop = '14px'; right.append(sp);
  slider(sp, 'SPEED', 'speed', 0.1, 3, 0.1, v => v.toFixed(1) + 'x');

  s = section('04', 'DENSITY + LINES');
  slider(s, 'DENSITY', 'density', 1, 10, 1);
  slider(s, 'FILL', 'fill', 0.1, 1, 0.01, v => Math.round(v * 100) + '%');
  slider(s, 'BRIGHTNESS', 'gain', 0.3, 2, 0.05, v => v.toFixed(2));
  slider(s, 'ROW SPACING', 'rowGap', 0.8, 2.2, 0.05, v => v.toFixed(2));
  slider(s, 'COLUMN SPACING', 'colGap', 0.8, 2.2, 0.05, v => v.toFixed(2));
  slider(s, 'HORIZONTAL LINES', 'hRules', 0, 24, 1);
  slider(s, 'VERTICAL LINES', 'vRules', 0, 24, 1);

  s = section('05', 'BRAND COLOUR');
  swatches(s, 'BACKGROUND', 'bg', PAL_KEYS);
  swatches(s, 'ASCII WALL', 'ink', PAL_KEYS);
  swatches(s, 'ASCII OBJECT', 'obj', OBJ_KEYS);

  const act = el('div', 'actions');
  const png = el('button', 'primary', 'Export PNG'); png.onclick = () => saveCanvas('spellbook-pattern', 'png');
  const rnd = el('button', null, 'Randomise colours'); rnd.onclick = randomise;
  const pause = el('button', null, 'Pause'); pause.onclick = () => { S.paused = !S.paused; syncUI(); };
  pause.id = 'pauseBtn';
  const rst = el('button', null, 'Reset'); rst.onclick = () => { Object.assign(S, DEFAULTS); textInput.value = S.text; syncUI(); };
  act.append(png, rnd, pause, rst);
  $('panel').append(act);

  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= MOTIFS.length) { S.motif = MOTIFS[n - 1].id; syncUI(); }
    if (e.key === ' ') { e.preventDefault(); S.paused = !S.paused; syncUI(); }
  });
  syncUI();
}

function syncUI() {
  queueSnap();
  refreshers.forEach(f => f());
  const wall = S.cover === 'wall';
  objGroup.classList.toggle('off', wall);
  textInput.classList.toggle('hide', S.shape !== 'text');
  mixRow.classList.toggle('hide', S.cover !== 'mix');
  $('pauseBtn').textContent = S.paused ? 'Play' : 'Pause';
  const m = MOTIFS.find(x => x.id === S.motif);
  $('capName').textContent = m.name.toUpperCase();
  $('capHint').textContent = m.hint;
  $('capR').textContent = wall ? '' : 'Drag on the artboard to move the object';
}

function lum(hex) {
  const n = parseInt(hex.slice(1), 16), f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}
function contrast(a, b) { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
function randomise() {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  S.bg = pick(['Orange', 'Yellow', 'Blue', 'Green', 'Purple', 'Ink', 'Dark', 'Paper']);
  const ok = PAL_KEYS.filter(k => contrast(PAL[S.bg], PAL[k]) >= 2.4);
  S.ink = pick(ok);
  const objs = [...ok.filter(k => k !== S.ink), ...(lum(PAL[S.bg]) < 0.12 ? ['Multi'] : [])];
  S.obj = pick(objs);
  syncUI();
}
