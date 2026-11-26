/* Walkthrough demo engine for the tool pages.
   - A shield sits over the tool: clicks, taps, keys and drags from the visitor never reach it, but the page scrolls normally.
   - A scripted cursor then drives the tool's real controls through a short sequence, on a loop, while the tool is on screen.
   - Scripts live in demo-scripts.js, keyed by project id. Every action skips quietly if its control is not on the page,
     so a missing selector never throws or stops the demo.
   Load this file in the <head> (before the tool's own scripts) so the input filter runs first. */
(() => {
  'use strict';
  /* ?embed=1: the page is shown inside the home page hero. No nav, About or Contact, the tool fills the frame, and the demo waits for the home page to say go. */
  const EMBED = /[?&]embed=1/.test(location.search);
  if (EMBED) document.documentElement.classList.add('embed');
  if (EMBED) {
    // the hero demo is silent: audio contexts are created suspended and can never resume, media never plays
    ['AudioContext', 'webkitAudioContext'].forEach((k) => {
      const Orig = window[k]; if (!Orig) return;
      Orig.prototype.resume = function () { return Promise.resolve(); };
      const Quiet = function (...args) { const c = new Orig(...args); try { c.suspend(); } catch (e) { /* ignore */ } return c; };
      Quiet.prototype = Orig.prototype;
      window[k] = Quiet;
    });
    HTMLMediaElement.prototype.play = function () { this.muted = true; this.volume = 0; return Promise.resolve(); };
    // Inside the home page hero the tool must never move the visitor's scroll position: scrollIntoView and focus() in a frame
    // also scroll the page that contains the frame.
    Element.prototype.scrollIntoView = function () {};
    HTMLElement.prototype.focus = function () {};
    window.focus = function () {};
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ---------- sound: off until the visitor switches it on with the toggle next to the Demo label ---------- */
  const audio = { muted: true, ctxs: [], resume: null };
  window.__demoAudio = audio;
  if (!EMBED) {
    const seen = new WeakSet();
    ['AudioContext', 'webkitAudioContext'].forEach((k) => {
      const Orig = window[k]; if (!Orig || seen.has(Orig.prototype)) return;
      seen.add(Orig.prototype);
      const origResume = Orig.prototype.resume;
      audio.resume = (c) => origResume.call(c);
      Orig.prototype.resume = function () { return audio.muted ? Promise.resolve() : origResume.apply(this, arguments); };
      const Tracked = class extends Orig { constructor(...args) { super(...args); audio.ctxs.push(this); if (audio.muted) { try { this.suspend(); } catch (e) { /* ignore */ } } } };
      window[k] = Tracked;
    });
  }
  const UI = 'data-demo-ui';
  const inUI = (el) => !!(el && el.closest && el.closest('[' + UI + '],.site-nav,.about-project,.contact-project'));

  /* ---------- block the visitor's input from reaching the tool (synthetic events from the demo are untrusted, so they pass) ---------- */
  const POINTER = ['pointerdown', 'pointerup', 'pointermove', 'pointerover', 'pointerout', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout',
    'click', 'dblclick', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'dragstart', 'wheel'];
  const KEYS = ['keydown', 'keyup', 'keypress'];
  const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown']);
  POINTER.forEach((t) => window.addEventListener(t, (e) => {
    if (!e.isTrusted) return;
    const tgt = e.target;
    const scrollish = e.type === 'wheel' || e.type.startsWith('touch');   // the tool never sees these, wherever they land, so it cannot cancel page scrolling
    if (!scrollish && tgt && tgt.closest && tgt.closest('.site-nav,.about-project,.contact-project,.tools-project,.foot-project,.demo-dock')) return;   // nav, About and Contact keep working
    e.stopImmediatePropagation();   // no preventDefault: the page still scrolls, links in the nav still work
  }, true));
  KEYS.forEach((t) => window.addEventListener(t, (e) => {
    if (!e.isTrusted) return;
    const tgt = e.target;
    if (tgt && tgt.closest && tgt.closest('.site-nav,.about-project,.contact-project,.tools-project,.foot-project,.demo-dock')) return;
    e.stopImmediatePropagation();
    if (!SCROLL_KEYS.has(e.key) && e.key !== 'Tab') e.preventDefault();
  }, true));

  /* ---------- shield, cursor and caption ---------- */
  let shield, cursor, caption, mute, frame, dock, navH = 80;
  const SVG = '<svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true"><path d="M2 1.5v16l4.2-3.9 2.7 6.1 2.6-1.1-2.7-6H15z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  function build() {
    const css = document.createElement('style');
    css.textContent = `
      .demo-shield{position:fixed;left:0;right:0;bottom:0;top:80px;z-index:90;background:transparent;touch-action:pan-y pinch-zoom;cursor:default;-webkit-user-select:none;user-select:none}
      .demo-cursor{position:absolute;left:0;top:0;z-index:95;width:20px;height:22px;pointer-events:none;opacity:0;transition:opacity .35s linear;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45));will-change:transform}
      .demo-cursor.on{opacity:1}
      .demo-ripple{position:absolute;z-index:94;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:2px solid rgba(255,255,255,.95);box-shadow:0 0 0 1px rgba(20,20,50,.4),inset 0 0 0 1px rgba(20,20,50,.4);pointer-events:none;opacity:0;transform:scale(.25);animation:demo-ripple .6s ease-out forwards}
      @keyframes demo-ripple{0%{opacity:.9;transform:scale(.25)}100%{opacity:0;transform:scale(1)}}
      .demo-cursor svg{display:block;transition:transform .12s ease-out;transform-origin:3px 2px}
      .demo-cursor.down svg{transform:scale(.82)}
      .demo-dock{position:absolute;left:16px;bottom:16px;z-index:96;display:flex;flex-direction:column;align-items:flex-start;gap:8px;max-width:calc(100vw - 32px);pointer-events:none}
      .demo-caption{max-width:100%;pointer-events:none;display:inline-flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;background:rgba(24,23,22,.78);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#e8e8e8;font:400 12px/1.3 "Inter","Helvetica Neue",Helvetica,Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;transition:opacity .3s}
      .demo-caption, .demo-caption span{color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:none!important}
      .demo-caption{background:rgba(24,23,22,.86)!important}
      .demo-caption i{width:6px;height:6px;border-radius:50%;background:#8fd694;flex:none}
      .demo-mute{pointer-events:auto;display:none;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:0;border-radius:8px;background:rgba(24,23,22,.86);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;cursor:pointer;transition:background .2s}
      .demo-mute:hover{background:rgba(60,58,56,.92)}
      .demo-mute svg{display:block}
      .demo-mute:focus-visible{outline:2px solid #d7ff3a;outline-offset:2px}
      .demo-dock.has-sound .demo-mute{display:inline-flex}
      .site-nav .tools{display:none!important}
      .demo-frame{position:absolute;left:0;right:0;top:80px;height:calc(100vh - 80px);overflow:hidden;pointer-events:none;z-index:91}
      .demo-frame i{position:absolute;inset:0 8px 8px 8px;border-radius:8px;box-shadow:0 0 0 100vmax #181716}
      html.embed .demo-frame{display:none!important}
      html.embed .demo-dock{display:none!important}
      @media (max-width:600px){.demo-caption{font-size:11px}}`;
    document.head.appendChild(css);
    shield = document.createElement('div'); shield.className = 'demo-shield'; shield.setAttribute(UI, ''); shield.setAttribute('aria-hidden', 'true');
    cursor = document.createElement('div'); cursor.className = 'demo-cursor'; cursor.setAttribute(UI, ''); cursor.innerHTML = SVG;
    caption = document.createElement('div'); caption.className = 'demo-caption'; caption.setAttribute(UI, '');
    caption.innerHTML = '<i></i><span>Demo</span>';
    mute = document.createElement('button');
    mute.type = 'button'; mute.className = 'demo-mute'; mute.setAttribute(UI, '');
    mute.addEventListener('click', () => {
      audio.muted = !audio.muted;
      audio.ctxs.forEach((c) => { try { if (audio.muted) c.suspend(); else if (audio.resume) audio.resume(c); } catch (e) { /* ignore */ } });
      if (!audio.muted && typeof window.userStartAudio === 'function') { try { window.userStartAudio(); } catch (e) { /* ignore */ } }
      paintMute();
    });
    paintMute();
    frame = document.createElement('div'); frame.className = 'demo-frame'; frame.setAttribute(UI, ''); frame.setAttribute('aria-hidden', 'true'); frame.innerHTML = '<i></i>';
    dock = document.createElement('div'); dock.className = 'demo-dock'; dock.setAttribute(UI, '');
    dock.append(mute, caption);   // the sound toggle sits above the label
    document.body.append(frame, shield, cursor, dock);
    placeShield();
  }
  const ICON_OFF = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.6L12 18.5v-13L7.6 9.5z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>';
  const ICON_ON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.6L12 18.5v-13L7.6 9.5z"/><path d="M15.5 9a4.2 4.2 0 010 6M18 6.5a8 8 0 010 11"/></svg>';
  function paintMute() {
    if (!mute) return;
    mute.innerHTML = audio.muted ? ICON_OFF : ICON_ON;
    mute.setAttribute('aria-label', audio.muted ? 'Sound is off. Turn sound on' : 'Sound is on. Turn sound off');
    mute.setAttribute('aria-pressed', String(!audio.muted));
    mute.title = audio.muted ? 'Sound off: click to turn on' : 'Sound on: click to turn off';
  }
  function placeShield() {
    const nav = document.querySelector('.site-nav');
    navH = nav ? Math.round(nav.getBoundingClientRect().bottom + scrollY) : 80;
    shield.style.top = Math.max(0, navH - Math.min(scrollY, navH)) + 'px';
    frame.style.top = navH + 'px'; frame.style.height = Math.max(0, innerHeight - navH) + 'px';   // the tool sits inside a rounded, inset mask
  }

  /* ---------- the driver ---------- */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  let alive = true, onScreen = true, stepText = '', noteText = '';
  const onTop = () => scrollY < innerHeight * 0.45 && !document.hidden;

  const pos = { x: innerWidth * 0.5, y: innerHeight * 0.55 };
  const stage = () => ({ x: 0, y: navH, w: innerWidth, h: innerHeight - navH });

  function visible(el) { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function resolve(t) {
    if (!t) return null;
    if (typeof t === 'string') { const el = document.querySelector(t); return el && visible(el) ? el : null; }
    if (t instanceof Element) return visible(t) ? t : null;
    return null;
  }
  function point(t, fx = .5, fy = .5) {
    if (Array.isArray(t)) { const s = stage(); return { x: s.x + t[0] * s.w, y: s.y + t[1] * s.h, el: null }; }
    if (t && typeof t === 'object' && 'x' in t && !(t instanceof Element)) return { x: t.x, y: t.y, el: null };
    const el = resolve(t); if (!el) return null;
    el.scrollIntoView && el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width * fx, y: r.top + r.height * fy, el };
  }
  const elAt = (x, y) => (document.elementsFromPoint(x, y) || []).find((e) => !e.closest('[' + UI + ']') && !e.closest('.site-nav,.about-project,.contact-project,.tools-project,.foot-project,.demo-dock')) || null;

  function fire(el, type, x, y, buttons = 0, button = 0) {
    if (!el) return;
    const base = { bubbles: true, cancelable: true, composed: true, view: window, clientX: x, clientY: y, screenX: x, screenY: y, button, buttons };
    try {
      if (type.startsWith('pointer')) el.dispatchEvent(new PointerEvent(type, { ...base, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
      else el.dispatchEvent(new MouseEvent(type, base));
    } catch (e) { /* ignore */ }
  }

  /* one subtle ring where the cursor clicks */
  const ripple = (x, y) => { const r = document.createElement('div'); r.className = 'demo-ripple'; r.setAttribute(UI, ''); r.style.left = (x + scrollX) + 'px'; r.style.top = (y + scrollY) + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700); };
  let pressed = false;
  // When the visitor scrolls the page the content moves under the cursor, so the cursor moves with it: keep its viewport position in step.
  let lastSX = scrollX, lastSY = scrollY;
  window.addEventListener('scroll', () => { pos.x -= scrollX - lastSX; pos.y -= scrollY - lastSY; lastSX = scrollX; lastSY = scrollY; }, { passive: true });
  function setCursor(x, y) {
    pos.x = x; pos.y = y;
    cursor.style.transform = `translate(${x - 3 + scrollX}px,${y - 2 + scrollY}px)`;   // page coordinates: the cursor scrolls with the content it is pointing at
    const el = elAt(x, y);
    if (el) { fire(el, 'pointermove', x, y, pressed ? 1 : 0); fire(el, 'mousemove', x, y, pressed ? 1 : 0); }
    return el;
  }

  const api = {
    wait: async (ms) => { const t0 = performance.now(); while (alive && performance.now() - t0 < ms) { await sleep(Math.min(60, ms)); if (!onTop()) await api.idle(); } },
    idle: async () => { while (alive && !onTop()) await sleep(250); },
    // an optional note stays on the label after the step text (for example: sound is activated by interaction)
    note: (text) => { noteText = text || ''; api.say(stepText); },
    say: (text) => { stepText = text || ''; caption.querySelector('span').textContent = ['Demo', stepText, noteText].filter(Boolean).join(' · '); },
    /* move the cursor to a selector, element, [fx, fy] (fractions of the tool area) or {x, y} */
    move: async (t, ms = 800, fx = .5, fy = .5) => {
      const p = point(t, fx, fy); if (!p) return false;
      ms = Math.max(260, ms * 0.62);   // the cursor travels a touch quicker than the durations the scripts ask for
      const x0 = pos.x + scrollX, y0 = pos.y + scrollY, px = p.x + scrollX, py = p.y + scrollY, t0 = performance.now();   // page coordinates
      while (alive) {
        if (!onTop()) await api.idle();
        const k = Math.min(1, (performance.now() - t0) / ms), e = ease(k);
        setCursor(x0 + (px - x0) * e - scrollX, y0 + (py - y0) * e - scrollY);
        if (k >= 1) break;
        await new Promise((r) => requestAnimationFrame(r));
      }
      return true;
    },
    press: async (hold = 120) => {
      const el = elAt(pos.x, pos.y); pressed = true; cursor.classList.add('down'); ripple(pos.x, pos.y);
      fire(el, 'pointerdown', pos.x, pos.y, 1); fire(el, 'mousedown', pos.x, pos.y, 1);
      await api.wait(hold);
      return el;
    },
    release: (el) => {
      pressed = false; cursor.classList.remove('down');
      const t = elAt(pos.x, pos.y) || el;
      fire(t, 'pointerup', pos.x, pos.y, 0); fire(t, 'mouseup', pos.x, pos.y, 0); fire(t, 'click', pos.x, pos.y, 0);
    },
    click: async (t, ms = 800, fx = .5, fy = .5) => {
      if (!(await api.move(t, ms, fx, fy))) return false;
      const el = await api.press(); api.release(el);
      await api.wait(250);
      return true;
    },
    /* right-click (flag, context actions): the cursor goes there, then presses with the right button */
    rightClick: async (t, ms = 800, fx = .5, fy = .5) => {
      if (!(await api.move(t, ms, fx, fy))) return false;
      const el = elAt(pos.x, pos.y); cursor.classList.add('down'); ripple(pos.x, pos.y);
      fire(el, 'pointerdown', pos.x, pos.y, 2, 2); fire(el, 'mousedown', pos.x, pos.y, 2, 2);
      await api.wait(110);
      fire(el, 'contextmenu', pos.x, pos.y, 2, 2);
      cursor.classList.remove('down');
      fire(el, 'pointerup', pos.x, pos.y, 0, 2); fire(el, 'mouseup', pos.x, pos.y, 0, 2);
      await api.wait(250);
      return true;
    },
    /* scroll the wheel over a target (zoom effects): dy is the total, spread over `steps` events across `ms` */
    wheel: async (t, dy, ms = 800, steps = 8) => {
      if (t && !(await api.move(t, 700))) return false;
      const el = elAt(pos.x, pos.y);
      for (let i = 0; i < steps; i++) {
        try { el.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, composed: true, view: window, clientX: pos.x, clientY: pos.y, deltaY: dy / steps, deltaMode: 0 })); } catch (e) { /* ignore */ }
        await api.wait(ms / steps);
      }
      return true;
    },
    /* scroll the nearest scrolling panel around a control so the control (and what it changes) is on screen */
    reveal: async (t, ms = 900, frac = 0.4) => {
      const el = resolve(t); if (!el) return false;
      let sc = el.parentElement;
      while (sc && sc !== document.body && sc !== document.documentElement) {
        const cs = getComputedStyle(sc);
        if (/(auto|scroll)/.test(cs.overflowY) && sc.scrollHeight > sc.clientHeight + 2) break;
        sc = sc.parentElement;
      }
      if (!sc || sc === document.body || sc === document.documentElement) return false;
      const r = el.getBoundingClientRect(), sr = sc.getBoundingClientRect();
      const to = Math.max(0, Math.min(sc.scrollHeight - sc.clientHeight, sc.scrollTop + (r.top - sr.top) - sc.clientHeight * frac + r.height / 2));
      const from = sc.scrollTop, t0 = performance.now();
      while (alive) {
        if (!onTop()) await api.idle();
        const k = Math.min(1, (performance.now() - t0) / ms);
        sc.scrollTop = from + (to - from) * ease(k);
        if (k >= 1) break;
        await new Promise((rr) => requestAnimationFrame(rr));
      }
      return true;
    },
    /* page coordinates of a point given in the first canvas's own coordinates (what p5 sketches use) */
    canvasPoint: (x, y) => { const c = document.querySelector('canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + x, y: r.top + y }; },
    /* press at a, drag to b (both targets), release: for canvases that listen to mousedown / mousemove / mouseup */
    drag: async (a, b, ms = 900) => {
      if (!(await api.move(a, 600))) return false;
      const el = await api.press(80);
      await api.move(b, ms);
      pressed = false; cursor.classList.remove('down');
      const t = elAt(pos.x, pos.y) || el; fire(t, 'pointerup', pos.x, pos.y, 0); fire(t, 'mouseup', pos.x, pos.y, 0);
      await api.wait(250);
      return true;
    },
    /* glide through several [fx, fy] points without pressing (hover / brush effects) */
    sweep: async (pts, ms = 700) => { for (const p of pts) await api.move(p, ms); },
    /* animate a range input to a value, with the cursor riding the thumb */
    slider: async (t, value, ms = 900) => {
      const el = resolve(t); if (!el) return false;
      const min = +el.min || 0, max = el.max === '' ? 100 : +el.max;
      const frac = (v) => (v - min) / ((max - min) || 1);
      const thumb = (v) => { const r = el.getBoundingClientRect(); return { x: r.left + 8 + (r.width - 16) * frac(v), y: r.top + r.height / 2 }; };   // measured live, so a scroll can't leave the cursor off the thumb
      await api.move(thumb(+el.value), 600);
      const el0 = await api.press(80), v0 = +el.value, t0 = performance.now();
      while (alive) {
        const k = Math.min(1, (performance.now() - t0) / ms), v = v0 + (value - v0) * ease(k), q = thumb(v);
        el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true }));
        setCursor(q.x, q.y);
        if (k >= 1) break;
        await new Promise((rr) => requestAnimationFrame(rr));
      }
      el.dispatchEvent(new Event('change', { bubbles: true }));
      api.release(el0);
      await api.wait(200);
      return true;
    },
    /* set a select / text input / colour input value (cursor goes to it first) */
    set: async (t, value) => {
      const el = resolve(t); if (!el) return false;
      await api.move(el, 700);
      const e0 = await api.press(90); api.release(e0);
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
      await api.wait(350);
      return true;
    },
    type: async (t, text, per = 70) => {
      const el = resolve(t); if (!el) return false;
      await api.move(el, 700);
      const e0 = await api.press(90); api.release(e0);
      let s = '';
      for (const ch of text) { s += ch; el.value = s; el.dispatchEvent(new Event('input', { bubbles: true })); await api.wait(per); }
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await api.wait(250);
      return true;
    },
    key: async (key, code) => {
      const t = document.body, o = { key, code: code || key, bubbles: true, cancelable: true };
      t.dispatchEvent(new KeyboardEvent('keydown', o)); await api.wait(80); t.dispatchEvent(new KeyboardEvent('keyup', o));
    },
    byText: (sel, text) => [...document.querySelectorAll(sel)].find((e) => visible(e) && e.textContent.trim().toLowerCase().includes(String(text).toLowerCase())) || null,
    setValue: (t, v) => { const el = resolve(t); if (!el) return; el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); },
    sound: () => dock.classList.add('has-sound'),   // show the sound toggle above the label
    hide: () => cursor.classList.remove('on'),
    show: () => cursor.classList.add('on'),
    $: (s) => document.querySelector(s),
    $$: (s) => [...document.querySelectorAll(s)],
  };

  async function run(script) {
    cursor.classList.add('on');
    setCursor(innerWidth * 0.55, navH + (innerHeight - navH) * 0.6);
    await api.wait(150);
    while (alive) {
      try { await script(api); } catch (e) { console.warn('demo step failed', e); await api.wait(1000); }
      api.say('');
      await api.wait(1800);
    }
  }

  /* Panels the tools pin with position: fixed would stay on screen while the page scrolls. Make them scroll away with the page instead. */
  function unfix() {
    document.querySelectorAll('body *').forEach((el) => {
      if (el.closest('[' + UI + '],.site-nav,.about-project,.contact-project')) return;
      if (getComputedStyle(el).position === 'fixed') el.style.setProperty('position', 'absolute', 'important');
    });
  }

  /* A demo is only a walkthrough: whatever the tool does, no file may ever be saved. Swallow any programmatic click on a download link. */
  function blockDownloads() {
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      if (alive && this.hasAttribute('download')) return;
      return click.apply(this, arguments);
    };
    addEventListener('click', (e) => {
      const a = e.target && e.target.closest && e.target.closest('a[download]');
      if (alive && a && !e.isTrusted) e.preventDefault();
    }, true);
  }

  function start() {
    build();
    [300, 1200, 3000, 6000].forEach((ms) => setTimeout(unfix, ms));
    window.addEventListener('load', unfix);
    window.addEventListener('resize', () => setTimeout(unfix, 200));
    window.addEventListener('resize', placeShield);
    window.addEventListener('scroll', placeShield, { passive: true });
    addEventListener('load', placeShield);
    setTimeout(placeShield, 600);
    if (reduced) { cursor.remove(); return; }
    const id = (location.pathname.replace(/\/index\.html$/, '').match(/([^/]+)\/?$/) || [])[1];
    const script = window.DEMOS && window.DEMOS[id];
    if (!script) { cursor.remove(); if (EMBED) parent.postMessage({ demo: 'ready' }, '*'); return; }
    blockDownloads();
    if (EMBED) {
      let go = false;
      const begin = () => { if (!go) { go = true; run(script); } };
      window.addEventListener('message', (e) => { if (e.data && e.data.demo === 'start') begin(); });
      setTimeout(begin, 12000);   // safety net if the home page never sends the signal
      parent.postMessage({ demo: 'ready' }, '*');
    } else {
      // start once the page and the tool's own setup are done, without the old long pause
      const go = () => setTimeout(() => run(script), 450);
      if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
