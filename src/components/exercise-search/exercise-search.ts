// Task 06 — Exercise search (owner: yuliialiubenka).
// Contract used by pages/home-page: keep these exports and signatures.

function getElements(): { form: HTMLFormElement; input: HTMLInputElement } {
  const form = document.querySelector<HTMLFormElement>(
    '[data-exercise-search]'
  );
  const input = form?.querySelector<HTMLInputElement>('[data-search-input]');
  if (!form || !input) throw new Error('Exercise search is missing.');
  return { form, input };
}

/** Calls onSubmit with the trimmed keyword on form submit. */
export function initExerciseSearch(onSubmit: (keyword: string) => void): void {
  const { form, input } = getElements();
  form.addEventListener('submit', event => {
    event.preventDefault();
    onSubmit(input.value.trim());
  });
}

export function setExerciseSearchKeyword(keyword: string): void {
  const { input } = getElements();
  input.value = keyword;
  // Lets search-field update its clear button.
  input.dispatchEvent(new Event('input'));
}

export function setExerciseSearchVisible(visible: boolean): void {
  getElements().form.hidden = !visible;
}
