import type { Category } from '../../services/catalog';

export function renderCategoryCard(
  template: HTMLTemplateElement,
  category: Category,
  onSelect: (name: string) => void
) {
  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const image = fragment.querySelector('img');
  const name = fragment.querySelector('.category-card__name');
  const filter = fragment.querySelector('.category-card__filter');
  const link = fragment.querySelector('a');

  if (!image || !name || !filter || !link) return;

  image.src = category.imgURL;
  name.textContent = category.name;
  filter.textContent = category.filter;
  link.addEventListener('click', event => {
    event.preventDefault();
    onSelect(category.name);
  });

  return fragment;
}
