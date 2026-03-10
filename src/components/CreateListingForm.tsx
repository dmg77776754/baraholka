import { useState, useRef, useEffect } from 'react';
import type { Category, ProductCategory, District, Listing } from '../types';
import { CATEGORY_LABELS, PRODUCT_CATEGORY_LABELS, DISTRICT_LABELS } from '../types';
import { addListing, updateMyListing } from '../store';
import { getTelegramUser } from '../telegram';
import { addToMyListings } from '../storage';

const CATEGORIES: Category[] = ['sell', 'buy', 'free', 'services'];
const PRODUCT_CATEGORIES: ProductCategory[] = [
  'electronics', 'furniture', 'clothing', 'kids', 'auto',
  'garden', 'pets', 'food', 'realty', 'beauty', 'sport', 'other',
];
const DISTRICTS: District[] = ['pervomayskoe', 'kivenappa'];
const MAX_PHOTOS = 3;

export function CreateListingForm({ 
  onClose, 
  onListingAdded,
  editingListing,
}: { 
  onClose: () => void; 
  onListingAdded?: () => void;
  editingListing?: Listing;
}) {
  const [title, setTitle] = useState(editingListing?.title || '');
  const [description, setDescription] = useState(editingListing?.description || '');
  const [price, setPrice] = useState(editingListing?.price || '');
  const [category, setCategory] = useState<Category>(editingListing?.category || 'sell');
  const [productCategory, setProductCategory] = useState<ProductCategory>(editingListing?.product_category || 'other');
  const [district, setDistrict] = useState<District>(editingListing?.district || 'pervomayskoe');
  const [photos, setPhotos] = useState<string[]>(editingListing?.photos || []);
  const [contactTelegram, setContactTelegram] = useState(editingListing?.contact_telegram || '');
  const [contactPhone, setContactPhone] = useState(editingListing?.contact_phone || '');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const tgUser = getTelegramUser();
  const isEditMode = !!editingListing;

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 800;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setPhotos((prev) => [...prev.slice(0, MAX_PHOTOS - 1), compressed]);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });

    if (fileRef.current) fileRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!title.trim()) { 
      setError('Укажите заголовок'); 
      return; 
    }
    if (!price.trim()) { 
      setError('Укажите цену'); 
      return; 
    }
    if (!contactTelegram.trim() && !contactPhone.trim()) { 
      setError('Укажите хотя бы один контакт (Telegram или телефон)'); 
      return; 
    }

    const mainContact = contactTelegram.trim() || contactPhone.trim();

    try {
      setIsLoading(true);
      
      if (isEditMode && editingListing) {
        // Режим редактирования с проверкой владельца
        if (!tgUser?.id) {
          throw new Error('Ошибка: не удалось определить пользователя');
        }
        
        await updateMyListing(editingListing.id, tgUser.id, {
          title: title.trim(),
          description: description.trim(),
          price: price.trim(),
          photos,
          contact_telegram: contactTelegram.trim() || undefined,
          contact_phone: contactPhone.trim() || undefined,
        });
      } else {
        // Режим добавления нового объявления
        const result = await addListing({
          title: title.trim(),
          description: description.trim(),
          price: price.trim(),
          category,
          product_category: productCategory,
          district,
          photos,
          contact: mainContact,
          contact_telegram: contactTelegram.trim() || undefined,
          contact_phone: contactPhone.trim() || undefined,
          telegram_user_id: tgUser?.id,
          telegram_username: tgUser?.username,
        });

        // Сохранить ID в localStorage
        if (result.id) {
          addToMyListings(result.id);
        }
      }

      // Успешно отправлено
      setSubmitted(true);
      
      // Уведомить родительский компонент об успешном добавлении
      if (onListingAdded) {
        onListingAdded();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при отправке объявления';
      setError(message);
      console.error('Error adding listing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 text-6xl animate-bounce">✅</div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          {isEditMode ? 'Объявление обновлено!' : 'Объявление отправлено!'}
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          {isEditMode 
            ? 'Ваши изменения сохранены.'
            : 'Ваше объявление отправлено на модерацию. После проверки оно появится в ленте.'
          }
        </p>
        {!isEditMode && (
          <div className="inline-block rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">
            ⏳ На модерации
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-8 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:shadow-md hover:shadow-blue-300/40 transition-all duration-200"
        >
          {isEditMode ? 'Вернуться' : 'Вернуться к объявлениям'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isEditMode ? 'Редактировать объявление' : 'Новое объявление'}
        </h2>
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
          placeholder="Например: Продам велосипед"
          maxLength={100}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 shadow-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Подробности о товаре или услуге..."
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 resize-none shadow-sm"
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
          placeholder="Например: 5 000 ₽ или Бесплатно"
          maxLength={50}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 shadow-sm"
        />
      </div>

      {/* Type (sell/buy/free/services) */}
      {!isEditMode && (
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
      )}

      {/* Product Category */}
      {!isEditMode && (
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
      )}

      {/* District */}
      {!isEditMode && (
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
      )}

      {/* Photos */}
      <div>
        <label className="mb-2.5 block text-sm font-semibold text-gray-700">
          📸 Фото (до {MAX_PHOTOS} шт.)
        </label>
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo, i) => (
            <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-gray-200 group">
              <img src={photo} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-0.5 right-0.5 rounded-full bg-red-500 p-1 text-sm text-white leading-none opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoAdd}
          className="hidden"
        />
      </div>

      {/* Contacts */}
      <div className="space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <label className="block text-sm font-semibold text-gray-700">
          📞 Контакты <span className="text-red-400">*</span>
          <span className="text-xs text-gray-500 font-normal ml-1">(минимум один)</span>
        </label>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Telegram</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">💬</span>
            <input
              type="text"
              value={contactTelegram}
              onChange={(e) => setContactTelegram(e.target.value)}
              placeholder="@username"
              maxLength={100}
              className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Телефон</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📱</span>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+7 900 000-00-00"
              maxLength={20}
              className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-3 focus:ring-blue-100 bg-white"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:shadow-blue-300/40 active:scale-95'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block animate-spin">⏳</span>
            {isEditMode ? 'Сохраняю...' : 'Отправляется...'}
          </span>
        ) : (
          isEditMode ? '✅ Сохранить изменения' : '✅ Отправить объявление'
        )}
      </button>
    </form>
  );
}
