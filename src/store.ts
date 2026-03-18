// src/store.ts
import { supabase } from './supabase';
import type { Listing, Category, ProductCategory, District } from './types';

// Получить все одобренные объявления
export async function getApprovedListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Получить все объявления
export async function getAllListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Добавить объявление
export async function addListing(data: {
  title: string;
  description: string;
  price: string;
  category: Category;
  product_category: ProductCategory; // ⚠️ имя как в базе
  district: District;
  photos: string[];
  contact: string;
  contact_telegram?: string;
  contact_phone?: string;
  user_id: string;
  telegram_username?: string;
}): Promise<Listing> {
  const listingData = {
    ...data,
    telegram_user_id: data.user_id, // Map user_id to telegram_user_id in database
    is_approved: false,
    created_at: new Date().toISOString(),
  };

  const { data: insertedData, error } = await supabase
    .from('listings')
    .insert([listingData])
    .select()
    .single();

  if (error) throw error;
  return insertedData as Listing;
}

// Переключить одобрение объявления
export async function toggleApproval(id: string): Promise<void> {
  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('is_approved')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from('listings')
    .update({ is_approved: !listing.is_approved })
    .eq('id', id);

  if (error) throw error;
}

// Удалить объявление
export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Получить свои объявления (по telegram_user_id)
export async function getMyListings(telegramUserId: number): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Обновить своё объявление (редактирование) с проверкой владельца
export async function updateMyListing(
  id: string,
  userId: string,
  updateData: {
    title?: string;
    description?: string;
    price?: string;
    photos?: string[];
    contact_telegram?: string;
    contact_phone?: string;
  }
): Promise<Listing> {
  // Проверяем что объявление принадлежит пользователю
  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('telegram_user_id, is_approved')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;
  if (listing.telegram_user_id !== userId) {
    throw new Error('Вы не можете редактировать чужое объявление');
  }

  // Если объявление было одобрено, после редактирования отправляем на модерацию
  const finalUpdateData = {
    ...updateData,
    ...(listing.is_approved ? { is_approved: false } : {}),
  };

  // Обновляем объявление
  const { data, error } = await supabase
    .from('listings')
    .update(finalUpdateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Listing;
}

// Обновить объявление (редактирование) БЕЗ проверки - для admin
export async function updateListing(
  id: string,
  updateData: {
    title?: string;
    description?: string;
    price?: string;
    photos?: string[];
    contact_telegram?: string;
    contact_phone?: string;
  }
): Promise<Listing> {
  const { data, error } = await supabase
    .from('listings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Listing;
}

// Удалить своё объявление (с проверкой принадлежности)
export async function deleteMyListing(id: string, userId: string): Promise<void> {
  // Проверяем что объявление принадлежит пользователю
  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('telegram_user_id')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;
  if (listing.telegram_user_id !== userId) {
    throw new Error('Вы не можете удалить чужое объявление');
  }

  // Удаляем объявление
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Функции для избранных объявлений

// Добавить в избранное
export async function addToFavorites(listingId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      listing_id: listingId,
    });

  if (error) {
    // Если уже в избранном, игнорируем ошибку
    if (error.code === '23505') return; // unique_violation
    throw error;
  }
}

// Удалить из избранного
export async function removeFromFavorites(listingId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('listing_id', listingId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Проверить, в избранном ли объявление
export async function isFavorite(listingId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('listing_id', listingId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return !!data;
}

// Получить избранные объявления пользователя
export async function getFavorites(userId: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      listing_id,
      listings (
        id,
        title,
        description,
        price,
        category,
        product_category,
        district,
        photos,
        contact,
        contact_telegram,
        contact_phone,
        telegram_user_id,
        telegram_username,
        is_approved,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Извлекаем объявления из результата
  return data
    .map((item: any) => item.listings)
    .filter((listing: any) => listing && listing.is_approved) as Listing[];
}