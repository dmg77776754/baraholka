## 🆘 Решение типичных проблем

### ⚠️ ПРОБЛЕМА 1: Белый экран вместо компонентов

**Симптомы:**
- Экран полностью белый
- В консоли: `Cannot read property 'map' of undefined`
- Или: `X is not iterable`

**Причина:**
```typescript
// ❌ НЕПРАВИЛЬНО - это Promise, не массив!
const listings = getApprovedListings();
const items = listings.map(...); // ← Error!
```

**Решение:**
```typescript
// ✅ ПРАВИЛЬНО - используем async/await
const data = await getApprovedListings();
const items = data.map(...); // ← Works!
```

**Полный пример:**
```typescript
export function Listings() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    // Создаем функцию внутри useEffect
    const loadData = async () => {
      const data = await getApprovedListings();
      setListings(data);
    };
    loadData();
  }, []);

  return <div>{listings.map(item => ...)}</div>;
}
```

---

### ⚠️ ПРОБЛЕМА 2: Объявление добавляется, но список не обновляется

**Симптомы:**
- Видим сообщение "Объявление отправлено успешно"
- Но списка объявлений не обновилось

**Причина:**
```typescript
// ❌ НЕПРАВИЛЬНО
const handleSubmit = async () => {
  await addListing(data);
  setSubmitted(true);
  // Забыли обновить список!
};
```

**Решение 1: Передать callback в форму**
```typescript
// В App.tsx
<CreateListingForm 
  onListingAdded={refresh}  // ← Передаем функцию
/>

// В CreateListingForm.tsx
export function CreateListingForm({ onListingAdded }) {
  const handleSubmit = async () => {
    await addListing(data);
    onListingAdded?.();  // ← Вызываем callback
  };
}
```

**Решение 2: Использовать useCallback**
```typescript
export function App() {
  const refresh = useCallback(async () => {
    const data = await getApprovedListings();
    setListings(data);
  }, []);

  // ... потом передать refresh везде где нужно обновление
}
```

---

### ⚠️ ПРОБЛЕМА 3: При модерации - кнопки не отключаются, список не обновляется

**Симптомы:**
- Можно бесконечно нажимать на кнопку одобрения
- Список не обновляется после одобрения
- Может быть двойное действие

**Причина:**
```typescript
// ❌ НЕПРАВИЛЬНО
const handleToggle = (id) => {
  toggleApproval(id);      // ← Не ждем
  refresh();               // ← Вызовется до завершения toggleApproval
};

// Результат: иногда не обновляется, иногда баг с данными
```

**Решение:**
```typescript
// ✅ ПРАВИЛЬНО - используем async/await
const [loadingId, setLoadingId] = useState(null);

const handleToggle = async (id) => {
  try {
    setLoadingId(id);      // ← Отключаем кнопку
    await toggleApproval(id);
    await loadAllListings(); // ← Обновляем после завершения
  } catch (err) {
    setError(err.message);
  } finally {
    setLoadingId(null);    // ← Включаем кнопку
  }
};

// Кнопка:
<button 
  onClick={() => handleToggle(id)}
  disabled={loadingId === id}  // ← Отключена только для этого элемента
>
  {loadingId === id ? '⏳' : 'Одобрить'}
</button>
```

---

### ⚠️ ПРОБЛЕМА 4: Ошибка "Cannot read property of undefined" при добавлении

**Симптомы:**
- В консоли TypeError
- Форма не отправляется
- Иногда видно в девтулсе: "field is not defined"

**Причина:**
```typescript
// ❌ НЕПРАВИЛЬНО - забыли snake_case в полях store
await addListing({
  title: 'Велосипед',
  productCategory: 'auto',    // ← ОШИБКА! Должен быть product_category
  contactTelegram: '@user',   // ← ОШИБКА! Должен быть contact_telegram
});
```

**Решение:**
```typescript
// ✅ ПРАВИЛЬНО - используем snake_case как в store.ts
await addListing({
  title: 'Велосипед',
  product_category: 'auto',       // ← snake_case
  contact_telegram: '@user',      // ← snake_case
  contact_phone: '+7...',         // ← snake_case
  telegram_user_id: 123,          // ← snake_case
});

// Проверьте store.ts функцию addListing() параметры:
// они определяют правильные имена!
```

---

### ⚠️ ПРОБЛЕМА 5: Promise ошибка - "Promise { <pending> }"

**Симптомы:**
- В консоли видно `Promise { <pending> }`
- Компонент не обновляется
- Данные не загружаются

**Причина:**
```typescript
// ❌ НЕПРАВИЛЬНО - забыли await
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Забыли await!
  addListing(data);  
  
  // Код выполниться ДО отправки на Supabase
  setSubmitted(true);
};
```

**Решение:**
```typescript
// ✅ ПРАВИЛЬНО - используем await
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setIsLoading(true);
    await addListing(data);  // ← Ждем завершения
    setSubmitted(true);      // ← Только после успеха
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

---

### ⚠️ ПРОБЛЕМА 6: Компонент не перезагружается после навигации

**Симптомы:**
- Переходим на другую страницу и обратно
- Объявления не обновляются
- Видны старые данные

**Причина:**
```typescript
// ❌ НЕПРАВИЛЬНО - loadListings не в зависимостях useEffect
const loadListings = () => { /* ... */ };

useEffect(() => {
  loadListings();
}, []);  // ← loadListings не указан!
```

**Решение:**
```typescript
// ✅ ПРАВИЛЬНО - используем useCallback и зависимость
const loadListings = useCallback(async () => {
  const data = await getApprovedListings();
  setListings(data);
}, []);

useEffect(() => {
  loadListings();
}, [loadListings]);  // ← Вявно указываем зависимость
```

**Или проще:**
```typescript
// ✅ ПРОЩЕ - функция внутри useEffect
useEffect(() => {
  const load = async () => {
    const data = await getApprovedListings();
    setListings(data);
  };
  load();
}, []); // ← Пусто - запусти один раз
```

---

### ⚠️ ПРОБЛЕМА 7: Много запросов Supabase одновременно

**Симптомы:**
- Быстрые клики на кнопку отправки
- Разные результаты каждый раз
- В девтулсе видно множество запросов

**Причина:**
```typescript
// ❌ НЕПРАВИЛЬНО - кнопка не отключена
<button onClick={handleDelete}>Удалить</button>

// Пользователь кликает быстро 5 раз
// → 5 запросов на Supabase одновременно
// → Хаос!
```

**Решение:**
```typescript
// ✅ ПРАВИЛЬНО - отключаем кнопку
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  try {
    setIsDeleting(true);
    await deleteListing(id);
  } finally {
    setIsDeleting(false);
  }
};

<button 
  onClick={handleDelete}
  disabled={isDeleting}  // ← Только один клик!
>
  {isDeleting ? '⏳' : 'Удалить'}
</button>
```

---

### ⚠️ ПРОБЛЕМА 8: Ошибка Supabase - "UNIQUE constraint failed"

**Симптомы:**
- При добавлении объявления ошибка: `UNIQUE constraint failed`
- Или: `duplicate key value`

**Причина:**
```typescript
// Скорее всего ошибка со стороны Supabase/базы данных
// Может быть попытка добавить объявление с существующим ID
```

**Решение:**
```typescript
// 1. Проверьте, что НЕ передаёте id (Supabase сам создаст)
await addListing({
  // ❌ id: '123',  ← Удалите это!
  title: 'Велосипед',
  // ...
});

// 2. Проверьте в Supabase, что типы данных совпадают
// 3. Проверьте консоль Supabase в браузере DevTools → Network

await addListing({
  title: 'Велосипед',
  // id и created_at добавляются автоматически
});
```

---

### ⚠️ ПРОБЛЕМА 9: Ошибка CORS при запросе к Supabase

**Симптомы:**
- В консоли: `CORS error` или `Access-Control-Allow-Origin`
- Данные не загружаются

**Причина:**
Обычно это проблема конфигурации Supabase или сборки.

**Проверьте:**
```typescript
// 1. Проверьте, что Supabase инициализирован правильно
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://YOUR-PROJECT.supabase.co',
  'YOUR-ANON-KEY'
);

// 2. Проверьте в консоли браузера правый URL
console.log(supabase.auth.getSession());

// 3. Проверьте RLS (Row Level Security) в Supabase
// Может быть, таблица закрыта от анонимного доступа
```

---

### ⚠️ ПРОБЛЕМА 10: Фото не загружаются, форма висит на "Отправляется"

**Симптомы:**
- Кликаем отправить
- Кнопка стоит в статусе "⏳ Отправляется..."
- И так зависает на 10+ минут

**Причина:**
```typescript
// Скорее всего:
// 1. Фотографии очень большие (несжатые)
// 2. Суетка с base64 и canvas
// 3. Timeout при загрузке данных
```

**Решение:**
```typescript
// 1. Сжимайте фото при добавлении
const handlePhotoAdd = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 800;  // Не больше 800px
      // ... сжатие ...
      const compressed = canvas.toDataURL('image/jpeg', 0.7);  // 70% качество
    };
  };
};

// 2. Ограничите размер фото
const MAX_PHOTO_SIZE = 500 * 1024; // 500KB макс

// 3. В store.ts проверьте timeout
const { data, error } = await supabase
  .from('listings')
  .insert([...])
  .timeout(60000);  // 60 секунд максимум
```

---

## 🔍 ЧЕК-ЛИСТ отладки

Если что-то не работает:

- [ ] Открыть DevTools (F12)
- [ ] Перейти на вкладку Console
- [ ] Поискать красные ошибки
- [ ] Скопировать ошибку и погуглить
- [ ] Проверить:
  - [ ] Есть ли async/await?
  - [ ] Вызывается ли setData() после await?
  - [ ] Правильны ли имена полей (snake_case)?
  - [ ] Отключена ли кнопка во время загрузки?
  - [ ] Обновляется ли список после операции?
- [ ] Проверить вкладку Network в DevTools
  - [ ] Видны ли запросы к Supabase?
  - [ ] Есть ли ошибки (красные)?
  - [ ] Какой HTTP статус? (200 = ок, 400/500 = ошибка)
- [ ] Добавить console.log() для отладки
- [ ] Перезагрузить страницу (Ctrl+R или Cmd+R)

---

## 📱 ПРИМЕРЫ ПРАВИЛЬНЫХ ФУНКЦИЙ

**❌ Неправильно:**
```typescript
const refresh = () => {
  setListings(getApprovedListings());
};
```

**✅ Правильно:**
```typescript
const refresh = async () => {
  try {
    const data = await getApprovedListings();
    setListings(data);
  } catch (err) {
    console.error(err);
  }
};
```

**❌ Неправильно:**
```typescript
useEffect(() => {
  refresh();
}, [refresh]);
```

**✅ Правильно:**
```typescript
useEffect(() => {
  refresh();
}, []);  // или [refresh] если refresh в useCallback
```

---

## 🚀 Если все еще не работает

1. Проверьте Supabase статус: https://status.supabase.com/
2. Проверьте RLS в Supabase Dashboard
3. Проверьте креденшалы (URL и API key)
4. Удалите node_modules и переустановите:
   ```bash
   rm -r node_modules
   npm install
   npm run dev
   ```
5. Очистите браузер кеш (Ctrl+Shift+Delete)
6. Попробуйте в приватном окне (без расширений)
