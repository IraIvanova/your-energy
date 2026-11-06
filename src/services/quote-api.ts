// Task 01 — Daily quote API (owner: krmelnyk).
import { API_BASE_URL, fetchJson } from './api';
import type { Quote } from './types';

export function getQuote(): Promise<Quote> {
  return fetchJson<Quote>(`${API_BASE_URL}/quote`);
}
