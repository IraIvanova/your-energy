import { initCatalogFilters } from '../../components/catalog-filters/catalog-filters';
import { initCategoryCatalog } from '../../components/category-catalog/category-catalog';

const home = document.querySelector<HTMLElement>('.home-page__exercises');
if (home) {
  const refreshCatalog = initCategoryCatalog(home);
  if (refreshCatalog) {
    initCatalogFilters(home, refreshCatalog);
  }
}
