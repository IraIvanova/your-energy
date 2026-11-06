// Task 06 — Exercise list (owner: yuliialiubenka).
// Contract used by pages/home-page: keep these exports and signatures.
import type { Exercise } from '../../services/types';
import { createExerciseCard } from '../exercise-card/exercise-card';

function getElements(): {
  root: HTMLElement;
  title: HTMLElement;
  grid: HTMLElement;
  empty: HTMLElement;
  template: HTMLTemplateElement;
} {
  const root = document.querySelector<HTMLElement>('[data-exercise-list]');
  const title = root?.querySelector<HTMLElement>('[data-exercise-list-title]');
  const grid = root?.querySelector<HTMLElement>('[data-exercise-list-grid]');
  const empty = root?.querySelector<HTMLElement>('[data-exercise-list-empty]');
  const template = root?.querySelector<HTMLTemplateElement>(
    '[data-exercise-list-template]'
  );
  if (!root || !title || !grid || !empty || !template) {
    throw new Error('Exercise list is missing its markup.');
  }
  return { root, title, grid, empty, template };
}

/** Replaces the cards; shows the empty message when there are none. */
export function renderExerciseList(exercises: Exercise[]): void {
  const { grid, empty, template } = getElements();
  grid.textContent = '';
  for (const exercise of exercises) {
    grid.append(createExerciseCard(template, exercise, false));
  }
  empty.hidden = exercises.length !== 0;
  grid.hidden = exercises.length === 0;
}

export function clearExerciseList(): void {
  const { grid, empty } = getElements();
  grid.textContent = '';
  grid.hidden = false;
  empty.hidden = true;
}

export function setExerciseListTitle(title: string): void {
  getElements().title.textContent = title;
}

export function setExerciseListVisible(visible: boolean): void {
  getElements().root.hidden = !visible;
}

export function scrollToExerciseList(): void {
  getElements().root.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
