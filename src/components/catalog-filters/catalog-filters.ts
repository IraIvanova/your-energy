import {
  getCatalogState,
  selectFilter,
  catalogEvents,
  type CatalogFilter,
  type CatalogState,
} from '../../services/catalog-state';

export function initCatalogFilters(root: HTMLElement) {
  const buttons = root.querySelectorAll<HTMLButtonElement>('[data-filter]');

  const render = (state: CatalogState) =>
    buttons.forEach(button =>
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.filter === state.filter)
      )
    );

  buttons.forEach(button =>
    button.addEventListener('click', () =>
      selectFilter(button.dataset.filter as CatalogFilter)
    )
  );

  catalogEvents.addEventListener('catalog:change', () => {
    render(getCatalogState());
  });

  render(getCatalogState());
}
