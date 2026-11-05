export function initAppShell(): void {
  const pages = document.querySelectorAll<HTMLElement>('[data-page]');
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-route]');
  if (pages.length === 0 || links.length === 0) {
    throw new Error('App shell is missing pages or navigation.');
  }

  const menu = document.getElementById('site-menu');
  const toggle = document.querySelector<HTMLButtonElement>(
    '.site-header__menu-toggle'
  );
  const closeBtn = menu?.querySelector<HTMLButtonElement>('.site-menu__close');
  const backdrop = document.querySelector<HTMLButtonElement>(
    '.site-menu__backdrop'
  );
  const menuNav = menu?.querySelector<HTMLElement>('.site-menu__nav');

  function setBackdropVisible(visible: boolean): void {
    if (!backdrop) return;
    backdrop.hidden = !visible;
  }

  function updateRoute(): void {
    const path =
      (window.location.hash.slice(1) || '/')
        .split(/[?]/)[0]
        .replace(/\/+$/, '') || '/';
    const route = path.toLowerCase() === '/favorites' ? '/favorites' : '/';

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

    closeMenu();
  }

  function openMenu(): void {
    if (!menu || !toggle) return;
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('site-menu-open');
    setBackdropVisible(true);
    (closeBtn ?? menuNav?.querySelector('a') ?? toggle).focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeMenu(): void {
    if (!menu || !toggle) return;
    const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('site-menu-open');
    setBackdropVisible(false);
    document.removeEventListener('keydown', onKeydown);
    if (wasOpen) toggle.focus();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    }
  }

  toggle?.addEventListener('click', () => {
    if (toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    } else {
      openMenu();
    }
  });
  closeBtn?.addEventListener('click', closeMenu);
  backdrop?.addEventListener('click', closeMenu);
  menuNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  updateRoute();
  window.addEventListener('hashchange', updateRoute);
}
