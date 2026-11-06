// Loader — owner: not assigned.
// TZ: show a spinner while async requests are running.
//
// Ready to use: onPendingRequestsChange(listener) from services/api.ts
// reports the number of in-flight API requests (every fetchJson call),
// so this component never needs to touch other files.
//
// TODO: show [data-loader] while pending > 0, hide it at 0
// (a short delay avoids flicker on fast requests).
export function initLoader(): void {
  // Stub: implement here.
}
