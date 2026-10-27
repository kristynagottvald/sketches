/* Kick Off Type Lab for OpenProcessing. One file: it builds its own UI, so no HTML or CSS files are needed.
   Setup: 1) paste this as sketch.js  2) upload the fonts listed in FONT_FILES  3) hit run. */
(function injectUI(){
  const link = document.createElement('link'); link.rel='stylesheet';
  link.href='https://fonts.googleapis.com/css2?family=Chango&family=Inter:wght@400;500;600&display=swap';
  document.head.appendChild(link);
  const lib = document.createElement('script');                 // opentype.js, used by the SVG exporter
  lib.src='https://cdnjs.cloudflare.com/ajax/libs/opentype.js/1.3.4/opentype.min.js'; document.head.appendChild(lib);
  const st = document.createElement('style'); st.textContent = "\n/* Layout: live text stage on the left, a Figma-style type panel on the right (dark by design; stacks on phones). */\n:root{\n  --bg:#1e1e1e; --panel:#2c2c2c; --field:#383838; --line:#444; --fg:#f2f2f2; --mute:#a6a6a6;\n  --accent:#0d99ff; --font-ui:'Inter',system-ui,sans-serif; color-scheme:dark;\n}\nhtml,body{height:100%}\nbody{margin:0;background:var(--bg);color:var(--fg);font:12px/1.4 var(--font-ui);padding-left:max(0px,env(safe-area-inset-left,0px));padding-right:max(0px,env(safe-area-inset-right,0px))}\n#app{position:fixed;inset:0;display:flex;z-index:10;background:var(--bg)}\n#stage{flex:1;min-width:0;position:relative;overflow:hidden}\n#stage canvas{display:block}\n#hint{position:absolute;left:16px;bottom:12px;color:#14352aaa;font-size:12px;pointer-events:none}\n#panel{width:300px;flex:none;background:var(--panel);overflow-y:auto;padding:14px 14px 24px}\nh1{font:400 16px 'Chango',sans-serif;margin:0 0 12px}\n.lbl{display:block;color:var(--mute);margin:12px 0 6px}\n.box,select,input[type=text],textarea{box-sizing:border-box;background:var(--field);color:var(--fg);border:1px solid transparent;border-radius:6px;font:inherit;font-size:13px}\nselect,input[type=text]{width:100%;height:32px;padding:0 10px}\nselect{appearance:none;-webkit-appearance:none;padding-right:28px;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none' stroke='%23f2f2f2' stroke-width='1.5'%3E%3Cpath d='M1 1l4 4 4-4'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 10px center}\n.two{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}\n.field{display:flex;align-items:center;gap:6px;height:32px;padding:0 8px;background:var(--field);border-radius:6px;border:1px solid transparent}\n.field:focus-within,select:focus,textarea:focus{border-color:var(--accent);outline:0}\n.field input{flex:1;min-width:0;background:none;border:0;color:var(--fg);font:inherit;font-size:13px;padding:0;outline:0}\n.ico{width:18px;height:18px;flex:none;color:var(--mute);cursor:ew-resize;touch-action:none;display:grid;place-items:center}\n.ico svg{width:18px;height:18px}\ntextarea{width:100%;min-height:66px;padding:8px 10px;font-size:15px;resize:vertical;line-height:1.3}\n.rule{border:0;border-top:1px solid var(--line);margin:16px 0 0}\n.colors{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}\n.colors label{color:var(--mute);font-size:11px}\ninput[type=color]{width:100%;height:30px;border:0;border-radius:6px;background:var(--field);padding:2px;margin-top:4px}\ninput[type=range]{width:100%;accent-color:var(--accent);margin:0}\n.srow{display:grid;grid-template-columns:70px 1fr 34px;gap:8px;align-items:center;margin-top:8px;color:var(--mute)}\n.srow output{text-align:right;font-variant-numeric:tabular-nums;color:var(--fg)}\nbutton{font:inherit;background:var(--field);color:var(--fg);border:0;border-radius:6px;padding:7px 10px;cursor:pointer}\nbutton:hover{background:#474747}\nbutton.primary{background:var(--accent);color:#fff}\n.btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}\n#fstatus{color:var(--mute);font-size:11px;margin-top:6px;min-height:14px}\n#tip{color:var(--mute);font-size:11px;margin-top:8px;line-height:1.5}\nbutton:focus-visible{outline:2px solid var(--accent);outline-offset:1px}\n@media (max-width:760px){#app{flex-direction:column}#stage{flex:none;height:46vh}#panel{width:auto;flex:1}}\n";
  document.head.appendChild(st);
  const wrap = document.createElement('div'); wrap.innerHTML = "<div id=\"app\">\n  <div id=\"stage\"><div id=\"hint\">Type on the right. Click between letters to place the cursor.</div></div>\n  <aside id=\"panel\">\n    <h1>Kick Off Type Lab</h1>\n\n    <textarea id=\"txt\" spellcheck=\"false\" aria-label=\"Text\">COMPANY\nKICK OFF</textarea>\n\n    <span class=\"lbl\">Font</span>\n    <select id=\"font\" aria-label=\"Font family\"></select>\n    <div class=\"two\">\n      <select id=\"weight\" aria-label=\"Weight\">\n        <option value=\"n\">Regular</option><option value=\"b\">Bold</option><option value=\"i\">Italic</option><option value=\"bi\">Bold Italic</option>\n      </select>\n      <label class=\"field\" style=\"margin:0\"><input id=\"size\" type=\"text\" value=\"170\" list=\"sizes\" aria-label=\"Font size\" inputmode=\"decimal\"></label>\n      <datalist id=\"sizes\"><option>60</option><option>90</option><option>120</option><option>170</option><option>220</option><option>300</option></datalist>\n    </div>\n    <div id=\"fstatus\"></div>\n\n    <div class=\"two\" style=\"margin-top:4px\">\n      <div><span class=\"lbl\" style=\"margin-top:8px\">Line height</span>\n        <label class=\"field\"><span class=\"ico\" id=\"icoLH\" title=\"Drag to scrub\"><svg viewBox=\"0 0 18 18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M3 2.5h12M3 15.5h12M6.5 12.5L9 5.5l2.5 7M7.3 10.5h3.4\"/></svg></span><input id=\"lead\" type=\"text\" value=\"86%\" aria-label=\"Line height\"></label></div>\n      <div><span class=\"lbl\" style=\"margin-top:8px\">Letter spacing</span>\n        <label class=\"field\"><span class=\"ico\" id=\"icoLS\" title=\"Drag to scrub\"><svg viewBox=\"0 0 18 18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M2.5 3v12M15.5 3v12M6.5 13L9 5.5l2.5 7.5M7.3 10.8h3.4\"/></svg></span><input id=\"ls\" type=\"text\" value=\"0%\" aria-label=\"Letter spacing\"></label></div>\n    </div>\n    <span class=\"lbl\" style=\"margin-top:8px\">Default spacing (all letters)</span>\n    <label class=\"field\"><span class=\"ico\" id=\"icoTR\" title=\"Drag to scrub\"><svg viewBox=\"0 0 18 18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.3\"><path d=\"M2.5 3v12M15.5 3v12M6.5 13L9 5.5l2.5 7.5M7.3 10.8h3.4\"/></svg></span><input id=\"track\" type=\"text\" value=\"0%\" aria-label=\"Default letter spacing\"></label>\n    <div id=\"tip\">Default spacing moves every letter and keeps any individual spacing you set. Letter spacing follows your text cursor: a cursor sets the gap after the letter before it, a selection sets every selected letter. Double-click the text to select all. Alt + \u2190 \u2192 nudges 1% (Shift for 5%).</div>\n\n    <hr class=\"rule\">\n    <span class=\"lbl\">Style</span>\n    <div class=\"srow\"><span>Gooey</span><input id=\"goo\" type=\"range\" min=\"0\" max=\"100\" value=\"35\"><output></output></div>\n    <div class=\"srow\"><span>Warp</span><input id=\"warp\" type=\"range\" min=\"0\" max=\"100\" value=\"12\"><output></output></div>\n    <div class=\"srow\"><span>Wavelength</span><input id=\"wl\" type=\"range\" min=\"20\" max=\"200\" value=\"60\"><output></output></div>\n    <div class=\"srow\"><span>Stretch X</span><input id=\"xs\" type=\"range\" min=\"50\" max=\"250\" value=\"100\"><output></output></div>\n    <div class=\"srow\"><span>Stretch Y</span><input id=\"ys\" type=\"range\" min=\"50\" max=\"300\" value=\"100\"><output></output></div>\n    <label class=\"srow\" style=\"grid-template-columns:auto 1fr\"><input id=\"anim\" type=\"checkbox\"><span>Animate warp</span></label>\n    <div class=\"srow\"><span>Shadow X</span><input id=\"sx\" type=\"range\" min=\"-30\" max=\"30\" value=\"7\"><output></output></div>\n    <div class=\"srow\"><span>Shadow Y</span><input id=\"sy\" type=\"range\" min=\"-30\" max=\"30\" value=\"7\"><output></output></div>\n    <div class=\"colors\" style=\"margin-top:12px\">\n      <label>Text<input id=\"cfg\" type=\"color\" value=\"#17372b\"></label>\n      <label>Shadow<input id=\"csh\" type=\"color\" value=\"#f4977f\"></label>\n      <label>Background<input id=\"cbg\" type=\"color\" value=\"#f2e6d0\"></label>\n    </div>\n    <hr class=\"rule\">\n    <span class=\"lbl\">Export</span>\n    <label class=\"srow\" style=\"grid-template-columns:auto 1fr;margin:0 0 8px\"><input id=\"svgbg\" type=\"checkbox\" checked><span>Include background</span></label>\n    <div class=\"btns\" style=\"margin-top:0\"><button id=\"svgcopy\" class=\"primary\">Copy SVG</button><button id=\"svgdl\" hidden>Download .svg</button><button id=\"svgshow\">Show code</button></div>\n    <div id=\"svgnote\" class=\"lbl\" style=\"margin-top:8px\"></div>\n    <textarea id=\"svgout\" readonly hidden spellcheck=\"false\" style=\"margin-top:6px;min-height:140px;font:11px/1.3 ui-monospace,Menlo,monospace\" aria-label=\"SVG code\"></textarea>\n    <div class=\"btns\"><button id=\"upload\">Load font file\u2026</button><button id=\"resetk\">Reset spacing</button><button id=\"copy\" class=\"primary\">Copy settings</button><input id=\"file\" type=\"file\" accept=\".otf,.ttf,.woff,.woff2\" hidden></div>\n  </aside>\n</div>";
  document.body.appendChild(wrap.firstElementChild);
})();

/* ===== sketch.js : paste this block into OpenProcessing (UI is plain DOM above) ===== */

// Fonts picked from the Font Book. Each is tried by installed name; falls back to Chango.
// Upload these files to your OpenProcessing sketch (Files panel) with exactly these names
const FONT_FILES = {
 "Bronco": "Bronco.ttf",
 "CarnevaleeFreakshow": "CarnevaleeFreakshow.ttf",
 "Cowboys2": "Cowboys2.otf",
 "FonzieMedium": "FonzieMedium.otf",
 "GomaWestern": "GomaWestern.ttf",
 "GomaWestern2": "GomaWestern2.ttf",
 "Hatten": "Hatten.ttf",
 "HumaneBlack": "HumaneBlack.otf",
 "KongGroovy": "KongGroovy.ttf",
 "MasaGroovy": "MasaGroovy.ttf",
 "Monigue": "Monigue.otf",
 "Muifamoso": "Muifamoso.ttf",
 "RetroGroovy": "RetroGroovy.ttf",
 "SuperGroovy": "SuperGroovy.ttf",
 "YapariUltra": "YapariUltra.ttf"
};
const FONTS = [
  ['Cowboys 2.0',            'Cowboys2'],
  ['Goma Western',           'GomaWestern'],
  ['Carnevalee Freakshow',   'CarnevaleeFreakshow'],
  ['Fonzie Medium',          'FonzieMedium'],
  ['Hatten',                 'Hatten'],
  ['Bronco',                 'Bronco'],
  ['Humane Black',           'HumaneBlack'],
  ['Yapari Ultra (new)',     'YapariUltra'],
  ['Monigue (new)',          'Monigue'],
  ['Muifamoso (new)',        'Muifamoso'],
  ['Retro Groovy (dafont)',  'RetroGroovy'],
  ['Masa Groovy (dafont)',   'MasaGroovy'],
  ['Kong Groovy (dafont)',   'KongGroovy'],
  ['Super Groovy (dafont)',  'SuperGroovy'],
  ['Goma Western 2 (dafont)','GomaWestern2'],
  ['Chango (web font)',      null],
];
const FALLBACK = 'Chango, "Arial Black", Impact, sans-serif';
const ctx = () => drawingContext;
// Set the canvas font directly so size always applies, loaded font or not.
const fontStr = px => `${{n:'',b:'bold ',i:'italic ',bi:'italic bold '}[S.weight]}${px}px ${families[S.font]}`;
function setFont(px){ ctx().font = fontStr(px); }

// Offscreen layers: glyphs -> goo (blur + threshold) -> composite -> warp -> cache
const mk = () => document.createElement('canvas');
const L1 = mk(), L2 = mk(), COMP = mk(), CACHE = mk(), MID = mk();
let sigA = '', sigB = '', phase = 0;
function sized(c){ if (c.width!==width||c.height!==height){ c.width=width; c.height=height; } return c.getContext('2d'); }
// Gooey = round the shapes. A hidden blur is thresholded back to a hard edge, so only the outline
// changes (corners round, tight gaps fill) and nothing stays soft. Pixels are repainted in the solid color.
function goo(src, k, col){
  const B = sized(L2); B.clearRect(0,0,width,height);
  B.filter = `blur(${S.goo/100*0.045*S.size*k}px)`; B.drawImage(src,0,0); B.filter = 'none';
  const im = B.getImageData(0,0,width,height), d = im.data;
  const r = parseInt(col.slice(1,3),16), g = parseInt(col.slice(3,5),16), b = parseInt(col.slice(5,7),16);
  for (let i=0;i<d.length;i+=4){
    const a = d[i+3];
    d[i+3] = a<120 ? 0 : a>136 ? 255 : (a-120)*16;       // near-binary edge, about 1px of anti-aliasing
    d[i]=r; d[i+1]=g; d[i+2]=b;
  }
  B.putImageData(im,0,0); return L2;
}
function renderComp(k){
  const g = sized(COMP); g.clearRect(0,0,width,height);
  [[S.sh,S.sx*k,S.sy*k],[S.fg,0,0]].forEach(([col,ox,oy])=>{
    const L = sized(L1); L.clearRect(0,0,width,height);
    L.font = fontStr(S.size*k); L.textAlign='left'; L.textBaseline='alphabetic'; L.fillStyle = col;
    cells.forEach(c=>{ if (c.ch==='\n') return; L.save(); L.translate(c.px+ox, c.py+oy); L.scale(S.xs,S.ys); L.fillText(c.ch,0,0); L.restore(); });
    g.drawImage(S.goo>0 ? goo(L1,k,col) : L1, 0, 0);
  });
}
function renderWarp(k){
  const out = sized(CACHE); out.clearRect(0,0,width,height);
  if (!S.warp){ out.drawImage(COMP,0,0); return; }
  const A = S.warp/100*0.14*S.size*k, lam = Math.max(40, S.size*k*S.wl/40), T = 6.2832;
  const mid = sized(MID); mid.clearRect(0,0,width,height);
  for (let x=0;x<width;x+=2) mid.drawImage(COMP,x,0,2,height, x,A*Math.sin(x/lam*T+phase),2,height);
  for (let y=0;y<height;y+=2) out.drawImage(MID,0,y,width,2, A*.6*Math.sin(y/(lam*.8)*T+phase*1.3),y,width,2);
}
function paintText(k){
  const a = JSON.stringify([S,txt().value,width,height,FONTS.map(f=>f.ok),families.length]);
  if (a!==sigA){ sigA=a; sigB=''; renderComp(k); }
  const b = a+phase; if (b!==sigB){ sigB=b; renderWarp(k); }
  ctx().drawImage(CACHE,0,0);
}
// kern[i] = spacing after character i of the full text, in 1/1000 em (10 = 1%)
const S = { font:0, size:170, lead:.86, weight:'n', track:0, goo:35, warp:12, wl:60, xs:1, ys:1, anim:false, sx:7, sy:7, fg:'#17372b', sh:'#f4977f', bg:'#f2e6d0', kern:[] };
const families = [];
let cells = [], lay = {k:1, lh:0, y0:0}, prevText = '', blink = true;
const dom = id => document.getElementById(id);
const txt = () => dom('txt');

function setup(){
  const st = dom('stage');
  pixelDensity(1);
  createCanvas(st.clientWidth, st.clientHeight).parent(st);
  noLoop();
  FONTS.forEach((f,i)=>{
    const o = document.createElement('option'); o.value=i; o.textContent=f[0]; dom('font').appendChild(o);
    families[i] = `"kf${i}", ${FALLBACK}`;
    if (f[1] && FONT_FILES[f[1]]) loadFile(i, FONT_FILES[f[1]]);
  });
  document.fonts.load('40px Chango').then(()=>redraw());
  prevText = txt().value; S.kern = new Array(prevText.length).fill(0);
  bindUI(); bindExport(); setStatus(); syncLS(); redraw();
  setInterval(()=>{ if (document.activeElement===txt()){ blink=!blink; redraw(); } }, 530);
}
function loadFile(i, url){            // fetch the uploaded file: used for the canvas font and for SVG outlines
  fetch(url).then(r=>{ if(!r.ok) throw 0; return r.arrayBuffer(); }).then(async buf=>{
    const ff = new FontFace('kf'+i, buf.slice(0)); await ff.load(); document.fonts.add(ff);
    FONTS[i].buf = buf; FONTS[i].ok = true; setStatus(); redraw();
  }).catch(()=>{ FONTS[i].ok = false; setStatus(); });
}
function setStatus(){
  const f = FONTS[S.font]; if (!f) return;
  dom('fstatus').textContent = f[1]==null ? 'Web font, always available.'
    : f.ok===true ? 'Font loaded.'
    : f.ok===false ? 'Font file not found. Upload it to the sketch, or use Load font file.'
    : 'Loading font…';
}
function windowResized(){ const st=dom('stage'); resizeCanvas(st.clientWidth, st.clientHeight); redraw(); }
function styleConst(){ return {n:NORMAL,b:BOLD,i:ITALIC,bi:BOLDITALIC}[S.weight]; }

// Lay out every character of the full text (newlines included so indices line up with the textarea).
function layout(){
  const t = txt().value;
  setFont(S.size);
  cells = []; const lw = []; let l = 0, x = 0;
  for (let i=0;i<t.length;i++){
    const ch = t[i];
    if (ch==='\n'){ cells.push({ch,l,i,x,adv:0,nat:0}); lw[l]=x; l++; x=0; continue; }
    const nat = ctx().measureText(ch).width * S.xs, adv = nat + (S.track + (S.kern[i]||0))*S.size/1000;
    cells.push({ch,l,i,x,adv,nat}); x += adv;
  }
  lw[l] = x;
  cells.forEach(c=>c.lw = lw[c.l]);
  return {lines:l+1, widths:lw};
}
function draw(){
  background(S.bg);
  const {lines, widths} = layout();
  const lh = S.size*S.lead, blockH = lh*(lines-1) + S.size*.7;
  const k = Math.min(1, width*.9/Math.max(1,...widths), height*.9/(blockH+S.size*.3));
  const y0 = height/2 - blockH/2 + S.size*.7*k;
  lay = {k, lh:lh*k, y0, lw:widths};
  cells.forEach(c=>{ c.px = width/2 + (-c.lw/2 + c.x)*k; c.py = y0 + c.l*lh*k; });

  if (S.anim) phase += 0.07;
  paintText(k);

  // selection and spacing feedback driven by the textarea cursor
  const a = txt().selectionStart, b = txt().selectionEnd;
  if (a!==b){
    fill(13,153,255,70); noStroke();
    for (let i=a;i<b;i++){ const c=cells[i]; if (c && c.ch!=='\n') rect(c.px, c.py-S.size*.78*k*S.ys, c.adv*k, S.size*.98*k*S.ys); }
  } else if (a>0 && cells[a-1] && cells[a-1].ch!=='\n'){
    const p = cells[a-1], g = (S.track + (S.kern[a-1]||0))*S.size/1000*k;       // the editable gap after the previous letter
    if (g){ fill(13,153,255,90); rect(p.px + p.nat*k - (g<0?-g:0)*0, p.py-S.size*.78*k, g, S.size*.98*k); }
  }
  if (a===b && (blink || document.activeElement!==txt())){
    const pt = caretPoint(a); stroke(13,153,255); strokeWeight(2); line(pt.x, pt.y-S.size*.8*k, pt.x, pt.y+S.size*.2*k);
  }
}
function caretPoint(p){
  const c = cells[p];
  if (c && (p===0 || cells[p-1].ch==='\n' || c.ch!=='\n')) return {x:c.px, y:c.py};
  const q = cells[p-1];
  if (!q) return {x:width/2, y:lay.y0};
  if (q.ch==='\n') return {x:width/2, y:q.py+lay.lh};
  return {x:q.px+q.adv*lay.k, y:q.py};
}
function mousePressed(){
  if (mouseX<0||mouseY<0||mouseX>width||mouseY>height||!cells.length) return;
  const l = Math.max(0, Math.min(lay.lw.length-1, Math.round((mouseY-lay.y0)/lay.lh + .15)));
  let best = null, bd = 1e9;
  const t = txt().value;
  let line = 0;
  for (let p=0;p<=t.length;p++){
    if (p>0 && t[p-1]==='\n') line++;
    if (line!==l) continue;
    const d = Math.abs(caretPoint(p).x - mouseX);
    if (d<bd){ bd=d; best=p; }
  }
  if (best!==null){ txt().focus(); txt().setSelectionRange(best,best); blink=true; syncLS(); redraw(); }
}

// ---- SVG export: real outlined glyph paths (opentype.js), gooey as an SVG filter, warp baked into the path points ----
const otCache = {};
function getOT(i){
  if (i in otCache) return otCache[i];
  const f = FONTS[i]; let buf = f.buf;
  try { return otCache[i] = buf && window.opentype ? opentype.parse(buf) : null; } catch(e){ return otCache[i] = null; }
}
function buildSVG(){
  redraw();                                           // refresh cells[] positions from the current state
  const W = width, H = height, k = lay.k, px = S.size*k, T = 6.2832, ph = phase;
  const A = S.warp/100*0.14*px, lam = Math.max(40, px*S.wl/40);
  const ot = getOT(S.font), f = n => +n.toFixed(2), lerp = (a,b,t) => a+(b-a)*t;
  const slant = S.weight.includes('i') ? .2 : 0, bold = S.weight.includes('b');
  const warp = (x,y) => {                             // same two-pass ripple as the canvas version
    if (!S.warp) return [x,y];
    const y2 = y + A*Math.sin(x/lam*T + ph);
    return [x + A*.6*Math.sin(y2/(lam*.8)*T + ph*1.3), y2];
  };
  function glyphPath(c, ox, oy){
    const cmds = ot.getPath(c.ch, 0, 0, px).commands;
    const pt = (x,y) => { const [a,b] = warp(c.px+ox + S.xs*x - slant*S.ys*y, c.py+oy + S.ys*y); return f(a)+' '+f(b); };
    let d = '', cur = [0,0];
    for (const m of cmds){
      if (m.type==='M'){ d += 'M'+pt(m.x,m.y); cur = [m.x,m.y]; }
      else if (m.type==='L'){
        const n = S.warp ? Math.max(1, Math.ceil(Math.hypot(m.x-cur[0], m.y-cur[1])/10)) : 1;
        for (let s=1;s<=n;s++) d += 'L'+pt(lerp(cur[0],m.x,s/n), lerp(cur[1],m.y,s/n));
        cur = [m.x,m.y];
      } else if (m.type==='Q'){
        if (S.warp) for (let s=1;s<=10;s++){ const t=s/10, u=1-t;
          d += 'L'+pt(u*u*cur[0]+2*u*t*m.x1+t*t*m.x, u*u*cur[1]+2*u*t*m.y1+t*t*m.y); }
        else d += 'Q'+pt(m.x1,m.y1)+' '+pt(m.x,m.y);
        cur = [m.x,m.y];
      } else if (m.type==='C'){
        if (S.warp) for (let s=1;s<=12;s++){ const t=s/12, u=1-t;
          d += 'L'+pt(u*u*u*cur[0]+3*u*u*t*m.x1+3*u*t*t*m.x2+t*t*t*m.x, u*u*u*cur[1]+3*u*u*t*m.y1+3*u*t*t*m.y2+t*t*t*m.y); }
        else d += 'C'+pt(m.x1,m.y1)+' '+pt(m.x2,m.y2)+' '+pt(m.x,m.y);
        cur = [m.x,m.y];
      } else if (m.type==='Z') d += 'Z';
    }
    return d;
  }
  function layer(col, ox, oy){
    const stroke = bold ? ` stroke="${col}" stroke-width="${f(px*.03)}" stroke-linejoin="round"` : '';
    const g = S.goo>0 ? ' filter="url(#goo)"' : '';
    let body = '';
    cells.forEach(c => {
      if (c.ch==='\n' || c.ch===' ') return;
      body += ot ? `<path d="${glyphPath(c,ox,oy)}"/>`          // outlined glyph
                 : `<text x="${f(c.px+ox)}" y="${f(c.py+oy)}" transform="translate(${f(c.px+ox)} ${f(c.py+oy)}) scale(${S.xs} ${S.ys}) translate(${-f(c.px+ox)} ${-f(c.py+oy)})">${c.ch.replace('&','&amp;').replace('<','&lt;')}</text>`;
    });
    const fam = ot ? '' : ` font-family="Chango, 'Arial Black', sans-serif" font-size="${f(px)}"`;
    return `<g fill="${col}"${stroke}${fam}${g}>${body}</g>`;
  }
  const defs = S.goo>0
    ? `<defs><filter id="goo" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${f(S.goo/100*0.045*px)}"/><feComponentTransfer><feFuncA type="linear" slope="16" intercept="-7.5"/></feComponentTransfer></filter></defs>` : '';
  const bg = dom('svgbg').checked ? `<rect width="${W}" height="${H}" fill="${S.bg}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs}${bg}${layer(S.sh,S.sx*k,S.sy*k)}${layer(S.fg,0,0)}</svg>`;
}
function bindExport(){
  const note = t => { dom('svgnote').textContent = t; };
  dom('svgdl').hidden = !!window.claude;                 // saving is blocked inside the Claude artifact viewer; shown on OpenProcessing
  dom('svgcopy').onclick = () => {
    const svg = buildSVG(); dom('svgout').value = svg;
    (navigator.clipboard ? navigator.clipboard.writeText(svg) : Promise.reject())
      .then(()=>note(getOT(S.font) ? 'SVG copied. Paste it into Figma or save as .svg.' : 'Copied, but this font has no outline data, so letters are live text.'))
      .catch(()=>{ dom('svgout').hidden=false; dom('svgout').select(); note('Clipboard blocked. The code is selected below, copy it with Cmd+C.'); });
  };
  dom('svgdl').onclick = () => {
    const svg = buildSVG(); dom('svgout').value = svg;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([svg], {type:'image/svg+xml'})); a.download = 'kickoff-text.svg'; a.click();
    note('If nothing downloaded, your viewer blocks saves. Use Copy SVG instead.');
  };
  dom('svgshow').onclick = () => {
    const o = dom('svgout'); o.hidden = !o.hidden;
    if (!o.hidden){ o.value = buildSVG(); } dom('svgshow').textContent = o.hidden ? 'Show code' : 'Hide code';
  };
}
function doubleClicked(){
  if (mouseX<0||mouseY<0||mouseX>width||mouseY>height) return;
  txt().focus(); txt().select(); blink=true; syncLS(); redraw();
}

// ---- Letter spacing: tied to the text cursor ----
function gaps(){          // indices of characters whose "space after" the cursor edits
  const t = txt().value, a = txt().selectionStart, b = txt().selectionEnd, g = [];
  if (a===b){ if (a>0 && t[a-1]!=='\n') g.push(a-1); }
  else for (let i=a;i<b;i++) if (t[i]!=='\n') g.push(i);
  return g;
}
const fmt = v => (Math.round(v)/10).toString().replace(/\.0$/,'') + '%';
function syncLS(){
  const g = gaps(), el = dom('ls');
  el.disabled = !g.length;
  if (!g.length){ el.value = '—'; return; }
  const vs = new Set(g.map(i=>S.kern[i]||0));
  el.value = vs.size>1 ? 'Mixed' : fmt([...vs][0]);
}
function setLS(units, relative){
  const g = gaps(); if (!g.length) return;
  g.forEach(i=> S.kern[i] = Math.max(-500, Math.min(800, relative ? (S.kern[i]||0)+units : units)));
  syncLS(); redraw();
}
const num = s => { const m = String(s).match(/-?\d*\.?\d+/); return m ? parseFloat(m[0]) : null; };

// keep kerning attached to the right letters when text is edited
function reconcile(){
  const o = prevText, n = txt().value;
  let a = 0; while (a<o.length && a<n.length && o[a]===n[a]) a++;
  let b = 0; while (b<o.length-a && b<n.length-a && o[o.length-1-b]===n[n.length-1-b]) b++;
  S.kern = S.kern.slice(0,a).concat(new Array(n.length-a-b).fill(0), S.kern.slice(o.length-b, o.length));
  prevText = n;
}

function bindUI(){
  const T = txt();
  T.oninput = ()=>{ reconcile(); syncLS(); redraw(); };
  ['keyup','click','select','focus','blur'].forEach(ev=> T.addEventListener(ev, ()=>{ blink=true; syncLS(); redraw(); }));
  document.addEventListener('selectionchange', ()=>{ if (document.activeElement===T){ syncLS(); redraw(); } });
  T.addEventListener('keydown', e=>{
    if (e.altKey && (e.key==='ArrowRight'||e.key==='ArrowLeft')){ e.preventDefault(); setLS((e.key==='ArrowRight'?1:-1)*(e.shiftKey?50:10), true); }
  });
  dom('font').onchange = e=>{ S.font=+e.target.value; setStatus(); redraw(); };
  dom('weight').onchange = e=>{ S.weight=e.target.value; redraw(); };
  dom('size').onchange = dom('size').oninput = e=>{ const v=num(e.target.value); if (v>=8){ S.size=Math.min(900,v); redraw(); } };
  dom('lead').onchange = e=>{ const s=e.target.value.toLowerCase(); const v = s.includes('auto') ? 100 : num(s); if (v>=30) S.lead=v/100; e.target.value=Math.round(S.lead*100)+'%'; redraw(); };
  dom('ls').onchange = e=>{ const v=num(e.target.value); if (v!==null) setLS(v*10,false); else syncLS(); };
  dom('ls').onkeydown = e=>{ if (e.key==='ArrowUp'||e.key==='ArrowDown'){ e.preventDefault(); setLS((e.key==='ArrowUp'?1:-1)*(e.shiftKey?50:10), true); } };
  const setTR = u=>{ S.track = Math.max(-500, Math.min(800, u)); dom('track').value = fmt(S.track); redraw(); };
  dom('track').onchange = e=>{ const v=num(e.target.value); setTR(v===null ? S.track : v*10); };
  dom('track').onkeydown = e=>{ if (e.key==='ArrowUp'||e.key==='ArrowDown'){ e.preventDefault(); setTR(S.track+(e.key==='ArrowUp'?1:-1)*(e.shiftKey?50:10)); } };
  const icT = dom('icoTR'); let lt = 0;
  icT.onpointerdown = e=>{ lt=e.clientX; icT.setPointerCapture(e.pointerId); };
  icT.onpointermove = e=>{ if (e.buttons){ const d=Math.round((e.clientX-lt)/3); if (d){ setTR(S.track+d*5); lt=e.clientX; } } };
  let last = 0; const ico = dom('icoLS');
  ico.onpointerdown = e=>{ last=e.clientX; ico.setPointerCapture(e.pointerId); };
  ico.onpointermove = e=>{ if (e.buttons){ const d=Math.round((e.clientX-last)/3); if (d){ setLS(d*5,true); last=e.clientX; } } };
  const ic2 = dom('icoLH'); let l2 = 0;
  ic2.onpointerdown = e=>{ l2=e.clientX; ic2.setPointerCapture(e.pointerId); };
  ic2.onpointermove = e=>{ if (e.buttons){ const d=Math.round((e.clientX-l2)/3); if (d){ S.lead=Math.max(.3,S.lead+d/100); dom('lead').value=Math.round(S.lead*100)+'%'; l2=e.clientX; redraw(); } } };
  [['goo','goo','',1],['warp','warp','',1],['wl','wl','',1],['xs','xs','%',100],['ys','ys','%',100],['sx','sx','',1],['sy','sy','',1]].forEach(([id,k,u,div])=>{
    const el=dom(id), out=el.parentElement.querySelector('output');
    const go=()=>{ S[k]=+el.value/div; out.textContent=el.value+u; };
    el.oninput=()=>{ go(); redraw(); }; go();
  });
  dom('anim').onchange = e=>{ S.anim=e.target.checked; if (S.anim){ frameRate(30); loop(); } else noLoop(); redraw(); };
  [['cfg','fg'],['csh','sh'],['cbg','bg']].forEach(([id,k])=>{ dom(id).oninput=e=>{ S[k]=e.target.value; redraw(); }; S[k]=dom(id).value; });
  dom('resetk').onclick = ()=>{ S.kern = S.kern.map(()=>0); syncLS(); redraw(); };
  dom('upload').onclick = ()=>dom('file').click();
  dom('file').onchange = async e=>{
    const f = e.target.files[0]; if (!f) return;
    const i = FONTS.length, name = f.name.replace(/\.[^.]+$/,'');
    const buf = await f.arrayBuffer(), ff = new FontFace('kf'+i, buf.slice(0));
    try { await ff.load(); document.fonts.add(ff); } catch(err){ dom('fstatus').textContent='That file could not be read as a font.'; return; }
    FONTS.push([name+' (uploaded)', null]); FONTS[i].ok = true; FONTS[i].buf = buf; families[i] = `"kf${i}", ${FALLBACK}`;
    const o=document.createElement('option'); o.value=i; o.textContent=FONTS[i][0]; dom('font').appendChild(o);
    dom('font').value=i; S.font=i; setStatus(); redraw();
  };
  dom('copy').onclick = ()=>{
    const out = JSON.stringify({font:FONTS[S.font][0],weight:S.weight,size:S.size,lineHeight:S.lead,defaultSpacingPercent:S.track/10,gooey:S.goo,warp:S.warp,wavelength:S.wl,stretch:[S.xs,S.ys],
      shadow:[S.sx,S.sy],colors:[S.fg,S.sh,S.bg],text:txt().value,letterSpacingPercent:S.kern.map(v=>v/10)}, null, 1);
    const done=()=>{ dom('copy').textContent='Copied'; setTimeout(()=>dom('copy').textContent='Copy settings',1400); };
    (navigator.clipboard?navigator.clipboard.writeText(out):Promise.reject()).then(done).catch(()=>{ console.log(out); dom('copy').textContent='See console'; });
  };
  document.fonts.ready.then(()=>redraw());
}
