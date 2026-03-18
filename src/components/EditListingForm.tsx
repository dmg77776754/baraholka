import { useState } from 'react';
import type { Listing, Category, ProductCategory, District } from '../types';
import { CATEGORY_LABELS, PRODUCT_CATEGORY_LABELS, DISTRICT_LABELS } from '../types';
import { updateMyListing } from '../store';
import { getTelegramUser } from '../telegram';
import { getUserId } from '../storage';

const CATEGORIES: Category[] = ['sell', 'buy', 'free', 'services'];
const PRODUCT_CATEGORIES: ProductCategory[] = [
  'electronics', 'furniture', 'clothing', 'kids', 'auto',
  'garden', 'pets', 'food', 'realty', 'beauty', 'sport', 'other',
];
const DISTRICTS: District[] = ['pervomayskoe', 'kivenappa'];
const MAX_PHOTOS = 3;

export function EditListingForm({ 
  listing, 
  onClose, 
  onSaved 
}: { 
  listing: Listing;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description || '');
  const [price, setPrice] = useState(listing.price);
  const [category, setCategory] = useState<Category>(listing.category);
  const [productCategory, setProductCategory] = useState<ProductCategory>(listing.product_category);
  const [district, setDistrict] = useState<District>(listing.district);
  const [contactTelegram, setContactTelegram] = useState(listing.contact_telegram || '');
  const [contactPhone, setContactPhone] = useState(listing.contact_phone || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Укажите заголовок'); return; }
    if (!price.trim()) { setError('Укажите цену'); return; }
    if (!contactTelegram.trim() && !contactPhone.trim()) { setError('Укажите хотя бы один контакт'); return; }

    const mainContact = contactTelegram.trim() || contactPhone.trim();

    try {
      setIsLoading(true);
      
      const userId = getUserId();
      await updateMyListing(listing.id, userId, {
        title: title.trim(),
        description: description.trim(),
        price: price.trim(),
        contact_telegram: contactTelegram.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при сохранении';
      setError(message);
      console.error('Error updating listing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Редактировать объявление</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3.5 text-sm text-red-600 border border-red-200 flex items-start gap-2">
          <span className="text-lg leading-none">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Заголовок <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 shadow-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 resize-none shadow-sm"
        />
      </div>

      {/* Price */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Цена <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          maxLength={50}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 shadow-sm"
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-2.5 block text-sm font-semibold text-gray-700">Тип объявления</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                category === cat
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Product Category */}
      <div>
        <label className="mb-2.5 block text-sm font-semibold text-gray-700">Категория товара</label>
        <div className="grid grid-cols-3 gap-1.5">
          {PRODUCT_CATEGORIES.map((pc) => (
            <button
              key={pc}
              type="button"
              onClick={() => setProductCategory(pc)}
              className={`rounded-xl border-2 px-2 py-2.5 text-xs font-medium transition-all text-center leading-tight ${
                productCategory === pc
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {PRODUCT_CATEGORY_LABELS[pc]}
            </button>
          ))}
        </div>
      </div>

      {/* District */}
      <div>
        <label className="mb-2.5 block text-sm font-semibold text-gray-700">Район</label>
        <div className="grid grid-cols-2 gap-2">
          {DISTRICTS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDistrict(d)}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                district === d
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              📍 {DISTRICT_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div className="space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <label className="block text-sm font-semibold text-gray-700">
          📞 Контакты <span className="text-red-400">*</span>
          <span className="text-xs text-gray-500 font-normal ml-1">(минимум один)</span>
        </label>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Telegram</label>
          <input
            type="text"
            value={contactTelegram}
            onChange={(e) => setContactTelegram(e.target.value)}
            placeholder="@username"
            maxLength={100}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Телефон</label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+7 900 000-00-00"
            maxLength={20}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 bg-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-300/40 active:scale-95 disabled:opacity-50"
      >
        {isLoading ? '⏳ Сохраняю...' : '✅ Сохранить изменения'}
      </button>
    </form>
  );
}
