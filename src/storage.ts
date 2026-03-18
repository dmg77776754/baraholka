/**
 * Управление своими объявлениями через localStorage
 * Сохраняем IDs объявлений, которые создал пользователь
 */

const MY_LISTINGS_KEY = 'baraholka_my_listings';
const USER_ID_KEY = 'baraholka_user_id';

/**
 * Получить уникальный ID пользователя (генерируется при первом использовании)
 */
export function getUserId(): string {
  try {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  } catch (err) {
    console.error('Error getting user ID from localStorage:', err);
    // Fallback - generate temporary ID
    return `temp_${Date.now()}`;
  }
}

/**
 * Получить список ID своих объявлений
 */
export function getMyListingIds(): string[] {
  try {
    const stored = localStorage.getItem(MY_LISTINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error reading my listings from localStorage:', err);
    return [];
  }
}

/**
 * Добавить объявление в список своих
 */
export function addToMyListings(listingId: string): void {
  try {
    const ids = getMyListingIds();
    if (!ids.includes(listingId)) {
      ids.push(listingId);
      localStorage.setItem(MY_LISTINGS_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.error('Error saving listing to localStorage:', err);
  }
}

/**
 * Удалить объявление из списка своих
 */
export function removeFromMyListings(listingId: string): void {
  try {
    const ids = getMyListingIds();
    const filtered = ids.filter((id) => id !== listingId);
    localStorage.setItem(MY_LISTINGS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error removing listing from localStorage:', err);
  }
}

/**
 * Проверить, есть ли объявление в списке своих
 */
export function isMyListing(listingId: string): boolean {
  return getMyListingIds().includes(listingId);
}

/**
 * Очистить все свои объявления (на случай если нужно сбросить)
 */
export function clearMyListings(): void {
  try {
    localStorage.removeItem(MY_LISTINGS_KEY);
  } catch (err) {
    console.error('Error clearing my listings:', err);
  }
}

/**
 * LocalStorage favorites (для случаев без Telegram)
 */
const FAVORITES_KEY = 'baraholka_favorites';

export function getFavoriteIds(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error reading favorites from localStorage:', err);
    return [];
  }
}

export function addToFavoritesLocal(listingId: string): void {
  try {
    const ids = getFavoriteIds();
    if (!ids.includes(listingId)) {
      ids.push(listingId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.error('Error saving favorite to localStorage:', err);
  }
}

export function removeFromFavoritesLocal(listingId: string): void {
  try {
    const ids = getFavoriteIds();
    const filtered = ids.filter((id) => id !== listingId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error removing favorite from localStorage:', err);
  }
}

export function isFavoriteLocal(listingId: string): boolean {
  return getFavoriteIds().includes(listingId);
}
