import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { deleteMyListing } from '../store';
import { ListingDetail } from './ListingDetail';
import { CreateListingForm } from './CreateListingForm';
import { getTelegramUser } from '../telegram';
import type { Listing } from '../types';
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../types';
import { getMyListingIds, removeFromMyListings } from '../storage';

export function MyListings({ onClose }: { onClose: () => void }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const tgUser = getTelegramUser();

  useEffect(() => {
    const loadMyListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const myIds = getMyListingIds();
        
        if (myIds.length === 0) {
          setListings([]);
          return;
        }

        // Загрузить объявления по их ID из базы
        const { data, error: fetchError } = await supabase
          .from('listings')
          .select('*')
          .in('id', myIds)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setListings(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ошибка при загрузке объявлений';
        setError(message);
        console.error(message, err);
      } finally {
        setLoading(false);
      }
    };

    loadMyListings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!tgUser?.id) {
      setError('Ошибка: не удалось определить пользователя');
      return;
    }
    
    try {
      setDeletingId(id);

      // Удалить из базы с проверкой владельца
      await deleteMyListing(id, tgUser.id);

      // Удалить из localStorage
      removeFromMyListings(id);

      // Обновяем локальный список
      setListings((prev) => prev.filter((l) => l.id !== id));
      setSelectedListing(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при удалении';
      setError(message);
      console.error(message, err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditComplete = async () => {
    setEditingListing(null);
    // Перезагружаем объявления после редактирования
    try {
      const myIds = getMyListingIds();
      
      if (myIds.length === 0) {
        setListings([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .in('id', myIds)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setListings(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при загрузке объявлений';
      setError(message);
    }
  };

  const handleEdit = (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      setSelectedListing(null); // Close detail view
      setEditingListing(listing); // Open edit form
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96 p-4">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full"></div>
          </div>
          <p className="mt-3 text-sm text-gray-500">Загрузка ваших объявлений...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Мои объявления</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">❌ Ошибка</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Мои объявления</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 text-4xl">📭</div>
          <p className="text-sm text-gray-400">У вас нет объявлений</p>
          <button
            onClick={onClose}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-all"
          >
            ← Вернуться
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Мои объявления</h2>
          <p className="text-xs text-gray-400 mt-1">Всего: {listings.length}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {listings.map((listing) => (
          <div
            key={listing.id}
            onClick={() => setSelectedListing(listing)}
            className={`rounded-xl border-2 p-3.5 transition-all cursor-pointer hover:shadow-md ${
              listing.is_approved
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-50/50'
                : 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{listing.title}</h4>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">{listing.price}</span>
                  {' · '}
                  <span>{CATEGORY_LABELS[listing.category]}</span>
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap shadow-sm ${
                  listing.is_approved
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {listing.is_approved ? '✓ Одобрено' : '⏳ На модерации'}
              </span>
            </div>

            {listing.description && (
              <p className="mb-3 text-xs text-gray-600 line-clamp-2">{listing.description}</p>
            )}

            <div className="flex gap-2 text-xs text-gray-500">
              {listing.photos.length > 0 && <span>🖼️ {listing.photos.length} фото</span>}
              {listing.district && <span>📍 {DISTRICT_LABELS[listing.district]}</span>}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(listing.id);
              }}
              disabled={deletingId === listing.id}
              className="mt-3 w-full rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === listing.id ? '⏳ Удаляю...' : '🗑️ Удалить объявление'}
            </button>
          </div>
        ))}
      </div>

      {/* Модальное окно детали объявления */}
      {selectedListing && (
        <ListingDetail
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isMyListing={true}
        />
      )}

      {/* Модальное окно редактирования объявления */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto">
            <CreateListingForm 
              onClose={() => setEditingListing(null)}
              onListingAdded={handleEditComplete}
              editingListing={editingListing}
            />
          </div>
        </div>
      )}
    </div>
  );
}
