/* Walkthrough demo engine for the tool pages.
   - A shield sits over the tool: clicks, taps, keys and drags from the visitor never reach it, but the page scrolls normally.
   - A scripted cursor then drives the tool's real controls through a short sequence, on a loop, while the tool is on screen.
   - Scripts live in demo-scripts.js, keyed by project id. Every action skips quietly if its control is not on the page,
     so a missing selector never throws or stops the demo.
   Load this file in the <head> (before the tool's own scripts) so the input filter runs first. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    if (!scrollish && tgt && tgt.closest && tgt.closest('.site-nav,.about-project,.contact-project')) return;   // nav, About and Contact keep working
    e.stopImmediatePropagation();   // no preventDefault: the page still scrolls, links in the nav still work
  }, true));
  KEYS.forEach((t) => window.addEventListener(t, (e) => {
    if (!e.isTrusted) return;
    const tgt = e.target;
    if (tgt && tgt.closest && tgt.closest('.site-nav,.about-project,.contact-project')) return;
    e.stopImmediatePropagation();
    if (!SCROLL_KEYS.has(e.key) && e.key !== 'Tab') e.preventDefault();
  }, true));

  /* ---------- shield, cursor and caption ---------- */
  let shield, cursor, caption, navH = 80;
  const SVG = '<svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true"><path d="M2 1.5v16l4.2-3.9 2.7 6.1 2.6-1.1-2.7-6H15z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  function build() {
    const css = document.createElement('style');
    css.textContent = `
      .demo-shield{position:fixed;left:0;right:0;bottom:0;top:80px;z-index:90;background:transparent;touch-action:pan-y pinch-zoom;cursor:default;-webkit-user-select:none;user-select:none}
      .demo-cursor{position:fixed;left:0;top:0;z-index:95;width:20px;height:22px;pointer-events:none;opacity:0;transition:opacity .35s linear;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45));will-change:transform}
      .demo-cursor.on{opacity:1}
      .demo-cursor svg{display:block;transition:transform .12s ease-out;transform-origin:3px 2px}
      .demo-cursor.down svg{transform:scale(.82)}
      .demo-caption{position:fixed;left:16px;bottom:16px;z-index:96;pointer-events:none;display:inline-flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;background:rgba(24,23,22,.78);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#e8e8e8;font:400 12px/1.3 "Inter","Helvetica Neue",Helvetica,Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;transition:opacity .3s}
      .demo-caption i{width:6px;height:6px;border-radius:50%;background:#8fd694;flex:none}
      .site-nav .tools{display:none!important}
      @media (max-width:600px){.demo-caption{left:10px;bottom:10px;font-size:11px}}`;
    document.head.appendChild(css);
    shield = document.createElement('div'); shield.className = 'demo-shield'; shield.setAttribute(UI, ''); shield.setAttribute('aria-hidden', 'true');
    cursor = document.createElement('div'); cursor.className = 'demo-cursor'; cursor.setAttribute(UI, ''); cursor.innerHTML = SVG;
    caption = document.createElement('div'); caption.className = 'demo-caption'; caption.setAttribute(UI, '');
    caption.innerHTML = '<i></i><span>Walkthrough demo</span>';
    document.body.append(shield, cursor, caption);
    placeShield();
  }
  function placeShield() {
    const nav = document.querySelector('.site-nav');
    navH = nav ? Math.round(nav.getBoundingClientRect().bottom + scrollY) : 80;
    shield.style.top = Math.max(0, navH - Math.min(scrollY, navH)) + 'px';
  }

  /* ---------- the driver ---------- */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  let alive = true, onScreen = true;
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
  const elAt = (x, y) => (document.elementsFromPoint(x, y) || []).find((e) => !e.closest('[' + UI + ']') && !e.closest('.site-nav,.about-project,.contact-project')) || null;

  function fire(el, type, x, y, buttons = 0) {
    if (!el) return;
    const base = { bubbles: true, cancelable: true, composed: true, view: window, clientX: x, clientY: y, screenX: x, screenY: y, button: 0, buttons };
    try {
      if (type.startsWith('pointer')) el.dispatchEvent(new PointerEvent(type, { ...base, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
      else el.dispatchEvent(new MouseEvent(type, base));
    } catch (e) { /* ignore */ }
  }

  let pressed = false;
  function setCursor(x, y) {
    pos.x = x; pos.y = y;
    cursor.style.transform = `translate(${x - 3}px,${y - 2}px)`;
    const el = elAt(x, y);
    if (el) { fire(el, 'pointermove', x, y, pressed ? 1 : 0); fire(el, 'mousemove', x, y, pressed ? 1 : 0); }
    return el;
  }

  const api = {
    wait: async (ms) => { const t0 = performance.now(); while (alive && performance.now() - t0 < ms) { await sleep(Math.min(60, ms)); if (!onTop()) await api.idle(); } },
    idle: async () => { while (alive && !onTop()) await sleep(250); },
    say: (text) => { caption.lastChild.textContent = text ? 'Walkthrough demo · ' + text : 'Walkthrough demo'; },
    /* move the cursor to a selector, element, [fx, fy] (fractions of the tool area) or {x, y} */
    move: async (t, ms = 800, fx = .5, fy = .5) => {
      const p = point(t, fx, fy); if (!p) return false;
      const x0 = pos.x, y0 = pos.y, t0 = performance.now();
      while (alive) {
        if (!onTop()) await api.idle();
        const k = Math.min(1, (performance.now() - t0) / ms), e = ease(k);
        setCursor(x0 + (p.x - x0) * e, y0 + (p.y - y0) * e);
        if (k >= 1) break;
        await new Promise((r) => requestAnimationFrame(r));
      }
      return true;
    },
    press: async (hold = 120) => {
      const el = elAt(pos.x, pos.y); pressed = true; cursor.classList.add('down');
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
      const min = +el.min || 0, max = el.max === '' ? 100 : +el.max, r = el.getBoundingClientRect();
      const frac = (v) => (v - min) / ((max - min) || 1);
      const thumb = (v) => ({ x: r.left + 8 + (r.width - 16) * frac(v), y: r.top + r.height / 2 });
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
    hide: () => cursor.classList.remove('on'),
    show: () => cursor.classList.add('on'),
    $: (s) => document.querySelector(s),
    $$: (s) => [...document.querySelectorAll(s)],
  };

  async function run(script) {
    cursor.classList.add('on');
    setCursor(innerWidth * 0.55, navH + (innerHeight - navH) * 0.6);
    await api.wait(1200);
    while (alive) {
      try { await script(api); } catch (e) { console.warn('demo step failed', e); await api.wait(1000); }
      api.say('');
      await api.wait(1800);
    }
  }

  function start() {
    build();
    window.addEventListener('resize', placeShield);
    window.addEventListener('scroll', placeShield, { passive: true });
    addEventListener('load', placeShield);
    setTimeout(placeShield, 600);
    if (reduced) { cursor.remove(); return; }
    const id = (location.pathname.replace(/\/index\.html$/, '').match(/([^/]+)\/?$/) || [])[1];
    const script = window.DEMOS && window.DEMOS[id];
    if (script) setTimeout(() => run(script), 1200);
    else cursor.remove();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
