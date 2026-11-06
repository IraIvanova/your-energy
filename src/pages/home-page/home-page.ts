import { initCatalogFilters } from '../../components/catalog-filters/catalog-filters';
import { initCategoryCatalog } from '../../components/category-catalog/category-catalog';

export function initHomePage(): (() => void) | undefined {
  const home = document.querySelector<HTMLElement>('.home-page__exercises');
  if (!home) return;

  const refreshCatalog = initCategoryCatalog(home);
  if (refreshCatalog) {
    return initCatalogFilters(home, refreshCatalog);
  }
}
