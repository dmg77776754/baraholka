## 📊 Архитектура и взаимодействие компонентов

### Общая схема приложения

```
┌───────────────────────────────────────────────────────────────────┐
│                           APP.tsx                                 │
│                     (главный компонент)                           │
│                                                                   │
│  useState: page, listings, filters, searchQuery                  │
│  useCallback: refresh (async)                                    │
│  useEffect: loadData при монтировании                            │
│                                                                   │
│  ┌─────────┐  ┌─────────────┐  ┌──────────┐                    │
│  │ Listings│  │CreateListing│  │AdminPanel│                    │
│  │component│  │   component │  │component │                    │
│  └─────────┘  └─────────────┘  └──────────┘                    │
│       │             │                  │                         │
│       └─────────────┴──────────────────┘                          │
│                     │                                             │
│                refresh()                                          │
│                   │                                              │
│                   ▼                                              │
│          (обновляет listings)                                    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                           ▲
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
    ┌────────────┐                  ┌─────────────┐
    │ store.ts   │                  │ supabase.ts │
    │ (async fn) │────────connect──→│  (client)   │
    └────────────┘                  └─────────────┘
         │                                   │
         │                                   ▼
         │                          ┌──────────────┐
         │                          │  Supabase    │
         │                          │   Database   │
         └──────────────────────────→│  (Remote)    │
                    SQL requests     └──────────────┘
```

---

### Поток данных при добавлении объявления

```
Пользователь (User)
         │
         ▼
    CreateListingForm
    ├─ [title input]
    ├─ [price input]
    ├─ [photos upload]
    └─ [submit button]
         │
         ▼ onClick
    handleSubmit (async)
         │
         ├─ Валидация
         │  ├─ Проверка title
         │  ├─ Проверка price
         │  └─ Проверка контактов
         │
         ├─ setIsLoading(true)  ← блокируем кнопку
         │
         ▼
    await addListing({     ← store.ts функция
      title, price, photos, ...
    })
         │
         ├─ Отправить данные → Supabase
         │
         ▼
    ✅ Успешно / ❌ Ошибка
         │
    ┌────┴────┐
    │          │
    ▼ (успех)  ▼ (ошибка)
    │      setError(msg)
    │           │
    setSubmitted(true)  showConfirmation()
    │
    │ onListingAdded()  ← callback к App
    │           │
    │           ▼
    │       await refresh()
    │       getApprovedListings()
    │           │
    └───────────┤
                ▼
            setListings(data)
                │
                ▼
            <Listings /> обновляется
                │
                ▼
           Показывает новое объявление
```

---

### Жизненный цикл компонента Listings

```
MOUNT
  │
  ├─ useState: [listings, setListings]
  ├─ useState: [loading, setLoading]
  └─ useState: [error, setError]
  │
  ▼
useEffect (пусто [])
  │
  ├─ setLoading(true)
  │
  ├─ const data = await getApprovedListings()
  │
  ├─ setListings(data)
  ├─ setLoading(false)
  │
  └─ (если ошибка) setError(msg)
  │
  ▼
RENDER (loading = true)
  │
  ├─ if (loading) return <Loading />
  │
  ├─ if (error) return <Error />
  │
  └─ return <Grid>
       {listings.map(item => <Card />)}
     </Grid>
  │
  ▼
UNMOUNT (if page changes)
```

---

### Состояния (State) в каждом компоненте

```
Listings
├─ listings: Listing[]        ← массив объявлений
├─ loading: boolean           ← загружаем ли?
└─ error: string | null       ← ошибка?

CreateListingForm
├─ title: string              ← заголовок
├─ description: string        ← описание
├─ price: string              ← цена
├─ category: Category          ← тип
├─ productCategory: ProductCategory
├─ district: District
├─ photos: string[]           ← base64 фото
├─ contactTelegram: string    ← telegram
├─ contactPhone: string       ← телефон
├─ submitted: boolean         ← отправили ли?
├─ error: string              ← ошибка предается?
└─ isLoading: boolean         ← загружаем ли?

AdminPanel
├─ authed: boolean            ← авторизован ли?
├─ pin: string                ← введенный PIN
├─ listings: Listing[]        ← все объявления
├─ filter: 'all'|'pending'|'approved'
├─ isLoading: boolean         ← главная загрузка?
├─ loadingId: string | null   ← какой элемент обновляется?
└─ error: string | null       ← текущая ошибка?
```

---

### Зависимости (Dependencies) useEffect

```
useEffect(() => {
  // Код здесь
}, [dependencies]); // ← что от чего зависит?

ВАРИАНТЫ:

1. [] ← пусто
   // Запускается ОДИН РАЗ при монтировании
   useEffect(() => {
     loadData();
   }, []);

2. [variable] ← одна переменная
   // Запускается при изменении variable
   useEffect(() => {
     setError('');
     search();
   }, [searchQuery]);

3. [dep1, dep2]
   // Запускается при изменении dep1 ИЛИ dep2
   useEffect(() => {
     filter();
   }, [filterCat, filterProduct]);

4. Без [] ← опасно!
   // Запускается ПОСЛЕ КАЖДОГО РЕНДЕРА
   useEffect(() => {
     // ❌ Бесконечный цикл!
     loadData();
   });
```

---

### Обработка ошибок (error handling)

```
TRY/CATCH в async функциях:

const handleSubmit = async () => {
  try {
    // Код, который может вызвать ошибку
    const result = await riskyOperation();
    setData(result);
  } catch (error) {
    // Обработка ошибки
    const message = error instanceof Error 
      ? error.message 
      : 'Unknown error';
    setError(message);
    console.error('Error:', error);
  } finally {
    // Выполнится в любом случае
    setIsLoading(false);
  }
};

ТИПЫ ОШИБОК:

1. Supabase API ошибка:
   {
     error: {
       message: "UNIQUE constraint failed",
       details: "...",
       code: "23505"
     }
   }

2. Network ошибка:
   "Failed to fetch"
   "Connection timeout"

3. Валидация:
   "Title is required"
   "Invalid email"

4. Authorization:
   "User not authorized"
   "Invalid token"
```

---

### Callback функции

```
Callbacks используются чтобы сообщить родительскому
компоненту, что что-то произошло.

ПРИМЕР: CreateListingForm → App

// App.tsx
<CreateListingForm 
  onClose={() => setPage('feed')}
  onListingAdded={() => refresh()}  ← callback
/>

// CreateListingForm.tsx
export function CreateListingForm({ 
  onClose, 
  onListingAdded  ← получаем callback
}) {
  const handleSubmit = async () => {
    await addListing(data);
    onListingAdded?.();  ← вызываем callback
  };
}

ПРЕИМУЩЕСТВА:
1. Разделение ответственности
2. Компонент не знает о родителе
3. Легче тестировать
4. Переиспользуемость
```

---

### Loading состояния для разных сценариев

```
СЦЕНАРИЙ 1: Загрузка всего списка
┌─────────────┐
│ Loading     │
│ спиннер     │
└─────────────┘
        │
        ▼
 fetchListings()
        │
        ▼
┌─────────────────────┐
│ List (updated)      │
│ ┌─┐ ┌─┐ ┌─┐        │
│ │1│ │2│ │3│        │
│ └─┘ └─┘ └─┘        │
└─────────────────────┘

СЦЕНАРИЙ 2: Обновление одного элемента
┌─────────────────────┐
│ List                │
│ ┌─────────────────┐ │
│ │ Item 1          │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Item 2 ⏳       │ │ ← загружается этот
│ │ [Approve] ★     │ │   элемент
│ │ ★ disabled      │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Item 3          │ │
│ └─────────────────┘ │
└─────────────────────┘

СЦЕНАРИЙ 3: Отправка формы
┌──────────────────────────┐
│ Form                     │
│ [Title input]            │
│ [Price input]            │
│ [Submit button]          │
│           ↓              │
│ [Submit button] disabled │
│ ⏳ Отправляется...      │
│           ↓              │
│ ✅ Отправлено!           │
└──────────────────────────┘
```

---

### Правильная асинхронность

```
❌ НЕПРАВИЛЬНО: забыли await

setListings(getApprovedListings());
           ↑
    это ПРОМИС, не данные!

Результат:
listings = Promise { <pending> }
listings.map(...) ← Error!

✅ ПРАВИЛЬНО: используем await

const data = await getApprovedListings();
setListings(data);

Результат:
listings = [{ id: 1, title: '...' }, ...]
listings.map(...) ← Works!

ПРАВИЛО:
Если функция возвращает Promise,
используй AWAIT перед ней!
```

---

### Таблица событий и действий

| Событие | Компонент | Функция | Результат |
|---------|-----------|---------|-----------|
| Открыть приложение | App | refresh() | Списко загружается |
| Клик на "Добавить" | App | setPage('create') | Показывается форма |
| Заполнить форму | CreateListingForm | handleChange() | State обновляется |
| Отправить форму | CreateListingForm | handleSubmit() | await addListing() |
| ✅ Успех отправки | CreateListingForm | onListingAdded() | Вызывает refresh() |
| Вернуться на фид | App | goToFeed() | refresh() + setPage('feed') |
| Клик на "Админ" | App | setPage('admin') | Показывается админ-панель |
| Ввести PIN | AdminPanel | setPin() | Проверка PIN |
| Вход с PIN | AdminPanel | setAuthed() | Загружаются все объявления |
| Клик "Одобрить" | AdminPanel | handleToggle() | await toggleApproval() |
| ✅ Одобрение | AdminPanel | loadAllListings() | Список обновляется |
| Клик "Удалить" | AdminPanel | handleDelete() | await deleteListing() |
| ✅ Удаление | AdminPanel | loadAllListings() | Список обновляется |

---

### Правильное использование useEffect

```
❌ НЕПРАВИЛЬНО: Прямой вызов async

useEffect(async () => {  ← Ошибка!
  const data = await fetchData();
  setData(data);
}, []);

⚠️ ПРОБЛЕМА:
- useEffect не может быть async напрямую
- DevTools выдаст warning

✅ ПРАВИЛЬНО: Функция внутри

useEffect(() => {
  const load = async () => {
    const data = await fetchData();
    setData(data);
  };
  load();
}, []);

✅ АЛЬТЕРНАТИВА: IIFE

useEffect(() => {
  (async () => {
    const data = await fetchData();
    setData(data);
  })();
}, []);
```

---

### Шаг за шагом: полный цикл

```
1. ИНИЦИАЛИЗАЦИЯ
   ├─ Создаются все state переменные
   ├─ Устанавливаются начальные значения
   └─ Создаются функции

2. МОНТИРОВАНИЕ
   ├─ useEffect запускается
   ├─ Начинается загрузка данных
   ├─ setLoading(true)
   └─ Показывается спиннер

3. ЗАГРУЗКА
   ├─ await getApprovedListings()
   ├─ Supabase возвращает данные
   ├─ setListings(data)
   ├─ setLoading(false)
   └─ Компонент перерисовывается

4. РЕНДЕР
   ├─ Проверяем loading и error
   ├─ Если nothing wrong, показываем список
   ├─ Каждое объявление - отдельный Card
   └─ Пользователь видит данные

5. ВЗАИМОДЕЙСТВИЕ
   ├─ Пользователь кликает на кнопку
   ├─ Вызывается обработчик события
   ├─ Начинается асинхронная операция
   └─ Список обновляется или ошибка

6. РАЗМОНТИРОВАНИЕ
   └─ Компонент удаляется (очистка памяти)
```

---

### Диаграмма состояния компонента Listings

```
       START
         │
         ▼
    ┌────────────┐
    │ Initialization│
    │ loading=true │
    │ error=null   │
    │ data=[]      │
    └────────────┘
         │
         ▼
    ┌────────────────────────┐
    │ useEffect запускается  │
    │ loadListings()         │
    └────────────────────────┘
         │
         ▼
    await getApprovedListings()
         │
    ┌────┴────┐
    │          │
    ▼ (success) ▼ (error)
    │      ┌─────────┐
    │      │error=msg│
    │      │loading=f│
    │      └─────────┘
    │           │
    │           └─→ RENDER (error)
    │
    setListings(data)
    setLoading(false)
         │
         ▼
    ┌────────────────┐
    │ RENDER (success)│
    │ Show grid      │
    │ listings.map() │
    └────────────────┘
         │
         ▼
    READY (ждет действий)
```
