// Section navigation stays usable while the catalogue is loading.
(() => {
  const menu = document.querySelector('#mobileMenu');
  const nav = document.querySelector('.mobile-nav');
  const links = [...nav.querySelectorAll('[data-nav-section]')];
  const sections = ['top', 'brands', 'collections', 'catalog', 'about', 'contacts']
    .map(id => document.getElementById(id));
  let scheduled = false;

  function updateActiveSection() {
    scheduled = false;
    let current = 'top';
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 110) current = section.id;
    }
    const selected = current === 'catalog' && window.shopOnlyFavorites
      ? 'favorites' : ['catalog', 'brands'].includes(current) ? current : 'menu';
    links.forEach(link => {
      const active = link.dataset.navSection === selected;
      link.classList.toggle('active', active);
      if (active && link.tagName === 'A') link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    document.querySelector('#mobileFavorites').classList.toggle('active', selected === 'favorites');
  }

  function requestUpdate() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateActiveSection);
    }
  }

  document.querySelectorAll('[data-menu-open]').forEach(button => {
    button.addEventListener('click', () => { if (!menu.open) menu.showModal(); });
  });
  menu.querySelector('.close').addEventListener('click', () => menu.close());
  menu.addEventListener('click', event => {
    const link = event.target.closest('.menu-links a');
    if (link) {
      event.preventDefault();
      menu.close();
      const hash = link.getAttribute('href');
      history.replaceState(null, '', hash);
      requestAnimationFrame(() => document.querySelector(hash).scrollIntoView());
    } else if (event.target === menu) {
      const rect = menu.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) menu.close();
    }
  });
  window.addEventListener('scroll', requestUpdate, {passive: true});
  window.addEventListener('resize', requestUpdate);
  document.addEventListener('shop:navigation', requestUpdate);
  updateActiveSection();
})();

/* Let visitors stop the moving brand ribbon. */
(() => {
  const carousel = document.querySelector('.brand-carousel');
  const toggle = carousel?.querySelector('.brand-motion-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const paused = carousel.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Продолжить ленту' : 'Приостановить ленту';
  });
})();
