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

function setup() {
  createCanvas(windowWidth, windowHeight - NAV_H);
  noLoop(); 
  // New random composition and next palette every 2 seconds (click also advances the palette)
  setInterval(() => {
    currentPaletteIndex = (currentPaletteIndex + 1) % palettes.length;
    redraw();
  }, 2000);
}

function draw() {
  background(15);

  push();
  // scale the 800 x 400 composition down to fit narrow screens
  translate(width / 2, height / 2);
  scale(min(1, (width - 24) / 800));
  translate(-400, -200);
  
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, 800, 400);
  drawingContext.clip();
  
  generateComposition();
  
  drawingContext.restore();
  pop();
}

function generateComposition() {
  let palette = palettes[currentPaletteIndex];
  let compositionType = floor(random(3));

  // Pick a base background color
  let bgCol = random(palette.colors);
  // Look up the strictly safe contrast color for lines over this background
  let lineCol = palette.safeLines[bgCol];

  noStroke();
  fill(bgCol);
  rect(0, 0, 800, 400);

  if (compositionType === 0) {
    // Type 0: Full Line Network
    drawLineNetwork(0, 0, 800, 400, lineCol);
  } else if (compositionType === 1) {
    // Type 1: Color Grid 
    drawColorGrid(0, 0, 800, 400, palette);
  } else {
    // Type 2: Split Screen Hybrid
    let splitRatios = [0.5, 0.618, 0.382];
    let splitX = 800 * random(splitRatios);
    
    // Left side (Lines over Background)
    noStroke();
    fill(bgCol);
    rect(0, 0, splitX, 400);
    drawLineNetwork(0, 0, splitX, 400, lineCol);

    // Right side (Solid block using a DIFFERENT color from the bg)
    let rightBlockCol = random(palette.colors.filter(c => c !== bgCol));
    fill(rightBlockCol);
    noStroke();
    rect(splitX, 0, 800 - splitX, 400);
    
    // 50% chance to add stripes, strictly using the safe contrast color for rightBlockCol
    if (random() > 0.5) {
      drawStripes(splitX, 0, 800 - splitX, 400, palette.safeLines[rightBlockCol]);
    }
  }
}

function drawLineNetwork(startX, startY, w, h, lineCol) {
  stroke(lineCol);
  strokeWeight(2);
  noFill();
  
  let numRects = floor(random(4, 8));
  let gridSize = 40; 
  
  for (let i = 0; i < numRects; i++) {
    let rx = startX + floor(random(-2, w / gridSize)) * gridSize;
    let ry = startY + floor(random(-2, h / gridSize)) * gridSize;
    let rw = floor(random(3, 10)) * gridSize;
    let rh = floor(random(3, 10)) * gridSize;
    
    rect(rx, ry, rw, rh);
    
    if (random() > 0.4) {
      line(startX, ry, startX + w, ry); 
    }
    if (random() > 0.4) {
      line(rx, startY, rx, startY + h); 
    }
  }
}

function drawColorGrid(x, y, w, h, palette) {
  let ratios = random() > 0.5 ? [1/3, 2/3] : [0.382, 0.618];
  let splitX = w * ratios[floor(random(2))];
  let splitY = h * ratios[floor(random(2))];
  
  let blocks = [];
  
  // Assign colors while ensuring some variety in the grid
  let col1 = random(palette.colors);
  let col2 = random(palette.colors.filter(c => c !== col1));
  let col3 = random(palette.colors.filter(c => c !== col2));
  
  if (random() > 0.5) {
    blocks.push({ bx: 0, by: 0, bw: splitX, bh: h, col: col1 }); 
    blocks.push({ bx: splitX, by: 0, bw: w - splitX, bh: splitY, col: col2 }); 
    blocks.push({ bx: splitX, by: splitY, bw: w - splitX, bh: h - splitY, col: col3 }); 
  } else {
    blocks.push({ bx: 0, by: 0, bw: splitX, bh: splitY, col: col1 }); 
    blocks.push({ bx: 0, by: splitY, bw: splitX, bh: h - splitY, col: col2 }); 
    blocks.push({ bx: splitX, by: 0, bw: w - splitX, bh: h, col: col3 }); 
  }

  let stripedBlockIndex = floor(random(blocks.length));

  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i];
    
    noStroke();
    fill(b.col);
    rect(b.bx, b.by, b.bw, b.bh);
    
    // Stripes automatically pull from the safe contrast dictionary
    if (i === stripedBlockIndex) {
      drawStripes(b.bx, b.by, b.bw, b.bh, palette.safeLines[b.col]);
    }
  }
}

function drawStripes(x, y, w, h, stripeCol) {
  stroke(stripeCol);
  strokeWeight(2);
  let spacing = 8;
  for (let sx = x + spacing; sx < x + w; sx += spacing) {
    line(sx, y, sx, y + h);
  }
}

function mousePressed() {
  currentPaletteIndex = (currentPaletteIndex + 1) % palettes.length;
  redraw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - NAV_H);
  redraw();
}
