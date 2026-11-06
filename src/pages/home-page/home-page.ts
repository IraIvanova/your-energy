import { createCatalogRequests } from '../../services/pagination';
import type { Filter } from '../../services/types';
import { icons } from '../../images';
import {
  buildCategoryHash,
  createCategoryCard,
  toUrlSlug,
} from '../../components/category-card/category-card';
import { createExerciseCard } from '../../components/exercise-card/exercise-card';

type FilterType = Filter['filter'];

const FILTER_TYPES: FilterType[] = ['Muscles', 'Body parts', 'Equipment'];
const DEFAULT_FILTER: FilterType = 'Muscles';

interface Route {
  filter: FilterType;
  category: string | null;
  keyword: string;
}

function initHomePage(): void {
  // Shared component markup also exists on the favorites page,
  // so every query is scoped to the home page.
  const root = document.querySelector<HTMLElement>('[data-page="/"]');
  if (!root) throw new Error('Home page is missing.');

  const query = <T extends Element>(selector: string): T => {
    const element = root.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Home page is missing ${selector}.`);
    }
    return element;
  };

  const categories = query<HTMLElement>('[data-home-categories]');
  const categoriesEmpty = query<HTMLElement>('[data-home-categories-empty]');
  const exercises = query<HTMLElement>('[data-home-exercises]');
  const list = query<HTMLElement>('[data-home-list]');
  const categoryTitle = query<HTMLElement>('[data-home-category-title]');
  const catalogTitle = query<HTMLElement>('[data-exercises-title]');
  const back = query<HTMLAnchorElement>('[data-breadcrumb-home]');
  const breadcrumbs = query<HTMLElement>('[data-breadcrumbs]');
  const breadcrumbCurrent = query<HTMLElement>('[data-breadcrumb-current]');
  const search = query<HTMLFormElement>('[data-home-search]');
  const searchInput = query<HTMLInputElement>(
    '[data-home-search] [data-search-input]'
  );
  const empty = query<HTMLElement>('[data-home-empty]');
  const filterNav = query<HTMLElement>('[data-home-filter-nav]');
  const categoryTemplate = query<HTMLTemplateElement>(
    '[data-category-template]'
  );
  const exerciseTemplate = query<HTMLTemplateElement>('[data-home-template]');
  const error = query<HTMLElement>('[data-home-error]');
  const errorText = query<HTMLElement>('[data-home-error-text]');
  const retry = query<HTMLButtonElement>('[data-home-retry]');
  let retrySource: 'filters' | 'exercises' = 'filters';
  const filtersPagination = query<HTMLElement>(
    '[data-home-filters-pagination]'
  );
  const exercisesPagination = query<HTMLElement>(
    '[data-home-exercises-pagination]'
  );

  const catalog = createCatalogRequests(
    response => {
      error.hidden = true;
      categories.textContent = '';
      for (const filter of response.results) {
        categories.append(createCategoryCard(categoryTemplate, filter));
      }
      const isEmpty = response.results.length === 0;
      categoriesEmpty.hidden = !isEmpty;
      categories.hidden = isEmpty;
      renderPagination(
        filtersPagination,
        response.page,
        response.totalPages,
        page => catalog.changeFiltersPage(page)
      );
    },
    response => {
      error.hidden = true;
      list.textContent = '';
      for (const exercise of response.results) {
        list.append(createExerciseCard(exerciseTemplate, exercise, false));
      }
      const isEmpty = response.results.length === 0;
      empty.hidden = !isEmpty;
      list.hidden = isEmpty;
      renderPagination(
        exercisesPagination,
        response.page,
        response.totalPages,
        page => {
          catalog.changeExercisesPage(page);
          exercises.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      );
    },
    (_error, source) => {
      if (source === 'filters') {
        categories.textContent = '';
        categoriesEmpty.hidden = true;
        filtersPagination.hidden = true;
        showError('Unable to load categories. Please try again.', source);
      } else {
        list.textContent = '';
        empty.hidden = true;
        exercisesPagination.hidden = true;
        showError('Unable to load exercises. Please try again.', source);
      }
    }
  );

  function showError(
    message: string,
    source: 'filters' | 'exercises' | null = null
  ): void {
    errorText.textContent = message;
    retry.hidden = source === null;
    if (source) retrySource = source;
    error.hidden = false;
  }

  retry.addEventListener('click', () => {
    error.hidden = true;
    if (retrySource === 'filters') {
      void catalog.loadFilters();
    } else {
      void catalog.loadExercises();
    }
  });

  function setActiveFilter(filter: FilterType): void {
    for (const button of filterNav.querySelectorAll<HTMLButtonElement>(
      '[data-filter-type]'
    )) {
      const isActive = button.dataset.filterType === filter;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    }
  }

  function showCategoriesView(route: Route): void {
    catalog.cancelExercises();
    const filterChanged =
      route.filter !== catalog.state.filter ||
      catalog.state.filters.totalPages === 0;

    setActiveFilter(route.filter);
    catalogTitle.hidden = false;
    breadcrumbs.hidden = true;
    search.hidden = true;
    exercises.hidden = true;
    categories.hidden = false;
    error.hidden = true;

    if (filterChanged) {
      categories.textContent = '';
      categoriesEmpty.hidden = true;
      filtersPagination.hidden = true;
      catalog.changeFilter(route.filter);
    } else {
      // Coming back from a category: keep the already rendered page.
      catalog.state.category = '';
      filtersPagination.hidden = catalog.state.filters.totalPages <= 1;
      categoriesEmpty.hidden = categories.childElementCount !== 0;
      categories.hidden = categories.childElementCount === 0;
    }
  }

  function showExercisesView(route: Route & { category: string }): void {
    catalog.cancelFilters();
    setActiveFilter(route.filter);
    back.href = `#/category/${toUrlSlug(route.filter)}`;
    categoryTitle.textContent = route.category;
    breadcrumbCurrent.textContent = capitalizeFirstLetter(route.category);
    catalogTitle.hidden = true;
    breadcrumbs.hidden = false;
    search.hidden = false;
    categories.hidden = true;
    categoriesEmpty.hidden = true;
    filtersPagination.hidden = true;
    exercises.hidden = false;
    error.hidden = true;
    empty.hidden = true;
    list.textContent = '';
    exercisesPagination.hidden = true;
    searchInput.value = route.keyword;
    searchInput.dispatchEvent(new Event('input'));

    if (catalog.state.filter !== route.filter) {
      // Keep the category list in sync for the breadcrumb "back" step.
      catalog.state.filter = route.filter;
      catalog.state.filters.page = 1;
      catalog.state.filters.totalPages = 0;
      categories.textContent = '';
    }
    catalog.state.category = route.category;
    catalog.state.keyword = route.keyword;
    catalog.changeExercisesPage(1);
  }

  function render(): void {
    const hash = window.location.hash;
    if (hash === '' || hash === '#' || hash === '#/') {
      // Home: show the current filter (Muscles by default).
      window.history.replaceState(
        null,
        '',
        `#/category/${toUrlSlug(catalog.state.filter)}`
      );
      render();
      return;
    }

    const route = parseRoute(hash);
    if (!route) {
      // Another page (favorites): ignore late catalog responses.
      catalog.cancelExercises();
      catalog.cancelFilters();
      if (hash.startsWith('#/category')) {
        window.history.replaceState(
          null,
          '',
          `#/category/${toUrlSlug(DEFAULT_FILTER)}`
        );
        render();
      }
      return;
    }

    if (route.category) {
      showExercisesView({ ...route, category: route.category });
    } else {
      showCategoriesView(route);
    }
  }

  filterNav.addEventListener('click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-filter-type]'
    );
    const filter = FILTER_TYPES.find(
      type => type === button?.dataset.filterType
    );
    if (!filter) return;
    window.location.hash = `#/category/${toUrlSlug(filter)}`;
  });

  search.addEventListener('submit', event => {
    event.preventDefault();
    const route = parseRoute(window.location.hash);
    if (!route?.category) return;
    const next = buildCategoryHash(
      route.filter,
      route.category,
      searchInput.value.trim()
    );
    if (next === window.location.hash) {
      // Same query submitted again: reload the first page.
      catalog.changeKeyword(searchInput.value.trim());
    } else {
      window.location.hash = next;
    }
  });

  window.addEventListener('hashchange', render);

  render();
}

function parseRoute(hash: string): Route | null {
  const match = hash.match(/^#\/category\/([^/?]+)(?:\/([^?]+))?(?:\?(.*))?$/);
  if (!match) return null;
  const filter = FILTER_TYPES.find(type => toUrlSlug(type) === match[1]);
  if (!filter) return null;

  let category: string | null = null;
  if (match[2]) {
    try {
      category = decodeURIComponent(match[2]).trim() || null;
    } catch {
      return null;
    }
  }

  return {
    filter,
    category,
    keyword: new URLSearchParams(match[3] ?? '').get('keyword') ?? '',
  };
}

function renderPagination(
  container: HTMLElement,
  page: number,
  totalPages: number,
  onChange: (page: number) => void
): void {
  const pageTemplate = document.querySelector<HTMLTemplateElement>(
    '[data-pagination-page-template]'
  );
  const arrowTemplate = document.querySelector<HTMLTemplateElement>(
    '[data-pagination-arrow-template]'
  );
  const ellipsisTemplate = document.querySelector<HTMLTemplateElement>(
    '[data-pagination-ellipsis-template]'
  );
  if (!pageTemplate || !arrowTemplate || !ellipsisTemplate) {
    throw new Error('Pagination templates are missing.');
  }
  container.textContent = '';
  container.hidden = totalPages <= 1;
  if (totalPages <= 1) return;

  const appendPage = (value: number): void => {
    const button = pageTemplate.content.firstElementChild?.cloneNode(
      true
    ) as HTMLButtonElement | null;
    if (!button) throw new Error('Pagination page template is empty.');
    button.type = 'button';
    button.textContent = String(value);
    button.classList.toggle('is-active', value === page);
    button.setAttribute('aria-label', `Page ${value}`);
    if (value === page) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.addEventListener('click', () => onChange(value));
    }
    container.append(button);
  };

  const appendArrow = (
    label: string,
    source: string,
    position: 'first' | 'previous' | 'next' | 'last',
    disabled: boolean,
    nextPage: number
  ): void => {
    const button = arrowTemplate.content.firstElementChild?.cloneNode(
      true
    ) as HTMLButtonElement | null;
    if (!button) throw new Error('Pagination arrow template is empty.');
    button.type = 'button';
    button.dataset.paginationArrow = label;
    button.disabled = disabled;
    button.setAttribute('aria-label', label);
    const icon = button.querySelector<HTMLElement>(
      '.home-page__pagination-arrow-icon'
    );
    const image = icon?.querySelector<HTMLImageElement>('img');
    if (!icon || !image) throw new Error('Pagination arrow image is missing.');
    icon.classList.add(`is-${position}`);
    image.src = source;
    image.alt = '';
    button.addEventListener('click', () => onChange(nextPage));
    container.append(button);
  };

  appendArrow('First page', icons.paginationPrevious, 'first', page === 1, 1);
  appendArrow(
    'Previous page',
    icons.paginationPrevious,
    'previous',
    page === 1,
    page - 1
  );
  const visiblePages =
    totalPages <= 5
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : page <= 3
        ? [1, 2, 3, totalPages]
        : page >= totalPages - 2
          ? [1, totalPages - 2, totalPages - 1, totalPages]
          : [1, page, totalPages];

  visiblePages.forEach((value, index) => {
    if (index > 0 && value - visiblePages[index - 1] > 1) {
      const ellipsis = ellipsisTemplate.content.firstElementChild?.cloneNode(
        true
      ) as HTMLElement | null;
      if (!ellipsis) throw new Error('Pagination ellipsis template is empty.');
      container.append(ellipsis);
    }
    appendPage(value);
  });
  appendArrow(
    'Next page',
    icons.paginationNext,
    'next',
    page === totalPages,
    page + 1
  );
  appendArrow(
    'Last page',
    icons.paginationNext,
    'last',
    page === totalPages,
    totalPages
  );
}

function capitalizeFirstLetter(value: string): string {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

initHomePage();
