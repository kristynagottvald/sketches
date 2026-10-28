#!/usr/bin/env node
/* Encode a folder of frames into a looping WebM (VP9) using Chrome's built-in encoder.
 *
 *   node tools/encode-webm.mjs <frames-dir> <out.webm> [--fps 12] [--size 1280x720] [--kbps 1500]
 *
 * Needs Google Chrome (set CHROME=/path/to/chrome if it is not in the usual place) and Node 22+.
 * Frames are read in name order (png or jpg). The clip is recorded in real time, one frame
 * per tick, so a 72-frame clip at 12 fps takes about 6 seconds to encode.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const [dir, out] = args;
const opt = (name, def) => { const i = args.indexOf('--' + name); return i > -1 ? args[i + 1] : def; };
if (!dir || !out) { console.error('usage: encode-webm.mjs <frames-dir> <out.webm> [--fps 12] [--size 1280x720] [--kbps 1500]'); process.exit(1); }
const fps = +opt('fps', 12), [W, H] = opt('size', '1280x720').split('x').map(Number), kbps = +opt('kbps', 1500);
const chrome = process.env.CHROME || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium',
].find((p) => fs.existsSync(p));
if (!chrome) { console.error('Chrome not found. Set CHROME=/path/to/chrome'); process.exit(1); }

const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
if (!files.length) { console.error('no frames in ' + dir); process.exit(1); }

const port = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'webm-enc-'));
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
try {
  let page;
  for (let i = 0; i < 50 && !page; i++) { await sleep(200); try { page = (await (await fetch(`http://localhost:${port}/json`)).json()).find((t) => t.type === 'page'); } catch {} }
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
  const call = (expression) => new Promise((res, rej) => { const i = ++id; pend.set(i, (m) => (m.result?.exceptionDetails ? rej(new Error(m.result.exceptionDetails.exception?.description || 'page error')) : res(m.result?.result?.value))); ws.send(JSON.stringify({ id: i, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } })); });

  await call(`window.__frames = [];
    window.__add = async (list) => { for (const d of list) { const b = await (await fetch('data:image/png;base64,' + d)).blob(); window.__frames.push(await createImageBitmap(b)); } return window.__frames.length; };
    window.__encode = (w, h, fps, bps) => new Promise((res) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
      const stream = c.captureStream(0), track = stream.getVideoTracks()[0];
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: bps });
      const chunks = []; rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => { const buf = new Uint8Array(await new Blob(chunks).arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000)); res(btoa(s)); };
      rec.start(); let i = 0; const t0 = performance.now();
      const tick = () => { if (i >= window.__frames.length) return setTimeout(() => rec.stop(), 250); x.drawImage(window.__frames[i], 0, 0, w, h); track.requestFrame(); i++; setTimeout(tick, Math.max(0, t0 + i * 1000 / fps - performance.now())); };
      tick();
    });`);
  for (let i = 0; i < files.length; i += 6) {
    const batch = files.slice(i, i + 6).map((f) => fs.readFileSync(path.join(dir, f)).toString('base64'));
    await call(`window.__add(${JSON.stringify(batch)})`);
  }
  const b64 = await call(`window.__encode(${W}, ${H}, ${fps}, ${kbps * 1000})`);
  fs.writeFileSync(out, Buffer.from(b64, 'base64'));
  console.log(`${out}  ${Math.round(fs.statSync(out).size / 1024)} KB  (${files.length} frames, ${fps} fps, ${W}x${H}, ${kbps} kbps)`);
} finally {
  try { ws?.close(); } catch {}
  proc.kill();
  await new Promise((r) => { proc.once('exit', r); setTimeout(r, 1500); });
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
}
process.exit(0);
