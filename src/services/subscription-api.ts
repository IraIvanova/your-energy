// Task 10 — Subscription API (owner: MLazoryk).
import { API_BASE_URL, fetchJson } from './api';

export function subscribe(email: string): Promise<{ message?: string }> {
  return fetchJson<{ message?: string }>(`${API_BASE_URL}/subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}
