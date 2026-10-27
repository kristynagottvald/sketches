(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const views = { sketches: $('#view-sketches'), about: $('#view-about') };
  const cardsEl = $('#cards');
  const navLinks = document.querySelectorAll('[data-nav]');

  let sketches = [];
  let currentView = null;

  async function load() {
    try {
      const res = await fetch('sketches.json');
      if (!res.ok) throw new Error(res.status);
      sketches = await res.json();
    } catch (err) {
      console.error('Error loading sketches:', err);
    }

    if (!sketches.length) {
      cardsEl.innerHTML = '<p class="grey" style="padding: 24px;">No sketches found. Ensure sketches.json is present.</p>';
      return;
    }

    renderGrid();
    route();
  }

  const ARROW = '<svg class="card-arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.3 7.7l5.1-5.1M2.3 2.1h5.5v5.5" fill="none" stroke="currentColor"/></svg>';

  function renderGrid() {
    cardsEl.innerHTML = sketches
      .map((s) => `
      <article class="card" data-id="${s.id}">
        <a href="${s.url}" aria-label="${s.title}">
          <div class="card-media">
            <img src="${s.thumbnail}" alt="${s.title} Screenshot" loading="lazy">
          </div>
          <div class="card-meta">
            <h3 class="card-title">${s.title}</h3>
            ${s.blurb ? `<p class="card-sub">${s.blurb}</p>` : ''}
            ${ARROW}
          </div>
        </a>
      </article>`)
      .join('');

    watchWork();
  }

  function setActiveCard(card) {
    const s = sketches.find((x) => x.id === card.dataset.id);
    if (!s) return;
    cardsEl.querySelectorAll('.card').forEach((c) => c.classList.toggle('is-active', c === card));
    $('#work-active').textContent = s.title;
    $('#work-desc').textContent = s.blurb || '';
    $('#work-tag').textContent = [s.year, s.category].filter(Boolean).join(' – ');
  }

  let scrollTick = false;
  function updateActiveCardOnScroll() {
    scrollTick = false;
    if (currentView !== 'sketches') return;
    const mid = window.innerHeight * 0.5;
    let best = null, bestDist = Infinity;
    cardsEl.querySelectorAll('.card').forEach((c) => {
      const r = c.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - mid);
      if (dist < bestDist) { bestDist = dist; best = c; }
    });
    if (best && !best.classList.contains('is-active')) setActiveCard(best);
  }

  function watchWork() {
    const first = cardsEl.querySelector('.card');
    if (first) setActiveCard(first);
    window.addEventListener('scroll', () => {
      if (!scrollTick) {
        scrollTick = true;
        requestAnimationFrame(updateActiveCardOnScroll);
      }
    }, { passive: true });
  }

  /* Routing */
  function showView(name) {
    Object.entries(views).forEach(([key, el]) => { el.hidden = key !== name; });
    navLinks.forEach((a) => {
      if (a.dataset.nav === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    currentView = name;
    $('#hb-label').textContent = name === 'about' ? 'About' : 'Sketches';
    $('#hb').classList.remove('open');
  }

  function route() {
    const hash = location.hash.slice(1);
    if (hash === 'about') {
      showView('about');
    } else {
      showView('sketches');
    }
  }

  /* UI Event Listeners */
  $('.hb-pill').addEventListener('mouseleave', () => {
    $('#hb').classList.remove('open');
    $('#hb-toggle').setAttribute('aria-expanded', 'false');
  });

  $('#hb-toggle').addEventListener('click', () => {
    const hb = $('#hb');
    $('#hb-toggle').setAttribute('aria-expanded', String(hb.classList.toggle('open')));
  });

  window.addEventListener('hashchange', route);
  load();
})();