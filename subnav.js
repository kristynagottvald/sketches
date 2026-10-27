/* Sketch-page nav: hover/touch toggle + a paged project carousel from ../projects.json.
   The row starts at the current project; the card bleeding off an edge carries an arrow to page that way. */
(() => {
  const nav = document.getElementById('siteNav');
  const btn = document.getElementById('navToggle');
  const set = (o) => { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) set(false); });

  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const host = document.getElementById('navProjects');
  const MARGIN = 64, GAP = 20, MIN_W = 200, MAX_W = 260;
  const arrow = (dir) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  let list = [], start = 0, track, prev, next;

  function layout() {
    if (!track || !list.length) return;
    const V = host.clientWidth - 2 * MARGIN;
    // as many cards as fit at >= MIN_W; shrink them to fill the row exactly (never above MAX_W)
    const n = Math.max(1, Math.min(list.length, Math.floor((V + GAP) / (MIN_W + GAP))));
    const w = Math.min(MAX_W, (V - (n - 1) * GAP) / n);
    host.style.setProperty('--w', `${w}px`);
    track.style.transform = `translateX(${-start * (w + GAP)}px)`;
    prev.hidden = start <= 0;
    next.hidden = start + n >= list.length;
    const top = Math.round(w * 9 / 32 - 20), side = (MARGIN - 40) / 2;
    prev.style.cssText = `left:${side}px;top:${top}px`;
    next.style.cssText = `right:${side}px;top:${top}px`;
    layout.per = n;
  }
  const go = (d) => { start = Math.max(0, Math.min(list.length - 1, start + d * (layout.per || 1))); layout(); };

  fetch('../projects.json', { cache: 'no-cache' }).then((r) => r.json()).then((items) => {
    list = items;
    const here = location.pathname.replace(/index\.html$/, '');
    const cur = Math.max(0, list.findIndex((p) => here.endsWith('/' + p.id + '/')));
    start = cur;
    host.innerHTML = `<div class="np-view"><div class="np-track">${list.map((p, i) =>
      `<a class="nav-proj" href="../${esc(p.url || '#' + p.id)}"${i === cur ? ' aria-current="page"' : ''}><span class="np-img"><img src="../${esc(p.thumbnail)}" alt="">${i === cur ? `<span class="np-seen">${EYE}Just seen</span>` : ''}</span><span>${esc(p.title)}</span></a>`).join('')}</div></div>
      <button class="np-btn" type="button" aria-label="Previous projects" hidden>${arrow(-1)}</button>
      <button class="np-btn" type="button" aria-label="Next projects" hidden>${arrow(1)}</button>`;
    track = host.querySelector('.np-track');
    [prev, next] = host.querySelectorAll('.np-btn');
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    layout();
    track.querySelectorAll('img').forEach((im) => im.addEventListener('load', layout));
    window.addEventListener('resize', layout);
  }).catch(() => {});
})();
