import { getAllFilters } from '../../services/api';
import { createCatalogRequests } from '../../services/pagination';
import type { Filter } from '../../services/types';
import { icons } from '../../images';
import { createCategoryCard } from '../../components/category-card/category-card';
import { createExerciseCard } from '../../components/exercise-card/exercise-card';

async function initHomePage(): Promise<void> {
  const root = document.querySelector<HTMLElement>('[data-page="/"]');
  if (!root) throw new Error('Home page is missing.');
  const categories = root.querySelector<HTMLElement>('[data-home-categories]');
  const exercises = root.querySelector<HTMLElement>('[data-home-exercises]');
  const list = root.querySelector<HTMLElement>('[data-home-list]');
  const categoryTitle = root.querySelector<HTMLElement>(
    '[data-home-category-title]'
  );
  const catalogTitle = root.querySelector<HTMLElement>(
    '[data-exercises-title]'
  );
  const back = root.querySelector<HTMLAnchorElement>('[data-breadcrumb-home]');
  const breadcrumbs = root.querySelector<HTMLElement>('[data-breadcrumbs]');
  const breadcrumbCurrent = root.querySelector<HTMLElement>(
    '[data-breadcrumb-current]'
  );
  const search = root.querySelector<HTMLFormElement>('[data-home-search]');
  const searchInput = root.querySelector<HTMLInputElement>(
    '[data-home-search] [data-search-input]'
  );
  const empty = root.querySelector<HTMLElement>('[data-home-empty]');
  const filterNav = root.querySelector<HTMLElement>('[data-home-filter-nav]');
  const categoryTemplate = root.querySelector<HTMLTemplateElement>(
    '[data-category-template]'
  );
  const template = root.querySelector<HTMLTemplateElement>(
    '[data-home-template]'
  );
  const error = root.querySelector<HTMLElement>('[data-home-error]');
  const filtersPagination = root.querySelector<HTMLElement>(
    '[data-home-filters-pagination]'
  );
  const exercisesPagination = root.querySelector<HTMLElement>(
    '[data-home-exercises-pagination]'
  );
  if (
    !categories ||
    !exercises ||
    !list ||
    !categoryTitle ||
    !catalogTitle ||
    !back ||
    !breadcrumbs ||
    !breadcrumbCurrent ||
    !search ||
    !searchInput ||
    !empty ||
    !filterNav ||
    !categoryTemplate ||
    !template ||
    !error ||
    !filtersPagination ||
    !exercisesPagination
  ) {
    throw new Error('Home page is missing its exercise catalog.');
  }
  const categoriesElement = categories;
  const exercisesElement = exercises;
  const listElement = list;
  const categoryTitleElement = categoryTitle;
  const catalogTitleElement = catalogTitle;
  const categoryTemplateElement = categoryTemplate;
  const templateElement = template;
  const backElement = back;
  const breadcrumbsElement = breadcrumbs;
  const breadcrumbCurrentElement = breadcrumbCurrent;
  const searchElement = search;
  const searchInputElement = searchInput;
  const emptyElement = empty;
  const filterNavElement = filterNav;
  const errorElement = error;
  const filtersPaginationElement = filtersPagination;
  const exercisesPaginationElement = exercisesPagination;
  let activeFilter: Filter['filter'] = 'Muscles';
  let allFilters: Filter[] = [];
  let filtersPage = 1;
  let currentExercisesPage = 1;
  let currentExercisesTotalPages = 0;
  const filtersPerPage = window.matchMedia('(max-width: 767px)').matches
    ? 9
    : 12;
  const catalogRequests = createCatalogRequests(
    () => undefined,
    response => {
      if (response.page !== currentExercisesPage) return;
      errorElement.hidden = true;
      currentExercisesTotalPages = response.totalPages;
      listElement.textContent = '';
      emptyElement.hidden = response.results.length !== 0;
      listElement.hidden = response.results.length === 0;
      response.results.forEach(exercise => {
        listElement.append(
          createExerciseCard(templateElement, exercise, false)
        );
      });
      renderPagination(
        exercisesPaginationElement,
        currentExercisesPage,
        currentExercisesTotalPages,
        page => {
          currentExercisesPage = page;
          catalogRequests.changeExercisesPage(page);
        }
      );
    },
    () => {
      listElement.textContent = '';
      emptyElement.hidden = true;
      exercisesPaginationElement.hidden = true;
      showError("We couldn't load exercises. Please try again later.");
    }
  );

  try {
    setDefaultFilter();
    activeFilter = getFilterFromHash() ?? activeFilter;
    allFilters = await getAllFilters();
    categoriesElement.textContent = '';
    for (const filter of allFilters) {
      categoriesElement.append(
        createCategoryCard(categoryTemplateElement, filter)
      );
    }
    renderCategoryList(activeFilter);

    categoriesElement.addEventListener('click', event => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
        '[data-category-name]'
      );
      if (link) {
        event.preventDefault();
        window.location.hash = buildCategoryHash(
          link.dataset.categoryType ?? '',
          link.dataset.categoryName ?? ''
        );
      }
    });
    filterNavElement.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        '[data-filter-type]'
      );
      if (!button?.dataset.filterType) return;
      window.location.hash = `#/category/${toUrlSlug(
        button.dataset.filterType
      )}`;
    });
    searchElement.addEventListener('submit', event => {
      event.preventDefault();
      const params = getCategoryParams();
      window.location.hash = buildCategoryHash(
        params.categoryType,
        params.category,
        searchInputElement.value.trim()
      );
    });
    window.addEventListener('hashchange', safeRenderCategory);
    safeRenderCategory();
  } catch {
    showError("We couldn't load categories. Please try again later.");
  }

  function showError(message: string): void {
    errorElement.textContent = message;
    errorElement.hidden = false;
  }

  function safeRenderCategory(): void {
    try {
      renderCategory();
    } catch {
      catalogRequests.cancelExercises();
      showError("We couldn't find this category. Please choose another one.");
    }
  }

  function renderCategory(): void {
    const hash = window.location.hash;
    if (hash === '' || hash === '#' || hash === '#/') {
      // Home link / breadcrumb: keep the currently selected filter
      // instead of falling back to a list with every category type.
      window.location.replace(`#/category/${toUrlSlug(activeFilter)}`);
      return;
    }
    const match = hash.match(/^#\/category\/([^/?]+)(?:\/([^?]+))?/);
    if (!match) {
      // Another route (e.g. favorites): drop pending catalog responses.
      catalogRequests.cancelExercises();
      renderCategoryList(activeFilter);
      categoriesElement.hidden = false;
      filtersPaginationElement.hidden = false;
      exercisesElement.hidden = true;
      breadcrumbsElement.hidden = true;
      catalogTitleElement.hidden = false;
      searchElement.hidden = true;
      filterNavElement.hidden = false;
      return;
    }
    const categoryType = findFilterType(match[1]);
    if (categoryType !== activeFilter) filtersPage = 1;
    activeFilter = categoryType;
    errorElement.hidden = true;
    if (!match[2]) {
      catalogRequests.cancelExercises();
      renderCategoryList(categoryType);
      categoriesElement.hidden = false;
      filtersPaginationElement.hidden = false;
      exercisesElement.hidden = true;
      breadcrumbsElement.hidden = true;
      catalogTitleElement.hidden = false;
      searchElement.hidden = true;
      filterNavElement.hidden = false;
      return;
    }
    const category = findCategoryName(categoryType, match[2]);
    backElement.href = `#/category/${toUrlSlug(categoryType)}`;
    categoryTitleElement.textContent = category;
    categoriesElement.hidden = true;
    filtersPaginationElement.hidden = true;
    exercisesElement.hidden = false;
    breadcrumbsElement.hidden = false;
    catalogTitleElement.hidden = true;
    searchElement.hidden = false;
    filterNavElement
      .querySelectorAll<HTMLButtonElement>('[data-filter-type]')
      .forEach(button => {
        button.classList.toggle(
          'is-active',
          button.dataset.filterType === categoryType
        );
      });
    breadcrumbCurrentElement.textContent = capitalizeFirstLetter(category);
    listElement.textContent = '';
    const params = getCategoryParams();
    searchInputElement.value = params.query.get('keyword') ?? '';
    catalogRequests.state.filter = categoryType;
    catalogRequests.state.category = category;
    catalogRequests.state.keyword = searchInputElement.value;
    currentExercisesPage = 1;
    currentExercisesTotalPages = 0;
    catalogRequests.changeExercisesPage(1);
  }

  function renderCategoryList(selectedCategoryType?: Filter['filter']): void {
    filterNavElement
      .querySelectorAll<HTMLButtonElement>('[data-filter-type]')
      .forEach((button, index) => {
        button.classList.toggle(
          'is-active',
          selectedCategoryType
            ? button.dataset.filterType === selectedCategoryType
            : index === 0
        );
      });
    categoriesElement
      .querySelectorAll<HTMLElement>('[data-category-name]')
      .forEach(categoryElement => {
        const matchesFilter =
          !selectedCategoryType ||
          toUrlSlug(categoryElement.dataset.categoryType ?? '') ===
            toUrlSlug(selectedCategoryType);
        const index = Array.from(
          categoriesElement.querySelectorAll<HTMLElement>(
            `[data-category-name][data-category-type="${selectedCategoryType}"]`
          )
        ).indexOf(categoryElement);
        categoryElement.hidden =
          !matchesFilter ||
          (index >= 0 && index < (filtersPage - 1) * filtersPerPage) ||
          (index >= 0 && index >= filtersPage * filtersPerPage);
      });
    renderFiltersPagination();
  }

  function renderFiltersPagination(): void {
    const totalPages = Math.ceil(
      allFilters.filter(filter => filter.filter === activeFilter).length /
        filtersPerPage
    );
    renderPagination(
      filtersPaginationElement,
      filtersPage,
      totalPages,
      page => {
        filtersPage = page;
        renderCategoryList(activeFilter);
      }
    );
  }

  function setDefaultFilter(): void {
    const hash = window.location.hash;
    if (hash && hash !== '#/' && hash !== '#') return;

    window.history.replaceState(null, '', '#/category/muscles');
  }

  function getFilterFromHash(): Filter['filter'] | null {
    const match = window.location.hash.match(/^#\/category\/([^/?]+)/);
    if (!match) return null;
    try {
      return findFilterType(match[1]);
    } catch {
      return null;
    }
  }
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
    if (value === page) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => onChange(value));
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

function buildCategoryHash(
  categoryType: string,
  category: string,
  keyword = ''
): string {
  const query = new URLSearchParams();
  if (keyword) query.set('keyword', keyword);
  const queryString = query.toString();
  return `#/category/${toUrlSlug(categoryType)}/${toUrlSlug(category)}${
    queryString ? `?${queryString}` : ''
  }`;
}

function getCategoryParams(): {
  categoryType: Filter['filter'];
  category: string;
  query: URLSearchParams;
} {
  const match = window.location.hash.match(/^#\/category\/([^/]+)\/([^?]+)/);
  if (!match) {
    throw new Error('Category route is missing.');
  }
  const categoryType = findFilterType(match[1]);
  return {
    categoryType,
    category: findCategoryName(categoryType, match[2]),
    query: new URLSearchParams(window.location.hash.split('?')[1] ?? ''),
  };
}

function toUrlSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function capitalizeFirstLetter(value: string): string {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

function findFilterType(slug: string): Filter['filter'] {
  const normalized = toUrlSlug(slug);
  const filterType = ['Muscles', 'Body parts', 'Equipment'].find(
    filter => toUrlSlug(filter) === normalized
  );
  if (!filterType) {
    throw new Error('Unknown exercise filter.');
  }
  return filterType as Filter['filter'];
}

function findCategoryName(filterType: Filter['filter'], slug: string): string {
  const normalized = toUrlSlug(slug);
  for (const category of document.querySelectorAll<HTMLElement>(
    '[data-category-name]'
  )) {
    const categoryName = category.dataset.categoryName;
    if (
      category.dataset.categoryType === filterType &&
      categoryName &&
      toUrlSlug(categoryName) === normalized
    ) {
      return categoryName;
    }
  }
  throw new Error('Unknown exercise category.');
}

void initHomePage();
