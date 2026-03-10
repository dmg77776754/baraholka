# Переписанные компоненты React + TypeScript + Supabase

## 📋 Обзор

Все компоненты переписаны для работы с асинхронным `store.ts`, который возвращает `Promise<Listing[]>`.

Основные изменения:
- ✅ Использование `useState` для управления состоянием (loading, error, data)
- ✅ Использование `useEffect` для загрузки асинхронных данных
- ✅ Обработка ошибок `try/catch`
- ✅ Полная типизация TypeScript
- ✅ Автоматическое обновление списков после операций

---

## 1️⃣ Компонент Listings (Список одобренных объявлений)

**Файл:** `src/components/Listings.tsx`

```typescript
import { useState, useEffect } from 'react';
import { getApprovedListings } from '../store';
import { ListingCard } from './ListingCard';
import type { Listing } from '../types';

export function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
```

**Особенности:**
- 📥 Загружает только **одобренные** объявления через `getApprovedListings()`
- ⏳ Показывает loading спиннер во время загрузки
- ❌ Обрабатывает ошибки от Supabase
- 📭 Показывает сообщение, если объявлений нет

---

## 2️⃣ Компонент CreateListingForm (Добавление объявления)

**Файл:** `src/components/CreateListingForm.tsx`

### Ключевые изменения:

```typescript
// Добавлены новые состояния
const [isLoading, setIsLoading] = useState(false);

// Асинхронная функция отправки
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  // Валидация...
  if (!title.trim()) { 
    setError('Укажите заголовок'); 
    return; 
  }
  // ... другие проверки ...

  try {
    setIsLoading(true);
    
    // ⚠️ Важно: используются правильные имена полей из store.ts
    await addListing({
      title: title.trim(),
      description: description.trim(),
      price: price.trim(),
      category,
      product_category: productCategory, // ⚠️ snake_case!
      district,
      photos,
      contact: mainContact,
      contact_telegram: contactTelegram.trim() || undefined, // ⚠️ snake_case!
      contact_phone: contactPhone.trim() || undefined,       // ⚠️ snake_case!
      telegram_user_id: tgUser?.id,
      telegram_username: tgUser?.username,
    });

    // После успешной отправки
    setSubmitted(true);
    
    // Вызвать callback для обновления списка объявлений
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
```

**Обновленная кнопка отправки:**

```typescript
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
      Отправляется...
    </span>
  ) : (
    '✅ Отправить объявление'
  )}
</button>
```

**Использование в App.tsx:**

```typescript
{page === 'create' && (
  <CreateListingForm 
    onClose={goToFeed} 
    onListingAdded={refresh}  // 👈 Автоматически обновит список
  />
)}
```

---

## 3️⃣ Компонент AdminPanel (Модерация объявлений)

**Файл:** `src/components/AdminPanel.tsx`

### Ключевые изменения:

```typescript
// Новые состояния
const [listings, setListings] = useState<Listing[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [loadingId, setLoadingId] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);

// Загрузить все объявления при авторизации
useEffect(() => {
  if (authed) {
    loadAllListings();
  }
}, [authed]);

// Асинхронная загрузка объявлений
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

// Одобрение объявления с автообновлением списка
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

// Удаление объявления с автообновлением списка
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
```

**Кнопки с loading состоянием:**

```typescript
<button
  onClick={() => handleToggle(listing.id)}
  disabled={loadingId === listing.id}
  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
    loadingId === listing.id
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : listing.isApproved
      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      : 'bg-green-100 text-green-700 hover:bg-green-200'
  }`}
>
  {loadingId === listing.id ? '⏳' : listing.isApproved ? '⏳ Снять' : '✓ Одобрить'}
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
```

---

## 4️⃣ Обновленный App.tsx

**Ключевые изменения:**

```typescript
// Правильная работа с async refresh
const refresh = useCallback(async () => {
  try {
    const data = await getApprovedListings();
    setListings(data);
  } catch (err) {
    console.error('Error loading listings:', err);
  }
}, []);

useEffect(() => {
  initTelegram();
  refresh();
}, [refresh]);

const goToFeed = async () => {
  await refresh();
  setPage('feed');
};

// Использование компонентов
{page === 'create' && (
  <CreateListingForm 
    onClose={goToFeed} 
    onListingAdded={refresh}  // 👈 Обновляет список после добавления
  />
)}
```

---

## 📊 Схема работы потока данных

```
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Database                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ listings table (is_approved, product_category, ...)  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
                      ┌──────┴──────┐
                      │ store.ts    │
         ─────────────┤ (async fns) ├─────────────
         │            └──────┬──────┘            │
         │                   │                   │
         │        ┌──────────┴──────────┐       │
         │        │                     │       │
    [Promise]  [Promise]           [Promise]   │
  getApprovedListings  addListing  toggleApproval│
         │        │              │      │       │
         │        │              │      │       └─ deleteListing [Promise]
         │        │              │      │
         ▼        ▼              ▼      ▼
    ┌────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐
    │Listings│ │CreateForm│ │AdminPan│ │AdminPanel │
    │component│ │component │ │toggle  │ │ delete    │
    └────────┘ └──────────┘ └────────┘ └───────────┘
         │          │            │          │
         └──────────┴────────────┴──────────┘
                    │
                 useEffect  + useState
                    │
              (loading, error, data)
                    │
                return JSX
```

---

## ✅ Требования выполнены

| Требование | Статус | Компонент |
|-----------|--------|-----------|
| Использовать useState и useEffect | ✅ | Все компоненты |
| Обрабатывать ошибки от Supabase | ✅ | try/catch блоки |
| Обновлять список после добавления | ✅ | onListingAdded callback |
| Обновлять список после удаления | ✅ | loadAllListings() |
| Обновлять список после изменения | ✅ | loadAllListings() |
| Полный TypeScript код | ✅ | Все файлы типизированы |
| Обработка loading состояния | ✅ | Спиннеры и disabled кнопки |

---

## 🚀 Как использовать

1. **Загрузить объявления:**
   ```typescript
   <Listings />
   ```

2. **Добавить объявление:**
   ```typescript
   <CreateListingForm 
     onClose={() => setPage('feed')} 
     onListingAdded={refreshListings}
   />
   ```

3. **Модерация (админ):**
   ```typescript
   <AdminPanel 
     onClose={() => setPage('feed')} 
   />
   ```

---

## 🔧 Типичные ошибки и решения

### ❌ Ошибка: "Cannot read property of undefined"

**Причина:** Вызов async функции без await
```typescript
// ❌ НЕПРАВИЛЬНО
const listings = getApprovedListings(); // Promise, не массив!

// ✅ ПРАВИЛЬНО
const data = await getApprovedListings(); // Массив
```

### ❌ Ошибка: Компонент не обновляется после добавления объявления

**Причина:** onListingAdded не передан или не вызван
```typescript
// ✅ ПРАВИЛЬНО
<CreateListingForm 
  onClose={goToFeed} 
  onListingAdded={() => refresh()}  // Передать callback
/>
```

### ❌ Ошибка: Неправильные имена полей в store

**Причина:** Используется camelCase вместо snake_case
```typescript
// ❌ НЕПРАВИЛЬНО
await addListing({
  productCategory: 'electronics',  // camelCase
  contactTelegram: '@user',
})

// ✅ ПРАВИЛЬНО
await addListing({
  product_category: 'electronics',  // snake_case!
  contact_telegram: '@user',
})
```

---

## 📝 Типы данных

```typescript
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  category: 'sell' | 'buy' | 'free' | 'services';
  productCategory: ProductCategory;
  district: 'pervomayskoe' | 'kivenappa';
  photos: string[];
  contact: string;
  contactTelegram?: string;
  contactPhone?: string;
  telegramUserId?: number;
  telegramUsername?: string;
  isApproved: boolean;
  createdAt: number;
}
```

---

## 🎯 Чек-лист для тестирования

- [ ] Объявления загружаются при открытии приложения
- [ ] Loading спиннер показывается во время загрузки
- [ ] Ошибки от Supabase отображаются пользователю
- [ ] Можно добавить новое объявление
- [ ] Кнопка отправки отключена во время отправки
- [ ] Список обновляется после добавления объявления
- [ ] Админ может одобрить объявление
- [ ] Админ может удалить объявление
- [ ] Список обновляется после одобрения/удаления
- [ ] Нет белого экрана (все компоненты правильно обрабатывают async)
