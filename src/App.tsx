import { useState, useEffect, useCallback, useMemo } from 'react';
import { getApprovedListings } from './store';
import { initTelegram, getTelegramUser } from './telegram';
import { ListingCard } from './components/ListingCard';
import { CreateListingForm } from './components/CreateListingForm';
import { AdminPanel } from './components/AdminPanel';
import type { Listing, Category, ProductCategory, District } from './types';
import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_CATEGORY_ICONS,
  DISTRICT_LABELS,
} from './types';

type Page = 'feed' | 'create' | 'admin';

const CATEGORIES: Category[] = ['sell', 'buy', 'free', 'services'];
const PRODUCT_CATEGORIES: ProductCategory[] = [
  'electronics', 'furniture', 'clothing', 'kids', 'auto',
  'garden', 'pets', 'food', 'realty', 'beauty', 'sport', 'other',
];
const DISTRICTS: District[] = ['pervomayskoe', 'kivenappa'];

export function App() {
  const [page, setPage] = useState<Page>('feed');
  const [listings, setListings] = useState<Listing[]>([]);
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');
  const [filterProduct, setFilterProduct] = useState<ProductCategory | 'all'>('all');
  const [filterDistrict, setFilterDistrict] = useState<District | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  const tgUser = getTelegramUser();

  const refresh = useCallback(() => {
    setListings(getApprovedListings());
  }, []);

  useEffect(() => {
    initTelegram();
    refresh();
  }, [refresh]);

  const goToFeed = () => {
    refresh();
    setPage('feed');
  };

  const filtered = useMemo(() => {
    let result = listings;

    if (filterCat !== 'all') {
      result = result.filter((l) => l.category === filterCat);
    }
    if (filterProduct !== 'all') {
      result = result.filter((l) => l.productCategory === filterProduct);
    }
    if (filterDistrict !== 'all') {
      result = result.filter((l) => l.district === filterDistrict);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.price.toLowerCase().includes(q)
      );
    }

    return result;
  }, [listings, filterCat, filterProduct, filterDistrict, searchQuery]);

  const resetFilters = () => {
    setFilterCat('all');
    setFilterProduct('all');
    setFilterDistrict('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    filterCat !== 'all' || filterProduct !== 'all' || filterDistrict !== 'all' || searchQuery.trim() !== '';

  // Show 6 categories by default, rest on expand
  const visibleProductCategories = showAllCategories
    ? PRODUCT_CATEGORIES
    : PRODUCT_CATEGORIES.slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/98 backdrop-blur-lg border-b border-gray-100 shadow-md">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={goToFeed} className="flex items-center gap-3 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">🏪</span>
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-gray-400 tracking-widest">МАРКЕТПЛЕЙС</span>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Барахолка</span>
              </div>
            </button>
            <div className="flex items-center gap-2">
              {tgUser && (
                <span className="text-xs text-gray-500 max-w-[100px] truncate px-3 py-1.5 bg-gray-100 rounded-full">
                  👤 {tgUser.firstName || tgUser.username}
                </span>
              )}
              <button
                onClick={() => setPage('admin')}
                className="rounded-lg p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                title="Админ-панель"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg">
        {page === 'feed' && (
          <div className="px-4 pt-4 pb-24 space-y-4">
            {/* Search */}
            <div className="relative group">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск объявлений..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* District filter */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setFilterDistrict('all')}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  filterDistrict === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                }`}
              >
                📍 Все районы
              </button>
              {DISTRICTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDistrict(filterDistrict === d ? 'all' : d)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    filterDistrict === d
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200'
                      : 'bg-white text-gray-600 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {DISTRICT_LABELS[d]}
                </button>
              ))}
            </div>

            {/* Type filter (sell/buy/free/services) */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setFilterCat('all')}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  filterCat === 'all'
                    ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-500 hover:text-gray-900'
                }`}
              >
                Все
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(filterCat === cat ? 'all' : cat)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    filterCat === cat
                      ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-500 hover:text-gray-900'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Product categories grid */}
            <div className="mb-4">
              <div className="grid grid-cols-4 gap-2">
                {visibleProductCategories.map((pc) => (
                  <button
                    key={pc}
                    onClick={() => setFilterProduct(filterProduct === pc ? 'all' : pc)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center transition-all ${
                      filterProduct === pc
                        ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-200 scale-105'
                        : 'bg-white border border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl leading-none">{PRODUCT_CATEGORY_ICONS[pc]}</span>
                    <span className={`text-[10px] leading-tight font-semibold ${
                      filterProduct === pc ? 'text-white' : 'text-gray-700'
                    }`}>
                      {PRODUCT_CATEGORY_LABELS[pc].replace(/^[^\s]+\s/, '')}
                    </span>
                    {filterProduct === pc && <span className="text-xs leading-tight font-bold">✓</span>}
                  </button>
                ))}
              </div>
              {PRODUCT_CATEGORIES.length > 8 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="mt-2 w-full text-center text-xs text-blue-600 font-bold py-2 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {showAllCategories ? '▲ Свернуть' : '▼ Ещё категории'}
                </button>
              )}
            </div>

            {/* Active filters summary */}
            {hasActiveFilters && (
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border border-blue-200">
                <span className="text-xs font-bold text-blue-700">
                  ✓ Найдено: {filtered.length} объявлений
                </span>
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-white rounded-full px-3 py-1 transition-all"
                >
                  Сбросить ✕
                </button>
              </div>
            )}

            {/* Listings */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 text-6xl">📭</div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {hasActiveFilters ? 'Ничего не найдено' : 'Пока нет объявлений'}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {hasActiveFilters
                    ? 'Попробуйте изменить фильтры или поисковый запрос'
                    : 'Будьте первым — разместите объявление!'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        )}

        {page === 'create' && <CreateListingForm onClose={goToFeed} />}
        {page === 'admin' && <AdminPanel onClose={goToFeed} />}
      </main>

      {/* FAB */}
      {page === 'feed' && (
        <div className="fixed bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <button
            onClick={() => setPage('create')}
            className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-400/40 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/60 hover:scale-110 active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Подать объявление
          </button>
        </div>
      )}
    </div>
  );
}
