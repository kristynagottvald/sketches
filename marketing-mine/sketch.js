let gridElements = [];
let s = 58;
let cols, rows;
let totalMines;
let gameOver = false;
let gameWon = false;
let cellsRevealed = 0;
let highScore = 0;
let mineHitTime = 0;

let blocks1x1 = [];
let stickers = [];
let gift, diagonalblock, paleyellow, sunsticker, giftboxlong, diagonalblockpurple, yellow, starburststicker, salesticker;
let yellowhorz, yellowsalesticker, purpblock, salestickerpale;

let copyPieces = [
  {
    headline: "Weave direct mail into your omnichannel plan",
    paragraph: "Use QR codes and custom links to track engagement"
  },
  {
    headline: "Make your Black Friday direct mail shoppable with powerful CTAs",
    paragraph: "Create exclusive discounts for your lapsed customers"
  },
  {
    headline: "Get personal with your Black Friday direct mail",
    paragraph: "Use past purchases to suggest relevant products tailored to an individual's shopping habits"
  },
  {
    headline: "Combine direct mail with email",
    paragraph: "Send your customers an offer via email, and then follow it up with a direct mail piece straight to their mailbox"
  }
];
let copyIndex = 0;

let mineTipBgImg, mineTipObjImg, otherMinesImg, sunstickerImg, mineSpinImg;

function preload() {
  mineTipBgImg = loadImage('mine-tip0bg.png');
  mineTipObjImg = loadImage('mine-tip-object.png');
  otherMinesImg = loadImage('other-mines.png');
  sunstickerImg = loadImage('sunsticker.png');
  mineSpinImg = loadImage('mine-spin.png');

  diagonalblock = loadImage('diagonalblock.png');
  diagonalblockpurple = loadImage('diagonalblockpurple.png');
  gift = loadImage('gift.png');
  giftboxlong = loadImage('giftboxlong.png');
  paleyellow = loadImage('paleyellow.png');
  salesticker = loadImage('salesticker.png');
  starburststicker = loadImage('starburststicker.png');
  yellow = loadImage('yellow.png');
  yellowhorz = loadImage('yellowhorz.png');
  yellowsalesticker = loadImage('yellowsalesticker.png');
  purpblock = loadImage('purpblock.png');
  salestickerpale = loadImage('salestickerpale.png');
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight - NAV_H);
  
  canvas.style('display', 'block');
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  
  canvas.elt.addEventListener('contextmenu', e => e.preventDefault());
  
  textFont('Arial');

  blocks1x1 = [diagonalblock, diagonalblockpurple, gift, paleyellow, yellow, yellowhorz, purpblock];
  stickers = [salesticker, starburststicker, sunsticker, yellowsalesticker, salestickerpale];

  calculateGrid();
  initGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - NAV_H);
  calculateGrid();
  initGame();
}

function calculateGrid() {
  rows = Math.floor(height / 58);
  if (rows < 1) rows = 1; 
  
  s = height / rows;
  
  cols = Math.floor((width * 0.75) / s);
  
  totalMines = Math.floor((cols * rows) * 0.15); 
}

function initGame() {
  gridElements = [];
  gameOver = false;
  gameWon = false;
  cellsRevealed = 0;

  for (let x = 0; x < cols; x++) {
    gridElements[x] = [];
    for (let y = 0; y < rows; y++) {
      gridElements[x][y] = {
        x: x,
        y: y,
        isMine: false,
        revealed: false,
        flagged: false,
        isClickedMine: false,
        neighborCount: 0
      };
    }
  }

  let minesPlanted = 0;
  while (minesPlanted < totalMines) {
    let rx = Math.floor(random(cols));
    let ry = Math.floor(random(rows));
    if (!gridElements[rx][ry].isMine) {
      gridElements[rx][ry].isMine = true;
      minesPlanted++;
    }
  }

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (!gridElements[x][y].isMine) {
        gridElements[x][y].neighborCount = countNeighbors(x, y);
      }
    }
  }

  generateRandomComposition();
}

function countNeighbors(x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let nx = x + i;
      let ny = y + j;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        if (gridElements[nx][ny].isMine) {
          count++;
        }
      }
    }
  }
  return count;
}

// Touch screens have no right click: a quick tap reveals a cell, a long press flags it
const TOUCH = matchMedia('(pointer: coarse)').matches;
let pressStart = 0;
function mousePressed() {
  if (TOUCH && !(gameOver || gameWon)) { pressStart = millis(); return false; }
  act(mouseButton === RIGHT ? RIGHT : LEFT);
}
function mouseReleased() {
  if (!TOUCH || pressStart === 0) return;
  const long = millis() - pressStart >= 450;
  pressStart = 0;
  act(long ? RIGHT : LEFT);
  return false;
}

function act(button) {
  if (gameOver || gameWon) {
    initGame(); 
    return;
  }

  if (mouseX >= cols * s) return;

  let x = Math.floor(mouseX / s);
  let y = Math.floor(mouseY / s);

  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    let cell = gridElements[x][y];

    if (button === RIGHT) {
      if (!cell.revealed) {
        cell.flagged = !cell.flagged;
      }
    } 
    else if (button === LEFT) {
      if (!cell.flagged && !cell.revealed) {
        if (cell.isMine) {
          cell.isClickedMine = true;
          triggerGameOver();
        } else {
          revealCell(x, y);
          checkWinCondition();
        }
      }
    }
  }
}

function revealCell(x, y) {
  if (x < 0 || x >= cols || y < 0 || y >= rows) return;
  
  let cell = gridElements[x][y];
  
  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  cellsRevealed++;

  if (cellsRevealed > highScore) {
    highScore = cellsRevealed;
  }

  if (cell.neighborCount === 0) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        revealCell(x + i, y + j);
      }
    }
  }
}

function triggerGameOver() {
  gameOver = true;
  mineHitTime = millis(); 
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let cell = gridElements[x][y];
      if (cell.isMine) {
        cell.revealed = true;
      }
    }
  }
  copyIndex = (copyIndex + 1) % copyPieces.length;
}

function checkWinCondition() {
  if (cellsRevealed === (cols * rows) - totalMines) {
    gameWon = true;
    gameOver = true; 
    mineHitTime = millis(); 
  }
}

function drawSpacedText(str, x, y, letterSpacing = 1) {
  let textStr = String(str);
  let currentX = x;
  let align = textAlign().horizontal;

  if (align === CENTER) {
    let totalW = textWidth(textStr) + (textStr.length - 1) * letterSpacing;
    currentX = x - totalW / 2;
  } else if (align === RIGHT) {
    let totalW = textWidth(textStr) + (textStr.length - 1) * letterSpacing;
    currentX = x - totalW;
  }

  push();
  textAlign(LEFT, textAlign().vertical);
  for (let i = 0; i < textStr.length; i++) {
    let char = textStr.charAt(i);
    text(char, currentX, y);
    currentX += textWidth(char) + letterSpacing;
  }
  pop();
}

function draw() {
  background('#232746'); 

  let elapsed = millis() - mineHitTime;
  let animProgress = gameOver ? constrain(elapsed / 1000, 0, 1) : 1;
  let easeProgress = 1 - Math.pow(1 - animProgress, 3);
  
  let gameSpinAngle = -easeProgress * (TWO_PI * 5);

  let hyperSpeedFactor = Math.pow(1 - animProgress, 2) * 80; 
  let mediumSpeedFactor = millis() * 0.004; 
  let sidebarSpinAngle = -(hyperSpeedFactor + mediumSpeedFactor);

  let currentOpacity = gameOver ? map(animProgress, 0, 1, 0, 255) : 255;

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let cell = gridElements[x][y];
      let px = x * s;
      let py = y * s;

      stroke('#232746');
      strokeWeight(0.5);

      if (cell.revealed) {
        fill('#232746'); 
        rect(px, py, s, s); 

        if (cell.isMine) {
          if (cell.isClickedMine) {
            image(mineTipBgImg, px, py, s, s);
            push();
            translate(px + s / 2, py + s / 2);
            rotate(gameSpinAngle);
            tint(255, currentOpacity);
            imageMode(CENTER);
            image(mineTipObjImg, 0, 0, s, s);
            pop();
          } else {
            image(otherMinesImg, px, py, s, s);
          }
        } else if (cell.neighborCount > 0) {
          textAlign(CENTER, CENTER);
          textSize(s * 0.5);
          noStroke();
          
          let colors = ['#9E97EB', '#FBECBC', '#D045DC', '#D045DC', '#D045DC', '#D045DC', '#D045DC', '#D045DC'];
          fill(colors[cell.neighborCount - 1]);
          text(cell.neighborCount, px + s / 2, py + s / 2);
        }
      } else {
        fill('#4131F1');
        rect(px, py, s, s); 

        if (cell.flagged) {
          image(sunstickerImg, px, py, s, s);
        }
      }
    }
  }

  let activeTime = gameOver ? mineHitTime : millis();

  for (let el of aestheticElements) {
    let isHidden = false;
    let touchesRevealedMine = false;

    let checkCell = (x, y) => {
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        let cell = gridElements[x][y];
        if (cell.revealed) {
          if (cell.isMine) touchesRevealedMine = true;
          return true; 
        }
      }
      return false;
    };

    let baseRevealed = checkCell(el.gridX, el.gridY);
    let slideRevealed = el.hasSlide ? checkCell(el.gridX + el.slideDirX, el.gridY + el.slideDirY) : false;
    let giftRightRevealed = (el.type === 'giftboxlong') ? checkCell(el.gridX + 1, el.gridY) : false;

    if (baseRevealed || slideRevealed || giftRightRevealed) {
      isHidden = true;
    }

    if (el.type === 'block' && el.isDiagonal) {
      isHidden = false; 
    }

    if (touchesRevealedMine) {
      isHidden = true;
    }

    if (isHidden) continue;

    let cycleTime = 4000;
    let m = (activeTime + el.timeOffset) % cycleTime;
    let t = 0;
    let rotT = 0;
    
    if (m < 1000) {
      t = m / 1000;
      rotT = map(m, 0, 1000, 0, PI);
    } else if (m < 2000) {
      t = 1;
      rotT = PI;
    } else if (m < 3000) {
      t = 1 - ((m - 2000) / 1000);
      rotT = map(m, 2000, 3000, PI, TWO_PI);
    } else {
      t = 0;
      rotT = 0; 
    }
    
    let easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    let currX = el.gridX * s;
    let currY = el.gridY * s;
    
    if (el.hasSlide) {
      currX += el.slideDirX * s * easeT;
      currY += el.slideDirY * s * easeT;
    }

    let incomingSlideOpacity = 1.0;
    for (let other of aestheticElements) {
      if (other !== el && other.hasSlide) {
        if (other.gridX + other.slideDirX === el.gridX && other.gridY + other.slideDirY === el.gridY) {
          let mOther = (activeTime + other.timeOffset) % cycleTime;
          let tOther = 0;
          if (mOther < 1000) tOther = mOther / 1000;
          else if (mOther < 2000) tOther = 1;
          else if (mOther < 3000) tOther = 1 - ((mOther - 2000) / 1000);
          
          let easeOther = tOther < 0.5 ? 2 * tOther * tOther : 1 - Math.pow(-2 * tOther + 2, 2) / 2;
          incomingSlideOpacity = Math.min(incomingSlideOpacity, 1.0 - easeOther);
        }
      }
    }

    push();
    tint(255, 255 * incomingSlideOpacity);

    let activeImg = el.img1;
    if (el.isPurpleMorph && easeT > 0.5) {
      activeImg = purpblock;
    }

    if (el.type === 'giftboxlong') {
      image(giftboxlong, currX, currY, 2 * s, s);
    } else if (el.type === 'block') {
      if (el.isDiagonal) {
        push();
        translate(currX + s / 2, currY + s / 2);
        if (el.isFlipped) scale(-1, 1);
        
        if (el.isSwitching) {
          image(diagonalblock, -s / 2, -s / 2, s, s);
          push();
          tint(255, 255 * easeT * incomingSlideOpacity);
          image(diagonalblockpurple, -s / 2, -s / 2, s, s);
          pop();
        } else {
          image(activeImg, -s / 2, -s / 2, s, s);
        }
        pop();
      } else {
        image(activeImg, currX, currY, s, s);
      }
    }

    if (el.sticker) {
      let currentStickerImg = el.sticker;
      let isRotatable = (currentStickerImg === sunsticker || currentStickerImg === starburststicker);

      if (currentStickerImg === yellowsalesticker && easeT > 0.5) {
        currentStickerImg = salesticker;
      }

      let customScale = 0.95;
      if (currentStickerImg === sunsticker || currentStickerImg === salesticker || currentStickerImg === yellowsalesticker) {
        customScale = 1.02;
      }

      let aspect = currentStickerImg.width / (currentStickerImg.height || 1);
      let drawW, drawH;
      if (aspect >= 1) {
        drawW = s * customScale;
        drawH = (s / aspect) * customScale;
      } else {
        drawH = s * customScale;
        drawW = (s * aspect) * customScale;
      }

      if (isRotatable) {
        push();
        translate(currX + s / 2, currY + s / 2);
        rotate(rotT);
        imageMode(CENTER);
        image(currentStickerImg, 0, 0, drawW, drawH);
        pop();
      } else {
        let offsetX = (s - drawW) / 2;
        let offsetY = (s - drawH) / 2;

        if (currentStickerImg === salestickerpale) {
          let paleScale = 0.85;
          drawW = s * paleScale;
          drawH = (s / aspect) * paleScale;
          offsetX = (s - drawW) / 2;
          offsetY = (s - drawH) / 2;
        } else if (currentStickerImg === salesticker || currentStickerImg === yellowsalesticker) {
          offsetX -= s * 0.05;
          offsetY -= s * 0.05;
          drawW += 2;
          drawH += 2;
          offsetY += 1; 
        }
        image(currentStickerImg, currX + offsetX, currY + offsetY, drawW, drawH);
      }
    }
    pop();
  }

  let sidebarX = cols * s;
  let sidebarWidth = width - sidebarX;
  noStroke();
  fill('#232746');
  rect(sidebarX, 0, sidebarWidth, height);

  stroke(255, 60);
  strokeWeight(1);
  line(sidebarX, 0, sidebarX, height);

  let sideMargin = 24;
  let contentX = sidebarX + sideMargin;
  let contentWidth = sidebarWidth - sideMargin * 2;

  let scoreTopY = 40;

  noStroke();
  fill(255, 180);
  textFont('Arial');
  textStyle(NORMAL);
  textSize(11);
  textAlign(LEFT, TOP);
  drawSpacedText("CURRENT SCORE", contentX, scoreTopY, 1);

  fill(255);
  textSize(36);
  textStyle(NORMAL);
  drawSpacedText(cellsRevealed.toLocaleString('en-US'), contentX, scoreTopY + 18, 1);

  let highScoreY = scoreTopY + 85;
  fill(255, 180);
  textSize(11);
  textStyle(NORMAL);
  drawSpacedText("HIGH SCORE", contentX, highScoreY, 1);

  fill(255);
  textSize(36);
  textStyle(NORMAL);
  drawSpacedText(highScore.toLocaleString('en-US'), contentX, highScoreY + 18, 1);

  stroke(255, 60);
  strokeWeight(1);
  line(contentX, highScoreY + 75, sidebarX + sidebarWidth - sideMargin, highScoreY + 75);

  if (TOUCH && !gameOver) {
    noStroke(); fill(255, 140); textSize(10); textStyle(NORMAL); textAlign(LEFT, TOP);
    drawSpacedText("HOLD TO FLAG", contentX, highScoreY + 88, 1);
  }

  if (gameOver && !gameWon) {
    noStroke();
    textAlign(LEFT, TOP);

    let currentCopy = copyPieces[copyIndex];

    let labelText = "MARKETING MINE";
    let labelSize = 11;
    let labelHeight = labelSize; 
    let spacingAfterLabel = 28; 
    
    let headlineSize = 28;
    textStyle(BOLD);
    textSize(headlineSize);
    drawingContext.letterSpacing = "0px";
    let headlineHeight = textHeightMultiLine(currentCopy.headline, contentWidth, headlineSize);

    let spacingBetweenHeadlineAndPara = 20;

    let paraSize = 19;
    textStyle(NORMAL);
    textSize(paraSize);
    let paraHeight = textHeightMultiLine(currentCopy.paragraph, contentWidth, paraSize);

    let totalBlockHeight = labelHeight + spacingAfterLabel + headlineHeight + spacingBetweenHeadlineAndPara + paraHeight;

    let bottomPadding = 40;
    let startY = height - bottomPadding - totalBlockHeight;

    let minStartY = highScoreY + 100;
    if (startY < minStartY) startY = minStartY;

    let cursorY = startY;

    let iconSize = 12;
    let iconGap = 11; 
    push();
    
    let pulseFactor = map(sin(millis() * 0.005), -1, 1, 0.7, 1.0);
    tint(255, currentOpacity * pulseFactor);
    
    let imgCenterX = contentX + iconSize / 2;
    let imgCenterY = (cursorY + labelSize / 2) - 1; 
    
    translate(imgCenterX, imgCenterY);
    rotate(sidebarSpinAngle);
    imageMode(CENTER);
    image(mineSpinImg, 0, 0, iconSize, iconSize);
    pop();

    let labelColor = color('#D045DC');
    labelColor.setAlpha(currentOpacity);
    fill(labelColor);
    textStyle(BOLD);
    textSize(labelSize);
    let textStartX = contentX + iconSize + iconGap;
    drawSpacedTextWithAlpha(labelText, textStartX, cursorY, 2, currentOpacity);

    cursorY += labelHeight + spacingAfterLabel;

    let headlineColor = color(255, 255, 255, currentOpacity);
    fill(headlineColor);
    textStyle(BOLD);
    textSize(headlineSize);
    drawingContext.letterSpacing = "0px";
    text(currentCopy.headline, contentX, cursorY, contentWidth);

    cursorY += headlineHeight + spacingBetweenHeadlineAndPara;

    let paraColor = color(255, 255, 255, currentOpacity);
    fill(paraColor);
    textStyle(NORMAL);
    textSize(paraSize);
    text(currentCopy.paragraph, contentX, cursorY, contentWidth);
  }
}

let aestheticElements = [];

function generateRandomComposition() {
  aestheticElements = [];
  
  let grid = Array(cols).fill().map(() => Array(rows).fill(false));
  
  let totalCells = cols * rows;
  let targetFilled = floor(random(totalCells * 0.4, totalCells * 0.6)); 
  let filledCells = 0;
  
  let maxLongBoxes = floor(totalCells / 16); 
  let numLongBoxes = floor(random(maxLongBoxes * 0.5, maxLongBoxes));
  for (let i = 0; i < numLongBoxes; i++) {
    let rx = floor(random(cols - 1));
    let ry = floor(random(rows));
    if (!grid[rx][ry] && !grid[rx+1][ry]) {
      grid[rx][ry] = true;
      grid[rx+1][ry] = true;
      filledCells += 2;
      aestheticElements.push({ type: 'giftboxlong', gridX: rx, gridY: ry, timeOffset: random(4000) });
    }
  }
  
  let availableCells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[x][y]) availableCells.push({x, y});
    }
  }
  
  availableCells.sort(() => random() - 0.5);
  
  for (let i = 0; i < availableCells.length; i++) {
    if (filledCells >= targetFilled) break;
    
    let cell = availableCells[i];
    let x = cell.x, y = cell.y;
    
    grid[x][y] = true;
    filledCells++;
    
    if (random() < 0.2) {
      let standaloneSticker = random(stickers);
      aestheticElements.push({ type: 'standaloneSticker', sticker: standaloneSticker, gridX: x, gridY: y, timeOffset: random(4000) });
    } else {
      let img = random(blocks1x1);
      let el = { type: 'block', img1: img, gridX: x, gridY: y, timeOffset: random(4000) };
      
      if (img === diagonalblock || img === diagonalblockpurple) {
        el.isDiagonal = true;
        el.isSwitching = random() < 0.6;
      } else if (img === purpblock) {
        el.isPurpleMorph = true;
      }
      
      if (img !== yellowhorz) {
        let isYellowBlock = (img === yellow);
        let isPaleBlock = (img === paleyellow);
        let isGiftBlock = (img === gift);
        let isPurpleBlock = (img === purpblock);
        
        if (isYellowBlock || isPaleBlock || isPurpleBlock || isGiftBlock) {
           if (random() < 0.4) {
             let validStickers = stickers.filter(stk => {
               if (isPaleBlock && stk === sunsticker) return false;
               if (isYellowBlock && (stk === salesticker || stk === yellowsalesticker || stk === salestickerpale)) return false;
               if (isGiftBlock && stk === salestickerpale) return false;
               if (stk === yellowsalesticker && (isYellowBlock || isGiftBlock)) return false;
               if (isGiftBlock && (stk === salesticker || stk === sunsticker || stk === starburststicker)) return false;
               if (isPurpleBlock && stk === salesticker) return false;
               if (isPaleBlock && stk === salestickerpale) return false;
               return true;
             });
             
             if (validStickers.length > 0) el.sticker = random(validStickers);
           }
        }
      }
      aestheticElements.push(el);
    }
  }
  
  let nonSwitchingDiagonals = aestheticElements.filter(el => el.type === 'block' && el.isDiagonal && !el.isSwitching);
  nonSwitchingDiagonals.sort(() => random() - 0.5);
  let flipCount = Math.min(3, nonSwitchingDiagonals.length);
  for (let i = 0; i < flipCount; i++) {
    nonSwitchingDiagonals[i].isFlipped = true;
  }
  
  for (let el of aestheticElements) {
    if (el.type === 'block' && (el.img1 === yellow || el.img1 === paleyellow || el.img1 === purpblock || el.img1 === gift)) {
      let x = el.gridX;
      let y = el.gridY;
      let safeDirs = [];
      
      if (x > 0 && !grid[x - 1][y]) safeDirs.push({dx: -1, dy: 0});
      if (x < cols - 1 && !grid[x + 1][y]) safeDirs.push({dx: 1, dy: 0});
      if (y > 0 && !grid[x][y - 1]) safeDirs.push({dx: 0, dy: -1});
      if (y < rows - 1 && !grid[x][y + 1]) safeDirs.push({dx: 0, dy: 1});
      
      if (safeDirs.length > 0 && random() < 0.5) { 
        let d = random(safeDirs);
        el.hasSlide = true;
        el.slideDirX = d.dx;
        el.slideDirY = d.dy;
        
        grid[x + d.dx][y + d.dy] = true; 
      }
    }
  }
}

function drawSpacedTextWithAlpha(str, x, y, letterSpacing = 1, alphaVal = 255) {
  let textStr = String(str);
  let currentX = x;
  let align = textAlign().horizontal;

  if (align === CENTER) {
    let totalW = textWidth(textStr) + (textStr.length - 1) * letterSpacing;
    currentX = x - totalW / 2;
  } else if (align === RIGHT) {
    let totalW = textWidth(textStr) + (textStr.length - 1) * letterSpacing;
    currentX = x - totalW;
  }

  push();
  textAlign(LEFT, textAlign().vertical);
  for (let i = 0; i < textStr.length; i++) {
    let char = textStr.charAt(i);
    let c = color('#D045DC');
    c.setAlpha(alphaVal);
    fill(c);
    text(char, currentX, y);
    currentX += textWidth(char) + letterSpacing;
  }
  pop();
}

function textHeightMultiLine(str, maxW, tSize) {
  textSize(tSize);
  let words = str.split(' ');
  let line = '';
  let linesCount = 1;
  let lineH = tSize * 1.3; 

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + ' ';
    let testW = textWidth(testLine);
    if (testW > maxW && i > 0) {
      line = words[i] + ' ';
      linesCount++;
    } else {
      line = testLine;
    }
  }
  return linesCount * lineH;
}
