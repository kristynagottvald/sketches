const BG_COLOR = '#4E3EC8'; // Deep blue/purple background
const PALETTE = [
  '#F15076', // Pink
  '#FECA4F', // Yellow
  '#6C5CE7', // Light purple / Periwinkle
  '#D045DC'  // Magenta
];
const TEXT_COLOR = '#FFFFFF'; // White text

let svgLines = [];

// Seed State - Controls path deterministic stability
let ribbonSeed;

// UI Elements
let uiPanel;
let bendSlider;
let loopSlider;
let thicknessSlider;
let spacingSlider;
let textInputArea;
let weightSelect;
let panelBtn, panelOpen = false;

function setup() {
  createCanvas(windowWidth, windowHeight - NAV_H);
  textAlign(CENTER, CENTER);
  
  ribbonSeed = floor(random(1000000)); // Initial unique layout seed
  
  buildUIPanel();
  noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - NAV_H);
  layoutPanel();
  drawArtwork();
}

// On phones the controls sit in a sheet at the bottom, opened from a button
function layoutPanel() {
  const phone = windowWidth < 700;
  if (!phone) {
    uiPanel.style('position', 'absolute').style('display', 'block').style('left', 'auto').style('bottom', 'auto')
      .style('width', '250px').style('max-height', 'none').style('overflow', 'visible');
    uiPanel.position(windowWidth - 290, NAV_H + 20);
    panelBtn.hide();
    return;
  }
  panelBtn.show();
  uiPanel.style('position', 'fixed').style('left', '12px').style('right', '12px').style('top', 'auto').style('bottom', '12px')
    .style('width', 'auto').style('max-height', '58vh').style('overflow', 'auto').style('display', panelOpen ? 'block' : 'none');
}

function buildUIPanel() {
  uiPanel = createDiv('');
  uiPanel.position(windowWidth - 290, NAV_H + 20);
  uiPanel.style('font-family', 'sans-serif');
  uiPanel.style('width', '250px');
  uiPanel.style('padding', '20px');
  uiPanel.style('background', 'rgba(255, 255, 255, 0.92)');
  uiPanel.style('backdrop-filter', 'blur(8px)');
  uiPanel.style('border-radius', '12px');
  uiPanel.style('border', '1px solid rgba(0,0,0,0.1)');
  uiPanel.style('box-shadow', '0 8px 32px rgba(0,0,0,0.15)');
  uiPanel.style('z-index', '10');

  createDiv('<b>🎀 Ribbon Controls</b>').parent(uiPanel).style('margin-bottom', '15px');

  // 1. Text Input Area (Multi-line)
  createDiv('Ribbon Text (One per line):').parent(uiPanel);
  textInputArea = createElement('textarea', 'POSTMARK AWARDS');
  textInputArea.parent(uiPanel);
  textInputArea.style('width', '90%');
  textInputArea.style('height', '50px');
  textInputArea.style('margin-top', '5px');
  textInputArea.style('margin-bottom', '10px');
  textInputArea.style('resize', 'vertical');
  textInputArea.style('font-family', 'sans-serif');
  textInputArea.style('padding', '5px');
  textInputArea.input(drawArtwork);

  // 2. Font Weight / Style Dropdown
  createDiv('Font Weight:').parent(uiPanel);
  weightSelect = createSelect().parent(uiPanel);
  weightSelect.style('width', '100%');
  weightSelect.style('padding', '5px');
  weightSelect.style('margin-top', '5px');
  weightSelect.style('margin-bottom', '15px');
  weightSelect.option('Normal (Arial)');
  weightSelect.option('Bold (Arial)');
  weightSelect.option('Black (Arial Black)');
  weightSelect.selected('Bold (Arial)');
  weightSelect.changed(drawArtwork);

  // 3. Chaos Amplitude / Bend
  createDiv('Path Chaos / Turn Sharpness:').parent(uiPanel);
  bendSlider = createSlider(10, 150, 50, 1).parent(uiPanel);
  bendSlider.style('width', '100%');
  bendSlider.input(drawArtwork);

  // 4. Noise Frequency / Wiggle
  createDiv('Wiggle Frequency:').parent(uiPanel).style('margin-top', '10px');
  loopSlider = createSlider(0.001, 0.03, 0.006, 0.001).parent(uiPanel);
  loopSlider.style('width', '100%');
  loopSlider.input(drawArtwork);

  // 5. Ribbon Thickness
  createDiv('Ribbon Thickness:').parent(uiPanel).style('margin-top', '10px');
  thicknessSlider = createSlider(25, 90, 55, 1).parent(uiPanel);
  thicknessSlider.style('width', '100%');
  thicknessSlider.input(drawArtwork);

  // 6. Letter Spacing (Kerning Adjustment)
  createDiv('Letter Spacing (Kerning):').parent(uiPanel).style('margin-top', '10px');
  spacingSlider = createSlider(-4, 25, 4, 0.5).parent(uiPanel);
  spacingSlider.style('width', '100%');
  spacingSlider.input(drawArtwork);

  // 7. Randomize Button
  let randBtn = createButton('🎲 Randomize Pattern').parent(uiPanel);
  randBtn.style('margin-top', '20px');
  randBtn.style('width', '100%');
  randBtn.style('padding', '10px');
  randBtn.style('cursor', 'pointer');
  randBtn.style('border-radius', '6px');
  randBtn.style('border', '1px solid #ccc');
  randBtn.style('background', '#f5f5f5');
  randBtn.style('font-weight', 'bold');
  randBtn.mousePressed(randomizePattern);

  // 8. Export SVG Button
  let expBtn = createButton('💾 Download SVG').parent(uiPanel);
  expBtn.style('margin-top', '10px');
  expBtn.style('width', '100%');
  expBtn.style('padding', '10px');
  expBtn.style('background', PALETTE[0]);
  expBtn.style('color', 'white');
  expBtn.style('border', 'none');
  expBtn.style('border-radius', '6px');
  expBtn.style('cursor', 'pointer');
  expBtn.style('font-weight', 'bold');
  expBtn.mousePressed(exportSVG);
  
  panelBtn = createButton('Controls').parent(document.body);
  panelBtn.style('position', 'fixed').style('right', '12px').style('bottom', '12px').style('z-index', '11')
    .style('padding', '10px 16px').style('border-radius', '999px').style('border', 'none')
    .style('background', '#fff').style('color', '#1a1a1a').style('font-weight', 'bold').style('box-shadow', '0 4px 16px rgba(0,0,0,0.2)');
  panelBtn.mousePressed(() => { panelOpen = !panelOpen; panelBtn.html(panelOpen ? 'Close' : 'Controls'); layoutPanel(); });
  layoutPanel();
  drawArtwork();
}

function randomizePattern() {
  ribbonSeed = floor(random(1000000));
  drawArtwork();
}

function draw() {
  // Driven by UI controls
}

function drawArtwork() {
  // Lock the seed so sliders don't scramble the composition path
  randomSeed(ribbonSeed);
  noiseSeed(ribbonSeed);

  background(BG_COLOR);

  let amplitude = bendSlider.value();
  let frequency = loopSlider.value();
  let thickness = thicknessSlider.value();
  let letterSpacing = spacingSlider.value();

  // Apply Font Styles from Dropdown
  let selectedWeight = weightSelect.value();
  let exportFontFamily = 'Arial';
  let exportFontWeight = 'normal';

  if (selectedWeight === 'Normal (Arial)') {
    textFont('Arial');
    textStyle(NORMAL);
    exportFontWeight = 'normal';
  } else if (selectedWeight === 'Bold (Arial)') {
    textFont('Arial');
    textStyle(BOLD);
    exportFontWeight = 'bold';
  } else if (selectedWeight === 'Black (Arial Black)') {
    textFont('Arial Black');
    textStyle(BOLD); 
    exportFontFamily = 'Arial Black';
    exportFontWeight = 'bold';
  }

  // Process the text input field
  let rawText = textInputArea.value();
  let textLines = rawText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  if (textLines.length === 0) {
    textLines = [" "];
  }

  let fontSz = thickness * 0.42;
  textSize(fontSz);

  svgLines = [];
  svgLines.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`);
  svgLines.push(`<rect width="100%" height="100%" fill="${BG_COLOR}"/>`);

  let numRibbons = 7;
  let cx = width / 2;
  let cy = height / 2;

  // Safety off-screen boundary margin so ribbon ends never peek into view
  let margin = max(thickness * 2.5, 150);

  for (let r = 0; r < numRibbons; r++) {
    let col = PALETTE[r % PALETTE.length];
    let baseTextStr = textLines[r % textLines.length];
    let ribbonText = baseTextStr + "    ";

    let rawPts = [];
    
    // Spawn point guaranteed to be outside the safety perimeter
    let side = floor(random(4));
    let x, y;
    if (side === 0) {       // Top
      x = random(-margin, width + margin);
      y = -margin;
    } else if (side === 1) { // Right
      x = width + margin;
      y = random(-margin, height + margin);
    } else if (side === 2) { // Bottom
      x = random(-margin, width + margin);
      y = height + margin;
    } else {                // Left
      x = -margin;
      y = random(-margin, height + margin);
    }

    // Aim toward central canvas zone
    let targetX = cx + random(-width * 0.25, width * 0.25);
    let targetY = cy + random(-height * 0.25, height * 0.25);
    let angle = atan2(targetY - y, targetX - x);

    let stepSize = 8; 
    let maxSteps = 8000; // Safeguard limit
    let hasEntered = false;

    for (let i = 0; i < maxSteps; i++) {
      rawPts.push({ x: x, y: y });

      // Detect when path enters visible canvas area
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        hasEntered = true;
      }

      // Exit condition: Stop ONLY after it has crossed the canvas AND left the outer margin
      if (hasEntered) {
        let isOffscreen = (x < -margin || x > width + margin || y < -margin || y > height + margin);
        if (isOffscreen) {
          break;
        }
      } else {
        // Soft pull toward center while outside before initial canvas entry
        let angleToCenter = atan2(cy - y, cx - x);
        let diff = angleToCenter - angle;
        while (diff > PI) diff -= TWO_PI;
        while (diff < -PI) diff += TWO_PI;
        angle += diff * 0.03;
      }

      // Perlin noise continuous turning
      let noiseVal = noise(i * frequency, r * 100);
      let turn = map(noiseVal, 0, 1, -1, 1);
      
      angle += turn * (amplitude * 0.0025);

      x += cos(angle) * stepSize;
      y += sin(angle) * stepSize;
    }

    if (rawPts.length < 2) continue;

    // Calculate exact cumulative path distances
    let path = [];
    let totalD = 0;
    path.push({ x: rawPts[0].x, y: rawPts[0].y, d: 0 });

    for (let i = 1; i < rawPts.length; i++) {
      let stepD = dist(rawPts[i - 1].x, rawPts[i - 1].y, rawPts[i].x, rawPts[i].y);
      totalD += stepD;
      path.push({ x: rawPts[i].x, y: rawPts[i].y, d: totalD });
    }

    // Query smooth path position & angle at any distance 'targetD'
    function getPathState(targetD) {
      targetD = constrain(targetD, 0, totalD);
      
      let low = 0, high = path.length - 1;
      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (path[mid].d < targetD) low = mid + 1;
        else high = mid - 1;
      }
      let idx = max(0, low - 1);
      if (idx >= path.length - 1) idx = path.length - 2;

      let p1 = path[idx];
      let p2 = path[idx + 1];
      let segLen = p2.d - p1.d;
      let t = segLen > 0 ? (targetD - p1.d) / segLen : 0;

      let x = lerp(p1.x, p2.x, t);
      let y = lerp(p1.y, p2.y, t);

      let delta = 12;
      let pBefore = getPosOnly(max(0, targetD - delta));
      let pAfter = getPosOnly(min(totalD, targetD + delta));
      let angle = atan2(pAfter.y - pBefore.y, pAfter.x - pBefore.x);

      return { x: x, y: y, angle: angle };
    }

    function getPosOnly(targetD) {
      targetD = constrain(targetD, 0, totalD);
      let low = 0, high = path.length - 1;
      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (path[mid].d < targetD) low = mid + 1;
        else high = mid - 1;
      }
      let idx = max(0, low - 1);
      if (idx >= path.length - 1) idx = path.length - 2;
      let p1 = path[idx];
      let p2 = path[idx + 1];
      let segLen = p2.d - p1.d;
      let t = segLen > 0 ? (targetD - p1.d) / segLen : 0;
      return { x: lerp(p1.x, p2.x, t), y: lerp(p1.y, p2.y, t) };
    }

    // Render continuous wavy ribbon line
    stroke(col);
    strokeWeight(thickness);
    strokeCap(ROUND);
    strokeJoin(ROUND);
    noFill();
    beginShape();
    for (let i = 0; i < path.length; i += 4) {
      vertex(path[i].x, path[i].y);
    }
    vertex(path[path.length - 1].x, path[path.length - 1].y);
    endShape();

    // Generate SVG path element
    let pathSvg = `M ${path[0].x.toFixed(2)} ${path[0].y.toFixed(2)}`;
    for (let i = 1; i < path.length; i += 4) {
      pathSvg += ` L ${path[i].x.toFixed(2)} ${path[i].y.toFixed(2)}`;
    }
    svgLines.push(`<path d="${pathSvg}" fill="none" stroke="${col}" stroke-width="${thickness}" stroke-linecap="round" stroke-linejoin="round"/>`);

    // Layout letters along exact arc length
    let currentD = 20;
    let msgIdx = 0;

    while (currentD < totalD - 20) {
      let letter = ribbonText[msgIdx % ribbonText.length];
      let letterW = textWidth(letter);

      let charCenterD = currentD + letterW / 2;

      if (charCenterD < totalD - 10 && letter !== ' ') {
        let state = getPathState(charCenterD);
        if (state.x > -100 && state.x < width + 100 && state.y > -100 && state.y < height + 100) {
           drawAndExportChar(letter, state.x, state.y, state.angle, fontSz, exportFontFamily, exportFontWeight);
        }
      }

      currentD += letterW + letterSpacing;
      msgIdx++;
    }
  }

  svgLines.push('</svg>');
}

function drawAndExportChar(letter, x, y, angle, fontSz, fontFamily, fontWeight) {
  let yOffset = -fontSz * 0.05;

  push();
  translate(x, y);
  rotate(angle);
  fill(TEXT_COLOR);
  noStroke();
  text(letter, 0, yOffset);
  pop();

  let deg = angle * (180 / PI);
  let fSize = fontSz.toFixed(2);
  let yOffStr = yOffset.toFixed(2);

  svgLines.push(
    `<text x="0" y="${yOffStr}" transform="translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${deg.toFixed(2)})" ` +
    `fill="${TEXT_COLOR}" font-family="${fontFamily}" font-weight="${fontWeight}" font-size="${fSize}px" ` +
    `text-anchor="middle" dominant-baseline="central">${letter}</text>`
  );
}

function exportSVG() {
  saveStrings(svgLines, 'postmark_wavy_ribbon_text', 'svg');
}
