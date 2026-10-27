"""Rebuild everything from index.html: python3 build.py
 - index.embedded.html : artifact build (fonts embedded as data URIs)
 - sketch.js           : self-contained OpenProcessing sketch (fonts loaded from uploaded files)
 - sketch-code.html    : code viewer page"""
import re, os, json, glob, base64, html
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s = open('index.html').read()

# 1. artifact build
d = {}
for f in glob.glob('fonts/*'):
    n, e = os.path.splitext(os.path.basename(f))
    d[n] = "data:%s;base64," % ('font/otf' if e.lower() == '.otf' else 'font/ttf') + base64.b64encode(open(f, 'rb').read()).decode()
open('index.embedded.html', 'w').write(s.replace('const FONT_DATA = {};', 'const FONT_DATA = ' + json.dumps(d) + ';', 1))

# 2. OpenProcessing sketch
css = re.search(r'<style>(.*?)</style>', s, re.S).group(1)
markup = re.search(r'(<div id="app">.*?</aside>\s*</div>)', s, re.S).group(1)
js = re.findall(r'<script>(.*?)</script>', s, re.S)[0]
files = {os.path.splitext(f)[0]: f for f in sorted(os.listdir('fonts'))}
js = js.replace('const FONT_DATA = {};   // font files embedded as data URIs by the build step (see fonts/ folder)',
    '// Upload these files to your OpenProcessing sketch (Files panel) with exactly these names\nconst FONT_FILES = ' + json.dumps(files, indent=1) + ';')
js = js.replace("if (f[1] && FONT_DATA[f[1]]) tryLoad(i, `url(${FONT_DATA[f[1]]})`);", "if (f[1] && FONT_FILES[f[1]]) loadFile(i, FONT_FILES[f[1]]);")
js, n = re.subn(r'function tryLoad\(i, src\)\{.*?\n\}\n', """function loadFile(i, url){            // fetch the uploaded file: used for the canvas font and for SVG outlines
  fetch(url).then(r=>{ if(!r.ok) throw 0; return r.arrayBuffer(); }).then(async buf=>{
    const ff = new FontFace('kf'+i, buf.slice(0)); await ff.load(); document.fonts.add(ff);
    FONTS[i].buf = buf; FONTS[i].ok = true; setStatus(); redraw();
  }).catch(()=>{ FONTS[i].ok = false; setStatus(); });
}
""", js, count=1, flags=re.S); assert n == 1
js, n = re.subn(r"  if \(!buf && f\[1\] && FONT_DATA\[f\[1\]\]\)\{.*?\n  \}\n", '', js, count=1, flags=re.S); assert n == 1
assert 'FONT_DATA' not in js
js = js.replace("'Font failed to load, showing Chango.'", "'Font file not found. Upload it to the sketch, or use Load font file.'")
js = js.replace("const $ = id =>", "const dom = id =>").replace("$(", "dom(")
css = css.replace('#app{display:flex;height:100%}', '#app{position:fixed;inset:0;display:flex;z-index:10;background:var(--bg)}')
head = f"""/* Kick Off Type Lab for OpenProcessing. One file: it builds its own UI, so no HTML or CSS files are needed.
   Setup: 1) paste this as sketch.js  2) upload the fonts listed in FONT_FILES  3) hit run. */
(function injectUI(){{
  const link = document.createElement('link'); link.rel='stylesheet';
  link.href='https://fonts.googleapis.com/css2?family=Chango&family=Inter:wght@400;500;600&display=swap';
  document.head.appendChild(link);
  const lib = document.createElement('script');                 // opentype.js, used by the SVG exporter
  lib.src='https://cdnjs.cloudflare.com/ajax/libs/opentype.js/1.3.4/opentype.min.js'; document.head.appendChild(lib);
  const st = document.createElement('style'); st.textContent = {json.dumps(css)};
  document.head.appendChild(st);
  const wrap = document.createElement('div'); wrap.innerHTML = {json.dumps(markup)};
  document.body.appendChild(wrap.firstElementChild);
}})();

"""
code = head + js.strip() + "\n"
open('sketch.js', 'w').write(code)

# 3. code viewer page
v = open('sketch-code.html').read()
v = re.sub(r'<pre id="code">.*?</pre>', lambda m: '<pre id="code">' + html.escape(code) + '</pre>', v, flags=re.S)
v = re.sub(r'\d+ lines', '%d lines' % len(code.splitlines()), v, count=1)
open('sketch-code.html', 'w').write(v)
print('built', len(code))
