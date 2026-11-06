export function initAppShell(): void {
  const DESKTOP_QUERY = '(min-width: 768px)';
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

  function getMenuFocusables(): HTMLElement[] {
    if (!menu) return [];
    return Array.from(
      menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    ).filter(element => element.offsetParent !== null);
  }

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
    document.body.classList.toggle('favorites-active', route === '/favorites');
    document.documentElement.classList.toggle(
      'favorites-active',
      route === '/favorites'
    );

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

  function closeMenu(options: { restoreFocus?: boolean } = {}): void {
    if (!menu || !toggle) return;
    const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('site-menu-open');
    setBackdropVisible(false);
    document.removeEventListener('keydown', onKeydown);
    if (options.restoreFocus !== false && wasOpen) toggle.focus();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = getMenuFocusables();
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    const insideMenu = active instanceof Node && menu?.contains(active);
    if (event.shiftKey && (!insideMenu || active === first)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (!insideMenu || active === last)) {
      event.preventDefault();
      first.focus();
    }
  }

  toggle?.addEventListener('click', () => {
    if (toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    } else {
      openMenu();
    }
  });
  closeBtn?.addEventListener('click', () => closeMenu());
  backdrop?.addEventListener('click', () => closeMenu());
  menuNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  const desktopMql = window.matchMedia(DESKTOP_QUERY);
  desktopMql.addEventListener('change', event => {
    if (event.matches && toggle?.getAttribute('aria-expanded') === 'true') {
      closeMenu({ restoreFocus: false });
    }
  });

  updateRoute();
  window.addEventListener('hashchange', updateRoute);
}
