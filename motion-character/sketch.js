let palette;

function setup() {
  createCanvas(windowWidth, windowHeight - NAV_H);
  noStroke();
  
  palette = [
    color('#0a113f'),
    color('#266cb2'),
    color('#c2d9f2'),
    color('#0e3e26') 
  ];
}

function draw() {
  background('#0a113f'); 
  
  let sectionWidth = width / 4;
  let t = (millis() / 3000) % 2; 
  
  for (let i = 0; i < palette.length; i++) {
    fill(palette[i]);
    
    let offset = i * 0.2; 
    let animSpan = 0.6;    
    
    if (t < 1) {
      let localTime = constrain((t - offset) / animSpan, 0, 1);
      let progress = easeInOutQuint(localTime);
      
      rect(i * sectionWidth, 0, sectionWidth * progress, height);
      
    } else {
      let phase2Time = t - 1;
      let localTime = constrain((phase2Time - offset) / animSpan, 0, 1);
      let progress = easeInOutQuint(localTime);
      
      let startX = i * sectionWidth + (sectionWidth * progress);
      let currentWidth = sectionWidth * (1 - progress);
      
      if (currentWidth > 0) {
        rect(startX, 0, currentWidth, height);
      }
    }
  }
}

function easeInOutQuint(x) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - NAV_H);
}
