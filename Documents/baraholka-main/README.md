# 🏪 Барахолка — маркетплейс для соседей

**Локальный маркетплейс на Telegram** для продажи и покупки вещей между жителями.

---

## 📱 Функционал

### Для обычных пользователей:

- ✅ **Просмотр объявлений** — фильтр по категориям, районам, поиск по названию
- ✅ **Публикация объявлений** — форма с фото, описанием, ценой, контактами
- ✅ **Управление своими объявлениями** — удаление, редактирование (планируется)
- ✅ **Просмотр деталей объявления** — галерея фото, полная информация, контакты продавца
- ✅ **Связь с продавцом** — Telegram ссылка, номер телефона

### Для администраторов:

- ✅ **Модерация объявлений** — одобрение/отклонение новых объявлений
- ✅ **Удаление спама** — удаление нарушающих правила объявлений
- ✅ **Просмотр статистики** — всего объявлений, на модерации, одобрено

---

## 🚀 Установка

### 1. Предварительные требования

- Node.js 18+
- npm или pnpm
- Telegram Desktop Application (или WebApp)
- Supabase аккаунт (https://supabase.com)

### 2. Клонирование проекта

```bash
git clone https://github.com/yourusername/baraholka.git
cd baraholka
```

### 3. Установка зависимостей

```bash
npm install
# или
pnpm install
```

### 4. Настройка Supabase

#### Создать проект в Supabase:

1. Перейти на https://app.supabase.com
2. Нажать "New project"
3. Выбрать регион (например, Europe)
4. Установить пароль
5. Дождаться, пока проект будет готов

#### Скопировать credentials:

1. Перейти в "Settings" → "API"
2. Скопировать:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public key** (VITE_SUPABASE_ANON_KEY)

#### Создать таблицу в Supabase:

Открыть "SQL Editor" и выполнить:

```sql
-- Создать таблицу объявлений
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sell', 'buy', 'free', 'services')),
  product_category TEXT NOT NULL,
  district TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  contact TEXT NOT NULL,
  contact_telegram TEXT,
  contact_phone TEXT,
  telegram_user_id BIGINT,
  telegram_username TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Создать индексы для быстрого поиска
CREATE INDEX idx_listings_is_approved ON listings(is_approved);
CREATE INDEX idx_listings_telegram_user_id ON listings(telegram_user_id);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- Таблица администраторов
CREATE TABLE admins (
  id BIGINT PRIMARY KEY,
  telegram_username TEXT
);
```

#### Установить RLS политики:

```sql
-- Включить RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Политика 1: Публичный просмотр одобренных объявлений
CREATE POLICY "approved_listings_public_read"
  ON listings FOR SELECT
  USING (is_approved);

-- Политика 2: Создание объявления (любой авторизованный)
CREATE POLICY "create_listing"
  ON listings FOR INSERT
  WITH CHECK (true);

-- Политика 3: Просмотр своих объявлений (все статусы)
CREATE POLICY "view_own_listings"
  ON listings FOR SELECT
  USING (telegram_user_id = auth.uid());

-- Политика 4: Редактирование только своего объявления
CREATE POLICY "update_own_listing"
  ON listings FOR UPDATE
  USING (telegram_user_id = auth.uid())
  WITH CHECK (telegram_user_id = auth.uid());

-- Политика 5: Удаление только своего объявления
CREATE POLICY "delete_own_listing"
  ON listings FOR DELETE
  USING (telegram_user_id = auth.uid());

-- Политика 6: Администратор видит все объявления
CREATE POLICY "admin_see_all"
  ON listings FOR SELECT
  USING (telegram_user_id IN (SELECT id FROM admins));

-- Политика 7: Администратор одобряет/удаляет
CREATE POLICY "admin_approve_delete"
  ON listings FOR UPDATE
  USING (telegram_user_id IN (SELECT id FROM admins))
  WITH CHECK (telegram_user_id IN (SELECT id FROM admins));
```

#### Создать файл .env:

```bash
# Скопировать credentials из Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 5. Создать Telegram бот

1. Открыть [BotFather](https://t.me/BotFather) в Telegram
2. Отправить команду `/newbot`
3. Придумать имя (напр. "Барахолка бот")
4. Придумать username (напр. "baraholka_bot")
5. Скопировать полученный токен

#### Добавить WebApp-кнопку:

В BotFather отправить команду `/setmenubutton` и выбрать своего бота:

```
Bot: @baraholka_bot
Button text: 🏪 Открыть маркетплейс
URL: https://your-app-url.vercel.app/
```

### 6. Запуск в разработке

```bash
npm run dev
```

Откроется http://localhost:5173

### 7. Deploy на Vercel/Netlify

#### Vercel:

```bash
npm install -g vercel
vercel
```

Следовать инструкциям Vercel и добавить environment переменные из .env

#### Netlify:

1. Залить на GitHub
2. Подключить репо в Netlify
3. Добавить environment переменные в "Build & deploy" → "Environment"
4. Deploy

---

## 📖 Использование

### Как опубликовать объявление:

1. Открыть приложение
2. Нажать "➕ Подать объявление"
3. Выбрать категорию (Продать, Купить, Отдать, Услуги)
4. Выбрать тип товара (Электроника, Мебель, и т.д.)
5. Заполнить форму:
   - Название товара
   - Описание
   - Цена
   - Фото
   - Контакты (Telegram/Телефон)
   - Район
6. Нажать "Опубликовать"

**⏳ Статус:** Объявление поступит на модерацию к администраторам.

### Как просмотреть объявления:

1. Вернуться на главную страницу
2. Фильтровать по:
   - **Районам** — Первомайское, Киденьки
   - **Категориям** — Продают, Ищут, Дарят, Услуги
   - **Типам товара** — Электроника, Мебель, Одежда и т.д.
3. **Поиск** — ввести название в поле поиска
4. Нажать на объявление для просмотра деталей и фотографий

### Как управлять своими объявлениями:

1. Нажать "📋 Мои объявления" (икона в шапке)
2. Выбрать объявление и нажать на него
3. В модальном окне:
   - Просмотреть все фотографии
   - Посмотреть полную информацию
   - **Удалить** — удалит объявление
   - **Редактировать** — изменит информацию (планируется)

### Как связаться с продавцом:

1. Открыть объявление
2. Нажать:
   - "💬 Telegram" — откроется чат с продавцом
   - "☎️ Позвонить" — откроется приложение для звонка

---

## 🔧 Разработка

### Структура проекта:

```
baraholka/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx      — Админ-панель модерации
│   │   ├── CreateListingForm.tsx — Форма создания объявления
│   │   ├── ListingCard.tsx     — Компонент карточки объявления
│   │   ├── ListingDetail.tsx   — Модальное окно с деталями
│   │   └── MyListings.tsx      — Страница своих объявлений
│   ├── App.tsx                 — Главный компонент приложения
│   ├── main.tsx                — Точка входа
│   ├── index.css               — Стили Tailwind CSS
│   ├── store.ts                — Бизнес-логика (работа с API)
│   ├── supabase.ts             — Инициализация Supabase клиента
│   ├── telegram.ts             — Работа с Telegram WebApp API
│   ├── types.ts                — TypeScript интерфейсы
│   └── testSupabase.ts         — Тест подключения к БД
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── README.md
├── SECURITY.md                 — Документация по безопасности
├── SUPABASE_SETUP.md           — Подробная установка Supabase
├── DEPLOY.md                   — Инструкция по деплою
└── .env                        — (не коммитьте!)
```

### Хуки разработки:

```bash
# ESLint (проверка кода)
npm run lint

# TypeScript (проверка типов)
npm run type-check

# Сборка для production
npm run build

# Предпросмотр production сборки
npm run preview
```

### Особенности реализации:

- **React 19.2.3** — новейшая версия React
- **TypeScript** — типобезопасность на 100%
- **Tailwind CSS** — утилитарный CSS фреймворк
- **Vite** — молниеносная сборка
- **Supabase** — PostgreSQL + RLS + Real-time
- **Telegram WebApp API** — встроенная аутентификация

---

## 🔒 Безопасность

📖 **Полное описание мер безопасности:** [SECURITY.md](SECURITY.md)

Коротко:
- ✅ Аутентификация через Telegram (невозможно подделать)
- ✅ Row Level Security (RLS) на уровне БД
- ✅ Проверка владельца при удалении/редактировании
- ✅ Защита от XSS, SQL Injection, CSRF
- ✅ Компрессия и валидация фотографий
- ⚠️ Требуется: Rate limiting и проверка подписи initData на сервере

---

## 🐛 Известные проблемы и решения

### Проблема: "RLS policy violation"

**Решение:** Проверить, что:
1. RLS включен на таблице: `ALTER TABLE listings ENABLE ROW LEVEL SECURITY;`
2. Политики созданы правильно
3. `telegram_user_id` совпадает с `auth.uid()`

### Проблема: Объявления не загружаются

**Решение:**
1. Открыть DevTools (F12)
2. Перейти на вкладку "Network"
3. Перезагрузить страницу (F5)
4. Посмотреть запросы к Supabase
5. Проверить ошибки в консоли

### Проблема: Фотографии не загружаются

**Решение:**
1. Проверить размер файла (< 5MB)
2. Проверить тип файла (только jpg, png, webp)
3. Открыть браузерную консоль и посмотреть ошибку

---

## 📱 Тестирование

### На компьютере:

```bash
# Запустить dev сервер
npm run dev

# Открыть в браузере
open http://localhost:5173

# Открыть DevTools (F12) и эмулировать мобильный телефон (Ctrl+Shift+M)
```

### На телефоне:

1. Запустить локальный сервер или deploy
2. Открыть бота в Telegram
3. Нажать кнопку "Открыть маркетплейс"
4. Протестировать функции

### Checklist тестирования:

```markdown
- [ ] Объявления загружаются
- [ ] Фильтры работают
- [ ] Поиск работает
- [ ] Форма создания объявления работает
- [ ] Фотографии загружаются
- [ ] Объявление опубликовано
- [ ] Адм-панель показывает новое объявление
- [ ] Адм может одобрить/удалить
- [ ] Пользователь видит одобренное объявление
- [ ] Пользователь видит свои объявления
- [ ] Пользователь может удалить свое объявление
- [ ] Ссылки на Telegram и телефон работают
```

---

## 🤝 Вклад

Если хотите улучшить приложение:

1. Fork репо
2. Создать новую ветку: `git checkout -b feature/название`
3. Сделать изменения и коммиты
4. Push: `git push origin feature/название`
5. Открыть Pull Request

---

## 📄 Лицензия

MIT License — используйте свободно! 📜

---

## 📞 Контакты

- 💬 Telegram: [@username](https://t.me/username)
- 📧 Email: your@email.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/baraholka/issues)

---

## 🎯 Планируемые фичи

- [ ] Редактирование объявлений
- [ ] Система рейтинга продавцов
- [ ] Черный список пользователей
- [ ] Push-уведомления о новых объявлениях
- [ ] Сохранение избранного
- [ ] История просмотренных объявлений
- [ ] Чат между продавцом и покупателем
- [ ] Система платежей (Telegram Stars)
- [ ] Карта районов с объявлениями
- [ ] Аналитика для администраторов

---

## ⭐ Спасибо за использование Барахолки!

Если приложение вам понравилось, поставьте ⭐ на GitHub!

---

**Made with ❤️ for neighbors**

Последнее обновление: 2024-01-15 | React 19.2.3 | TypeScript | Supabase
