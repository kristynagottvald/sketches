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
  const PAD = 30, PEEK = 70, GAP = 20;
  const arrow = (dir) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
  let list = [], start = 0, track, prev, next;

  function layout() {
    if (!track || !list.length) return;
    const card = track.firstElementChild.getBoundingClientRect().width, step = card + GAP, V = host.clientWidth;
    const left = start > 0 ? PAD + PEEK : PAD;
    track.style.transform = `translateX(${left - start * step}px)`;
    const per = Math.max(1, Math.floor((V - left - PAD + GAP) / step));
    // the card that straddles the right edge (or the next one, if everything fits exactly)
    const nextIdx = Math.min(list.length - 1, start + per);
    const hasNext = start + per < list.length && left + (list.length - start) * step - GAP > V - 1;
    const hasPrev = start > 0;
    prev.hidden = !hasPrev; next.hidden = !hasNext;
    if (hasPrev) prev.style.left = `${Math.max(8, (left - GAP) / 2 - 22)}px`;
    if (hasNext) {
      const cardLeft = left + (nextIdx - start) * step;
      next.style.left = `${Math.min(V - 52, cardLeft + (V - cardLeft) / 2 - 22)}px`;
    }
    layout.per = per;
  }
  const go = (d) => { start = Math.max(0, Math.min(list.length - 1, start + d * (layout.per || 1))); layout(); };

  fetch('../projects.json').then((r) => r.json()).then((items) => {
    list = items;
    const here = location.pathname.replace(/index\.html$/, '');
    const cur = Math.max(0, list.findIndex((p) => here.endsWith('/' + p.id + '/')));
    start = cur;
    host.innerHTML = `<div class="np-track">${list.map((p, i) =>
      `<a class="nav-proj" href="../${esc(p.url || '#' + p.id)}"${i === cur ? ' aria-current="page"' : ''}><img src="../${esc(p.thumbnail)}" alt=""><span>${esc(p.title)}</span></a>`).join('')}</div>
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
