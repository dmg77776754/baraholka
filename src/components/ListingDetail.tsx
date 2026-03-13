import { useState } from 'react';
import type { Listing } from '../types';
import { CATEGORY_LABELS, PRODUCT_CATEGORY_LABELS, DISTRICT_LABELS } from '../types';
import { getTelegramLink, getPhoneLink } from '../telegram';

export function ListingDetail({
  listing,
  onClose,
  onEdit,
  onDelete,
  isMyListing = false,
}: {
  listing: Listing;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isMyListing?: boolean;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Вы уверены? Это действие нельзя отменить.')) {
      try {
        setIsDeleting(true);
        onDelete?.(listing.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const nextPhoto = () => {
    setPhotoIndex((i) => (i + 1) % listing.photos.length);
  };

  const prevPhoto = () => {
    setPhotoIndex((i) => (i - 1 + listing.photos.length) % listing.photos.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-gray-900">{listing.title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Photos */}
          {listing.photos.length > 0 ? (
            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={listing.photos[photoIndex]}
                  alt={`${listing.title} фото ${photoIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Photo counter */}
              <div className="absolute top-2 right-2 bg-black/60 text-white rounded-lg px-2.5 py-1 text-xs font-medium">
                🖼️ {photoIndex + 1} / {listing.photos.length}
              </div>

              {/* Photo navigation */}
              {listing.photos.length > 1 && (
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
                  <button
                    onClick={prevPhoto}
                    className="rounded-full bg-white/80 hover:bg-white p-2 transition-all"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="rounded-full bg-white/80 hover:bg-white p-2 transition-all"
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Photo thumbnails */}
              {listing.photos.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {listing.photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className={`h-12 w-12 rounded-lg overflow-hidden border-2 transition-all ${
                        i === photoIndex
                          ? 'border-blue-500 ring-2 ring-blue-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-5xl">
              {listing.category === 'sell' ? '🏷️' : listing.category === 'buy' ? '🛒' : '🎁'}
            </div>
          )}

          {/* Price & Category */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-gray-900">{listing.price} ₽</span>
              <span className="text-xs font-semibold text-gray-500">
                {listing.is_approved ? '✅ Одобрено' : '⏳ Ожидает одобрения'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {CATEGORY_LABELS[listing.category]}
              </span>
              {listing.product_category && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {PRODUCT_CATEGORY_LABELS[listing.product_category]}
                </span>
              )}
              {listing.district && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                  📍 {DISTRICT_LABELS[listing.district]}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Описание</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {/* Time */}
          <div className="text-xs text-gray-500">
            📅 {new Date(listing.created_at).toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>

          {/* Contacts */}
          <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-700">📞 Контакты продавца</h3>

            {listing.contact_telegram && (
              <a
                href={getTelegramLink(listing.contact_telegram)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-all border border-blue-200"
              >
                💬 Написать в Telegram
                <span className="text-xs text-gray-500">({listing.contact_telegram})</span>
              </a>
            )}

            {listing.contact_phone && (
              <a
                href={getPhoneLink(listing.contact_phone)}
                onClick={(e) => {
                  e.preventDefault();
                  openExternalLink(getPhoneLink(listing.contact_phone));
                }}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 transition-all border border-green-200"
              >
                📱 Позвонить
                <span className="text-xs text-gray-500">({listing.contact_phone})</span>
              </a>
            )}

            {!listing.contact_telegram && !listing.contact_phone && (
              <p className="text-xs text-gray-500 italic">Контактная информация недоступна</p>
            )}
          </div>

          {/* Actions (для своих объявлений) */}
          {isMyListing && (
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => onEdit?.(listing.id)}
                className="flex-1 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 transition-all"
              >
                ✏️ Редактировать
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isDeleting ? '⏳ Удаляю...' : '🗑️ Удалить'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
