(() => {
  'use strict';

  const SITE = 'Kristyna Gottvald';
  const TAGLINE = 'Creative Coding Hub';

  const $ = (sel, root = document) => root.querySelector(sel);
  const views = { home: $('#view-sketches'), case: $('#view-case'), projects: $('#view-projects'), about: $('#view-about') };
  const cardsEl = $('#cards');
  const stackEl = $('#case-stack');
  const navLinks = document.querySelectorAll('[data-nav]');

  let projects = [];
  let currentView = null;
  let homeScroll = 0;
  let projectsScroll = 0;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Data Loading ---------- */

  async function load() {
    try {
      const res = await fetch('projects.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status);
      projects = await res.json();
      projects.forEach((p) => { 
        if (!p.url) {
          p.slug = String(p.title).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); 
        }
      });
    } catch (err) {
      console.error(err);
    }
    if (!projects.length) {
      if (cardsEl) cardsEl.innerHTML = '<p class="load-error">Could not load projects.json.</p>';
      return;
    }
    renderGrid();
    route();
  }

  const firstHeading = (p) => ((p.caseStudyContent || []).find((b) => b.type === 'text' && b.heading) || {}).heading || '';
  const subtitle = (p) => {
    if (p.blurb) return p.blurb;
    const h = firstHeading(p), t = p.title.toLowerCase(), l = h.toLowerCase();
    return h && !l.includes(t) && !t.includes(l) ? h : '';
  };

  /* ---------- Rendering Grid & Projects ---------- */

  const ARROW = '<svg class="card-arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.3 7.7l5.1-5.1M2.3 2.1h5.5v5.5" fill="none" stroke="currentColor"/></svg>';
  const SERVICES = ['Creative Coding', 'Generative Art', 'Interactive Engines', 'Visual Systems'];

  function renderGrid() {
    const serviceListEl = $('#service-list');
    if (serviceListEl) {
      serviceListEl.innerHTML = SERVICES.map((t, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><span>${esc(t)}</span></li>`).join('');
    }
    watchWork();
    renderProjectsPage();
  }

  function renderProjectsPage() {
    const pjGridEl = $('#pj-grid');
    if (!pjGridEl) return;
    const cols = [[], []];
    projects.forEach((p, i) => {
      const c = i % 2, r = Math.floor(i / 2);
      const kind = (r + c) % 2 === 0 ? 'is-p' : 'is-l';
      const titleCase = (t) => String(t || '').replace(/\b([a-z])/g, (m) => m.toUpperCase());
      const name = p.listTitle || p.title;
      const right = p.clientName && p.clientName.toLowerCase() !== name.toLowerCase() ? p.clientName : titleCase(p.category);
      cols[c].push(`<a class="pj-tile ${kind}" href="${p.url ? esc(p.url) : '#' + esc(p.slug)}" style="--o:${i}" data-i="${i}" data-urls="${esc(JSON.stringify(nextImages(p)))}" aria-label="${esc(p.title)}">
        <div class="pj-media"><img class="is-active" src="${esc(p.thumbnail)}" data-still="${esc(p.thumbnail)}" data-preview="${esc(p.preview || '')}" alt="" loading="lazy"></div>
        <div class="pj-cap"><span>${esc(name)}</span><span class="grey">${esc(right || '')}</span></div>
      </a>`);
    });
    pjGridEl.innerHTML = cols.map((col) => `<div class="pj-col">${col.join('')}</div>`).join('');
    bindClipHover(pjGridEl);
    if (currentView === 'projects') startProjectsCycle();
  }


  /* ---------- Hover plays the sketch's stop-motion clip ---------- */
  function bindClipHover(grid) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // warm the cache so the clip starts the instant you hover
    grid.querySelectorAll('img[data-preview]').forEach((im) => { if (im.dataset.preview) new Image().src = im.dataset.preview; });
    const swap = (e, play) => {
      const tile = e.target.closest('.pj-tile');
      if (!tile || (e.relatedTarget && tile.contains(e.relatedTarget))) return;
      const im = tile.querySelector('img[data-preview]');
      if (!im || !im.dataset.preview) return;
      // a fresh query string restarts the clip from its first frame
      im.src = play ? `${im.dataset.preview}?t=${Date.now()}` : im.dataset.still;
    };
    grid.addEventListener('mouseover', (e) => swap(e, true));
    grid.addEventListener('mouseout', (e) => swap(e, false));
  }

  /* ---------- Projects Cycle Animation ---------- */

  const pjVisible = new Set();
  let pjObserver = null, pjTimer = null, pjLast = -1;
  function stopProjectsCycle() {
    clearTimeout(pjTimer);
    pjTimer = null;
    if (pjObserver) pjObserver.disconnect();
    pjObserver = null;
    pjVisible.clear();
  }
  function startProjectsCycle() {
    stopProjectsCycle();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    pjObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? pjVisible.add(e.target) : pjVisible.delete(e.target)));
      if (pjTimer === null) schedulePjTick();
    }, { threshold: 0.15 });
    document.querySelectorAll('.pj-tile').forEach((t) => pjObserver.observe(t));
  }
  function schedulePjTick() {
    clearTimeout(pjTimer);
    pjTimer = null;
    if (!pjVisible.size || currentView !== 'projects') return;
    pjTimer = setTimeout(pjTick, Math.max(250, 3000 / pjVisible.size));
  }
  function pjTick() {
    pjTimer = null;
    if (currentView !== 'projects') return;
    if (!document.hidden) {
      const shown = [...pjVisible].sort((a, b) => a.dataset.i - b.dataset.i);
      const next = shown.find((t) => +t.dataset.i > pjLast) || shown[0];
      if (next) { pjLast = +next.dataset.i; advanceTile(next); }
    }
    schedulePjTick();
  }
  function advanceTile(tile) {
    const urls = JSON.parse(tile.dataset.urls || '[]');
    if (urls.length < 2) return;
    const media = tile.querySelector('.pj-media');
    const i = ((+tile.dataset.idx || 0) + 1) % urls.length;
    const probe = new Image();
    probe.onload = () => {
      const img = document.createElement('img');
      img.alt = '';
      img.src = urls[i];
      media.appendChild(img);
      tile.dataset.idx = i;
      requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add('is-active')));
      setTimeout(() => media.querySelectorAll('img').forEach((o) => { if (o !== img) o.remove(); }), 1100);
    };
    probe.onerror = () => { urls.splice(i, 1); tile.dataset.urls = JSON.stringify(urls); };
    probe.src = urls[i];
  }

  /* ---------- Sidebar / Active Card Monitoring ---------- */

  const firstBody = (p) => (((p.caseStudyContent || []).find((b) => b.type === 'text' && (b.body || []).length) || {}).body || []).filter((t) => !/^\s*(role:|key results)/i.test(t)).join('\n\n');
  
  function setWork(card) {
    const p = projects.find((x) => x.id === card.dataset.pid);
    if (!p) return;
    if (cardsEl) {
      cardsEl.querySelectorAll('.card').forEach((c) => c.classList.toggle('is-active', c === card));
    }
    const activeEl = $('#work-active');
    if (activeEl) activeEl.textContent = p.title;
    const descEl = $('#work-desc');
    if (descEl) descEl.textContent = firstBody(p) || p.blurb || '';
    const tagEl = $('#work-tag');
    if (tagEl) tagEl.textContent = [p.year, p.category].filter(Boolean).join(' – ');
  }

  let workTick = false;
  function updateWork() {
    workTick = false;
    if (currentView !== 'home' && currentView !== 'sketches') return;
    const mid = window.innerHeight * 0.5;
    let best = null, bd = Infinity;
    if (cardsEl) {
      cardsEl.querySelectorAll('.card').forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bd) { bd = d; best = c; }
      });
    }
    if (best && !best.classList.contains('is-active')) setWork(best);
  }
  function watchWork() {
    if (!cardsEl) return;
    const first = cardsEl.querySelector('.card');
    first && setWork(first);
    window.addEventListener('scroll', () => { if (!workTick) { workTick = true; requestAnimationFrame(updateWork); } }, { passive: true });
  }

  function nextImages(q) {
    const list = [q.thumbnail];
    (q.caseStudyContent || []).forEach((b) => { if (b.type === 'image' && b.src && !list.includes(b.src) && !/placeholder/.test(b.src)) list.push(b.src); });
    return list.filter(Boolean);
  }

  /* ---------- Routing & View Management ---------- */

  function show(name) {
    if (currentView === 'home') homeScroll = window.scrollY;
    if (currentView === 'projects') projectsScroll = window.scrollY;
    Object.entries(views).forEach(([key, el]) => { if (el) el.hidden = key !== name; });
    if (name !== 'case' && stackEl) { stackEl.innerHTML = ''; }
    if (name === 'projects') startProjectsCycle(); else stopProjectsCycle();
    const navKey = name === 'home' ? 'sketches' : name === 'case' ? 'projects' : name;
    navLinks.forEach((a) => {
      if (a.dataset.nav === navKey) {
        if (!a.hasAttribute('aria-current')) { a.setAttribute('aria-current', 'page'); }
      } else {
        a.removeAttribute('aria-current');
      }
    });
    currentView = name;
    const hbLabel = $('#hb-label');
    if (hbLabel) hbLabel.textContent = { home: 'Sketches', case: 'Projects', projects: 'Projects', about: 'About' }[name] || 'Sketches';
    const hb = $('#hb');
    if (hb) hb.classList.remove('open');
    requestAnimationFrame(updateWork);
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
  }

  function route() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash === 'projects') {
      show('projects');
      document.title = `Projects • ${SITE}`;
      window.scrollTo(0, 0);
    } else if (hash === 'about') {
      show('about');
      document.title = `About • ${SITE}`;
      window.scrollTo(0, 0);
    } else if (hash === 'contact') {
      if (!currentView || currentView === 'case') show('home');
      document.title = `${SITE} • ${TAGLINE}`;
      scrollToId('contact');
    } else {
      show('home');
      document.title = `${SITE} • ${TAGLINE}`;
      window.scrollTo(0, 0);
    }
  }

  /* ---------- Event Listeners ---------- */

  const hbPill = $('.hb-pill');
  if (hbPill) {
    hbPill.addEventListener('mouseleave', () => {
      const hb = $('#hb');
      if (hb) hb.classList.remove('open');
      const toggle = $('#hb-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  const hbToggle = $('#hb-toggle');
  if (hbToggle) {
    hbToggle.addEventListener('click', () => {
      const hb = $('#hb');
      if (hb) {
        const isOpen = hb.classList.toggle('open');
        hbToggle.setAttribute('aria-expanded', String(isOpen));
      }
    });
  }


  /* ---------- Heading letter bounce ---------- */
  // Every 5-8 seconds the home heading's letters hop up one after another.
  (function bounceHeading() {
    const h = $('#view-sketches h1');
    if (!h || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    h.setAttribute('aria-label', h.textContent);
    const letters = [];
    [...h.childNodes].forEach((n) => {
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      [...n.textContent].forEach((ch) => {
        if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
        const sp = document.createElement('span');
        sp.className = 'bl'; sp.setAttribute('aria-hidden', 'true'); sp.textContent = ch;
        letters.push(sp); frag.appendChild(sp);
      });
      n.replaceWith(frag);
    });
    const play = () => {
      letters.forEach((sp, i) => {
        sp.style.animationDelay = `${i * 70}ms`;
        sp.classList.remove('hop'); void sp.offsetWidth; sp.classList.add('hop');
      });
      setTimeout(next, letters.length * 70 + 700);
    };
    const next = () => setTimeout(play, 5000 + Math.random() * 3000);
    next();
  })();

  window.addEventListener('hashchange', route);
  load();
})();