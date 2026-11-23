(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SLIDE_MS = 6000;   // one full loop of each clip

  const hero = $('#hero');
  const cta = $('#hero-cta');
  const ctaText = $('#hero-cta-text');
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

  /* ---------- Hero: every project clip plays in turn, no slide indicator ---------- */

  function renderHero() {
    if (!projects.length) return;
    const slides = projects.map((p, i) => {
      const el = document.createElement('div');
      el.className = 'slide';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = `<img class="slide-bg" alt=""><div class="slide-card"><img alt="${esc(p.title)}"></div>` +
        `<div class="slide-cap"><h2>${esc(p.title)}</h2><p>${esc(p.blurb || '')}</p></div>`;
      el.dataset.src = (reduced || !p.preview) ? p.thumbnail : p.preview;
      hero.insertBefore(el, cta);
      return el;
    });

    // a fresh src on a cached clip always starts from its first frame
    const load = (el) => el.querySelectorAll('img').forEach((im) => { if (im.getAttribute('src') !== el.dataset.src) im.src = el.dataset.src; });
    const restart = (el) => el.querySelectorAll('img').forEach((im) => { im.removeAttribute('src'); im.src = el.dataset.src; });

    let cur = -1;
    const show = (i) => {
      i = (i + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
      restart(slides[i]);
      load(slides[(i + 1) % slides.length]);   // warm the next clip so it plays from frame 0 on cue
      const p = projects[i];
      ctaText.textContent = p.title;
      cta.href = p.url;
      cur = i;
    };
    show(0);
    if (reduced) return;
    setInterval(() => { if (!document.hidden) show(cur + 1); }, SLIDE_MS);
  }

  /* ---------- Tools grid: hover a tile to play its clip ---------- */

  function renderGrid() {
    const grid = $('#grid');
    $('#tools-count').textContent = String(projects.length).padStart(2, '0');
    grid.innerHTML = projects.map((p) => `<a class="tile" href="${esc(p.url)}" aria-label="${esc(p.title)}">
      <div class="tile-media"><img src="${esc(p.thumbnail)}" data-still="${esc(p.thumbnail)}" data-preview="${esc(p.preview || '')}" alt="" loading="lazy"></div>
      <div class="tile-cap"><span>${esc(p.title)}</span><span>${esc(p.category || '')}</span></div>
    </a>`).join('');
    const play = (e, on) => {
      const t = e.target.closest('.tile');
      if (!t || (e.relatedTarget && t.contains(e.relatedTarget))) return;
      const im = t.querySelector('img');
      if (im.dataset.preview) im.src = on ? im.dataset.preview : im.dataset.still;
    };
    if (!reduced) {
      grid.addEventListener('mouseover', (e) => play(e, true));
      grid.addEventListener('mouseout', (e) => play(e, false));
    }
  }

  // keep the nav's current section highlighted as you scroll
  const links = [...document.querySelectorAll('.top-nav a')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => (a.getAttribute('href') === '#' + e.target.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['tools', 'about', 'contact'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  load();
})();
