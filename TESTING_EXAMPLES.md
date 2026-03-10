// ПРАКТИЧЕСКИЕ ПРИМЕРЫ ДЛЯ ТЕСТИРОВАНИЯ

// ============================================
// ТЕСТ 1: Загрузка одобренных объявлений
// ============================================

// ❌ БЫЛО - неправильно (белый экран)
function ListingsOld() {
  const [listings, setListings] = useState(null);

  // ❌ ПРОБЛЕМА: getApprovedListings() возвращает Promise, не массив!
  setListings(getApprovedListings());

  // ❌ ПРОБЛЕМА: listings === Promise, не массив
  return listings.map(item => ...); // TypeError: listings is not iterable
}

// ✅ ИСПРАВЛЕНО
function ListingsNew() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // ✅ Используем await чтобы получить массив
        const data = await getApprovedListings();
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error msg={error} />;
  return listings.map(item => <Item key={item.id} {...item} />);
}

// ============================================
// ТЕСТ 2: Добавление объявления
// ============================================

// ❌ БЫЛО - неправильно
const handleSubmit = (e) => {
  e.preventDefault();
  
  // ❌ ПРОБЛЕМА: addListing() возвращает Promise, но мы не ждем результат
  addListing({ title, price, ... });
  
  // ❌ ПРОБЛЕМА: setSubmitted вызовется ДО завершения отправки на Supabase!
  setSubmitted(true);
};

// ✅ ИСПРАВЛЕНО
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setIsLoading(true);
    // ✅ Используем await - ждем завершения
    await addListing({ title, price, ... });
    // ✅ Только после успеха
    setSubmitted(true);
    // ✅ Обновляем список в родительском компоненте
    onListingAdded?.();
  } catch (err) {
    // ✅ Обрабатываем ошибки из Supabase
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};

// ============================================
// ТЕСТ 3: Модерация объявлений с обновлением
// ============================================

// ❌ БЫЛО - неправильно (список не обновляется)
const handleApprove = (id) => {
  toggleApproval(id);        // ← Не ждем!
  refresh();                 // ← Вызывается ДО завершения toggleApproval!
};

// ✅ ИСПРАВЛЕНО
const handleApprove = async (id) => {
  try {
    setLoadingId(id);
    // ✅ Ждем завершения изменения
    await toggleApproval(id);
    // ✅ ПОТОМ обновляем список
    await loadAllListings();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoadingId(null);
  }
};

// ============================================
// ТЕСТ 4: Правильная типизация store функций
// ============================================

// ❌ БЫЛО - забыли про snake_case
await addListing({
  title: 'Велосипед',
  productCategory: 'auto',        // ❌ ОШИБКА! camelCase
  contactTelegram: '@user',       // ❌ ОШИБКА! camelCase
  telegramUserId: 123,            // ❌ ОШИБКА! camelCase
});

// ✅ ИСПРАВЛЕНО - используем snake_case как в store.ts
await addListing({
  title: 'Велосипед',
  product_category: 'auto',       // ✅ snake_case
  contact_telegram: '@user',      // ✅ snake_case
  telegram_user_id: 123,          // ✅ snake_case
});

// ============================================
// ТЕСТ 5: Чек-лист для отладки белого экрана
// ============================================

/*
Если видишь белый экран:

1. Откройте DevTools (F12) → Console
   
2. Поищите ошибку типа:
   - "Cannot read property of undefined"
   - "X.map is not a function"
   - "Promise { <pending> }"
   
3. Проверьте:
   ☐ Есть ли await перед getApprovedListings()?
   ☐ Есть ли try/catch?
   ☐ Правильны ли имена полей (snake_case vs camelCase)?
   ☐ Вызывается ли setListings(data) после await?
   ☐ Используется ли async функция в useEffect?
   
4. Примеры консоли:

   ❌ setListings(getApprovedListings());
      → listings будет Promise { <pending> }
      → Error: Cannot read property 'map'
   
   ✅ const data = await getApprovedListings();
      setListings(data);
      → listings будет Array
      → Работает!
*/

// ============================================
// ТЕСТ 6: Логирование для отладки
// ============================================

export function ListingsDebug() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        console.log('🔄 Начинаем загрузку объявлений...');
        const data = await getApprovedListings();
        console.log('✅ Получены объявления:', data);
        console.log(`   Количество: ${data.length}`);
        console.log('   Первое:', data[0]);
        setListings(data);
      } catch (err) {
        console.error('❌ Ошибка загрузки:', err);
        console.error('   Сообщение:', err.message);
        console.error('   Stack:', err.stack);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return <div>Loaded {listings.length} items</div>;
}

// ============================================
// ТЕСТ 7: Симуляция задержки для тестирования loading
// ============================================

// Используйте для тестирования спиннеров и disabled состояния

export function AddListingDebug() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Симулируем задержку 3 секунды
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Отправка завершена');
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <button disabled={isLoading}>
        {isLoading ? '⏳ Отправляется...' : '✅ Отправить'}
      </button>
    </form>
  );
}

// ============================================
// ТЕСТ 8: Правильное состояние при загрузке
// ============================================

// ❌ БЫЛО - состояния не включены
export function AdminPanelOld() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    setListings(getAllListings()); // ← Promise!
  }, []);

  return <div>{listings.length}</div>; // ← NaN
}

// ✅ ИСПРАВЛЕНО - все состояния
export function AdminPanelNew() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllListings();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoadingId(id);
      await deleteListing(id);
      await loadListings();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) return <p>⏳ Загрузка...</p>;
  if (error) return <p>❌ {error}</p>;

  return (
    <div>
      {listings.map(item => (
        <div key={item.id}>
          {item.title}
          <button 
            onClick={() => handleDelete(item.id)}
            disabled={loadingId === item.id}
          >
            {loadingId === item.id ? '⏳' : '🗑️'}
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// ТЕСТ 9: Обновление после операции
// ============================================

// Все операции должны обновлять список

const operations = {
  // После добавления
  addListing: async (data) => {
    const result = await addListing(data);
    // ← Нужно: вызвать onListingAdded() или refresh()
    return result;
  },

  // После одобрения
  toggleApproval: async (id) => {
    await toggleApproval(id);
    // ← Нужно: await loadAllListings()
  },

  // После удаления
  deleteListing: async (id) => {
    await deleteListing(id);
    // ← Нужно: await loadAllListings()
  },
};

// ============================================
// ТЕСТ 10: ПОЛНЫЙ РАБОЧИЙ ПРИМЕР
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { getApprovedListings, addListing, toggleApproval, deleteListing } from '../store';

export function CompleteExample() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Загружаем объявления при монтировании
  useEffect(() => {
    refresh();
  }, []);

  // 2. Функция для загрузки
  const refresh = async () => {
    try {
      setLoading(true);
      const data = await getApprovedListings();
      setListings(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Функция для добавления
  const handleAdd = async (data) => {
    try {
      await addListing(data);
      // Обновляем список после добавления
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  // 4. Функция для одобрения
  const handleApprove = async (id) => {
    try {
      await toggleApproval(id);
      // Обновляем список после одобрения
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  // 5. Функция для удаления
  const handleRemove = async (id) => {
    try {
      await deleteListing(id);
      // Обновляем список после удаления
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>⏳ Загрузка...</div>;
  if (error) return <div>❌ {error}</div>;

  return (
    <div>
      <h2>Объявления ({listings.length})</h2>
      {listings.map(item => (
        <div key={item.id}>
          <strong>{item.title}</strong>
          <p>{item.price} в {item.district}</p>
          <button onClick={() => handleApprove(item.id)}>
            {item.isApproved ? 'Снять' : 'Одобрить'}
          </button>
          <button onClick={() => handleRemove(item.id)}>Удалить</button>
        </div>
      ))}
    </div>
  );
}
