let stack;

// UI Controls
let curveSpreadSlider, floatSlider, densitySlider, randomizeBtn;
let pointToggles = [];
let uiContainer;
let panelBtn, panelOpen = false;

// Waypoint configuration structure with wide randomizable offsets
let baseWaypoints;
let currentOffsets;

function setup() {
  createCanvas(windowWidth, windowHeight - NAV_H);
  
  // Initialize base layout positions (percentages of width/height)
  baseWaypoints = [
    { xPct: -0.5, yPct: 0.25, label: "Control 1" },    // [0]
    { xPct: -0.1, yPct: 0.25, label: "1. Start Left" },  // [1]
    { xPct: 0.25, yPct: 0.8,  label: "2. Bottom Left" }, // [2]
    { xPct: 0.50, yPct: 0.4,  label: "3. Middle" },      // [3]
    { xPct: 0.80, yPct: 0.8,  label: "4. Bottom Right" },// [4]
    { xPct: 0.85, yPct: -0.5, label: "5. Top Exit" },    // [5]
    { xPct: 0.85, yPct: -1.0, label: "Control 2" }     // [6]
  ];
  
  // Initialize zeroed random offsets
  currentOffsets = baseWaypoints.map(() => ({ x: 0, y: 0 }));

  // Initialize the stack (Type 2 / Green isolated default)
  stack = new MailStack(2);

  // --- UI Setup ---
  uiContainer = createDiv('');
  uiContainer.position(20, NAV_H + 20);
  uiContainer.style('font-family', 'sans-serif');
  uiContainer.style('color', 'white');
  uiContainer.style('background', 'rgba(0, 0, 0, 0.5)');
  uiContainer.style('padding', '15px');
  uiContainer.style('border-radius', '8px');
  uiContainer.style('max-width', '240px');
  
  // Curve Spread Slider
  createDiv('<b>Curve Spread Width</b>').parent(uiContainer).style('margin-bottom', '4px');
  curveSpreadSlider = createSlider(10, 200, 100); 
  curveSpreadSlider.parent(uiContainer).style('margin-bottom', '10px');

  // Float Bobbing Motion Slider
  createDiv('<b>Float Intensity</b>').parent(uiContainer).style('margin-bottom', '4px');
  floatSlider = createSlider(0, 100, 20);
  floatSlider.parent(uiContainer).style('margin-bottom', '10px');

  // Density Slider
  createDiv('<b>Stack Density</b>').parent(uiContainer).style('margin-bottom', '4px');
  densitySlider = createSlider(10, 400, 200);
  densitySlider.parent(uiContainer).style('margin-bottom', '15px');

  // Point Density Toggles Header
  createDiv('<b>Point Density Boosters</b>').parent(uiContainer).style('margin-bottom', '6px');
  
  // Create checkboxes for visual waypoints 1 through 5
  for (let i = 1; i <= 5; i++) {
    let cb = createCheckbox(baseWaypoints[i].label, true);
    cb.parent(uiContainer);
    cb.style('margin-bottom', '4px');
    pointToggles.push(cb);
  }

  // Randomize Shape Button
  let spacer = createDiv('');
  spacer.parent(uiContainer);
  spacer.style('margin-bottom', '10px');

  randomizeBtn = createButton('Randomize Curve Shape');
  randomizeBtn.parent(uiContainer);
  randomizeBtn.style('width', '100%');
  randomizeBtn.style('padding', '8px');
  randomizeBtn.style('background', '#9DD437');
  randomizeBtn.style('border', 'none');
  randomizeBtn.style('border-radius', '4px');
  randomizeBtn.style('font-weight', 'bold');
  randomizeBtn.style('cursor', 'pointer');
  randomizeBtn.mousePressed(randomizeCurveShape);

  // On phones the controls sit in a sheet at the bottom, opened from a button
  panelBtn = createButton('Controls').parent(document.body);
  panelBtn.style('position', 'fixed').style('right', '12px').style('bottom', '12px').style('z-index', '11')
    .style('padding', '10px 16px').style('border-radius', '999px').style('border', 'none')
    .style('background', '#9DD437').style('color', '#1a1a1a').style('font-weight', 'bold').style('box-shadow', '0 4px 16px rgba(0,0,0,0.3)');
  panelBtn.mousePressed(() => { panelOpen = !panelOpen; panelBtn.html(panelOpen ? 'Close' : 'Controls'); layoutPanel(); });
  layoutPanel();
}

function layoutPanel() {
  if (windowWidth >= 700) {
    uiContainer.style('position', 'absolute').style('display', 'block').style('left', '20px').style('right', 'auto').style('bottom', 'auto')
      .style('max-width', '240px').style('max-height', 'none').style('overflow', 'visible');
    uiContainer.position(20, NAV_H + 20);
    panelBtn.hide();
    return;
  }
  panelBtn.show();
  uiContainer.style('position', 'fixed').style('left', '12px').style('right', '12px').style('top', 'auto').style('bottom', '62px')
    .style('max-width', 'none').style('max-height', '55vh').style('overflow', 'auto').style('display', panelOpen ? 'block' : 'none');
}

function randomizeCurveShape() {
  // Generate massive canvas-wide offsets so waypoints can overlap and cross over weirdly
  for (let i = 0; i < baseWaypoints.length; i++) {
    if (i === 0 || i === 6) {
      currentOffsets[i] = { x: 0, y: 0 };
    } else {
      currentOffsets[i] = {
        x: random(-width * 0.4, width * 0.4),
        y: random(-height * 0.5, height * 0.5)
      };
    }
  }
}

function draw() {
  background('#1E105C');
  stack.display();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - NAV_H);
  layoutPanel();
}

// --- MailStack Class ---
class MailStack {
  constructor(type) {
    this.type = type; 
    this.cardW = 340;
    this.cardH = 220;
  }

  getSplinePos(p, spreadScalar) {
    let wHalf = width / 2;
    let mapX = (percentX) => wHalf + (width * percentX - wHalf) * spreadScalar;

    let pts = baseWaypoints.map((pt, i) => {
      let px = mapX(pt.xPct) + currentOffsets[i].x;
      let py = (pt.yPct * height) + currentOffsets[i].y;
      return { x: px, y: py };
    });

    let numSegments = 4;
    p = constrain(p, 0, 0.9999);
    
    let segment = floor(p * numSegments) + 1;
    let localT = (p * numSegments) % 1.0;

    let p0 = pts[segment - 1];
    let p1 = pts[segment];
    let p2 = pts[segment + 1];
    let p3 = pts[segment + 2];

    let px = curvePoint(p0.x, p1.x, p2.x, p3.x, localT);
    let py = curvePoint(p0.y, p1.y, p2.y, p3.y, localT);
    
    return { x: px, y: py };
  }

  display() {
    let t = millis() * 0.001; 
    let layers = [];
    
    let currentDensity = densitySlider.value();
    let spreadScalar = curveSpreadSlider.value() / 100.0;
    let floatIntensity = floatSlider.value();

    let activeWeights = pointToggles.map(cb => cb.checked());

    // 1. Calculate progress with point-density weighting modifications
    for (let i = 0; i < currentDensity; i++) {
      let baseP = i / currentDensity;
      let warpedP = baseP;
      let numSegments = 4;
      let segIndex = floor(baseP * numSegments);
      
      let isSegActive = true;
      if (segIndex >= 0 && segIndex < activeWeights.length) {
        isSegActive = activeWeights[segIndex] || activeWeights[segIndex + 1];
      }

      if (!isSegActive) {
        warpedP = baseP * 0.8 + (segIndex / numSegments) * 0.2;
      }
      
      layers.push({ progress: warpedP, index: i });
    }

    // Sort back to front (1.0 is furthest back, 0.0 is closest)
    layers.sort((a, b) => b.progress - a.progress);

    // 2. Detect Hover Collision
    let hoveredIndex = -1;
    let baseScale = 0.5;
    let scaledW = this.cardW * baseScale;
    let scaledH = this.cardH * baseScale;

    for (let i = layers.length - 1; i >= 0; i--) {
      let p = layers[i].progress;
      let pos = this.getSplinePos(p, spreadScalar);
      
      pos.y += sin(t * 3.0 + p * TWO_PI * 4) * floatIntensity;

      let isWithinSafeBorder = (pos.x >= 50 && pos.x <= width - 50 && pos.y >= 50 && pos.y <= height - 50);

      if (
        isWithinSafeBorder &&
        mouseX > pos.x - scaledW / 2 && mouseX < pos.x + scaledW / 2 &&
        mouseY > pos.y - scaledH / 2 && mouseY < pos.y + scaledH / 2
      ) {
        hoveredIndex = i;
        break; 
      }
    }

    // 3. Render the cards
    for (let i = 0; i < layers.length; i++) {
      let p = layers[i].progress;
      let currentScale = baseScale;

      if (hoveredIndex !== -1) {
        let spacingP = 0.025; 
        
        if (i < hoveredIndex) {
          p += spacingP;
        } else if (i > hoveredIndex) {
          p -= spacingP;
        } else {
          currentScale = 0.55; 
        }
      }

      let pos = this.getSplinePos(p, spreadScalar);
      pos.y += sin(t * 3.0 + p * TWO_PI * 4) * floatIntensity;

      push();
      translate(pos.x, pos.y);
      scale(currentScale);
      
      let renderType = (hoveredIndex === i) ? this.type : 0;
      drawCard(this.cardW, this.cardH, renderType, t);
      
      pop();
    }
  }
}

// --- Postcard & Visual Rendering Functions ---

function drawCard(w, h, type, t) {
  noStroke();
  rectMode(CENTER);

  if (type === 1) {
    fill('#EB5124');
    rect(0, 0, w, h);
    drawOrangeHeatmap(w, h, t);
  } else if (type === 2) {
    fill('#9DD437');
    rect(0, 0, w, h);
    drawGreenHeatmap(w, h, t);
  } else if (type === 3) {
    fill('#DEE936');
    rect(0, 0, w, h);
    drawYellowHeatmap(w, h, t);
  } else {
    fill('#4A2BC5');
    stroke('#1E105C');
    strokeWeight(1);
    rect(0, 0, w, h);
    noStroke();
  }
}

function drawOrangeHeatmap(w, h, t) {
  let ox = sin(t * 0.9) * 12;
  let oy = cos(t * 1.2) * 12;

  drawingContext.filter = 'blur(24px)';
  fill('#FDEB4D');

  rect(-w / 2 + 75 + ox, -h / 2 + 110 + oy, 110, 150, 20);
  rect(w / 2 - 80 - ox, -h / 2 + 100 - oy, 120, 130, 20);

  drawingContext.filter = 'none';
}

function drawGreenHeatmap(w, h, t) {
  let ox1 = sin(t * 0.8) * 15;
  let oy1 = cos(t * 1.1) * 15;
  let ox2 = cos(t * 1.3) * 15;
  let oy2 = sin(t * 0.7) * 15;

  drawingContext.filter = 'blur(30px)';
  fill('#D5E029');
  rect(-w / 2 + 110 + ox1, -h / 2 + 105 + oy1, 160, 120, 25);
  rect(w / 2 - 85 + ox2, h / 2 - 60 + oy2, 130, 100, 25);

  drawingContext.filter = 'blur(16px)';
  fill('#DD3D21');
  rect(-w / 2 + 105 + ox1 * 0.6, -h / 2 + 100 + oy1 * 0.6, 100, 60, 15);
  rect(w / 2 - 80 + ox2 * 0.6, h / 2 - 50 + oy2 * 0.6, 75, 45, 15);

  drawingContext.filter = 'none';
}

function drawYellowHeatmap(w, h, t) {
  let ox = cos(t * 1.4) * 10;
  let oy = sin(t * 1.1) * 10;

  drawingContext.filter = 'blur(22px)';
  fill('#C12F98');

  rect(-w / 2 + 65 + ox, -h / 2 + 110 + oy, 80, 160, 25);
  rect(w / 2 - 70 - ox, h / 2 - 40 - oy, 180, 60, 25);

  drawingContext.filter = 'none';
}
