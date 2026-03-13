import { useState, useEffect } from 'react';
import { getAllListings, toggleApproval, deleteListing } from '../store';
import { CATEGORY_LABELS, DISTRICT_LABELS, PRODUCT_CATEGORY_LABELS } from '../types';
import type { Listing } from '../types';

const ADMIN_PIN = '532753';

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Загрузить все объявления при авторизации
  useEffect(() => {
    if (authed) {
      loadAllListings();
    }
  }, [authed]);

  const loadAllListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllListings();
      setListings(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при загрузке объявлений';
      setError(message);
      console.error(message, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      setLoadingId(id);
      await toggleApproval(id);
      // Обновить список после изменения
      await loadAllListings();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при одобрении объявления';
      setError(message);
      console.error(message, err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить объявление?')) return;
    
    try {
      setLoadingId(id);
      await deleteListing(id);
      // Обновить список после удаления
      await loadAllListings();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при удалении объявления';
      setError(message);
      console.error(message, err);
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = listings.filter((l) => {
    if (filter === 'pending') return !l.is_approved;
    if (filter === 'approved') return l.is_approved;
    return true;
  });

  if (!authed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <div className="mb-4 text-5xl">🔐</div>
        <h2 className="mb-1 text-lg font-bold text-gray-900">Админ-панель</h2>
        <p className="mb-6 text-xs text-gray-400">Введите PIN для доступа</p>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Введите PIN"
          className="mb-4 w-56 rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 shadow-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && pin === ADMIN_PIN) setAuthed(true);
          }}
        />
        <div className="flex gap-2">
          <button
            onClick={() => pin === ADMIN_PIN && setAuthed(true)}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all shadow-sm ${
              pin === ADMIN_PIN
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-md hover:shadow-blue-300/40'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Войти
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-all"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">⚙️ Панель модерации</h2>
          <p className="text-xs text-gray-400 mt-1">Всего объявлений: {listings.length}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
        >
          ✕
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1.5">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              filter === f
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all'
              ? `📋 Все (${listings.length})`
              : f === 'pending'
              ? `⏳ Ожидают (${listings.filter((l) => !l.is_approved).length})`
              : `✅ Одобрено (${listings.filter((l) => l.is_approved).length})`}
          </button>
        ))}
      </div>

      {/* Ошибка */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-sm text-red-600 border border-red-200 flex items-start gap-2">
          <span className="text-lg leading-none">❌</span>
          <div>
            <p className="font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-500 hover:text-red-700 underline mt-1"
            >
              Скрыть
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="inline-block animate-spin mb-2">
              <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500">Загрузка...</p>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 text-4xl">📭</div>
          <p className="text-sm text-gray-400">Нет объявлений</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((listing) => (
          <div
            key={listing.id}
            className={`rounded-xl border-2 p-3.5 transition-all ${
              listing.is_approved
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-50/50'
                : 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-50/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {listing.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">{CATEGORY_LABELS[listing.category]}</span>
                  {' · '}
                  <span className="text-gray-500">{listing.price} ₽</span>
                  {listing.contact_telegram && <span> · 💬 {listing.contact_telegram}</span>}
                  {listing.contact_phone && <span> · 📱 {listing.contact_phone}</span>}
                </p>
                {(listing.product_category || listing.district) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {listing.product_category && PRODUCT_CATEGORY_LABELS[listing.product_category]}
                    {listing.productCategory && listing.district && ' · '}
                    {listing.district && `📍 ${DISTRICT_LABELS[listing.district]}`}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap shadow-sm ${
                  listing.is_approved
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {listing.is_approved ? '✓ Одобрено' : '⏳ Ожидает'}
              </span>
            </div>

            {listing.description && (
              <p className="mb-3 text-xs text-gray-600 line-clamp-2">{listing.description}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleToggle(listing.id)}
                disabled={loadingId === listing.id}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  loadingId === listing.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : listing.is_approved
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {loadingId === listing.id ? '⏳' : listing.is_approved ? '⏳ Снять' : '✓ Одобрить'}
              </button>
              <button
                onClick={() => handleDelete(listing.id)}
                disabled={loadingId === listing.id}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  loadingId === listing.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {loadingId === listing.id ? '⏳' : '🗑️ Удалить'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
