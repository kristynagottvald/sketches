let baseCellSize = 80; 
let cols, rows;
let cellSize;
let offsetX, offsetY;
let gridMap = [];
let overlayImages = {};

const layout = [
  ["#D768EB", "#D768EB", "#E6EB99", "#A48EFF", "#141735", "#D768EB", "#E6EB99", "#E6EB99", "#141735", "#E6EB99", "#FECA4F", "#C0CE00"],
  ["#D768EB", "#D768EB", "#FF6F5C", "#D768EB", "#141735", "0", "#C0CE00", "#141735", "#C0CE00", "#E6EB99", "0", "0"],
  ["#FECA4F", "#D768EB", "#FF6F5C", "#E6EB99", "#4131F1", "#141735", "#141735", "#A48EFF", "0", "#D768EB", "0", "1"],
  ["#A48EFF", "#A48EFF", "#141735", "#C0CE00", "#C0CE00", "#A48EFF", "#FF6F5C", "#D768EB", "#D768EB", "0", "#D768EB", "#141735"],
  ["#FECA4F", "#E6EB99", "#E6EB99", "#E6EB99", "#141735", "1", "#141735", "#4131F1", "0", "#141735", "#141735", "1"],
  ["#E6EB99", "#A48EFF", "#A48EFF", "#A48EFF", "#D768EB", "#FF6F5C", "1", "#D768EB", "#D768EB", "#E6EB99", "#C0CE00", "0"],
  ["#D768EB", "#D768EB", "#FECA4F", "#D768EB", "#D768EB", "#141735", "#E6EB99", "#4131F1", "#A48EFF", "#A48EFF", "#4131F1", "#FECA4F"]
];

const validColors = [...new Set(layout.flat().filter(item => item.startsWith("#") && item !== "#141735"))];

// Overlay PNGs load in the background, so the grid runs even before they are uploaded
const OVERLAY_FILES = {
  lightpurp: "lightpurp-small.png", limeLrg: "lime-larg.png", limeMed: "lime-med.png", limeSmall: "lime-small.png",
  purpLrg: "purp-lrg.png", purpMed: "purp-med.png", purpMed2: "purp-med2.png", purpSmall: "purp-small.png", redMed: "red-med.png"
};
function loadOverlays() {
  Object.keys(OVERLAY_FILES).forEach(k => {
    overlayImages[k] = null;
    loadImage(OVERLAY_FILES[k], img => { overlayImages[k] = img; }, () => {});
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight - NAV_H);
  textAlign(CENTER, CENTER);
  textStyle(NORMAL); 
  textFont('Arial'); 
  
  loadOverlays();
  updateGridDimensions();
}

function updateGridDimensions() {
  cellSize = min(baseCellSize, max(44, floor(width / 7)));   // about 7 columns across on a phone
  cols = max(1, floor(width / cellSize));
  rows = max(1, floor(height / cellSize));
  
  offsetX = (width - (cols * cellSize)) / 2;
  offsetY = (height - (rows * cellSize)) / 2;
  
  let imgKeys = Object.keys(overlayImages);
  gridMap = [];
  
  let sweep = map(mouseX, 0, width, 0, width + height);
  
  for (let j = 0; j < rows; j++) {
    let rowMap = [];
    for (let i = 0; i < cols; i++) {
      let cellData = layout[j % layout.length][i % layout[0].length];
      
      let textValue = (cellData === "0" || cellData === "1") ? cellData : (random() < 0.5 ? "0" : "1");
      let targetColor = (cellData.startsWith("#") && cellData !== "#141735") ? cellData : random(validColors);
      
      let pattern = null;
      if (random() < 0.6) {
        pattern = {
          key: random(imgKeys),
          flipX: random() < 0.5,
          flipY: random() < 0.5,
          dynamicOrientation: random() < 0.40, 
          lastOrientationChange: millis(),
          orientationInterval: random(2000, 5000) 
        };
      }
      
      let cellCenterX = offsetX + (i * cellSize) + (cellSize / 2);
      let cellCenterY = offsetY + (j * cellSize) + (cellSize / 2);
      
      // Determine if this cell is permanently colored (approx 20% chance)
      let isStaticColor = random() < 0.2;
      
      // If it's static, set initial angle to PI (colored side). Otherwise, check sweep.
      let initialAngle = isStaticColor ? PI : ((cellCenterX + cellCenterY) < sweep ? PI : 0);

      rowMap.push({
        color: targetColor,
        flipAngle: initialAngle,      
        textValue: textValue,
        pattern: pattern,
        dynamicColor: random() < 0.30,
        isStaticColor: isStaticColor,
        dynamicText: random() < 0.20 // 20% chance to be a flipping number
      });
    }
    gridMap.push(rowMap);
  }
}

function draw() {
  background("#141735"); 
  
  let flipSpeed = 0.15;
  
  let sweep = map(mouseX, 0, width, 0, width + height);
  
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let x = offsetX + (i * cellSize);
      let y = offsetY + (j * cellSize);
      let cellCenterX = x + cellSize / 2;
      let cellCenterY = y + cellSize / 2;
      let cell = gridMap[j][i];
      
      // Target angle is permanently PI if it's a static colored block.
      // Otherwise, it responds to the diagonal mouse sweep.
      let targetAngle = cell.isStaticColor ? PI : ((cellCenterX + cellCenterY) < sweep ? PI : 0);
      
      if (cell.flipAngle < targetAngle) {
        cell.flipAngle = min(cell.flipAngle + flipSpeed, PI);
      } else if (cell.flipAngle > targetAngle) {
        cell.flipAngle = max(cell.flipAngle - flipSpeed, 0);
      }
      
      push();
      translate(cellCenterX, cellCenterY);
      
      let scaleY = cos(cell.flipAngle);
      scale(1, abs(scaleY));
      
      let showDarkFace = cell.flipAngle < HALF_PI;
      
      noStroke();
      
      if (showDarkFace) {
        fill("#141735"); 
        rect(-cellSize / 2, -cellSize / 2, cellSize, cellSize);
        
        if (cell.textValue !== "") {
          
          // Randomly flip 0s and 1s based on probability
          if (cell.dynamicText && random() < 0.02) { 
            cell.textValue = cell.textValue === "0" ? "1" : "0";
          }

          fill("#E6EB99"); 
          textSize(cellSize * 0.7);
          text(cell.textValue, 0, cellSize * 0.05);
        }
      } else {
        let colorChangedThisFrame = false;
        if (cell.dynamicColor && random() < 0.003) {
          cell.color = random(validColors);
          colorChangedThisFrame = true;
        }
        
        fill(cell.color);
        rect(-cellSize / 2, -cellSize / 2, cellSize, cellSize);
        
        // width > 0 skips overlays whose PNG has not loaded
        if (cell.pattern && overlayImages[cell.pattern.key] && overlayImages[cell.pattern.key].width > 1) {
          if (cell.pattern.dynamicOrientation && !colorChangedThisFrame) {
            let now = millis();
            if (now - cell.pattern.lastOrientationChange > cell.pattern.orientationInterval) {
              if (random() < 0.5) {
                cell.pattern.flipX = !cell.pattern.flipX; 
              } else {
                cell.pattern.flipY = !cell.pattern.flipY; 
              }
              cell.pattern.lastOrientationChange = now;
              cell.pattern.orientationInterval = random(2000, 5000); 
            }
          }

          push();
          scale(cell.pattern.flipX ? -1 : 1, cell.pattern.flipY ? -1 : 1);
          image(overlayImages[cell.pattern.key], -cellSize / 2, -cellSize / 2, cellSize, cellSize);
          pop();
        }
      }
      pop();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - NAV_H);
  updateGridDimensions();
}
