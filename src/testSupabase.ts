import { getApprovedListings, addListing } from './store';

async function testSupabase() {
  console.log('--- Тест Supabase ---');

  // Получаем одобренные объявления
  const listings = await getApprovedListings();
  console.log('Approved listings:', listings);

  // Добавляем тестовое объявление
  const newAd = await addListing({
    title: 'Тестовое объявление',
    description: 'Описание теста',
    price: '100',
    category: 'sell',
    product_category: 'other',
    district: 'pervomayskoe',
    photos: [],
    contact: 'testuser',
  });
  console.log('Inserted listing:', newAd);
}

// testSupabase(); // Disabled - was adding test listings infinitely