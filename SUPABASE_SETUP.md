# Supabase Setup

## Таблица Listings

Выполните следующий SQL скрипт в Supabase SQL Editor для создания таблицы:

```sql
-- Create enum types
CREATE TYPE listing_category AS ENUM ('sell', 'buy', 'free', 'services');
CREATE TYPE product_category AS ENUM (
  'electronics', 'furniture', 'clothing', 'kids', 'auto',
  'garden', 'pets', 'food', 'realty', 'beauty', 'sport', 'other'
);
CREATE TYPE district AS ENUM ('pervomayskoe', 'kivenappa');

-- Create listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  category listing_category NOT NULL,
  productCategory product_category NOT NULL,
  district district NOT NULL,
  photos TEXT[] DEFAULT '{}',
  contact TEXT NOT NULL,
  contactTelegram TEXT,
  contactPhone TEXT,
  telegramUserId BIGINT,
  telegramUsername TEXT,
  isApproved BOOLEAN DEFAULT FALSE,
  createdAt BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for queries
CREATE INDEX idx_listings_isApproved ON listings(isApproved);
CREATE INDEX idx_listings_createdAt ON listings(createdAt DESC);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_productCategory ON listings(productCategory);
CREATE INDEX idx_listings_district ON listings(district);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read of approved listings
CREATE POLICY "Anyone can view approved listings"
  ON listings
  FOR SELECT
  USING (isApproved = true);

-- Create policy to allow inserting new listings
CREATE POLICY "Anyone can create listings"
  ON listings
  FOR INSERT
  WITH CHECK (true);

-- Optional: Create policy for admin operations (if you have auth)
-- CREATE POLICY "Admins can manage all listings"
--   ON listings
--   USING (auth.role() = 'authenticated');
```

## Изменения в коде

### store.ts
- **Было**: localStorage-based хранилище
- **Стало**: Supabase Database с async операциями

Все функции теперь асинхронные:
- `getApprovedListings()` → `Promise<Listing[]>`
- `getAllListings()` → `Promise<Listing[]>`
- `addListing()` → `Promise<Listing>`
- `toggleApproval()` → `Promise<void>`
- `deleteListing()` → `Promise<void>`

### App.tsx
- Обновлены вызовы `getApprovedListings()` для работы с Promise
- Добавлена обработка ошибок

### AdminPanel.tsx
- Обновлены `getAllListings()`, `toggleApproval()`, `deleteListing()` для работы с Promise
- Все операции обёрнуты в try-catch блоки

### CreateListingForm.tsx
- `handleSubmit()` теперь async
- Добавлена обработка ошибок при отправке объявления

## Миграция данных (это опционально)

Если у вас есть старые данные в localStorage, их можно импортировать в Supabase:

```javascript
// Временный скрипт для миграции
import { supabase } from './supabase';

async function migrateFromLocalStorage() {
  const STORAGE_KEY = 'baraholka_listings_v3';
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  const listings = JSON.parse(raw);
  
  if (listings.length > 0) {
    const { error } = await supabase
      .from('listings')
      .insert(listings.map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        price: l.price,
        category: l.category,
        productCategory: l.productCategory,
        district: l.district,
        photos: l.photos,
        contact: l.contact,
        contactTelegram: l.contactTelegram,
        contactPhone: l.contactPhone,
        telegramUserId: l.telegramUserId,
        telegramUsername: l.telegramUsername,
        isApproved: l.isApproved,
        createdAt: l.createdAt,
      })));
    
    if (error) console.error('Migration error:', error);
    else console.log('Migrated', listings.length, 'listings');
  }
}

// Запустите эту функцию один раз в консоли браузера
```

## Примечания

1. **Photos хранятся как массив base64 строк** в database. Для оптимизации рекомендуется использовать Supabase Storage.

2. **RLS (Row Level Security)** включен, но может потребоваться дополнительная настройка в зависимости от ваших требований.

3. **Credentials** в `supabase.ts` используют anon ключ - не используйте service role ключ в клиентском коде!

4. Для реальной апликации рекомендуется добавить аутентификацию и более строгие RLS policies.
