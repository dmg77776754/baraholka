// МИНИМАЛЬНЫЙ РАБОЧИЙ ПРИМЕР всех компонентов

// ============================================
// 1. КОМПОНЕНТ LISTINGS (минимум кода)
// ============================================

import { useState, useEffect } from 'react';
import { getApprovedListings } from '../store';

export function ListingsExample() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // КЛЮЧЕВОЙ МОМЕНТ: используем async в отдельной функции
    (async () => {
      try {
        const data = await getApprovedListings();
        setListings(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // Пустой массив = запуск только один раз при монтировании

  if (loading) return <p>⏳ Загрузка...</p>;
  if (listings.length === 0) return <p>📭 Нет объявлений</p>;

  return (
    <ul>
      {listings.map(item => (
        <li key={item.id}>
          <strong>{item.title}</strong> - {item.price} в {item.district}
        </li>
      ))}
    </ul>
  );
}

// ============================================
// 2. КОМПОНЕНТ CreateListingForm (ключевые части)
// ============================================

import { addListing } from '../store';

export function CreateListingFormExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      
      // КЛЮЧЕВОЙ МОМЕНТ: Await для добавления объявления
      await addListing({
        title: 'Продам велосипед',
        description: 'Красивый велосипед',
        price: '5000₽',
        category: 'sell',
        product_category: 'auto', // snake_case!
        district: 'pervomayskoe',
        photos: [],
        contact: '@myusername',
        contact_telegram: '@myusername',
      });
      
      alert('✅ Объявление добавлено!');
    } catch (err) {
      setError(err.message || 'Ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
      <button disabled={isLoading}>
        {isLoading ? 'Загрузка...' : 'Добавить объявление'}
      </button>
    </form>
  );
}

// ============================================
// 3. КОМПОНЕНТ AdminPanel (ключевые части)
// ============================================

import { getAllListings, toggleApproval, deleteListing } from '../store';

export function AdminPanelExample() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadListings = async () => {
    try {
      setLoading(true);
      // КЛЮЧЕВОЙ МОМЕНТ: Await для загрузки
      const data = await getAllListings();
      setListings(data);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      // КЛЮЧЕВОЙ МОМЕНТ: Await для действия
      await toggleApproval(id);
      // КЛЮЧЕВОЙ МОМЕНТ: Обновить список
      await loadListings();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить?')) return;
    try {
      await deleteListing(id);
      await loadListings();
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  return (
    <div>
      <button onClick={loadListings}>
        {loading ? 'Загрузка...' : 'Загрузить объявления'}
      </button>
      <ul>
        {listings.map(item => (
          <li key={item.id}>
            {item.title}
            <button onClick={() => handleToggle(item.id)}>
              {item.isApproved ? 'Снять' : 'Одобрить'}
            </button>
            <button onClick={() => handleDelete(item.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// ОСНОВНЫЕ ПАТТЕРНЫ ДЛЯ ЗАПОМИНАНИЯ
// ============================================

/*
1️⃣ ПРАВИЛЬНО: async/await в useEffect
   
   useEffect(() => {
     const load = async () => {
       const data = await fetchData();
       setData(data);
     };
     load();
   }, []);

2️⃣ ПРАВИЛЬНО: async функция при клике

   const handleClick = async () => {
     try {
       await someAsyncAction();
       refresh();
     } catch (err) {
       setError(err.message);
     }
   };

3️⃣ ПРАВИЛЬНО: snake_case имена из store.ts

   await addListing({
     product_category: 'electronics',  // ✅
     contact_telegram: '@user',        // ✅
     telegram_user_id: 123,            // ✅
   });

4️⃣ НЕПРАВИЛЬНО: забыли await

   const data = getApprovedListings(); // ❌ Promise, не массив!
   const items = data.map(...);        // ❌ Ошибка!

5️⃣ НЕПРАВИЛЬНО: async в useEffect напрямую

   useEffect(async () => {  // ❌ ОШИБКА!
     const data = await fetch();
     setData(data);
   }, []);
*/

// ============================================
// ИНТЕГРАЦИЯ В App.tsx
// ============================================

/*
import { useCallback, useState, useEffect } from 'react';

export function App() {
  const [page, setPage] = useState('feed');

  // ✅ ПРАВИЛЬНЫЙ ПАТТЕРН
  const refresh = useCallback(async () => {
    try {
      const data = await getApprovedListings();
      setListings(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div>
      {page === 'feed' && <Listings />}
      {page === 'create' && (
        <CreateListingForm 
          onClose={() => setPage('feed')}
          onListingAdded={refresh}  // ← Обновляет после добавления
        />
      )}
      {page === 'admin' && <AdminPanel onClose={() => setPage('feed')} />}
    </div>
  );
}
*/
