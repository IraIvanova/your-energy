import { ApiError } from '../../services/api';
import { subscribe } from '../../services/subscription-api';

const form = document.getElementById(
  'footer-subscription-form'
) as HTMLFormElement | null;
const emailInput = document.getElementById(
  'footer-email'
) as HTMLInputElement | null;
const messageEl = document.getElementById(
  'footer-subscription-message'
) as HTMLParagraphElement | null;

if (form && emailInput && messageEl) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    messageEl.textContent = '';

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const email = emailInput.value.trim();

    try {
      const response = await subscribe(email);
      messageEl.textContent =
        response.message || 'Thank you! You are subscribed.';
      messageEl.style.color = '#4caf50';
      form.reset();
    } catch (error) {
      messageEl.style.color = '#f44336';
      if (error instanceof ApiError) {
        messageEl.textContent =
          error.message || 'Something went wrong. Please try again.';
      } else {
        messageEl.textContent = 'Something went wrong. Please try again.';
      }
    }
  });
}
export {};
