export function initSearchFields(): void {
  for (const field of document.querySelectorAll<HTMLElement>('[data-search]')) {
    const input = field.querySelector<HTMLInputElement>('[data-search-input]');
    const clear = field.querySelector<HTMLButtonElement>('[data-search-clear]');
    if (!input || !clear) {
      throw new Error('Search field is missing its input or clear button.');
    }

    const updateClearButton = (): void => {
      clear.hidden = input.value.length === 0;
      clear.disabled = input.disabled;
    };

    input.addEventListener('input', updateClearButton);
    clear.addEventListener('click', () => {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
    updateClearButton();
  }
}
