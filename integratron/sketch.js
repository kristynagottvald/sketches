let fovy;
let audioCtx;
let soundEnabled = false;
let lastCycleState = 1.0;
let lastLightsOn = false;

// Array to keep track of active sound layers so we can fade them out independently
let activeBowlGains = [];
let activeScrollGains = [];
let lastScrollTime = 0;

// Array for our random cacti
let cacti = [];

function setup() {
  createCanvas(windowWidth, windowHeight - NAV_H, WEBGL);
  fovy = PI / 3.5;
  perspective(fovy, width / height, 10, 60000);
  noStroke();
  
  // Generate 5 random south western cacti matching the image shape, keeping them far from the dome
  for (let i = 0; i < 5; i++) {
    let angle = random(TWO_PI);
    // Minimum radius 600 ensures a clear vicinity around the Integratron
    let r = random(600, 1800); 
    cacti.push({
      x: cos(angle) * r,
      z: sin(angle) * r,
      h: random(100, 160), // Base height before the 50% scale reduction
      rotY: random(TWO_PI),
      tiltZ: random(-0.15, 0.15) // Adds the slight lean seen in the image
    });
  }
}

function draw() {
  let cycle = getCycleInfo();
  
  background(0);
  
  orbitControl(2, 2, 0.1);
  
  rotateX(-0.1);
  rotateY(-0.2);
  
  drawSky(cycle);
  setupLighting(cycle);
  drawGround(cycle);
  drawCacti(cycle);
  drawIntegratron(cycle);
}

function activateAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  soundEnabled = true;
}

function mousePressed() {
  activateAudio();
  playBowlSound(false);
  console.log("[Audio Active] Mouse click registered. Sound bath bowls enabled.");
}

function mouseWheel(event) {
  activateAudio();
  
  // Trigger the higher-octave interactive bowl sound on scroll
  playScrollBowlSound();
  
  fovy += event.delta * 0.0008;
  fovy = constrain(fovy, PI/10, PI/2.5);
  perspective(fovy, width / height, 10, 60000);
}

function getCycleInfo() {
  let cycleLength = 1600; 
  let f = frameCount % cycleLength;
  
  let cycle; 
  
  if (f < 600) {
    let progress = f / 600;
    cycle = (cos(progress * PI) + 1) / 2; 
  } else if (f < 720) {
    cycle = 0.0;
  } else if (f < 1320) {
    let progress = (f - 720) / 600;
    cycle = 1.0 - (cos(progress * PI) + 1) / 2;
  } else {
    cycle = 1.0;
  }
  
  let currentLightsOn = cycle < 0.45;
  if (!lastLightsOn && currentLightsOn) {
    playBowlSound(true); 
  } else if (lastLightsOn && !currentLightsOn) {
    playBowlSound(false); 
  }
  lastLightsOn = currentLightsOn;

  lastCycleState = cycle;
  return cycle;
}

// --- MAIN BACKGROUND BOWL SOUND ---
function playBowlSound(isDusk) {
  if (!soundEnabled || !audioCtx) return;

  let t = audioCtx.currentTime;

  // Fade out previous main background sounds to prevent stacking
  for (let i = 0; i < activeBowlGains.length; i++) {
    let oldGain = activeBowlGains[i];
    oldGain.gain.cancelScheduledValues(t);
    oldGain.gain.setTargetAtTime(0, t, 0.4);
  }
  activeBowlGains = [];

  let masterGain = audioCtx.createGain();
  masterGain.gain.value = isDusk ? 0.45 : 0.6;
  activeBowlGains.push(masterGain);

  let filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, t); 

  let compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-12, t);
  compressor.knee.setValueAtTime(6, t);
  compressor.ratio.setValueAtTime(4, t);
  compressor.attack.setValueAtTime(0.03, t);
  compressor.release.setValueAtTime(0.25, t);

  filter.connect(compressor);
  compressor.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  let octaveMultiplier = isDusk ? 1.5 : 1.0; 
  let decayBonus = isDusk ? 2.5 : 0.0;

  function createRing(freq, peakGain, attack, decay) {
    let osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * octaveMultiplier, t);

    let gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, t);
    
    gain.gain.linearRampToValueAtTime(peakGain, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, t + attack + decay + decayBonus);

    osc.connect(gain);
    gain.connect(filter); 

    osc.start(t);
    osc.stop(t + attack + decay + decayBonus);
  }

  createRing(216, 0.7, 1.5, 7.0);
  createRing(218.5, 0.5, 2.0, 6.5);
  createRing(580, 0.15, 0.8, 5.0);
}

// --- INTERACTIVE SCROLL BOWL SOUND ---
function playScrollBowlSound() {
  if (!soundEnabled || !audioCtx) return;

  let t = audioCtx.currentTime;

  // Debounce: Prevent rapid scroll wheel ticks from spawning hundreds of sounds
  if (t - lastScrollTime < 0.15) return;
  lastScrollTime = t;

  // Fade out previous scroll sounds independently of the main ambient drone
  for (let i = 0; i < activeScrollGains.length; i++) {
    let oldGain = activeScrollGains[i];
    oldGain.gain.cancelScheduledValues(t);
    oldGain.gain.setTargetAtTime(0, t, 0.2);
  }
  activeScrollGains = [];

  let masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.35; // Slightly quieter so it accents the main drone
  activeScrollGains.push(masterGain);

  let filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1500, t); // Slightly higher cutoff for the higher octave

  filter.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  function createRing(freq, peakGain, attack, decay) {
    let osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    let gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, t);
    
    gain.gain.linearRampToValueAtTime(peakGain, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, t + attack + decay);

    osc.connect(gain);
    gain.connect(filter);

    osc.start(t);
    osc.stop(t + attack + decay);
  }

  // Multiply base frequencies by 2 to push them exactly one octave up
  createRing(216 * 2, 0.6, 0.2, 3.0);
  createRing(218.5 * 2, 0.4, 0.3, 2.8);
}

function setupLighting(cycle) {
  colorMode(RGB, 255);
  
  let dayLight = color(220, 225, 235);
  let sunsetLight = color(150, 90, 120);
  let nightLight = color(30, 30, 45);

  let ambientCol;
  
  if (cycle > 0.5) {
    ambientCol = lerpColor(sunsetLight, dayLight, map(cycle, 0.5, 1.0, 0, 1));
  } else {
    ambientCol = lerpColor(nightLight, sunsetLight, map(cycle, 0.0, 0.5, 0, 1));
  }
  
  ambientLight(ambientCol);
}

function getNaturalSkyColor(inter, cycle) {
  let noonBottom = color(140, 210, 255);
  let noonTop = color(30, 100, 230);
  let noonCol = lerpColor(noonBottom, noonTop, inter);
  
  let sunsetCol;
  if (inter < 0.33) {
    sunsetCol = lerpColor(color(255, 160, 100), color(240, 100, 160), map(inter, 0, 0.33, 0, 1));
  } else if (inter < 0.66) {
    sunsetCol = lerpColor(color(240, 100, 160), color(140, 70, 170), map(inter, 0.33, 0.66, 0, 1));
  } else {
    sunsetCol = lerpColor(color(140, 70, 170), color(40, 50, 80), map(inter, 0.66, 1.0, 0, 1));
  }

  let nightBottom = color(20, 25, 45);
  let nightTop = color(5, 8, 20);
  let nightCol = lerpColor(nightBottom, nightTop, inter);
  
  if (cycle > 0.5) {
    let blendFactor = map(cycle, 1.0, 0.5, 0, 1);
    return lerpColor(noonCol, sunsetCol, blendFactor);
  } else {
    let blendFactor = map(cycle, 0.5, 0.0, 0, 1);
    return lerpColor(sunsetCol, nightCol, blendFactor);
  }
}

function drawSky(cycle) {
  push();
  colorMode(RGB, 255);
  
  let skySteps = 30; 
  let radius = 25000;
  let yBottom = 500;  
  let yTop = -20000;  
  let angleStep = TWO_PI / 32;

  noStroke();
  for (let i = 0; i < skySteps; i++) {
    let inter1 = i / skySteps;
    let inter2 = (i + 1) / skySteps;

    let col1 = getNaturalSkyColor(inter1, cycle);
    let col2 = getNaturalSkyColor(inter2, cycle);

    let y1 = map(inter1, 0, 1, yBottom, yTop);
    let y2 = map(inter2, 0, 1, yBottom, yTop);

    beginShape(QUAD_STRIP);
    for (let a = 0; a <= TWO_PI + 0.01; a += angleStep) {
      let x = cos(a) * radius;
      let z = sin(a) * radius;
      
      fill(col1);
      vertex(x, y1, z);
      
      fill(col2);
      vertex(x, y2, z);
    }
    endShape();
  }
  pop();
}

function drawGround(cycle) {
  push();
  translate(0, 80, 0); 
  
  let dayGround = color(210, 195, 170);
  let sunsetGround = color(140, 70, 60);
  let nightGround = color(15, 20, 25);
  let currentGround;
  
  if (cycle > 0.5) {
    currentGround = lerpColor(sunsetGround, dayGround, map(cycle, 0.5, 1.0, 0, 1));
  } else {
    currentGround = lerpColor(nightGround, sunsetGround, map(cycle, 0.0, 0.5, 0, 1));
  }
  
  fill(currentGround); 
  box(60000, 2, 60000); 
  pop();
}

function drawCacti(cycle) {
  push();
  
  let dayGreen = color(65, 95, 55);
  let sunsetGreen = color(40, 50, 35);
  let nightGreen = color(15, 20, 15);
  let currentGreen;
  
  if (cycle > 0.5) {
    currentGreen = lerpColor(sunsetGreen, dayGreen, map(cycle, 0.5, 1.0, 0, 1));
  } else {
    currentGreen = lerpColor(nightGreen, sunsetGreen, map(cycle, 0.0, 0.5, 0, 1));
  }
  
  fill(currentGreen);
  
  for (let i = 0; i < cacti.length; i++) {
    let c = cacti[i];
    push();
    
    // Position cactus on the ground (ground top is ~79)
    // Since we scale by 0.5 below, the effective height is halved.
    // Adjusting the translation height so the base sits exactly on the ground.
    translate(c.x, 80 - c.h / 4, c.z);
    rotateY(c.rotY);
    rotateZ(c.tiltZ); // Slight lean as seen in the reference image
    
    // Scale everything down by 50% cleanly
    scale(0.5);
    
    // Main Trunk (Chunky)
    cylinder(16, c.h, 16);
    push();
    translate(0, -c.h / 2, 0);
    sphere(16, 16, 16);
    pop();
    
    // Left arm (Higher, longer vertical extension)
    push();
    translate(-16, -c.h * 0.15, 0); // Start high up on the trunk
    
    // Horizontal stub out left
    push();
    translate(-12, 0, 0);
    rotateZ(HALF_PI);
    cylinder(12, 24, 12); 
    pop();
    
    // Elbow and vertical extension
    push();
    translate(-24, 0, 0);
    sphere(12, 12, 12);
    translate(0, -18, 0);
    cylinder(12, 36, 12);
    translate(0, -18, 0);
    sphere(12, 12, 12); // Tip
    pop();
    pop();
    
    // Right arm (Lower, slightly shorter)
    push();
    translate(16, c.h * 0.2, 0); // Start lower down on the trunk
    
    // Horizontal stub out right
    push();
    translate(10, 0, 0);
    rotateZ(HALF_PI);
    cylinder(12, 20, 12); 
    pop();
    
    // Elbow and vertical extension
    push();
    translate(20, 0, 0);
    sphere(12, 12, 12);
    translate(0, -14, 0);
    cylinder(12, 28, 12);
    translate(0, -14, 0);
    sphere(12, 12, 12); // Tip
    pop();
    pop();
    
    pop();
  }
  pop();
}

function drawIntegratron(cycle) {
  push();
  colorMode(RGB, 255);
  
  let lightsOn = cycle < 0.45; 
  let dayGlass = color(45, 65, 85);
  let nightGlass = color(255, 215, 120);
  
  let currentGlass = lightsOn ? nightGlass : dayGlass;
  let glowCol = lightsOn ? nightGlass : color(0, 0, 0);

  translate(0, 40, 0); 
  fill(255);
  cylinder(150, 80, 16); 
  pop();

  push();
  translate(0, 0, 0); 
  fill(255); 
  cylinder(175, 4, 16); 
  pop();

  push();
  fill(180, 20, 20); 
  for (let i = 0; i < 48; i++) {
    push();
    rotateY(TWO_PI * (i / 48));
    translate(170, 4, 0); 
    sphere(2.5, 4, 4);
    pop();
  }
  pop();

  push();
  translate(0, 0, 0);
  fill(255); 
  sphere(149, 16, 12); 
  pop();

  push();
  fill(235, 235, 235); 
  for (let i = 0; i < 16; i++) {
    push();
    rotateY(TWO_PI * (i / 16));
    rotateZ(HALF_PI); 
    torus(150, 1, 16, 3); 
    pop();
  }
  pop();

  push();
  translate(0, -149, 0);
  fill(255); 
  cylinder(15, 6, 8);
  pop();

  for (let i = 0; i < 16; i++) {
    push();
    rotateY(TWO_PI * (i / 16) + PI/16); 
    
    let yPos = -65; 
    let rAtY = sqrt(150*150 - yPos*yPos); 
    
    translate(0, yPos, rAtY - 2);
    
    let windowTilt = asin(abs(yPos)/150);
    rotateX(windowTilt);
    
    fill(255);
    box(16, 20, 8);
    
    translate(0, 0, 2);
    emissiveMaterial(glowCol);
    fill(currentGlass); 
    box(10, 14, 6);
    emissiveMaterial(0, 0, 0);
    pop();
  }

  push();
  rotateY(PI/12); 
  translate(0, 45, 147);
  
  fill(245);
  box(24, 65, 10);
  
  translate(0, 0, 2);
  fill(255);
  box(20, 60, 8);
  pop();

  drawBaseWindow(-PI/4, currentGlass, glowCol);
  drawBaseWindow(PI/2.5, currentGlass, glowCol);
}

function drawBaseWindow(angle, currentGlass, glowCol) {
  push();
  rotateY(angle);
  translate(0, 50, 147);
  
  fill(255);
  box(22, 22, 8);
  
  translate(0, 0, 2);
  emissiveMaterial(glowCol);
  fill(currentGlass); 
  
  push();
  translate(-5, 0, 0);
  box(8, 16, 6);
  pop();
  
  push();
  translate(5, 0, 0);
  box(8, 16, 6);
  pop();
  
  emissiveMaterial(0, 0, 0);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - NAV_H);
  perspective(fovy, width / height, 10, 60000);
}
