export function initAppShell(): void {
  const pages = document.querySelectorAll<HTMLElement>('[data-page]');
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-route]');
  if (pages.length === 0 || links.length === 0) {
    throw new Error('App shell is missing pages or navigation.');
  }

  function updateRoute(): void {
    const path =
      (window.location.hash.slice(1) || '/')
        .split(/[?]/)[0]
        .replace(/\/+$/, '') || '/';
    const route = path.toLowerCase() === '/favorites' ? '/favorites' : '/';
    document.body.classList.toggle('favorites-active', route === '/favorites');

    for (const page of pages) {
      page.hidden = page.dataset.page !== route;
    }
    for (const link of links) {
      const active = link.dataset.route === route;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  updateRoute();
  window.addEventListener('hashchange', updateRoute);
}
