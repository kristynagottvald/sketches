/* Sketch-page nav: hover/touch toggle + a paged carousel (3 projects at a time) beside an
   "About this project" panel, both from ../projects.json. The row starts at the current project.
   Hovering a card shows that project's description; leaving restores the current project's. */
(() => {
  const nav = document.getElementById('siteNav');
  const btn = document.getElementById('navToggle');
  const set = (o) => { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) set(false); });

  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const host = document.getElementById('navProjects');
  const MARGIN = 64, GAP = 20, MIN_W = 150, MAX_W = 260, PER = 3;
  const arrow = (dir) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  let list = [], start = 0, cur = 0, car, track, prev, next;

  function layout() {
    if (!track || !list.length) return;
    const V = car.clientWidth - 2 * MARGIN;
    // three cards at a time (fewer only if the column is too narrow); shrink them to fill the row (never above MAX_W)
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
      `<a class="nav-proj" href="../${esc(p.url || '#' + p.id)}"${i === cur ? ' aria-current="page"' : ''}><span class="np-img"><img src="../${esc(p.thumbnail)}" data-still="../${esc(p.thumbnail)}" data-preview="${p.preview ? '../' + esc(p.preview) : ''}" alt="">${i === cur ? `<span class="np-seen">${EYE}Just seen</span>` : ''}</span><span>${esc(p.title)}</span></a>`).join('')}</div></div>
      <button class="np-btn" type="button" aria-label="Previous projects" hidden>${arrow(-1)}</button>
      <button class="np-btn" type="button" aria-label="Next projects" hidden>${arrow(1)}</button></div>
      <aside class="np-about" aria-live="polite"><h3>About this project</h3><p></p></aside>`;
    car = host.querySelector('.np-carousel');
    // the panel describes the project you are on; hovering another card previews its description
    const aboutP = host.querySelector('.np-about p');
    const showAbout = (i) => { const p = list[i]; aboutP.textContent = (p && (p.about || p.blurb)) || ''; };
    showAbout(cur);
    const cards = [...host.querySelectorAll('.nav-proj')];
    cards.forEach((a, i) => {
      a.addEventListener('mouseenter', () => showAbout(i));
      a.addEventListener('focus', () => showAbout(i));
    });
    host.querySelector('.np-track').addEventListener('mouseleave', () => showAbout(cur));
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
    layout();
    track.querySelectorAll('img').forEach((im) => im.addEventListener('load', layout));
    window.addEventListener('resize', layout);
  }).catch(() => {});
})();
