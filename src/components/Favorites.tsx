import { useState, useEffect } from 'react';
import { getFavorites, getApprovedListings } from '../store';
import { getTelegramUser } from '../telegram';
import { ListingCard } from './ListingCard';
import { ListingDetail } from './ListingDetail';
import { getFavoriteIds } from '../storage';
import type { Listing } from '../types';

export function Favorites({ onClose }: { onClose: () => void }) {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const tgUser = getTelegramUser();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (tgUser?.id) {
        const data = await getFavorites(tgUser.id);
        setFavorites(data);
        return;
      }

      // Fallback: localStorage favorites (без Telegram)
      const favoriteIds = getFavoriteIds();
      if (favoriteIds.length === 0) {
        setFavorites([]);
        return;
      }

      const all = await getApprovedListings();
      const filtered = all.filter((l) => favoriteIds.includes(l.id));
      setFavorites(filtered);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при загрузке избранного';
      setError(message);
      console.error(message, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    // Reload favorites when a favorite is toggled
    loadFavorites();
  };

  if (!tgUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="sticky top-0 z-30 bg-white/98 backdrop-blur-lg border-b border-gray-100 shadow-md">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-gray-900">❤️ Избранное</h1>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500">Необходимо авторизоваться через Telegram</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/98 backdrop-blur-lg border-b border-gray-100 shadow-md">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">❤️ Избранное</h1>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-500">Загружаем избранное...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadFavorites}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-all"
            >
              Попробовать снова
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Избранное пустое</h2>
            <p className="text-gray-500 mb-6">Добавьте объявления в избранное, нажав на сердечко</p>
            <button
              onClick={onClose}
              className="rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-600 transition-all"
            >
              Найти объявления
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                {favorites.length} {favorites.length === 1 ? 'объявление' : favorites.length < 5 ? 'объявления' : 'объявлений'}
              </p>
            </div>

            <div className="grid gap-4">
              {favorites.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => setSelectedListing(listing)}
                  className="cursor-pointer"
                >
                  <ListingCard
                    listing={listing}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <ListingDetail
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onEdit={() => {}} // Favorites can't edit
          onDelete={() => {}} // Favorites can't delete
          isMyListing={false}
        />
      )}
    </div>
  );
}