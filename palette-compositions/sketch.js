// 3-color palettes with strict, hardcoded contrast rules to prevent clashing/vibration
const palettes = [
  {
    // Dark Blue, Bright Blue, Purple
    colors: ['#1E2247', '#4131F1', '#614BBA'],
    safeLines: {
      '#1E2247': '#614BBA', // Purple lines on Dark Blue
      '#4131F1': '#1E2247', // Dark Blue lines on Bright Blue
      '#614BBA': '#1E2247'  // Dark Blue lines on Purple
    }
  },
  {
    // Bright Blue, Pink, Yellow
    colors: ['#4131F1', '#D045DC', '#F6C93F'],
    safeLines: {
      '#4131F1': '#F6C93F', // Yellow lines on Bright Blue
      '#D045DC': '#F6C93F', // Yellow lines on Pink
      '#F6C93F': '#4131F1'  // Bright Blue lines on Yellow
    }
  },
  {
    // Bright Blue, Pink, Light Purple
    colors: ['#4131F1', '#D045DC', '#9D8DF1'],
    safeLines: {
      '#4131F1': '#9D8DF1', // Light Purple lines on Bright Blue
      '#D045DC': '#9D8DF1', // Light Purple lines on Pink
      '#9D8DF1': '#4131F1'  // Bright Blue lines on Light Purple
    }
  },
  {
    // Dark Teal, Bright Blue, Lime Green
    colors: ['#163E44', '#4131F1', '#839E2F'],
    safeLines: {
      '#163E44': '#839E2F', // Lime lines on Dark Teal
      '#4131F1': '#163E44', // Dark Teal lines on Bright Blue (Avoids Lime vibration)
      '#839E2F': '#163E44'  // Dark Teal lines on Lime Green
    }
  },
  {
    // Pink, Bright Blue, Light Pink
    colors: ['#D045DC', '#4131F1', '#EAA9F4'],
    safeLines: {
      '#D045DC': '#EAA9F4', // Light Pink lines on Pink
      '#4131F1': '#EAA9F4', // Light Pink lines on Bright Blue
      '#EAA9F4': '#4131F1'  // Bright Blue lines on Light Pink
    }
  }
];

let currentPaletteIndex = 0;
let comp = null;          // the current layout; colours are stored as palette slots (0-2) so a new palette keeps the layout
let bgSlot = 0;           // which palette slot is the background

const GRID = 40, STRIPE = 20, LINE_W = 2;   // stripes every 20px (they were every 8px, too dense)

function setup() {
  createCanvas(...ExportKit.size());
  noLoop();
  newLayout();
  buildPanel();
  redraw();
}

function draw() {
  background(15);
  if (!comp || comp.w !== width || comp.h !== height) newLayout();
  const pal = palettes[currentPaletteIndex];
  for (const it of comp.items) {
    if (it.k === 'block') {
      noStroke();
      fill(colourOf(it.slot, pal));
      rect(it.x, it.y, it.w, it.h);
    } else {
      stroke(pal.safeLines[colourOf(it.on, pal)]);
      strokeWeight(LINE_W);
      noFill();
      for (const l of segments(it)) l.r ? rect(l.x, l.y, l.w, l.h) : line(l.x1, l.y1, l.x2, l.y2);
    }
  }
}

// a slot is 0-2, or 'bg' for the background colour
function colourOf(slot, pal) { return pal.colors[slot === 'bg' ? bgSlot : slot]; }

/* ---------- layout: the same three composition types as before, stored as data ---------- */
function newLayout() {
  const W = width, H = height, items = [];
  const type = floor(random(3));
  bgSlot = floor(random(3));
  if (type === 0) {
    // full line network over the background
    items.push({ k: 'block', x: 0, y: 0, w: W, h: H, slot: 'bg' });
    items.push(lineNetwork(0, 0, W, H, 'bg'));
  } else if (type === 1) {
    // colour grid: three blocks, the first one is the background, one block is striped
    const ratios = random() > 0.5 ? [1 / 3, 2 / 3] : [0.382, 0.618];
    const sx = W * ratios[floor(random(2))], sy = H * ratios[floor(random(2))];
    // all three blocks touch, so each gets its own palette colour
    const [c2, c3] = shuffle([0, 1, 2].filter((c) => c !== bgSlot));
    const blocks = random() > 0.5
      ? [{ x: 0, y: 0, w: sx, h: H, slot: 'bg' }, { x: sx, y: 0, w: W - sx, h: sy, slot: c2 }, { x: sx, y: sy, w: W - sx, h: H - sy, slot: c3 }]
      : [{ x: 0, y: 0, w: sx, h: sy, slot: 'bg' }, { x: 0, y: sy, w: sx, h: H - sy, slot: c2 }, { x: sx, y: 0, w: W - sx, h: H, slot: c3 }];
    const striped = floor(random(3));
    blocks.forEach((b, i) => {
      items.push({ k: 'block', ...b });
      if (i === striped) items.push({ k: 'stripes', x: b.x, y: b.y, w: b.w, h: b.h, on: b.slot });
    });
  } else {
    // split screen: lines over the background on the left, a solid block on the right
    const sx = W * random([0.5, 0.618, 0.382]);
    const right = random([0, 1, 2].filter((c) => c !== bgSlot));
    items.push({ k: 'block', x: 0, y: 0, w: sx, h: H, slot: 'bg' });
    items.push(lineNetwork(0, 0, sx, H, 'bg'));
    items.push({ k: 'block', x: sx, y: 0, w: W - sx, h: H, slot: right });
    if (random() > 0.5) items.push({ k: 'stripes', x: sx, y: 0, w: W - sx, h: H, on: right });
  }
  comp = { w: W, h: H, items };
}

function lineNetwork(x0, y0, w, h, on) {
  const n = floor(random(4, 8) * max(1, sqrt((w * h) / 320000)));
  const parts = [];
  for (let i = 0; i < n; i++) {
    const rx = x0 + floor(random(-2, w / GRID)) * GRID, ry = y0 + floor(random(-2, h / GRID)) * GRID;
    parts.push({ r: true, x: rx, y: ry, w: floor(random(3, 10)) * GRID, h: floor(random(3, 10)) * GRID });
    if (random() > 0.4) parts.push({ x1: x0, y1: ry, x2: x0 + w, y2: ry });
    if (random() > 0.4) parts.push({ x1: rx, y1: y0, x2: rx, y2: y0 + h });
  }
  return { k: 'lines', x: x0, y: y0, w, h, on, parts };
}

function segments(it) {
  if (it.k === 'lines') return it.parts;
  const out = [];
  for (let sx = it.x + STRIPE; sx < it.x + it.w; sx += STRIPE) out.push({ x1: sx, y1: it.y, x2: sx, y2: it.y + it.h });
  return out;
}

/* ---------- randomise ---------- */
function randomizeAll() {
  currentPaletteIndex = (currentPaletteIndex + 1) % palettes.length;
  newLayout(); redraw();
}
// a different palette, same layout
function randomizeColours() {
  currentPaletteIndex = random([...palettes.keys()].filter((i) => i !== currentPaletteIndex));
  redraw();
}
// a different background colour, everything else kept; a block that already had that colour takes the old one so neighbours never merge
function randomizeBackground() {
  const next = random([0, 1, 2].filter((c) => c !== bgSlot));
  for (const it of comp.items) {
    if (it.slot === next) it.slot = bgSlot;
    if (it.on === next) it.on = bgSlot;
  }
  bgSlot = next;
  redraw();
}

/* ---------- export ---------- */
function toSVG() {
  const pal = palettes[currentPaletteIndex], W = comp.w, H = comp.h;
  const f = (v) => +v.toFixed(2);
  const body = comp.items.map((it) => {
    if (it.k === 'block') return `<rect x="${f(it.x)}" y="${f(it.y)}" width="${f(it.w)}" height="${f(it.h)}" fill="${colourOf(it.slot, pal)}"/>`;
    const lines = segments(it).map((l) => l.r
      ? `<rect x="${f(l.x)}" y="${f(l.y)}" width="${f(l.w)}" height="${f(l.h)}"/>`
      : `<line x1="${f(l.x1)}" y1="${f(l.y1)}" x2="${f(l.x2)}" y2="${f(l.y2)}"/>`).join('');
    return `<g fill="none" stroke="${pal.safeLines[colourOf(it.on, pal)]}" stroke-width="${LINE_W}">${lines}</g>`;
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n  <defs><clipPath id="frame"><rect width="${W}" height="${H}"/></clipPath></defs>\n  <g clip-path="url(#frame)">\n  ${body}\n  </g>\n</svg>\n`;
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ---------- right-hand panel ---------- */
function buildPanel() {
  const p = ExportKit.panel('Palette Compositions');
  const sec = document.createElement('section');
  sec.className = 'xk';
  sec.innerHTML = `<div class="xk-h">Randomise</div>
    <button type="button" class="xk-btn" data-act="colour">Colour only</button>
    <button type="button" class="xk-btn ghost" data-act="bg">Background only</button>
    <button type="button" class="xk-btn ghost" data-act="all">New layout</button>`;
  const ex = document.createElement('section');
  ex.className = 'xk';
  ex.innerHTML = `<div class="xk-h">Export</div>
    <div class="xk-btns"><button type="button" class="xk-btn" data-act="svg">SVG</button><button type="button" class="xk-btn" data-act="png">PNG</button></div>
    <div class="xk-status" role="status"></div>`;
  p.append(sec, ex);
  const status = ex.querySelector('.xk-status');
  const say = (t) => { status.textContent = t; clearTimeout(say.t); say.t = setTimeout(() => { status.textContent = ''; }, 2200); };
  p.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'colour') randomizeColours();
    else if (act === 'bg') randomizeBackground();
    else if (act === 'all') randomizeAll();
    else {
      // the walkthrough demo's clicks are untrusted: show the step, never download
      const name = `palette-composition.${act}`;
      if (!e.isTrusted) { say(`${act.toUpperCase()} ready`); return; }
      if (act === 'svg') download(new Blob([toSVG()], { type: 'image/svg+xml' }), name);
      else document.querySelector('canvas').toBlob((blob) => blob && download(blob, name), 'image/png');
      say(`Saved ${name}`);
    }
  });
}

function mousePressed(e) {
  if (e && e.target && e.target.tagName !== 'CANVAS') return;   // clicks on the panel are not canvas clicks
  randomizeAll();
}

function windowResized() {
  resizeCanvas(...ExportKit.size());
  newLayout();
  redraw();
}
