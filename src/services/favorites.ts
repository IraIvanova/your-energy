const FAVORITES_KEY = 'favorites';

export function readFavoriteIds(): string[] {
  const stored = window.localStorage.getItem(FAVORITES_KEY);
  if (!stored) {
    return [];
  }

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) {
    throw new Error('Favorites storage must contain an array of IDs.');
  }

  return parsed.filter((id): id is string => typeof id === 'string');
}

/**
 * Like readFavoriteIds, but treats broken storage as an empty list.
 * Use it where a broken value must not stop the UI (modal, add/remove).
 * The favorites page uses readFavoriteIds to tell the user about it.
 */
export function readFavoriteIdsSafe(): string[] {
  try {
    return readFavoriteIds();
  } catch {
    return [];
  }
}

export function isFavoriteId(id: string): boolean {
  return readFavoriteIdsSafe().includes(id);
}

export function writeFavoriteIds(ids: string[]): void {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function addFavoriteId(id: string): void {
  const ids = readFavoriteIdsSafe();
  if (!ids.includes(id)) {
    writeFavoriteIds([...ids, id]);
  }
}

export function removeFavoriteId(id: string): void {
  writeFavoriteIds(
    readFavoriteIdsSafe().filter(favoriteId => favoriteId !== id)
  );
}
