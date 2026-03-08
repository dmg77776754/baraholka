# 🚀 Деплой «Локальной барахолки» — полная инструкция

## Вариант 1: GitHub Pages (БЕСПЛАТНО, рекомендуется)

### Шаг 1. Создай репозиторий на GitHub
1. Зайди на https://github.com/new
2. Назови репо, например: `baraholka`
3. Сделай его **Public**
4. Нажми **Create repository**

### Шаг 2. Залей код
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЮЗЕРНЕЙМ/baraholka.git
git push -u origin main
```

### Шаг 3. Настрой GitHub Pages
1. Перейди в репо → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Создай файл `.github/workflows/deploy.yml` (содержимое ниже)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

### Шаг 4. Готово!
Через 1-2 минуты сайт будет доступен по адресу:
```
https://ТВОЙ_ЮЗЕРНЕЙМ.github.io/baraholka/
```

---

## Вариант 2: Подключение к Telegram как Mini App

### Шаг 1. Создай бота
1. Открой @BotFather в Telegram
2. Отправь `/newbot`
3. Задай имя и username бота

### Шаг 2. Подключи Web App
Отправь BotFather:
```
/setmenubutton
```
Выбери своего бота и укажи URL:
```
https://ТВОЙ_ЮЗЕРНЕЙМ.github.io/baraholka/
```
Текст кнопки: `🏪 Барахолка`

### Шаг 3. Проверь
Открой своего бота → нажми кнопку меню → приложение откроется внутри Telegram!

---

## 📦 База данных

### Текущая реализация: localStorage
Сейчас данные хранятся в localStorage браузера каждого пользователя.
Это **работает для демо**, но данные у каждого свои.

### Для продакшена: Supabase (БЕСПЛАТНО)

#### 1. Создай проект на Supabase
1. Зайди на https://supabase.com → Sign Up (бесплатно)
2. Create New Project
3. Запомни **Project URL** и **anon key**

#### 2. Создай таблицу
Зайди в SQL Editor и выполни:

```sql
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sell', 'buy', 'free', 'services')),
  product_category TEXT NOT NULL DEFAULT 'other',
  district TEXT NOT NULL CHECK (district IN ('pervomayskoe', 'kivenappa')),
  photos TEXT[] DEFAULT '{}',
  contact TEXT DEFAULT '',
  contact_telegram TEXT,
  contact_phone TEXT,
  telegram_user_id BIGINT,
  telegram_username TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Включи RLS (Row Level Security)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Политика: все видят одобренные
CREATE POLICY "Anyone can read approved" ON listings
  FOR SELECT USING (is_approved = true);

-- Политика: все могут добавлять
CREATE POLICY "Anyone can insert" ON listings
  FOR INSERT WITH CHECK (true);

-- Для админа: создай отдельную роль или используй Dashboard
```

#### 3. Установи клиент
```bash
npm install @supabase/supabase-js
```

#### 4. Замени store.ts на Supabase-версию
Создай `src/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ТВОЙ_ПРОЕКТ.supabase.co';
const SUPABASE_ANON_KEY = 'ТВОЙ_КЛЮЧ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Замени функции в `store.ts`:
```typescript
import { supabase } from './supabase';

export async function getApprovedListings() {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addListing(data) {
  const { error } = await supabase.from('listings').insert([data]);
  if (error) throw error;
}
```

#### 5. Модерация через Supabase Dashboard
- Зайди в https://supabase.com → Table Editor → listings
- Найди объявление → измени `is_approved` на `true`
- Или используй SQL: `UPDATE listings SET is_approved = true WHERE id = '...'`

---

## 💰 Стоимость

| Сервис | Лимит | Стоимость |
|--------|-------|-----------|
| GitHub Pages | безлимитно (статика) | **Бесплатно** |
| Supabase Free | 500 МБ БД, 50 000 запросов/мес | **Бесплатно** |
| Telegram Bot | без ограничений | **Бесплатно** |

**Итого: 0 ₽ / мес** для посёлка с сотнями пользователей.

---

## 🔧 Альтернативы (тоже бесплатно)

| Хостинг | База данных |
|---------|-------------|
| GitHub Pages | Supabase (рекомендую) |
| Netlify | Firebase Firestore |
| Vercel | Google Sheets API |
| Cloudflare Pages | Turso (SQLite) |
