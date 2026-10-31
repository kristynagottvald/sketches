/**
 * BRAND MOTION SYSTEM & INTERACTIVE TOOLKIT
 * -------------------------------------------------------------
 * Target Font: Poppins (Loaded via Google Fonts)
 * Colors: Navy, Green Bean, Kale, Avocado, Matcha, Kiwi, Robin's Egg, Blueberry
 * -------------------------------------------------------------
 */

const COLORS = {
  navy:       '#0E3251',
  greenBean:  '#0F5A5C',
  kale:       '#1C8859',
  avocado:    '#9EC878',
  matcha:     '#8CE39B',
  kiwi:       '#EEFB71',
  robinsEgg:  '#D7F5FA',
  blueberry:  '#3FA0BE',
  white:      '#FFFFFF'
};

const BRAND_PALETTE = {
  'Kale': '#1C8859',
  'Green Bean': '#0F5A5C',
  'Avocado': '#9EC878',
  'Matcha': '#8CE39B',
  'Kiwi': '#EEFB71',
  'Robin\'s Egg': '#D7F5FA',
  'Blueberry': '#3FA0BE',
  'White': '#FFFFFF'
};

// Motion visual sits this fraction of the frame width left of centre
const VISUAL_OFFSET = 0.16;

const MOTIFS = ['Grow', 'Evolve', 'Orbit', 'Train', 'Stack', 'Micro', 'Macro'];
let currentMotif = 'Grow';

// Gap between the text's right edge and the viewport's right edge
const RIGHT_MARGIN = 80;

// Site header height; the sketch lives in a <main> below it
const HEADER_H = 60;

// UI Controls
let motifButtons = [];
let sliders = {};
let textInput;
let randColorBtn;
let paletteBox;
let paletteMenu;

// Colour palette: 3-5 slots, order matters.
//   slot 0 = background, slot 1 = text, slot 2 = period (Micro) + main motion colour,
//   slots 3+ = additional colours in the motion visual
const ALL_COLORS = Object.assign({ 'Navy': COLORS.navy }, BRAND_PALETTE);
const MIN_SLOTS = 3;
const MAX_SLOTS = 5;
const MAX_SLOTS_MORE = 8; // Orbit, Train and Evolve get extra slots, one per satellite / car / ring / disc
let lowerEls = [];
let paletteLowerTop = 0;
let paletteBaseH = 48;
const PALETTE_WRAP_H = 92;
const PAD = 14;          // inner padding of the settings boxes
const COL1 = 15 + PAD;   // left column x
const COL2 = 165;        // right column x
let paletteWrap;
let paletteWrapTop = 0;

function maxSlots() { return ['Orbit', 'Train', 'Evolve', 'Stack'].includes(currentMotif) ? MAX_SLOTS_MORE : MAX_SLOTS; }
let paletteSlots = ['Green Bean', 'White', 'Kiwi', 'Matcha'];
let dragSlot = -1;

function slotColor(i) { return ALL_COLORS[paletteSlots[min(i, paletteSlots.length - 1)]]; }
function motionColors() { return paletteSlots.slice(2).map(n => ALL_COLORS[n]); }
function satelliteColors() { return paletteSlots.length > 3 ? paletteSlots.slice(3).map(n => ALL_COLORS[n]) : [slotColor(2)]; }

// Interaction States
let isTextPickedUp = false;
let isPeriodPickedUp = false;
let isCirclePickedUp = false;
let showDeleteButton = false;

let textX = 0;
let textY = 0;
let periodX = 0;
let periodY = 0;
let periodOffX = 0;   // drag offset from the default spot beside the word
let periodOffY = 0;
let periodDragAnchorX = 0;
let periodDragAnchorY = 0;
let circleX = 0;
let circleY = 0;

// Time Tracker
let t = 0;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight - HEADER_H);
  cnv.parent(document.querySelector('main'));

  // Dynamically load Google Font 'Poppins'
  let fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  textFont('Poppins');
  createUI();

  // Keep the controls inside <main> so they sit below the site header with the canvas
  let main = document.querySelector('main');
  [...document.body.children]
    .filter(el => el.style.position === 'absolute' && el !== paletteMenu)
    .forEach(el => main.appendChild(el));

  placeTextFarRight();
}

// Pushes the text block to the far right of the viewport frame (right-aligned with a margin).
// The text is drawn centered on textX, so textX = right edge - margin - half the text width.
function placeTextFarRight() {
  let vpW = width - 370;
  let half = floor(vpW / 2);

  // Let POS X span the whole viewport
  sliders.posX.attribute('min', -half);
  sliders.posX.attribute('max', half);

  push();
  textSize(sliders.textSize.value());
  textStyle(BOLD);
  drawingContext.letterSpacing = sliders.tracking.value() + 'px';
  let tw = textWidth(textInput.value());
  drawingContext.letterSpacing = '0px';
  pop();

  let dx = (half - RIGHT_MARGIN - tw / 2) - textX;
  textX += dx;
  periodX += dx;
  sliders.posX.value(textX);

  if (!isCirclePickedUp) circleX = -floor(vpW * VISUAL_OFFSET);
}

function draw() {
  background(COLORS.navy);

  // Advance master time based on Speed slider
  let speed = sliders.speed.value();
  t += 0.01 * speed;

  // Sidebar Panel Background
  noStroke();
  fill(0, 50);
  rect(0, 0, 320, height + 10);

  // Header in Sidebar
  fill(COLORS.white);
  textSize(22);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("grubclub", 25, 22);

  fill(COLORS.robinsEgg);
  textSize(14);
  text("MOTION SYSTEM", 25, 56);

  // Canvas Viewport Frame Coordinates
  let vpX = 340;
  let vpY = 20;
  let vpW = width - 370;
  let vpH = height - 100;

  // Draw base background for the viewport card
  fill(slotColor(0));
  noStroke();
  rect(vpX, vpY, vpW, vpH, 16);

  // 1. MASKING SETUP FOR FRAME: Draw clipped frame
  push();
  beginClip({ rounded: true });
  rect(vpX, vpY, vpW, vpH, 16);
  endClip();

  // Translate to Viewport Center
  translate(vpX + vpW / 2, vpY + vpH / 2);

  // Render Active Motion Motif
  if (currentMotif !== 'Micro') {
    push();
    translate(circleX, circleY);
    switch(currentMotif) {
      case 'Grow':   drawGrow();   break;
      case 'Evolve': drawEvolve(); break;
      case 'Orbit':  drawOrbit();  break;
      case 'Train':  drawTrain(vpW, vpH);  break;
      case 'Stack':  drawStack();  break;
      case 'Macro':  drawMacro();  break;
    }
    pop();
  }

  // Render Text & Period (Attached for all except Micro)
  drawTextAndPeriod();

  // Draw Photoshop-style marching ants lasso selection outline & Delete button
  drawSelectionGuidesAndUI();

  pop(); // End Clip Context

  // Render Guidelines Footer below frame
  drawFooterInfo(vpX, vpY + vpH + 15, vpW);
}

// =============================================================
// INTERACTION & DELETE BUTTON LOGIC
// =============================================================

function mousePressed() {
  let vpX = 340;
  let vpY = 20;
  let vpW = width - 370;
  let vpH = height - 100;

  if (mouseX >= vpX && mouseX <= vpX + vpW && mouseY >= vpY && mouseY <= vpY + vpH) {
    let mX = mouseX - (vpX + vpW / 2);
    let mY = mouseY - (vpY + vpH / 2);

    let rawTxt = textInput.value();
    let txtSize = sliders.textSize.value();
    let tw = textWidth(rawTxt);

    let tLeft = textX - tw / 2;
    let tRight = textX + tw / 2;
    let tTop = textY - txtSize / 2;
    let tBottom = textY + txtSize / 2;

    // Check if Delete Button was clicked while active
    if (showDeleteButton) {
      let btnX = textX;
      let btnY = textY - txtSize - 20;
      if (mX >= btnX - 35 && mX <= btnX + 35 && mY >= btnY - 14 && mY <= btnY + 14) {
        textInput.value('');
        showDeleteButton = false;
        isTextPickedUp = false;
        isPeriodPickedUp = false;
        return;
      }
    }

    let distToPeriod = currentMotif === 'Micro' ? dist(mX, mY, periodX, periodY) : 999;
    let distToCircle = dist(mX, mY, circleX, circleY);

    if (!isTextPickedUp && !isPeriodPickedUp && !isCirclePickedUp) {
      if (currentMotif === 'Micro' && distToPeriod < Math.max(20, txtSize * 0.4)) {
        isPeriodPickedUp = true;
        showDeleteButton = true;
      } else if (mX >= tLeft && mX <= tRight && mY >= tTop && mY <= tBottom) {
        isTextPickedUp = true;
        showDeleteButton = true;
      } else if (distToCircle < 55 && currentMotif !== 'Micro') {
        isCirclePickedUp = true;
        showDeleteButton = false;
      } else {
        showDeleteButton = false;
      }
    } else {
      isTextPickedUp = false;
      isPeriodPickedUp = false;
      isCirclePickedUp = false;
    }
  } else {
    showDeleteButton = false;
  }
}

function mouseMoved() {
  let vpX = 340;
  let vpY = 20;
  let vpW = width - 370;
  let vpH = height - 100;

  let mX = mouseX - (vpX + vpW / 2);
  let mY = mouseY - (vpY + vpH / 2);

  if (isTextPickedUp) {
    let dx = mX - textX;
    let dy = mY - textY;
    textX = mX;
    textY = mY;
    periodX += dx;
    periodY += dy;
    sliders.posX.value(textX);
    sliders.posY.value(textY);
  }

  if (isPeriodPickedUp) {
    periodOffX += mX - periodX;
    periodOffY += mY - periodY;
    periodX = mX;
    periodY = mY;
  }

  if (isCirclePickedUp) {
    circleX = mX;
    circleY = mY;
  }
}

function drawSelectionGuidesAndUI() {
  let txtSize = sliders.textSize.value();
  let rawTxt = textInput.value();
  if (!rawTxt) return;

  let tw = textWidth(rawTxt);

  if (showDeleteButton) {
    // Draw Hovering Delete Button above text (Solid styling)
    let btnX = textX;
    let btnY = textY - txtSize - 22;

    push();
    translate(btnX, btnY);
    drawingContext.setLineDash([]); // solid line for button box
    fill(220, 50, 50);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, 70, 26, 6);

    fill(255);
    textSize(11);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("DELETE", 0, 0);
    pop();
  }

  // Photoshop-style Animated Marching Ants Lasso Selection (Medium Purple)
  push();
  drawingContext.setLineDash([5, 5]);
  drawingContext.lineDashOffset = -t * 25; // Animate dashes
  stroke('#9370DB'); // Medium Purple
  strokeWeight(2);
  noFill();

  if (isTextPickedUp) {
    rectMode(CENTER);
    rect(textX, textY, tw + 20, txtSize + 10, 4);
    rectMode(CORNER);
  }

  if (isPeriodPickedUp && currentMotif === 'Micro') {
    circle(periodX, periodY, Math.max(30, txtSize * 0.6));
  }

  if (isCirclePickedUp && currentMotif !== 'Micro') {
    circle(circleX, circleY, 90);
  }

  drawingContext.setLineDash([]); // Reset line dash
  pop();
}

// =============================================================
// TEXT & PERIOD RENDERING
// =============================================================

function drawTextAndPeriod() {
  let rawTxt = textInput.value();
  if (!rawTxt) return;

  let txtSize = sliders.textSize.value();
  let tracking = sliders.tracking.value();
  let leadingRatio = sliders.leading.value();

  if (currentMotif !== 'Micro') {
    // Attached mode: Render full string (e.g. "fullplate.") together
    push();
    translate(textX, textY);
    fill(slotColor(1));
    noStroke();
    textSize(txtSize);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    textLeading(txtSize * leadingRatio);

    drawingContext.letterSpacing = tracking + 'px';
    text(rawTxt, 0, 0);
    drawingContext.letterSpacing = '0px';
    pop();
  } else {
    // Micro mode: the period sits right after the word, on its baseline, and hops
    let baseTxt = rawTxt.endsWith('.') ? rawTxt.slice(0, -1) : rawTxt;
    let baselineY = textY + txtSize * 0.35;   // matches the word's baseline

    push();
    fill(slotColor(1));
    noStroke();
    textSize(txtSize);
    textStyle(BOLD);
    textAlign(CENTER, BASELINE);
    drawingContext.letterSpacing = tracking + 'px';
    let mainWidth = textWidth(baseTxt);
    text(baseTxt, textX, baselineY);
    drawingContext.letterSpacing = '0px';
    pop();

    // Rest position: right of the word, bottom edge of the dot on the baseline.
    // A drag only adds an offset, so the period always follows the word.
    let r = txtSize * 0.11;
    let restX = textX + mainWidth / 2 + r + txtSize * 0.06 + periodOffX;
    let restY = baselineY - r + periodOffY;
    periodX = restX;
    periodY = restY;

    // Soft hops with a different height each time; never goes below the rest line
    let freq = sliders.param1.value();
    let heightScale = sliders.param2.value() / 5;
    let phase = t * freq * 2.2;
    let idx = floor(phase);
    let f = phase - idx;
    let hopH = txtSize * (0.25 + 0.85 * bounceRand(idx)) * heightScale;
    let lift = hopH * sin(PI * f);

    // Squash on landing, slight stretch in the air; bottom edge stays anchored
    let nearFloor = pow(1 - sin(PI * f), 3);
    let squash = nearFloor * 0.28;
    let stretch = (1 - nearFloor) * 0.06 * (lift / max(hopH, 1));
    let sy = 1 - squash + stretch;
    let sx = 1 + squash * 0.8 - stretch * 0.5;

    let periodColor = lerpColor(color(slotColor(2)), color(slotColor(3)), (sin(t * 5) + 1) / 2);
    fill(periodColor);
    noStroke();
    ellipse(restX, restY + r - r * sy - lift, r * 2 * sx, r * 2 * sy);
  }
}

// Deterministic 0..1 per hop so every bounce gets its own height
function bounceRand(i) {
  let v = sin(i * 127.1 + 311.7) * 43758.5453;
  return v - floor(v);
}

// =============================================================
// MOTION MOTIF IMPLEMENTATIONS
// =============================================================

function drawGrow() {
  let scaleFactor = sliders.param1.value();
  let elasticity = sliders.param2.value();
  let loopPhase = (t % TWO_PI);

  let baseR = 110 * scaleFactor;
  let pulse = sin(loopPhase * elasticity) * 35;

  noStroke();
  fill(slotColor(2));
  circle(0, 0, baseR + pulse);
}

function drawEvolve() {
  let speed = sliders.param1.value();
  let ringCount = floor(sliders.param2.value());
  let palette = motionColors();

  for (let i = ringCount; i > 0; i--) {
    let phase = t * speed + i * 0.4;
    let colorIndex = floor(phase) % palette.length;
    let nextColorIndex = (colorIndex + 1) % palette.length;
    let lerpAmt = phase % 1;

    let col = lerpColor(color(palette[colorIndex]), color(palette[nextColorIndex]), lerpAmt);
    let r = i * 36;
    let morphScale = 1 + sin(t * 2 + i * 0.3) * 0.15;

    fill(col);
    noStroke();
    circle(0, 0, r * 2 * morphScale);
  }
}

function drawOrbit() {
  let radius = sliders.param1.value() * 100;
  let count = floor(sliders.param2.value());

  fill(slotColor(2));
  circle(0, 0, 70);

  let cols = satelliteColors();
  for (let i = 0; i < count; i++) {
    let angle = t + (TWO_PI / count) * i;
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;

    fill(cols[i % cols.length]);
    noStroke();
    circle(x, y, 32);
  }
}

function drawTrain(vpW, vpH) {
  let count = floor(sliders.param1.value());
  let gap = sliders.param2.value() * 40;

  let circleR = 40;
  let totalWidth = count * (circleR * 2) + (count - 1) * gap;
  let startX = -totalWidth / 2 + circleR;
  let offsetX = (t * 120) % (circleR * 2 + gap);
  let cols = motionColors();

  for (let i = -1; i <= count; i++) {
    let x = startX + i * (circleR * 2 + gap) + offsetX;
    fill(cols[Math.abs(i) % cols.length]);
    noStroke();
    circle(x, 0, circleR * 2);
  }
}

function drawStack() {
  let offset = sliders.param1.value() * 60;
  let count = floor(sliders.param2.value());
  let cols = motionColors();
  let startX = -((count - 1) * offset) / 2;

  for (let i = 0; i < count; i++) {
    let bounce = sin(t * 3 + i * 0.4) * 15;
    let x = startX + i * offset;
    let y = bounce;

    fill(cols[i % cols.length]);
    noStroke();
    circle(x, y, 90);
  }
}

function drawMacro() {
  let zoom = sliders.param1.value();
  let speed = sliders.param2.value();

  let cycle = (sin(t * speed) + 1) / 2;
  let currentDiameter = lerp(120, 1100 * zoom, cycle);

  fill(slotColor(2));
  noStroke();
  circle(0, 0, currentDiameter);
}

// =============================================================
// UI CREATION & STYLING
// =============================================================

function createUI() {
  let startY = 84;

  // Motif Selector Buttons
  MOTIFS.forEach((motif, index) => {
    let btn = createButton(motif);
    btn.position(15, startY + index * 30);
    btn.size(290, 26);
    styleButton(btn, motif === currentMotif);

    btn.mousePressed(() => {
      currentMotif = motif;
      if (paletteSlots.length > maxSlots()) paletteSlots.length = maxSlots();
      renderPalette();
      updateButtonStyles();
      updateSliderLabels();
    });

    motifButtons.push({ name: motif, element: btn });
  });

  let uiY = startY + MOTIFS.length * 30 + 8;

  // ---- Wrapper 1: brand colour palette ----
  paletteWrap = makeWrapper(uiY, PALETTE_WRAP_H);

  createControlLabel("BRAND COLOR PALETTE", COL1, uiY + PAD);

  randColorBtn = createButton("RANDOMIZE");
  randColorBtn.position(COL1, uiY + PAD + 16);
  randColorBtn.size(74, 28);
  styleRandButton(randColorBtn);
  randColorBtn.mousePressed(randomizePalette);

  paletteBox = createDiv();
  paletteBox.position(COL1 + 82, uiY + PAD + 16);
  paletteBox.style('width', '180px');
  paletteBox.style('padding', '6px 6px 4px');
  paletteBox.style('box-sizing', 'border-box');
  paletteBox.style('border', '1px solid #8CE39B');
  paletteBox.style('border-radius', '4px');
  paletteBox.style('background', 'rgba(255,255,255,0.05)');
  paletteBox.style('display', 'flex');
  paletteBox.style('gap', '4px');
  paletteBox.style('min-height', '48px');
  paletteBox.style('flex-wrap', 'wrap');
  paletteBox.style('align-content', 'flex-start');

  paletteMenu = document.createElement('div');
  paletteMenu.style.cssText = 'position:fixed;z-index:20;display:none;background:#0E3251;border:1px solid #8CE39B;border-radius:6px;padding:4px;font:600 11px Poppins,sans-serif;max-height:70vh;overflow:auto;';
  document.body.appendChild(paletteMenu);
  document.addEventListener('mousedown', e => {
    if (!paletteMenu.contains(e.target) && !paletteBox.elt.contains(e.target)) closePaletteMenu();
  });
  renderPalette();

  // ---- Wrapper 2: text settings ----
  uiY += PALETTE_WRAP_H + 8;
  paletteLowerTop = uiY - 1;
  makeWrapper(uiY, 198);
  uiY += PAD;

  createControlLabel("TEXT CONTENT", COL1, uiY);
  textInput = createInput('fullplate.');
  textInput.position(COL1, uiY + 16);
  textInput.size(244, 22);
  styleInput(textInput);

  uiY += 58;

  createControlLabel("TEXT SIZE", COL1, uiY);
  sliders.textSize = createSlider(12, 120, 36, 1);
  sliders.textSize.position(COL1, uiY + 16);

  createControlLabel("TRACKING", COL2, uiY);
  sliders.tracking = createSlider(-2, 20, 0, 0.5);
  sliders.tracking.position(COL2, uiY + 16);

  uiY += 40;

  createControlLabel("LINE HEIGHT", COL1, uiY);
  sliders.leading = createSlider(0.8, 3.0, 1.2, 0.1);
  sliders.leading.position(COL1, uiY + 16);

  sliders.posXLabel = createControlLabel("POS X", COL2, uiY);
  sliders.posX = createSlider(-400, 400, 0, 1);
  sliders.posX.position(COL2, uiY + 16);
  sliders.posX.input(() => {
    let dx = sliders.posX.value() - textX;
    textX = sliders.posX.value();
    periodX += dx;
  });

  uiY += 40;

  sliders.posYLabel = createControlLabel("POS Y", COL1, uiY);
  sliders.posY = createSlider(-300, 300, 0, 1);
  sliders.posY.position(COL1, uiY + 16);
  sliders.posY.input(() => {
    let dy = sliders.posY.value() - textY;
    textY = sliders.posY.value();
    periodY += dy;
  });

  // ---- Wrapper 3: motion visual settings ----
  uiY += 16 + 16 + PAD + 8;
  makeWrapper(uiY, 100);
  uiY += PAD;

  createControlLabel("MOTION SPEED", COL1, uiY);
  sliders.speed = createSlider(0.1, 3.0, 1.0, 0.1);
  sliders.speed.position(COL1, uiY + 16);

  sliders.param1Label = createControlLabel("PARAM 1", COL2, uiY);
  sliders.param1 = createSlider(0.5, 2.5, 1.0, 0.05);
  sliders.param1.position(COL2, uiY + 16);

  uiY += 40;

  sliders.param2Label = createControlLabel("PARAM 2", COL1, uiY);
  sliders.param2 = createSlider(1, 10, 5, 1);
  sliders.param2.position(COL1, uiY + 16);

  let allSliders = selectAll('input');
  allSliders.forEach(s => {
    if (s.attribute('type') === 'range') {
      s.style('width', '126px');
    }
  });

  updateSliderLabels();

  // Everything in wrapper 2 moves down when the palette box grows to extra rows
  lowerEls = [...document.querySelectorAll('span, input, div')]
    .filter(el => el !== paletteMenu && el.style.position === 'absolute')
    .map(el => ({ el, top: parseFloat(el.style.top) }))
    .filter(o => o.top > paletteLowerTop);
  renderPalette();
}

// Slot labels are tied to the motif: BG / TEXT first, then the motif's own name numbered 1, 2, 3...
function slotRole(i) {
  if (i === 0) return 'BG';
  if (i === 1) return 'TEXT';
  switch (currentMotif) {
    case 'Orbit':  return i === 2 ? 'CORE' : 'SAT ' + (i - 2);
    case 'Train':  return 'CAR ' + (i - 1);
    case 'Evolve': return 'RING ' + (i - 1);
    case 'Stack':  return 'DISC ' + (i - 1);
    case 'Micro':  return i === 2 ? 'DOT' : 'MOT ' + (i - 2);
    default:       return i === 2 ? 'MAIN' : 'MOT ' + (i - 2);
  }
}

// Text colour is driven by the background: light bg -> dark green / navy, dark or medium bg -> white
function enforceTextContrast() {
  let c = color(slotColor(0));
  let lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4); };
  let lum = 0.2126 * lin(red(c)) + 0.7152 * lin(green(c)) + 0.0722 * lin(blue(c));
  if (lum > 0.4) {
    if (paletteSlots[1] !== 'Green Bean' && paletteSlots[1] !== 'Navy') paletteSlots[1] = 'Navy';
  } else {
    paletteSlots[1] = 'White';
  }
}

function renderPalette() {
  enforceTextContrast();
  let box = paletteBox.elt;
  box.innerHTML = '';

  paletteSlots.forEach((name, i) => {
    let cell = document.createElement('div');
    cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;width:28px;';

    let sw = document.createElement('div');
    sw.title = slotRole(i) + ': ' + name + ' (click to change, drag to swap)';
    sw.draggable = true;
    sw.style.cssText = 'position:relative;width:28px;height:28px;border-radius:6px;cursor:grab;box-sizing:border-box;border:1px solid rgba(255,255,255,0.5);background:' + ALL_COLORS[name] + ';';
    sw.addEventListener('click', () => openPaletteMenu(sw, i));
    sw.addEventListener('dragstart', e => { dragSlot = i; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); closePaletteMenu(); });
    sw.addEventListener('dragover', e => { e.preventDefault(); sw.style.outline = '2px solid #EEFB71'; });
    sw.addEventListener('dragleave', () => { sw.style.outline = ''; });
    sw.addEventListener('drop', e => {
      e.preventDefault();
      if (dragSlot >= 0 && dragSlot !== i) {
        let tmp = paletteSlots[dragSlot];
        paletteSlots[dragSlot] = paletteSlots[i];
        paletteSlots[i] = tmp;
      }
      dragSlot = -1;
      renderPalette();
    });
    sw.addEventListener('dragend', () => { dragSlot = -1; renderPalette(); });

    if (paletteSlots.length > MIN_SLOTS) {
      let x = document.createElement('div');
      x.textContent = '×';
      x.title = 'Remove';
      x.style.cssText = 'position:absolute;top:-6px;right:-6px;width:13px;height:13px;border-radius:50%;background:#0E3251;color:#fff;border:1px solid #8CE39B;font:700 10px/11px Poppins,sans-serif;text-align:center;cursor:pointer;';
      x.addEventListener('click', e => { e.stopPropagation(); paletteSlots.splice(i, 1); closePaletteMenu(); renderPalette(); });
      sw.appendChild(x);
    }

    let lbl = document.createElement('div');
    lbl.textContent = slotRole(i);
    lbl.style.cssText = 'font:600 6px Poppins,sans-serif;letter-spacing:0.2px;white-space:nowrap;color:#8CE39B;';
    cell.appendChild(sw);
    cell.appendChild(lbl);
    box.appendChild(cell);
  });

  if (paletteSlots.length < maxSlots()) {
    let add = document.createElement('div');
    add.textContent = '+';
    add.title = 'Add colour';
    add.style.cssText = 'width:28px;height:28px;border-radius:6px;box-sizing:border-box;border:1px dashed #8CE39B;color:#8CE39B;font:600 16px/26px Poppins,sans-serif;text-align:center;cursor:pointer;';
    add.addEventListener('click', () => openPaletteMenu(add, -1));
    box.appendChild(add);
  }

  // Grow the box over extra rows and push the controls below it down
  let extra = max(0, box.offsetHeight - paletteBaseH);
  paletteWrap.style('height', (PALETTE_WRAP_H + extra) + 'px');
  lowerEls.forEach(o => { o.el.style.top = (o.top + extra) + 'px'; });
}

// index >= 0 replaces that slot's colour, -1 adds a new slot
function openPaletteMenu(anchor, index) {
  paletteMenu.innerHTML = '';
  Object.keys(ALL_COLORS).forEach(name => {
    let row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:4px;cursor:pointer;color:#D7F5FA;';
    row.addEventListener('mouseenter', () => { row.style.background = 'rgba(255,255,255,0.12)'; });
    row.addEventListener('mouseleave', () => { row.style.background = ''; });
    let dot = document.createElement('span');
    dot.style.cssText = 'width:14px;height:14px;border-radius:4px;border:1px solid rgba(255,255,255,0.4);background:' + ALL_COLORS[name] + ';';
    row.appendChild(dot);
    row.appendChild(document.createTextNode(name));
    row.addEventListener('click', () => {
      if (index >= 0) paletteSlots[index] = name;
      else if (paletteSlots.length < maxSlots()) paletteSlots.push(name);
      closePaletteMenu();
      renderPalette();
    });
    paletteMenu.appendChild(row);
  });
  let r = anchor.getBoundingClientRect();
  paletteMenu.style.left = r.left + 'px';
  paletteMenu.style.top = (r.bottom + 6) + 'px';
  paletteMenu.style.display = 'block';
}

function closePaletteMenu() {
  paletteMenu.style.display = 'none';
}

function randomizePalette() {
  paletteSlots = shuffle(Object.keys(ALL_COLORS)).slice(0, paletteSlots.length);
  closePaletteMenu();
  renderPalette();
}

// Rounded panel that groups a set of controls (created first so the controls sit on top)
function makeWrapper(y, h) {
  let w = createDiv();
  w.position(15, y);
  w.style('width', '290px');
  w.style('height', h + 'px');
  w.style('box-sizing', 'border-box');
  w.style('border', '1px solid rgba(140, 227, 155, 0.35)');
  w.style('border-radius', '14px');
  w.style('background', 'rgba(255, 255, 255, 0.04)');
  return w;
}

function createControlLabel(txt, x, y) {
  let lbl = createSpan(txt);
  lbl.position(x, y);
  lbl.style('color', '#8CE39B');
  lbl.style('font-family', 'Poppins, sans-serif');
  lbl.style('font-size', '10px');
  lbl.style('font-weight', '600');
  lbl.style('letter-spacing', '0.5px');
  return lbl;
}

function styleButton(btn, isActive) {
  btn.style('font-family', 'Poppins, sans-serif');
  btn.style('font-size', '12px');
  btn.style('font-weight', '600');
  btn.style('border-radius', '4px');
  btn.style('border', 'none');
  btn.style('cursor', 'pointer');
  btn.style('text-align', 'left');
  btn.style('padding-left', '12px');

  if (isActive) {
    btn.style('background-color', COLORS.kiwi);
    btn.style('color', COLORS.navy);
  } else {
    btn.style('background-color', 'rgba(255, 255, 255, 0.08)');
    btn.style('color', COLORS.robinsEgg);
  }
}

function styleInput(inp) {
  inp.style('font-family', 'Poppins, sans-serif');
  inp.style('font-size', '12px');
  inp.style('padding', '3px 8px');
  inp.style('border-radius', '4px');
  inp.style('border', '1px solid #8CE39B');
  inp.style('background', '#0E3251');
  inp.style('color', '#FFFFFF');
}

function styleSelect(sel) {
  sel.style('font-family', 'Poppins, sans-serif');
  sel.style('font-size', '11px');
  sel.style('font-weight', '600');
  sel.style('background-color', '#0E3251');
  sel.style('color', '#EEFB71');
  sel.style('border', '1px solid #8CE39B');
  sel.style('border-radius', '4px');
  sel.style('cursor', 'pointer');
}

function styleRandButton(btn) {
  btn.style('font-family', 'Poppins, sans-serif');
  btn.style('font-size', '10px');
  btn.style('font-weight', '700');
  btn.style('background-color', COLORS.matcha);
  btn.style('color', COLORS.navy);
  btn.style('border', 'none');
  btn.style('border-radius', '4px');
  btn.style('cursor', 'pointer');
}

function updateButtonStyles() {
  motifButtons.forEach(b => {
    styleButton(b.element, b.name === currentMotif);
  });
}

function updateSliderLabels() {
  switch(currentMotif) {
    case 'Grow':
      sliders.param1Label.html("SCALE FACTOR");
      sliders.param2Label.html("ELASTICITY");
      break;
    case 'Evolve':
      sliders.param1Label.html("COLOR SPEED");
      sliders.param2Label.html("RING COUNT");
      break;
    case 'Orbit':
      sliders.param1Label.html("ORBIT RADIUS");
      sliders.param2Label.html("SATELLITE COUNT");
      break;
    case 'Train':
      sliders.param1Label.html("CIRCLE COUNT");
      sliders.param2Label.html("GAP SPACING");
      break;
    case 'Stack':
      sliders.param1Label.html("STACK OFFSET");
      sliders.param2Label.html("CIRCLE COUNT");
      break;
    case 'Micro':
      sliders.param1Label.html("BOUNCE SPEED");
      sliders.param2Label.html("BOUNCE HEIGHT");
      break;
    case 'Macro':
      sliders.param1Label.html("ZOOM MAGNITUDE");
      sliders.param2Label.html("EXPANSION SPEED");
      break;
  }
}

function drawFooterInfo(x, y, w) {
  fill(COLORS.robinsEgg);
  textSize(11);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text("GUIDELINE:", x, y);

  fill(COLORS.matcha);
  textStyle(NORMAL);
  let guidelines = {
    'Grow':   "One circle that gently grows and shrinks.",
    'Evolve': "Rings that slowly shift from one brand colour to the next.",
    'Orbit':  "Small circles circle a still centre at an even speed.",
    'Train':  "Circles move in a line to show progress or flow.",
    'Stack':  "Overlapping circles with a soft up-and-down bounce.",
    'Micro':  "Just the period, hopping softly after the word.",
    'Macro':  "One big circle grows to reveal the text."
  };


  textStyle(BOLD);
  let labelW = textWidth("GUIDELINE:");
  textStyle(NORMAL);
  text(guidelines[currentMotif], x + labelW + 8, y, w - labelW - 8);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - HEADER_H);
  placeTextFarRight();
}
