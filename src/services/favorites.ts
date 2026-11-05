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

export function writeFavoriteIds(ids: string[]): void {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function addFavoriteId(id: string): void {
  const ids = readFavoriteIds();
  if (!ids.includes(id)) {
    writeFavoriteIds([...ids, id]);
  }
}

export function removeFavoriteId(id: string): void {
  writeFavoriteIds(readFavoriteIds().filter(favoriteId => favoriteId !== id));
}
