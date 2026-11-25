/* Export kit for the p5 motion tools: a small right-hand panel that records the sketch to MP4 or GIF.
   - Length (2 to 15 seconds), format (MP4 or GIF) and ratio (1:1 or 16:9).
   - While recording, the sketch is re-laid out at the export size (1080x1080 or 1920x1080) and shown framed inside the page,
     so the motion is composed for the ratio instead of cropped. Sketches size their canvas with ExportKit.size().
   - Frames are captured right after each p5 draw, so WEBGL canvases work too. MP4 uses WebCodecs (H.264, or VP9 where H.264
     is not available) muxed with mp4-muxer; GIF uses gifenc. Both libraries load only when an export starts.
   - Clicks from the walkthrough demo are untrusted: they play the recording preview but never encode or download a file.
   Load after p5 and before the sketch. */
(() => {
  'use strict';
  const MUXER = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.min.js';
  const GIFENC = 'https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js';
  const SIZES = { '1:1': [1080, 1080], '16:9': [1920, 1080] };
  const GIF_SIZES = { '1:1': [540, 540], '16:9': [800, 450] };
  const MP4_FPS = 30, GIF_FPS = 15;
  const navH = () => (typeof NAV_H !== 'undefined' ? NAV_H : 0);

  let rec = null;          // the recording in progress
  let saved = null;        // canvas style to restore afterwards

  /* ---------- styles ---------- */
  const css = document.createElement('style');
  css.textContent = `
    .xk-panel{position:absolute;right:20px;width:240px;z-index:10;padding:18px;border-radius:12px;font:13px/1.35 system-ui,sans-serif;
      color:#1a1a1a;background:rgba(255,255,255,.92);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
      border:1px solid rgba(0,0,0,.1);box-shadow:0 8px 32px rgba(0,0,0,.18);box-sizing:border-box}
    .xk-panel > b{display:block;margin-bottom:12px;font-size:14px}
    .xk-toggle{display:none;position:fixed;right:12px;bottom:12px;z-index:11;padding:10px 16px;border-radius:999px;border:0;
      background:#fff;color:#1a1a1a;font:600 13px system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25)}
    @media (max-width:699px){
      .xk-panel{position:fixed;left:12px;right:12px;top:auto!important;bottom:62px;width:auto;max-height:55vh;overflow:auto;display:none}
      .xk-panel.open{display:block}
      .xk-toggle{display:block}
    }
    .xk{--xk-accent:#1a1a1a;--xk-on:#fff;display:grid;gap:9px}
    :not(b) + .xk{margin-top:16px;padding-top:14px;border-top:1px solid rgba(127,127,127,.3)}
    .xk-h{font-weight:700}
    .xk-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .xk-row output{font-variant-numeric:tabular-nums;opacity:.75}
    .xk input[type=range]{width:100%;margin:0;accent-color:var(--xk-accent)}
    .xk-seg{display:inline-flex;border:1px solid rgba(127,127,127,.45);border-radius:6px;overflow:hidden}
    .xk-seg button{border:0;padding:5px 10px;background:transparent;color:inherit;font:600 12px system-ui,sans-serif;cursor:pointer}
    .xk-seg button[aria-pressed=true]{background:var(--xk-accent);color:var(--xk-on)}
    .xk-btn{width:100%;padding:9px 10px;border:0;border-radius:6px;background:var(--xk-accent);color:var(--xk-on);
      font:700 13px system-ui,sans-serif;cursor:pointer}
    .xk-btn.ghost{background:transparent;color:inherit;border:1px solid rgba(127,127,127,.45)}
    .xk-btn:disabled{opacity:.55;cursor:default}
    .xk-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .xk-bar{height:4px;border-radius:2px;background:rgba(127,127,127,.25);overflow:hidden;display:none}
    .xk-bar i{display:block;height:100%;width:0;background:var(--xk-accent)}
    .xk.busy .xk-bar{display:block}
    .xk-status{min-height:1em;font-size:12px;opacity:.75}
    .xk-rec{position:absolute;z-index:9;pointer-events:none;outline:1px solid rgba(255,255,255,.35)}
    .xk-rec span{position:absolute;left:10px;top:10px;padding:4px 8px;border-radius:4px;background:rgba(0,0,0,.6);color:#fff;
      font:600 11px system-ui,sans-serif;letter-spacing:.04em}
    .xk-rec span::before{content:'';display:inline-block;width:7px;height:7px;margin-right:6px;border-radius:50%;background:#ff4d3d;vertical-align:1px}`;
  document.head.appendChild(css);

  const el = (tag, attrs = {}, html = '') => { const e = document.createElement(tag); Object.assign(e, attrs); if (html) e.innerHTML = html; return e; };

  /* ---------- a right-hand panel for tools that do not have one (with a toggle on phones) ---------- */
  function panel(title, toggleLabel = 'Controls') {
    const p = el('div', { className: 'xk-panel' }, title ? `<b>${title}</b>` : '');
    p.style.top = (navH() + 20) + 'px';
    const t = el('button', { type: 'button', className: 'xk-toggle', textContent: toggleLabel });
    t.addEventListener('click', () => { const open = p.classList.toggle('open'); t.textContent = open ? 'Close' : toggleLabel; });
    document.body.append(p, t);
    return p;
  }

  function seg(options, value, onPick) {
    const s = el('div', { className: 'xk-seg', role: 'group' });
    options.forEach((o) => {
      const b = el('button', { type: 'button', textContent: o });
      b.setAttribute('aria-pressed', String(o === value));
      b.addEventListener('click', () => { [...s.children].forEach((c) => c.setAttribute('aria-pressed', String(c === b))); onPick(o); });
      s.appendChild(b);
    });
    return s;
  }

  /* ---------- the motion export section ---------- */
  function motion(opts = {}) {
    const mount = opts.mount || panel(null, 'Export');
    const state = { len: opts.length || 6, fmt: 'MP4', ratio: '16:9' };
    const box = el('section', { className: 'xk' });
    if (opts.accent) box.style.setProperty('--xk-accent', opts.accent);
    if (opts.accentText) box.style.setProperty('--xk-on', opts.accentText);
    box.innerHTML = `<div class="xk-h">${opts.heading || 'Export motion'}</div>
      <div class="xk-row"><span>Length</span><output>${state.len} s</output></div>
      <input type="range" min="2" max="15" step="1" value="${state.len}" aria-label="Export length in seconds">`;
    const out = box.querySelector('output'), range = box.querySelector('input');
    range.addEventListener('input', () => { state.len = +range.value; out.textContent = state.len + ' s'; });
    const go = el('button', { type: 'button', className: 'xk-btn' });
    const paint = () => { go.textContent = `Export ${state.fmt} · ${state.ratio}`; };
    const fmtRow = el('div', { className: 'xk-row' }, '<span>Format</span>');
    fmtRow.appendChild(seg(['MP4', 'GIF'], state.fmt, (v) => { state.fmt = v; paint(); }));
    const ratioRow = el('div', { className: 'xk-row' }, '<span>Ratio</span>');
    ratioRow.appendChild(seg(['1:1', '16:9'], state.ratio, (v) => { state.ratio = v; paint(); }));
    const bar = el('div', { className: 'xk-bar' }, '<i></i>');
    const status = el('div', { className: 'xk-status', role: 'status' });
    box.append(fmtRow, ratioRow, go, bar, status);
    paint();
    mount.appendChild(box);

    const ui = {
      progress: (k, text) => { bar.firstChild.style.width = Math.round(k * 100) + '%'; if (text != null) status.textContent = text; },
      busy: (on) => { box.classList.toggle('busy', on); go.disabled = on; range.disabled = on; },
    };
    go.addEventListener('click', (e) => {
      if (rec) return;
      start({ seconds: state.len, format: state.fmt.toLowerCase(), ratio: state.ratio, name: opts.name || 'motion', dry: !e.isTrusted, ui });
    });
    return box;
  }

  /* ---------- recording ---------- */
  const canvasEl = () => document.querySelector('canvas.p5Canvas') || document.querySelector('canvas');
  const relayout = () => { if (typeof window.windowResized === 'function') window.windowResized(); else if (typeof window.resizeCanvas === 'function') window.resizeCanvas(...size()); };

  function size() {
    if (rec) return rec.size.slice();
    return [window.innerWidth, window.innerHeight - navH()];
  }

  function frameCanvas() {
    const c = canvasEl(); if (!c || !rec) return;
    const [W, H] = rec.size;
    const top = navH(), sw = window.innerWidth, sh = window.innerHeight - top;
    const k = Math.min(sw / W, sh / H) * 0.88;
    const w = Math.round(W * k), h = Math.round(H * k);
    const x = Math.round((sw - w) / 2), y = Math.round(top + (sh - h) / 2);
    Object.assign(c.style, { position: 'absolute', left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    Object.assign(rec.badge.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
  }

  const loadScript = (src) => new Promise((ok, fail) => { const s = el('script', { src }); s.onload = ok; s.onerror = () => fail(new Error('Could not load ' + src)); document.head.appendChild(s); });

  async function mp4Encoder(W, H) {
    if (typeof VideoEncoder === 'undefined') throw new Error('MP4 export needs a browser with WebCodecs (recent Chrome, Edge, Safari or Firefox).');
    if (!window.Mp4Muxer) await loadScript(MUXER);
    const tries = [
      { muxCodec: 'avc', codec: 'avc1.640028' },
      { muxCodec: 'avc', codec: 'avc1.4d0028' },
      { muxCodec: 'vp9', codec: 'vp09.00.40.08' },
    ];
    let pick = null;
    for (const t of tries) {
      const cfg = { codec: t.codec, width: W, height: H, bitrate: 10e6, framerate: MP4_FPS };
      try { if ((await VideoEncoder.isConfigSupported(cfg)).supported) { pick = { ...t, cfg }; break; } } catch (e) { /* next */ }
    }
    if (!pick) throw new Error('This browser cannot encode MP4 video.');
    const muxer = new Mp4Muxer.Muxer({ target: new Mp4Muxer.ArrayBufferTarget(), video: { codec: pick.muxCodec, width: W, height: H, frameRate: MP4_FPS }, fastStart: 'in-memory' });
    let failed = null;
    const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { failed = e; } });
    enc.configure(pick.cfg);
    return {
      fps: MP4_FPS,
      add(canvas, i) {
        if (failed) throw failed;
        const f = new VideoFrame(canvas, { timestamp: Math.round(i * 1e6 / MP4_FPS), duration: Math.round(1e6 / MP4_FPS) });
        enc.encode(f, { keyFrame: i % (MP4_FPS * 2) === 0 }); f.close();
      },
      async finish() { await enc.flush(); if (failed) throw failed; enc.close(); muxer.finalize(); return new Blob([muxer.target.buffer], { type: 'video/mp4' }); },
      cancel() { try { enc.close(); } catch (e) { /* ignore */ } },
    };
  }

  async function gifEncoder(W, H) {
    const { GIFEncoder, quantize, applyPalette } = await import(GIFENC);
    const gif = GIFEncoder();
    return {
      fps: GIF_FPS,
      add(canvas) {
        const data = canvas.getContext('2d').getImageData(0, 0, W, H).data;
        const palette = quantize(data, 256);
        gif.writeFrame(applyPalette(data, palette), W, H, { palette, delay: Math.round(1000 / GIF_FPS) });
      },
      async finish() { gif.finish(); return new Blob([gif.bytes()], { type: 'image/gif' }); },
      cancel() {},
    };
  }

  /* opts: seconds, format ('mp4' | 'gif'), ratio ('1:1' | '16:9'), name, dry (preview only), ui (optional progress hooks).
     Resolves with the file Blob (null for a dry run). */
  function start(opts) {
    if (rec) return Promise.reject(new Error('Already recording'));
    const ui = opts.ui || { progress() {}, busy() {} };
    const fmt = opts.format === 'gif' ? 'gif' : 'mp4';
    const ratio = SIZES[opts.ratio] ? opts.ratio : '16:9';
    const seconds = Math.max(1, Math.min(30, +opts.seconds || 6));
    const [cw, ch] = fmt === 'gif' ? GIF_SIZES[ratio] : SIZES[ratio];
    const c = canvasEl();
    if (!c) return Promise.reject(new Error('No canvas'));

    return new Promise((resolve, reject) => {
      (async () => {
        ui.busy(true);
        ui.progress(0, opts.dry ? 'Preview' : 'Preparing…');
        let encoder = null;
        if (!opts.dry) {
          try { encoder = fmt === 'gif' ? await gifEncoder(cw, ch) : await mp4Encoder(cw, ch); }
          catch (err) { ui.busy(false); ui.progress(0, err.message); reject(err); return; }
        }
        const cap = el('canvas'); cap.width = cw; cap.height = ch;
        const badge = el('div', { className: 'xk-rec' }, `<span>REC ${ratio} · ${fmt.toUpperCase()}</span>`);
        document.body.appendChild(badge);
        saved = c.style.cssText;
        const hold = el('div'); hold.style.height = c.getBoundingClientRect().height + 'px';   // keeps the page below in place
        c.before(hold);
        rec = { size: SIZES[ratio], fps: encoder ? encoder.fps : MP4_FPS, seconds, t0: null, n: 0, cap, ctx: cap.getContext('2d', { willReadFrequently: fmt === 'gif' }),
          encoder, ui, badge, hold, resolve, reject, name: opts.name || 'motion', fmt, ratio, done: false };
        relayout();
        frameCanvas();
        window.addEventListener('resize', frameCanvas);
      })();
    });
  }

  async function finish(err) {
    const r = rec; if (!r || r.done) return;
    r.done = true;
    window.removeEventListener('resize', frameCanvas);
    rec = null;
    r.badge.remove(); r.hold.remove();
    const c = canvasEl(); if (c) c.style.cssText = saved || '';
    relayout();
    if (err) { if (r.encoder) r.encoder.cancel(); r.ui.busy(false); r.ui.progress(0, 'Export failed: ' + err.message); r.reject(err); return; }
    if (!r.encoder) { r.ui.progress(1, 'Preview done'); setTimeout(() => { r.ui.busy(false); r.ui.progress(0, ''); }, 900); r.resolve(null); return; }
    try {
      r.ui.progress(1, 'Encoding…');
      const blob = await r.encoder.finish();
      const file = `${r.name}-${r.ratio.replace(':', 'x')}-${r.seconds}s.${r.fmt}`;
      const a = el('a', { href: URL.createObjectURL(blob), download: file });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      r.ui.busy(false); r.ui.progress(0, `Saved ${file} (${(blob.size / 1048576).toFixed(1)} MB)`);
      r.resolve(blob);
    } catch (e) { r.ui.busy(false); r.ui.progress(0, 'Export failed: ' + e.message); r.reject(e); }
  }

  /* called after every p5 draw: sample the canvas at the export frame rate, in real time. When the sketch draws slower than
     the export frame rate, the last drawn frame is repeated, so the file always runs for the length that was asked for. */
  function onPost() {
    const r = rec; if (!r || r.done) return;
    const now = performance.now();
    if (r.t0 === null) r.t0 = now;
    const t = (now - r.t0) / 1000;
    const total = Math.round(r.seconds * r.fps);
    const upTo = t >= r.seconds ? total : Math.min(total, Math.floor(t * r.fps) + 1);   // frames that should exist by now
    if (r.n < upTo) {
      const c = canvasEl(); if (!c) return;
      try {
        r.ctx.drawImage(c, 0, 0, r.cap.width, r.cap.height);
        for (; r.n < upTo; r.n++) if (r.encoder) r.encoder.add(r.cap, r.n);
      } catch (e) { finish(e); return; }
    }
    if (r.n >= total) { finish(); return; }
    r.ui.progress(t / r.seconds, `Recording ${t.toFixed(1)} / ${r.seconds} s`);
  }
  if (window.p5 && p5.prototype.registerMethod) p5.prototype.registerMethod('post', onPost);

  window.ExportKit = { size, panel, motion, start, seg, isRecording: () => !!rec };
})();
