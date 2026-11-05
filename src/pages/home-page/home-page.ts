import { initCatalogFilters } from '../../components/catalog-filters/catalog-filters';
import { initCategoryCatalog } from '../../components/category-catalog/category-catalog';

const home = document.querySelector<HTMLElement>('.home-page');
if (home) {
  initCatalogFilters(home);
  initCategoryCatalog(home);
}
