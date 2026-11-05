import { getAllFilters, getExercisesByFilter } from '../../services/api';
import type { Filter } from '../../services/types';
import { createExerciseCard } from '../../components/exercise-card/exercise-card';

async function initHomePage(): Promise<void> {
  const categories = document.querySelector<HTMLElement>(
    '[data-home-categories]'
  );
  const exercises = document.querySelector<HTMLElement>(
    '[data-home-exercises]'
  );
  const list = document.querySelector<HTMLElement>('[data-home-list]');
  const categoryTitle = document.querySelector<HTMLElement>(
    '[data-home-category-title]'
  );
  const catalogTitle = document.querySelector<HTMLElement>(
    '[data-exercises-title]'
  );
  const back = document.querySelector<HTMLAnchorElement>(
    '[data-breadcrumb-home]'
  );
  const breadcrumbs = document.querySelector<HTMLElement>('[data-breadcrumbs]');
  const breadcrumbCurrent = document.querySelector<HTMLElement>(
    '[data-breadcrumb-current]'
  );
  const search = document.querySelector<HTMLFormElement>('[data-home-search]');
  const searchInput = document.querySelector<HTMLInputElement>(
    '[data-home-search] [data-search-input]'
  );
  const empty = document.querySelector<HTMLElement>('[data-home-empty]');
  const filterNav = document.querySelector<HTMLElement>(
    '[data-home-filter-nav]'
  );
  const categoryTemplate = document.querySelector<HTMLTemplateElement>(
    '[data-category-template]'
  );
  const template = document.querySelector<HTMLTemplateElement>(
    '[data-home-template]'
  );
  const error = document.querySelector<HTMLElement>('[data-home-error]');
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
    !error
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

  try {
    setDefaultFilter();
    const filters = await getAllFilters();
    categoriesElement.textContent = '';
    for (const filter of filters) {
      categoriesElement.append(
        createCategoryCard(categoryTemplateElement, filter)
      );
    }
    renderCategoryList();

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
    backElement.addEventListener('click', () => {
      const path = window.location.hash.split('?')[0];
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 2) {
        segments.pop();
      }
      window.location.hash = `#/${segments.join('/') || 'category/muscles'}`;
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
    window.addEventListener('hashchange', () => {
      void renderCategory();
    });
    await renderCategory();
  } catch {
    error.hidden = false;
  }

  async function renderCategory(): Promise<void> {
    const match = window.location.hash.match(
      /^#\/category\/([^/]+)(?:\/([^?]+))?/
    );
    if (!match) {
      renderCategoryList();
      categoriesElement.hidden = false;
      exercisesElement.hidden = true;
      breadcrumbsElement.hidden = true;
      catalogTitleElement.hidden = false;
      searchElement.hidden = true;
      filterNavElement.hidden = false;
      return;
    }
    const categoryType = findFilterType(match[1]);
    if (!match[2]) {
      renderCategoryList(categoryType);
      categoriesElement.hidden = false;
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
    const response = await getExercisesByFilter(
      categoryType,
      category,
      1,
      9,
      searchInputElement.value
    );
    const { results } = response;
    emptyElement.hidden = results.length !== 0;
    listElement.hidden = results.length === 0;
    for (const exercise of results) {
      listElement.append(createExerciseCard(templateElement, exercise, false));
    }
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
        categoryElement.hidden = Boolean(
          selectedCategoryType &&
          toUrlSlug(categoryElement.dataset.categoryType ?? '') !==
            toUrlSlug(selectedCategoryType)
        );
      });
  }

  function setDefaultFilter(): void {
    const hash = window.location.hash;
    if (hash && hash !== '#/' && hash !== '#') return;

    window.location.hash = '#/category/muscles';
  }
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

function createCategoryCard(
  template: HTMLTemplateElement,
  filter: Filter
): HTMLElement {
  const card = template.content.firstElementChild?.cloneNode(
    true
  ) as HTMLElement | null;
  if (!card) throw new Error('Category card template is missing.');
  const link = card as HTMLAnchorElement;
  const name = card.querySelector<HTMLElement>('.home-page__category-name');
  if (!name) throw new Error('Category template is incomplete.');
  link.dataset.categoryName = filter.name;
  link.dataset.categoryType = filter.filter;
  link.href = buildCategoryHash(filter.filter, filter.name);
  name.textContent = filter.name;
  return card;
}

void initHomePage();
