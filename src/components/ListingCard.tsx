import type { Listing } from '../types';
import { CATEGORY_LABELS, CATEGORY_COLORS, PRODUCT_CATEGORY_LABELS, DISTRICT_LABELS } from '../types';
import { getTelegramLink, getPhoneLink } from '../telegram';
import { useState, useEffect } from 'react';
import { getTelegramUser } from '../telegram';
import { addToFavorites, removeFromFavorites, isFavorite } from '../store';
import { addToFavoritesLocal, removeFromFavoritesLocal, isFavoriteLocal } from '../storage';

export function ListingCard({ 
  listing, 
  onFavoriteToggle 
}: { 
  listing: Listing;
  onFavoriteToggle?: () => void;
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeAgo = getTimeAgo(listing.created_at);
  const isAvailable = listing.category !== 'buy';

  useEffect(() => {
    const checkFavorite = async () => {
      const tgUser = getTelegramUser();
      if (tgUser?.id) {
        try {
          const favorited = await isFavorite(listing.id, tgUser.id);
          setIsFavorited(favorited);
          return;
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }

      // Fallback: localStorage для не-telegram среды
      setIsFavorited(isFavoriteLocal(listing.id));
    };
    checkFavorite();
  }, [listing.id]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const tgUser = getTelegramUser();

    setIsLoading(true);
    try {
      if (tgUser?.id) {
        if (isFavorited) {
          await removeFromFavorites(listing.id, tgUser.id);
          setIsFavorited(false);
        } else {
          await addToFavorites(listing.id, tgUser.id);
          setIsFavorited(true);
        }
      } else {
        // Fallback: localStorage
        if (isFavorited) {
          removeFromFavoritesLocal(listing.id);
          setIsFavorited(false);
        } else {
          addToFavoritesLocal(listing.id);
          setIsFavorited(true);
        }
      }

      onFavoriteToggle?.();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col">
      {/* Image Container - Square aspect ratio */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-square">
        {listing.photos.length > 0 ? (
          <img 
            src={listing.photos[0]} 
            alt={listing.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            {listing.category === 'sell' ? '🏷️' : 
             listing.category === 'buy' ? '🛒' :
             listing.category === 'free' ? '🎁' : '🔧'}
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-medium shadow-md">
          <span className="inline-block w-1.5 h-1.5 bg-white rounded-full"></span>
          {isAvailable ? 'Доступно' : 'Ищу'}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteToggle}
          disabled={isLoading}
          aria-label={isFavorited ? 'Удалить из избранного' : 'Добавить в избранное'}
          className={`absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/80 shadow-md ${
            isFavorited ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          } ${isLoading ? 'opacity-50' : ''}`}
        >
          {isLoading ? (
            '⏳'
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
              aria-hidden="true"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          )}
        </button>

        {/* Photos indicator */}
        {listing.photos.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white rounded-lg px-1.5 py-0.5 text-xs font-medium">
            🖼️ {listing.photos.length}
          </div>
        )}

        {/* Time badge */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white rounded-lg px-2 py-1 text-xs font-medium">
          {timeAgo}
        </div>
      </div>

      <div className="p-3 space-y-2 flex flex-col flex-1">
        {/* Title & Category */}
        <div className="flex items-start justify-between gap-1 min-h-[2.5rem]">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
            {listing.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
              CATEGORY_COLORS[listing.category]
            }`}
          >
            {CATEGORY_LABELS[listing.category]}
          </span>
        </div>

        {/* Product Category + District */}
        <div className="flex flex-wrap gap-1 text-xs">
          {listing.product_category && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 line-clamp-1">
              {PRODUCT_CATEGORY_LABELS[listing.product_category].split(' ').slice(1).join(' ')}
            </span>
          )}
          {listing.district && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600 whitespace-nowrap">
              📍 {DISTRICT_LABELS[listing.district]}
            </span>
          )}
        </div>

        {/* Description - optional */}
        {listing.description && (
          <p className="text-xs text-gray-500 line-clamp-1 mt-1">{listing.description}</p>
        )}

        {/* Price */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-900">{listing.price} ₽</span>
        </div>

        {/* Contacts */}
        {(listing.contact_telegram || listing.contact_phone) && (
          <div className="pt-2 space-y-1.5 border-t border-gray-100">
            {listing.contact_telegram && (
              <a
                href={getTelegramLink(listing.contact_telegram)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-all border border-blue-200"
              >
                💬 Telegram
              </a>
            )}
            {listing.contact_phone && (
              <a
                href={getPhoneLink(listing.contact_phone)}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100 transition-all border border-green-200"
              >
                📱 Позвонить
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(isoString: string): string {
  const timestamp = new Date(isoString).getTime();
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'вчера';
  return `${days} дн. назад`;
}
