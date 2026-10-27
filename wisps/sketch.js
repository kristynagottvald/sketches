let startX, startY;
let targetX, targetY;

let revealT = 1.0; // Progress of the reveal animation toward a new target (0 to 1)
let bgGraphics;    // Offscreen buffer for the blurred background

let wisps = []; 

function setup() {
  createCanvas(windowWidth, windowHeight - NAV_H);
  
  // Generate the Gaussian-blurred sky blue and green background
  updateBlurredBackground();
  
  // Set initial coordinates relative to the canvas size
  startX = width * 0.2;
  startY = height * 0.8;
  targetX = width * 0.8;
  targetY = height * 0.2;
  
  generateWisps(); 
}

function draw() {
  // Display the pre-blurred background image
  image(bgGraphics, 0, 0);
  
  // Smoothly advance the reveal progress toward 1.0 when a new target is clicked
  if (revealT < 1.0) {
    revealT += 0.015;
    if (revealT > 1.0) revealT = 1.0;
  }
  
  // Draw minimalist start and target nodes
  noStroke();
  fill(255, 255, 255, 120);
  ellipse(startX, startY, 10, 10);
  ellipse(targetX, targetY, 10, 10);
  fill(255);
  ellipse(startX, startY, 4, 4);
  ellipse(targetX, targetY, 4, 4);

  // Draw the asymmetrical network progressively
  noFill();
  strokeWeight(0.8); 
  
  for (let i = 0; i < wisps.length; i++) {
    let w = wisps[i];
    let currentAlpha = w.baseAlpha;
    
    // Apply smooth Perlin noise-based fading (60% coverage)
    if (w.isFading) {
      let noiseVal = noise(frameCount * 0.005 + w.noiseOffset);
      currentAlpha = map(noiseVal, 0, 1, 10, w.baseAlpha * 1.6); 
    }
    
    stroke(255, 255, 255, currentAlpha); 
    
    // Determine the draw range based on click-reveal and continuous trails
    let drawStart = 0;
    let drawEnd = revealT;
    
    if (w.isReveal && revealT >= 1.0) {
      // Continuous sliding light-trail effect once the main reveal finishes
      let cycle = (frameCount * 0.0035 + w.revealOffset) % 1.3;
      drawEnd = min(1.0, cycle);
      drawStart = max(0, cycle - 0.35);
      if (drawEnd <= drawStart) continue;
    }

    beginShape();
    let numSteps = 50; 
    for (let pt = 0; pt <= numSteps; pt++) {
      let progress = lerp(drawStart, drawEnd, pt / numSteps);
      
      let px, py;
      
      if (w.type === 'cornered') {
        // Piecewise function for true 90-degree rounded box shapes
        if (progress < 0.2) {
          let ptProgress = progress / 0.2; 
          let u = 1 - ptProgress;
          px = u * u * w.pA.x + 2 * u * ptProgress * w.pB.x + ptProgress * ptProgress * w.pC.x;
          py = u * u * w.pA.y + 2 * u * ptProgress * w.pB.y + ptProgress * ptProgress * w.pC.y;
        } else if (progress < 0.8) {
          let ptProgress = (progress - 0.2) / 0.6; 
          px = lerp(w.pC.x, w.pD.x, ptProgress);
          py = lerp(w.pC.y, w.pD.y, ptProgress);
        } else {
          let ptProgress = (progress - 0.8) / 0.2; 
          let u = 1 - ptProgress;
          px = u * u * w.pD.x + 2 * u * ptProgress * w.pE.x + ptProgress * ptProgress * w.pF.x;
          py = u * u * w.pD.y + 2 * u * ptProgress * w.pE.y + ptProgress * ptProgress * w.pF.y;
        }
      } else {
        // Standard Cubic Bézier function for smooth, S-shaped, or looped lines
        let u = 1 - progress;
        let tt = progress * progress;
        let uu = u * u;
        let uuu = uu * u;
        let ttt = tt * progress;
        
        px = uuu * startX + 3 * uu * progress * w.cp1x + 3 * u * tt * w.cp2x + ttt * targetX;
        py = uuu * startY + 3 * uu * progress * w.cp1y + 3 * u * tt * w.cp2y + ttt * targetY;
      }
      
      vertex(px, py);
    }
    endShape();
  }
}

function mousePressed() {
  // Update starting position to current target, and set new target to mouse position
  startX = targetX;
  startY = targetY;
  
  targetX = mouseX;
  targetY = mouseY;
  
  generateWisps();
  
  // Trigger smooth reveal animation toward the new pressed point
  revealT = 0.0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - NAV_H);
  updateBlurredBackground();
}

// Generates the Gaussian-blurred sky blue and green backdrop offscreen
function updateBlurredBackground() {
  bgGraphics = createGraphics(width, height);
  bgGraphics.background(135, 206, 235); // Base Sky Blue
  bgGraphics.noStroke();
  
  // Paint soft, overlapping sky blue and vibrant green patches
  for (let i = 0; i < 18; i++) {
    let x = random(bgGraphics.width);
    let y = random(bgGraphics.height);
    let r = random(350, 800);
    if (random() > 0.45) {
      bgGraphics.fill(64, 165, 120, 50); // Soft Green
    } else {
      bgGraphics.fill(160, 230, 255, 60); // Light Sky Blue
    }
    bgGraphics.ellipse(x, y, r, r);
  }
  
  // Apply a true Gaussian blur filter to the backdrop
  bgGraphics.filter(BLUR, 75);
}

// Generates the control points for all types of lines
function generateWisps() {
  wisps = [];
  let totalLines = 24; 
  
  let vecX = targetX - startX;
  let vecY = targetY - startY;
  let len = sqrt(vecX * vecX + vecY * vecY);
  if (len === 0) len = 0.001; 
  
  let normX = -vecY / len;
  let normY = vecX / len;
  let dirX = vecX / len; 
  let dirY = vecY / len; 

  let maxSpread = random(len * 0.2, len * 0.4); 
  
  let oppositeCorneredCount = 0;
  let targetOppositeCornered = int(random(2, 5));

  // Counters for S-shape lines (target 4 to 6 lines)
  let sShapeCount = 0;
  let targetSShape = int(random(4, 7));

  for (let i = 0; i < totalLines; i++) {
    let isInverseSide = i % 2 === 0;
    
    // ~10% chance to loop over itself
    let bendsBack = random() < 0.1;
    // Exactly 60% chance of opacity fade
    let isFading = random() < 0.6;
    // Exactly 20% chance for a sliding stroke reveal effect
    let isReveal = random() < 0.2;
    
    // Check if this line should be an S-shape (4-6 total)
    let makeSShape = false;
    if (sShapeCount < targetSShape && !bendsBack && random() < 0.3) {
      makeSShape = true;
      sShapeCount++;
    }
    
    let spread = map(i, 0, totalLines, 10, maxSpread) * random(0.8, 1.2); 
    
    let w = {
      baseAlpha: random(40, 110),
      isFading: isFading,
      noiseOffset: random(1000),
      isReveal: isReveal,
      revealOffset: random(10)
    };

    if (bendsBack) {
      // -- LOOPING / OVERLAPPING S-CURVE --
      w.type = 'cubic';
      let backPull = len * random(0.3, 0.5); 
      let forwardPush = len * random(0.3, 0.5);
      
      w.cp1x = startX - dirX * backPull + normX * (spread * 1.2) + random(-15, 15);
      w.cp1y = startY - dirY * backPull + normY * (spread * 1.2) + random(-15, 15);
      
      w.cp2x = targetX + dirX * forwardPush - normX * (spread * 1.2) + random(-15, 15);
      w.cp2y = targetY + dirY * forwardPush - normY * (spread * 1.2) + random(-15, 15);
      
    } else if (makeSShape) {
      // -- HIGHLY EXAGGERATED S-SHAPE COUNTER-CURVE --
      w.type = 'cubic';
      let backPull = len * 0.3;
      w.cp1x = startX - dirX * backPull - normX * (spread * 2.8) + random(-15, 15);
      w.cp1y = startY - dirY * backPull - normY * (spread * 2.8) + random(-15, 15);
      
      w.cp2x = startX + vecX * 0.6 + normX * (spread * 2.2) + random(-15, 15);
      w.cp2y = startY + vecY * 0.6 + normY * (spread * 2.2) + random(-15, 15);
      
    } else if (isInverseSide) {
      // -- PRIMARY RECTANGLE SIDE -- 
      if (random() > 0.4) {
        w.type = 'cornered';
        
        let cornerDist = len * 0.2; // 20% away from start/end
        let rectSpread = spread * 1.4;
        
        let n1x = random(-8, 8), n1y = random(-8, 8);
        let n2x = random(-8, 8), n2y = random(-8, 8);

        w.pA = { x: startX, y: startY };
        w.pB = { x: startX + normX * rectSpread + n1x, y: startY + normY * rectSpread + n1y }; 
        w.pC = { x: startX + dirX * cornerDist + normX * rectSpread + n1x, y: startY + dirY * cornerDist + normY * rectSpread + n1y }; 
        
        w.pD = { x: targetX - dirX * cornerDist + normX * rectSpread + n2x, y: targetY - dirY * cornerDist + normY * rectSpread + n2y }; 
        w.pE = { x: targetX + normX * rectSpread + n2x, y: targetY + normY * rectSpread + n2y }; 
        w.pF = { x: targetX, y: targetY };
      } else {
        w.type = 'cubic';
        let rectSpread = spread * 1.4;
        let archExtension = len * 0.15; 
        
        w.cp1x = startX - dirX * archExtension + normX * rectSpread + random(-10, 10);
        w.cp1y = startY - dirY * archExtension + normY * rectSpread + random(-10, 10);
        
        w.cp2x = targetX + dirX * archExtension + normX * rectSpread + random(-10, 10);
        w.cp2y = targetY + dirY * archExtension + normY * rectSpread + random(-10, 10);
      }
      
    } else {
      // -- OPPOSITE SIDE --
      let makeOppositeCornered = false;
      if (oppositeCorneredCount < targetOppositeCornered && random() < 0.35) {
        makeOppositeCornered = true;
        oppositeCorneredCount++;
      }

      if (makeOppositeCornered) {
        w.type = 'cornered';
        let cornerDist = len * 0.2; 
        let rectSpread = spread * 1.2;
        
        let n1x = random(-8, 8), n1y = random(-8, 8);
        let n2x = random(-8, 8), n2y = random(-8, 8);

        w.pA = { x: startX, y: startY };
        w.pB = { x: startX - normX * rectSpread + n1x, y: startY - normY * rectSpread + n1y }; 
        w.pC = { x: startX + dirX * cornerDist - normX * rectSpread + n1x, y: startY + dirY * cornerDist - normY * rectSpread + n1y }; 
        
        w.pD = { x: targetX - dirX * cornerDist - normX * rectSpread + n2x, y: targetY - dirY * cornerDist - normY * rectSpread + n2y }; 
        w.pE = { x: targetX - normX * rectSpread + n2x, y: targetY - normX * rectSpread + n2y }; 
        w.pF = { x: targetX, y: targetY };
      } else {
        w.type = 'cubic';
        let base1X = startX + vecX * 0.2;
        let base1Y = startY + vecY * 0.2;
        
        let base2X = startX + vecX * 0.8;
        let base2Y = startY + vecY * 0.8;

        let oppSpread = spread * random(0.15, 0.35); 

        w.cp1x = base1X - normX * oppSpread + random(-10, 10);
        w.cp1y = base1Y - normY * oppSpread + random(-10, 10);
        
        w.cp2x = base2X - normX * oppSpread + random(-10, 10);
        w.cp2y = base2Y - normY * oppSpread + random(-10, 10);
      }
    }

    wisps.push(w);
  }
}
