/* Tool-page sections: About this project, Contact, All Tools and the copyright footer, built from ../projects.json and placed just
   below the first screen. (The nav has no dropdown: "All Tools" in the nav goes back to the home page.) */
(() => {
  if (/[?&]embed=1/.test(location.search)) return;   // shown inside the home page hero: no nav, About or Contact
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let list = [], cur = 0;

  fetch('../projects.json', { cache: 'no-cache' }).then((r) => r.json()).then((items) => {
    list = items;
    const here = location.pathname.replace(/index\.html$/, '');
    cur = Math.max(0, list.findIndex((p) => here.endsWith('/' + p.id + '/')));

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
      const place = () => { const end = Math.round(document.body.getBoundingClientRect().bottom + window.scrollY); wrap.style.top = (end - window.innerHeight < 24 ? window.innerHeight : end) + 'px'; };   // a few stray pixels under the tool never open a gap
      place(); window.addEventListener('resize', place); window.addEventListener('load', place);
      [400, 1200, 3000].forEach((ms) => setTimeout(place, ms));
      if ('ResizeObserver' in window) new ResizeObserver(place).observe(document.body);
    }
  }).catch(() => {});
})();
