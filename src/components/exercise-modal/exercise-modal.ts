import {
  addFavoriteId,
  readFavoriteIds,
  removeFavoriteId,
} from '../../services/favorites';

export function initExerciseModal(): void {
  const modal = document.querySelector<HTMLDialogElement>(
    '[data-exercise-modal]'
  );
  if (!modal) {
    throw new Error('Exercise modal is missing.');
  }

  const close = modal.querySelector<HTMLButtonElement>('[data-modal-close]');
  const favorite = modal.querySelector<HTMLButtonElement>(
    '[data-modal-favorite]'
  );
  if (!close || !favorite) {
    throw new Error('Exercise modal controls are missing.');
  }
  const modalElement = modal;
  const closeButton = close;
  const favoriteButton = favorite;

  let currentExerciseId: string | null = null;
  document.addEventListener('click', event => {
    const start = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-exercise-start]'
    );
    if (!start?.dataset.exerciseId) return;
    openExercise(start.dataset.exerciseId);
  });

  closeButton.addEventListener('click', () => modalElement.close());
  modalElement.addEventListener('click', event => {
    if (event.target === modalElement) modalElement.close();
  });
  favoriteButton.addEventListener('click', () => {
    if (!currentExerciseId) return;
    const isFavorite = readFavoriteIds().includes(currentExerciseId);
    if (isFavorite) {
      removeFavoriteId(currentExerciseId);
      favoriteButton.textContent = 'Add to favorites';
    } else {
      addFavoriteId(currentExerciseId);
      favoriteButton.textContent = 'Remove from favorites';
    }
    favoriteButton.disabled = false;
    window.dispatchEvent(new Event('favorites-updated'));
  });

  function openExercise(id: string): void {
    currentExerciseId = id;
    const title = modalElement.querySelector<HTMLElement>('[data-modal-title]');
    if (!title) {
      throw new Error('Exercise modal title is missing.');
    }
    title.textContent = 'Save this exercise to your favorites?';
    const isFavorite = readFavoriteIds().includes(id);
    favoriteButton.textContent = isFavorite
      ? 'Remove from favorites'
      : 'Add to favorites';
    favoriteButton.disabled = false;
    modalElement.showModal();
  }
}
