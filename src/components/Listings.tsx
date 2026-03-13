import { useState, useEffect } from 'react';
import { getApprovedListings } from '../store';
import { supabase } from '../supabase';
import { ListingCard } from './ListingCard';
import { ListingDetail } from './ListingDetail';
import { isMyListing, removeFromMyListings } from '../storage';
import type { Listing } from '../types';

export function Listings({ onFavoriteToggle }: { onFavoriteToggle?: () => void }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Загрузить одобренные объявления при монтировании
  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getApprovedListings();
        setListings(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ошибка при загрузке объявлений';
        setError(message);
        console.error(message, err);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  const handleDeleteListing = async (listingId: string) => {
    try {
      // Удалить из базы (если пользователь владелец)
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (deleteError) throw deleteError;

      // Удалить из localStorage
      removeFromMyListings(listingId);

      // Обновить список
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setSelectedListing(null);
    } catch (err) {
      console.error('Error deleting listing:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96 p-4">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full"></div>
          </div>
          <p className="mt-3 text-sm text-gray-500">Загрузка объявлений...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">❌ Ошибка загрузки</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-4">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-gray-600 font-medium">Нет объявлений</p>
        <p className="text-gray-500 text-sm">Попробуйте позже или добавьте своё объявление</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 p-4 pb-24">
        {listings.map((listing) => (
          <div key={listing.id} onClick={() => setSelectedListing(listing)} className="cursor-pointer">
            <ListingCard listing={listing} onFavoriteToggle={onFavoriteToggle} />
          </div>
        ))}
      </div>

      {/* Модальное окно деталей объявления */}
      {selectedListing && (
        <ListingDetail
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onEdit={(id) => console.log('Edit:', id)}
          onDelete={handleDeleteListing}
          isMyListing={isMyListing(selectedListing.id)}
        />
      )}
    </>
  );
}
