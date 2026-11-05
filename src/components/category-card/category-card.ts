import type { Category } from '../../services/catalog';

export function renderCategoryCard(
  template: HTMLTemplateElement,
  category: Category,
  onSelect: (name: string) => void
) {
  const fragment = template.content.cloneNode(true) as DocumentFragment;
  fragment.querySelector('img')!.src = category.imgURL;
  fragment.querySelector('.category-card__name')!.textContent = category.name;
  fragment.querySelector('.category-card__filter')!.textContent =
    category.filter;
  fragment
    .querySelector('button')!
    .addEventListener('click', () => onSelect(category.name));
  return fragment;
}
