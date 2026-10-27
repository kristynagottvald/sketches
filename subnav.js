/* Sketch-page nav: toggle (touch/keyboard) + project list from ../projects.json */
(() => {
  const nav = document.getElementById('siteNav');
  const btn = document.getElementById('navToggle');
  const set = (o) => { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) set(false); });
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  fetch('../projects.json').then((r) => r.json()).then((list) => {
    const here = location.pathname.replace(/index\.html$/, '');
    document.getElementById('navProjects').innerHTML = list.map((p) => {
      const cur = here.endsWith('/' + p.id + '/') ? ' aria-current="page"' : '';
      return `<a class="nav-proj" href="../${esc(p.url || '#' + p.id)}"${cur}><img src="../${esc(p.thumbnail)}" alt=""><span>${esc(p.title)}</span></a>`;
    }).join('');
  }).catch(() => {});
})();
