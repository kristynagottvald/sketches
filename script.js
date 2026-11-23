(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARROW = '<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.3 7.7l5.1-5.1M2.3 2.1h5.5v5.5" fill="none" stroke="currentColor"/></svg>';
  const CARD_ARROW = '<svg class="card-arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.3 7.7l5.1-5.1M2.3 2.1h5.5v5.5" fill="none" stroke="currentColor"/></svg>';

  const hero = $('#hero');
  let projects = [];

  async function load() {
    try {
      const res = await fetch('projects.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      projects = (await res.json()).filter((p) => !p.hidden && p.url);
    } catch (err) {
      console.error(err);
      return;
    }
    renderHero();
    renderGrid();
  }

  /* ---------- Hero: 2.5 seconds of each tool's own demo, played live from the tool page ---------- */

  const DEMO_MS = 2500;          // how long each tool's demo shows
  const VW = 1280, VH = 720;     // the size each tool is laid out at inside its frame, scaled to fill the hero

  function renderHero() {
    if (!projects.length) return;
    const slides = projects.map((p) => {
      const el = document.createElement('div');
      el.className = 'slide';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = `<div class="slide-card"><img class="still" src="${esc(p.thumbnail)}" alt=""><iframe class="slide-frame" title="${esc(p.title)} demo" tabindex="-1" aria-hidden="true" loading="eager"></iframe></div>` +
        `<div class="slide-cap"><span class="slide-name caps">${esc(p.category || '')}</span><h2>${esc(p.title)}</h2>` +
        `<a class="slide-cta caps" href="${esc(p.url)}" tabindex="-1"><span>${esc(p.cta || 'Open tool')}</span>${ARROW}</a></div>`;
      hero.appendChild(el);
      return el;
    });
    const frames = slides.map((s) => s.querySelector('iframe'));
    const cards = slides.map((s) => s.querySelector('.slide-card'));
    const n = slides.length;

    // scale each frame so the 1280x720 tool fills its card like object-fit: cover
    const fit = () => frames.forEach((f, i) => {
      const w = cards[i].clientWidth, h = cards[i].clientHeight; if (!w || !h) return;
      f.style.transform = `translate(-50%, -50%) scale(${Math.max(w / VW, h / VH)})`;
    });
    fit(); new ResizeObserver(fit).observe(hero); window.addEventListener('resize', fit);

    const show = (i) => slides.forEach((s, k) => {
      s.classList.toggle('is-on', k === i);
      s.setAttribute('aria-hidden', String(k !== i));
      s.querySelector('.slide-cta').tabIndex = k === i ? 0 : -1;
    });
    if (reduced) { show(0); return; }   // reduced motion: just the still of the first tool

    const ready = new Array(n).fill(false);
    frames.forEach((f, i) => f.addEventListener('load', () => { if (f.dataset.on) setTimeout(() => { ready[i] = true; }, 350); }));
    const prep = (i) => { const f = frames[i]; if (f.dataset.on) return; f.dataset.on = '1'; ready[i] = false; f.classList.remove('live'); f.src = projects[i].url.replace(/\/?$/, '/') + 'index.html?embed=1'; };
    const release = (i) => setTimeout(() => { const f = frames[i]; f.dataset.on = ''; f.classList.remove('live'); ready[i] = false; f.src = 'about:blank'; }, 1200);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      let i = 0, prev = -1;
      prep(0);
      for (;;) {
        while (document.hidden) await sleep(400);
        const t0 = performance.now();
        while (!ready[i] && performance.now() - t0 < 7000) await sleep(100);   // a slow tool shows its still image instead
        show(i);
        if (ready[i]) {
          frames[i].classList.add('live');
          try { frames[i].contentWindow.postMessage({ demo: 'start' }, '*'); } catch (e) { /* ignore */ }
        }
        if (prev >= 0) release(prev);
        prep((i + 1) % n);   // load the next tool while this one plays
        await sleep(DEMO_MS);
        prev = i; i = (i + 1) % n;
      }
    })();
  }

  /* ---------- All tools: same card as Selected Work; hover plays the tool's clip ---------- */

  function renderGrid() {
    const list = $('#cards');
    list.innerHTML = projects.map((p) => `<article class="card">
      <a href="${esc(p.url)}" aria-label="${esc(p.title)}">
        <div class="card-media"><img src="${esc(p.thumbnail)}" data-still="${esc(p.thumbnail)}" data-preview="${esc(p.preview || '')}" alt="" loading="lazy"></div>
        <div class="card-meta">
          <h3 class="card-title">${esc(p.title)}</h3>
          <p class="card-sub">${esc(p.category || '')}</p>${CARD_ARROW}
        </div>
      </a>
    </article>`).join('');
    const play = (e, on) => {
      const a = e.target.closest('.card a');
      if (!a || (e.relatedTarget && a.contains(e.relatedTarget))) return;
      const im = a.querySelector('img');
      if (im.dataset.preview) im.src = on ? im.dataset.preview : im.dataset.still;
    };
    if (!reduced) {
      list.addEventListener('mouseover', (e) => play(e, true));
      list.addEventListener('mouseout', (e) => play(e, false));
    }
  }

  // Phones: the current section's name opens a stacked list of the sections
  const top = $('#top'), jump = $('#nav-jump'), jumpLabel = $('#nav-jump-label');
  const setMenu = (open) => { top.classList.toggle('open', open); jump.setAttribute('aria-expanded', String(open)); };
  jump.addEventListener('click', (e) => { e.stopPropagation(); setMenu(!top.classList.contains('open')); });
  document.addEventListener('click', (e) => { if (!top.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  top.querySelectorAll('.top-nav a, .status').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // keep the nav's current section highlighted as you scroll
  const links = [...document.querySelectorAll('.top-nav a')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => {
          const on = a.getAttribute('href') === '#' + e.target.id;
          if (on) { a.setAttribute('aria-current', 'true'); jumpLabel.textContent = a.textContent; } else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['tools', 'about', 'contact'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  addEventListener('scroll', () => { if (scrollY < 120) jumpLabel.textContent = 'Tools'; }, { passive: true });

  load();
})();
