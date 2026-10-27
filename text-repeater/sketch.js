const BG = '#4131f1';
const FG = '#b4aaff';
const FRAME_W = 413.55;
const FRAME_H = 162;
const MARGIN = 28;         // free space kept at each side of it (Figma units)
const CENTER_X = 207.9;
const GROW = 1.3;          // size ratio between neighbouring lines
const BEAT_MS = 2600;      // one pulse / ripple cycle
const PULSE = 0.07;        // how much the middle swells at the peak of a pulse
const RIPPLE_LAG = 0.07;   // delay between neighbouring lines (fraction of a beat)
const RIPPLE_MAX_LAG = 0.5;
const FONT_URL = 'https://fonts.gstatic.com/s/bbhbartle/v1/zYXjKVYuMYMaN-IMqP3RSm4.ttf';

// The middle block, one word per line (Figma group 1597882000, size 22.5).
// Line pitch is 21 units like the Figma lines; the block is centred on the
// frame. Each line gets a background panel 1.1 x its font size tall.
const MIDDLE_LINES = ['STANDOUT', 'DESIGN', 'AWARD'];
const TOP_WORD = 'STANDOUT';    // radiates upward
const BOTTOM_WORD = 'AWARD';    // radiates downward
const MIDDLE_TOP = 53;   // top of the first line's box (block centred in frame)
const MIDDLE_PITCH = 21;

const BASE_SIZE = 22.5; // font size of the static middle group

let font = null;
const WIDTH_PER_SIZE = {};
let CAP = 0.7; // cap height / font size, measured once the font has loaded

// p5 2.0 removed preload(); load in setup() with a callback (works in 1.x too)
function setup() {
  createCanvas(windowWidth, windowHeight - NAV_H);
  pixelDensity(2);
  background(BG);
  loadFont(FONT_URL, f => {
    font = f;
    // natural width of each word per unit of font size
    textFont(font);
    textSize(100);
    for (const w of MIDDLE_LINES) WIDTH_PER_SIZE[w] = textWidth(w) / 100;
    // cap height (as a fraction of font size) = the visible height of the lines
    const m = drawingContext.measureText('H');
    CAP = m.actualBoundingBoxAscent > 0 ? m.actualBoundingBoxAscent / 100 : 0.7;
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - NAV_H);
}

function draw() {
  background(BG);
  if (!font) return;

  // scale from the middle text, not from the frame
  const widest = Math.max(...MIDDLE_LINES.map(w => WIDTH_PER_SIZE[w]));
  const k = width / (widest * BASE_SIZE + 2 * MARGIN);
  translate(width / 2 - CENTER_X * k, (height - FRAME_H * k) / 2);
  scale(k);

  // visible range above / below the frame, in Figma units
  const extra = Math.max(0, (height / k - FRAME_H) / 2);
  const beat = (millis() / BEAT_MS) % 1; // 0..1 within the current beat

  drawRadiating(extra, beat); // behind the middle, outermost line first
  drawMiddle(beat);
}

// the middle group swells quickly at the start of a beat, then settles
function drawMiddle(beat) {
  const w = beat < 0.4 ? Math.sin((Math.PI * beat) / 0.4) : 0;
  const m = 1 + PULSE * w;
  push();
  translate(MIDDLE_CX, MIDDLE_CY);
  scale(m);
  translate(-MIDDLE_CX, -MIDDLE_CY);
  drawBanner();
  pop();
}

const MIDDLE_CX = CENTER_X;
const MIDDLE_CY = MIDDLE_TOP + ((MIDDLE_LINES.length - 1) * MIDDLE_PITCH + 14) / 2; // centre of the block


// Radiating lines grow on a geometric ladder, size = BASE_SIZE * GROW^(i + phase),
// but they are STACKED with one constant gap between the visible letters
// (the same gap as between the middle lines), so spacing never grows with size:
//   top   : each line's top  = line below's top - GAP - its own cap height
//   bottom: each line's top  = line above's bottom + GAP
// Line 0 starts exactly on the middle line and travels out by one line-slot per
// beat, which makes every line land where the next one started (seamless).

// ease-out: a line leaps outward at the start of its move and settles
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Phase of line i within this beat. Inner lines start first and outer lines
// are delayed (up to RIPPLE_MAX_LAG), so the pulse travels outward; every line
// has finished its move by the end of the beat, which keeps the loop seamless.
function linePhase(i, beat) {
  const lag = Math.min(i * RIPPLE_LAG, RIPPLE_MAX_LAG);
  const t = Math.min(1, Math.max(0, (beat - lag) / (1 - RIPPLE_MAX_LAG)));
  return easeOutCubic(t);
}

// distance from a line's box top (what figmaText takes) to the top of its caps
function inkOffset(f, size) {
  return ((0.88 - f.asc - f.desc) / 2 + f.asc - CAP) * size;
}

function fontMetrics() {
  const f = font.font || font.data;
  if (f && f.unitsPerEm) {
    return { asc: f.ascender / f.unitsPerEm, desc: -f.descender / f.unitsPerEm };
  }
  return { asc: textAscent() / GLYPH_REF, desc: textDescent() / GLYPH_REF };
}

function drawRadiating(extra, beat) {
  const fm = fontMetrics();
  const GAP = MIDDLE_PITCH - CAP * BASE_SIZE; // gap between middle lines' letters
  const capB = CAP * BASE_SIZE;

  // visible letter tops of the first and last middle line
  const firstTop = MIDDLE_TOP + inkOffset(fm, BASE_SIZE);
  const lastTop = firstTop + (MIDDLE_LINES.length - 1) * MIDDLE_PITCH;

  noStroke();
  fill(FG);

  // above: STANDOUT, stacked upward
  let top = 0;
  for (let i = 0; i < 80; i++) {
    const p = linePhase(i, beat);
    const size = BASE_SIZE * Math.pow(GROW, i + p);
    if (i === 0) {
      top = firstTop - (GAP + CAP * BASE_SIZE * GROW) * p; // slides one slot out
    } else {
      top = top - GAP - CAP * size;
    }
    figmaText(TOP_WORD, CENTER_X, top - inkOffset(fm, size), 0, size);
    if (top < -extra - 1) break;
  }

  // below: AWARD, stacked downward
  let prevBottom = 0;
  for (let i = 0; i < 80; i++) {
    const p = linePhase(i, beat);
    const size = BASE_SIZE * Math.pow(GROW, i + p);
    if (i === 0) {
      top = lastTop + (capB + GAP) * p;
    } else {
      top = prevBottom + GAP;
    }
    prevBottom = top + CAP * size;
    figmaText(BOTTOM_WORD, CENTER_X, top - inkOffset(fm, size), 0, size);
    if (top > FRAME_H + extra + 1) break;
  }
}

// the static middle block, in Figma units
function drawBanner() {
  noStroke();
  const lines = MIDDLE_LINES.map((str, i) => ({
    str,
    y: MIDDLE_TOP + i * MIDDLE_PITCH,
    w: WIDTH_PER_SIZE[str] * BASE_SIZE
  }));

  fill(BG);
  for (const l of lines) rect(CENTER_X - l.w / 2, l.y - 0.1 * BASE_SIZE, l.w, 1.1 * BASE_SIZE);

  fill(FG);
  for (const l of lines) figmaText(l.str, CENTER_X, l.y, 0, BASE_SIZE);
}

// Figma places the first baseline inside a 0.88 line box, centred on the
// font's ascent + descent; text is centred horizontally in its box.
//
// The text is always set at one fixed size (GLYPH_REF) and sized with a
// transform instead. Changing textSize() every frame makes the browser
// re-rasterise and pixel-snap the glyphs, which is what made the radiating
// lines jitter; scaling a fixed size moves smoothly at sub-pixel precision.
const GLYPH_REF = 100;

function figmaText(str, x, y, w, size) {
  textFont(font);
  textSize(GLYPH_REF);
  textAlign(CENTER, BASELINE);

  // ascent / descent from the font file (opentype object differs by p5 version)
  const f = font.font || font.data;
  let asc, desc;
  if (f && f.unitsPerEm) {
    asc = f.ascender / f.unitsPerEm;
    desc = -f.descender / f.unitsPerEm;
  } else {
    asc = textAscent() / GLYPH_REF;
    desc = textDescent() / GLYPH_REF;
  }
  const baseline = y + (0.88 * size - (asc + desc) * size) / 2 + asc * size;

  push();
  translate(x + w / 2, baseline);
  scale(size / GLYPH_REF);
  text(str, 0, 0);
  pop();
}
