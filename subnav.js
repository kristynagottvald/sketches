/* Sketch-page nav: hover/touch toggle + a paged carousel (3 projects at a time) beside an
   "About this project" panel, both from ../projects.json. The row starts at the current project.
   Hovering a card shows that project's description; leaving restores the current project's. */
(() => {
  if (/[?&]embed=1/.test(location.search)) return;   // shown inside the home page hero: no nav, About or Contact
  const nav = document.getElementById('siteNav');
  const btn = document.getElementById('navToggle');
  const set = (o) => { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  const allLink = nav.querySelector('.hb-label a');   // phones: "All Tools" with the arrow opens the dropdown instead of leaving the page
  if (allLink) allLink.addEventListener('click', (e) => { if (matchMedia('(max-width: 600px)').matches) { e.preventDefault(); set(!nav.classList.contains('open')); } });
  const nameEl = nav.querySelector('.hb-label b');   // the arrow is gone: tapping the tool name opens the dropdown on touch screens
  if (nameEl) nameEl.addEventListener('click', () => set(!nav.classList.contains('open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) set(false); });

  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const host = document.getElementById('navProjects');
  const MAX_W = 320;
  let MARGIN = 64, GAP = 20, MIN_W = 150, PER = 5;   // phones show three small cards at a time (set in layout)
  const arrow = (dir) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  let list = [], start = 0, cur = 0, car, track, prev, next;

  function layout() {
    if (!track || !list.length) return;
    const phone = matchMedia('(max-width: 600px)').matches;
    MARGIN = phone ? 40 : 64; GAP = phone ? 10 : 20; MIN_W = phone ? 80 : 150; PER = phone ? 3 : 5;
    const V = car.clientWidth - 2 * MARGIN;
    // up to five cards at a time across the full width (fewer only if too narrow); shrink them to fill the row (never above MAX_W)
    const n = Math.max(1, Math.min(PER, list.length, Math.floor((V + GAP) / (MIN_W + GAP))));
    const w = Math.min(MAX_W, (V - (n - 1) * GAP) / n);
    car.style.setProperty('--w', `${w}px`);
    start = Math.max(0, Math.min(list.length - n, start));
    track.style.transform = `translateX(${-start * (w + GAP)}px)`;
    prev.hidden = start <= 0;
    next.hidden = start + n >= list.length;
    const top = Math.round(w * 9 / 32 - 20), side = (MARGIN - 40) / 2;
    prev.style.cssText = `left:${side}px;top:${top}px`;
    next.style.cssText = `right:${side}px;top:${top}px`;
    layout.per = n;
  }
  const go = (d) => { start += d * (layout.per || 1); layout(); };

  fetch('../projects.json', { cache: 'no-cache' }).then((r) => r.json()).then((items) => {
    list = items;
    const here = location.pathname.replace(/index\.html$/, '');
    cur = Math.max(0, list.findIndex((p) => here.endsWith('/' + p.id + '/')));
    start = cur;
    host.innerHTML = `<div class="np-carousel"><div class="np-view"><div class="np-track">${list.map((p, i) =>
      `<a class="nav-proj" href="../${esc(p.url || '#' + p.id)}"${i === cur ? ' aria-current="page"' : ''}><span class="np-img"><img src="../${esc(p.thumbnail)}" data-still="../${esc(p.thumbnail)}" data-preview="${p.preview ? '../' + esc(p.preview) : ''}" alt="">${i === cur ? `<span class="np-seen">${EYE}Viewing</span>` : ''}</span><span>${esc(p.title)}</span></a>`).join('')}</div></div>
      <button class="np-btn" type="button" aria-label="Previous projects" hidden>${arrow(-1)}</button>
      <button class="np-btn" type="button" aria-label="Next projects" hidden>${arrow(1)}</button></div>`;
    car = host.querySelector('.np-carousel');
    // hovering a card plays that tool's clip on a loop until the pointer leaves
    const play = (e, on) => {
      const a = e.target.closest('.nav-proj'); if (!a || (e.relatedTarget && a.contains(e.relatedTarget))) return;
      const im = a.querySelector('img[data-preview]'); if (!im || !im.dataset.preview) return;
      im.src = on ? im.dataset.preview : im.dataset.still;
    };
    host.addEventListener('mouseover', (e) => play(e, true));
    host.addEventListener('mouseout', (e) => play(e, false));
    track = host.querySelector('.np-track');
    [prev, next] = host.querySelectorAll('.np-btn');
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));

    // "About this project": a soft-black section under the tool, styled like the home page's About and Contact sections
    const p = list[cur];
    let sec = null, ft = null;
    if (p && (p.about || p.blurb)) {
      sec = document.createElement('section');
      sec.className = 'about-project'; sec.id = 'aboutProject'; sec.setAttribute('aria-labelledby', 'apTitle');
      sec.innerHTML = `<div class="ap-head"><span class="ap-label">About this project</span><h2 id="apTitle">${esc(p.title)}</h2></div>
        <div class="ap-body"><p>${esc(p.about || p.blurb)}</p>
          <div class="ap-rows">
            <div class="ap-row"><h3>Type</h3><div>${esc(p.category || '')}</div></div>
            ${p.year ? `<div class="ap-row"><h3>Year</h3><div>${esc(p.year)}</div></div>` : ''}
          </div></div>`;
    }
    // Contact + footer, same as the home page, with copy for a visitor who has just seen a tool
    if (!document.getElementById('contact')) {
      ft = document.createElement('footer');
      ft.className = 'contact-project'; ft.id = 'contact'; ft.setAttribute('aria-label', 'Contact');
      ft.innerHTML = `<div class="cp-grid"><div class="cp-head"><h2>Want a tool like this?<br>Let’s build it.</h2></div>
        <div class="cp-rows"><div class="cp-row"><h3>Contact</h3><div>
          <a href="mailto:kgottvald@gmail.com">Email</a>
          <a href="https://www.linkedin.com/in/kgottvald/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://kristynagottvald.github.io/" target="_blank" rel="noopener noreferrer">Portfolio</a>
        </div></div></div></div>`;
    }
    // All Tools: the same heading-left, two-column card list as the home page (the tool you are on is left out)
    const tp = document.createElement('section');
    tp.className = 'tools-project'; tp.id = 'allTools'; tp.setAttribute('aria-label', 'All Tools');
    const ARROW = '<svg class="tp-arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.3 7.7l5.1-5.1M2.3 2.1h5.5v5.5" fill="none" stroke="currentColor"/></svg>';
    tp.innerHTML = `<div class="tp-side"><h2>All Tools</h2></div><div class="tp-list">${list.filter((q, i) => i !== cur && !q.hidden).map((q) =>
      `<article class="tp-card"><a href="../${esc(q.url || '#')}" aria-label="${esc(q.title)}"><div class="tp-media"><img src="../${esc(q.thumbnail)}" data-still="../${esc(q.thumbnail)}" data-preview="${q.preview ? '../' + esc(q.preview) : ''}" alt="" loading="lazy"></div><div class="tp-meta"><h3>${esc(q.title)}</h3><p>${esc(q.category || '')}</p>${ARROW}</div></a></article>`).join('')}</div>`;
    const swap = (e, on) => { const a = e.target.closest('.tp-card a'); if (!a || (e.relatedTarget && a.contains(e.relatedTarget))) return; const im = a.querySelector('img'); if (im && im.dataset.preview) im.src = on ? im.dataset.preview : im.dataset.still; };
    tp.addEventListener('mouseover', (e) => swap(e, true)); tp.addEventListener('mouseout', (e) => swap(e, false));
    // the copyright footer closes the page
    const cf = document.createElement('footer');
    cf.className = 'foot-project';
    cf.innerHTML = '<span>© Kristyna Gottvald</span><a href="#" id="cpTop">Back to top ↑</a>';
    cf.querySelector('#cpTop').addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    // Both sections live in one wrapper on <html>, just below the first screen. Nothing here takes space from the tool's own layout,
    // so tools that stretch to the page height (flex or 100vh layouts) keep their full size.
    {
      const wrap = document.createElement('div');
      wrap.id = 'toolAfter';
      if (sec) wrap.appendChild(sec);
      if (ft) wrap.appendChild(ft);
      wrap.appendChild(tp); wrap.appendChild(cf);
      document.documentElement.appendChild(wrap);
      document.documentElement.classList.add('has-about');
      const place = () => { wrap.style.top = Math.max(window.innerHeight, Math.round(document.body.getBoundingClientRect().bottom + window.scrollY)) + 'px'; };
      place(); window.addEventListener('resize', place); window.addEventListener('load', place);
      [400, 1200, 3000].forEach((ms) => setTimeout(place, ms));
      if ('ResizeObserver' in window) new ResizeObserver(place).observe(document.body);
    }
    layout();
    track.querySelectorAll('img').forEach((im) => im.addEventListener('load', layout));
    window.addEventListener('resize', layout);
  }).catch(() => {});
})();
