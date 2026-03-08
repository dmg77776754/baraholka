import type { Listing } from '../types';
import { CATEGORY_LABELS, CATEGORY_COLORS, PRODUCT_CATEGORY_LABELS, DISTRICT_LABELS } from '../types';
import { getContactLink, getTelegramLink, getPhoneLink } from '../telegram';

export function ListingCard({ listing }: { listing: Listing }) {
  const timeAgo = getTimeAgo(listing.createdAt);
  const isAvailable = listing.category !== 'buy';

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
          {listing.productCategory && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 line-clamp-1">
              {PRODUCT_CATEGORY_LABELS[listing.productCategory].split(' ').slice(1).join(' ')}
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
          <span className="text-lg font-bold text-gray-900">{listing.price}</span>
        </div>

        {/* Contact buttons */}
        <div className="flex gap-2 mt-auto">
          {(listing.contactTelegram) && (
            <a
              href={getTelegramLink(listing.contactTelegram)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-500 px-2 py-2 text-xs font-medium text-white transition-all hover:bg-blue-600 active:bg-blue-700 shadow-sm hover:shadow-md"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              TG
            </a>
          )}
          {(listing.contactPhone) && (
            <a
              href={getPhoneLink(listing.contactPhone)}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-500 px-2 py-2 text-xs font-medium text-white transition-all hover:bg-green-600 active:bg-green-700 shadow-sm hover:shadow-md"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              ☎️
            </a>
          )}
          {(!listing.contactTelegram && !listing.contactPhone && listing.contact) && (
            <a
              href={getContactLink(listing.contact)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-500 px-2 py-2 text-xs font-medium text-white transition-all hover:bg-blue-600 active:bg-blue-700 shadow-sm hover:shadow-md"
            >
              Связь
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
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
