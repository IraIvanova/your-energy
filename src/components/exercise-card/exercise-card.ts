import type { Exercise } from '../../services/types';

export function createExerciseCard(
  template: HTMLTemplateElement,
  exercise: Exercise,
  showRemove: boolean
): HTMLElement {
  const card = template.content.firstElementChild?.cloneNode(
    true
  ) as HTMLElement | null;
  if (!card) {
    throw new Error('Exercise card template is missing.');
  }

  card.dataset.exerciseId = exercise._id;
  const title = card.querySelector<HTMLElement>('.exercise-card__title');
  const details = card.querySelectorAll<HTMLElement>(
    '.exercise-card__details p'
  );
  const start = card.querySelector<HTMLButtonElement>('[data-exercise-start]');
  const remove = card.querySelector<HTMLButtonElement>(
    '[data-favorite-remove]'
  );
  const icon = remove?.querySelector<HTMLImageElement>('img');
  const rating = card.querySelector<HTMLElement>('[data-exercise-rating]');
  const ratingValue = card.querySelector<HTMLElement>('[data-rating-value]');
  if (
    !title ||
    details.length < 3 ||
    !start ||
    !remove ||
    !icon ||
    !rating ||
    !ratingValue
  ) {
    throw new Error('Exercise card template is incomplete.');
  }

  title.textContent = exercise.name;
  const detailValues = [
    `${exercise.burnedCalories} / min`,
    exercise.bodyPart,
    exercise.target,
  ];
  details.forEach((detail, index) => {
    const value = detail.lastChild;
    if (!value) {
      throw new Error('Exercise card detail is incomplete.');
    }
    value.textContent = ` ${detailValues[index]}`;
  });
  start.dataset.exerciseId = exercise._id;
  remove.hidden = !showRemove;
  icon.src = './images/icons/trash.svg';
  rating.hidden = showRemove;
  ratingValue.textContent = String(exercise.rating ?? 0);

  return card;
}
