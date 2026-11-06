// Shared HTTP core (owner: yuliialiubenka, integration).
// Endpoints live in their own files so tasks don't edit the same module:
//   quote-api.ts         01 daily quote
//   filters-api.ts       05 categories / 07 pagination
//   exercises-api.ts     06 exercises, 08 modal (+ rating), 09 favorites
//   subscription-api.ts  10 footer subscription
// Data shapes are in types.ts.

export const API_BASE_URL = 'https://your-energy.b.goit.study/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type PendingListener = (pending: number) => void;

let pendingRequests = 0;
const pendingListeners = new Set<PendingListener>();

/** Reports the number of in-flight API requests (used by the loader). */
export function onPendingRequestsChange(listener: PendingListener): void {
  pendingListeners.add(listener);
  listener(pendingRequests);
}

function setPendingRequests(delta: number): void {
  pendingRequests += delta;
  for (const listener of pendingListeners) listener(pendingRequests);
}

export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  setPendingRequests(1);
  try {
    return await request<T>(url, options);
  } finally {
    setPendingRequests(-1);
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    // Prefer the backend's own message (e.g. "Subscription already exists").
    let message = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const body: unknown = await response.json();
      if (
        typeof body === 'object' &&
        body !== null &&
        'message' in body &&
        typeof body.message === 'string'
      ) {
        message = body.message;
      }
    } catch {
      // Response has no JSON body.
    }
    throw new ApiError(message.trim(), response.status);
  }

  return (await response.json()) as T;
}

// The API returns `page` (and sometimes `totalPages`) as strings,
// so "1" + 1 would give "11". Normalize them to numbers once here.
export function normalizePage<
  T extends { page: number | string; totalPages: number | string },
>(response: T): T {
  return {
    ...response,
    page: Number(response.page) || 1,
    totalPages: Number(response.totalPages) || 0,
  };
}
