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
  telegram_user_id?: number;
  telegram_username?: string;
}): Promise<Listing> {
  const listingData = {
    ...data,
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
  telegramUserId: number,
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
    .select('telegram_user_id')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;
  if (listing.telegram_user_id !== telegramUserId) {
    throw new Error('Вы не можете редактировать чужое объявление');
  }

  // Обновляем объявление
  const { data, error } = await supabase
    .from('listings')
    .update(updateData)
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
export async function deleteMyListing(id: string, telegramUserId: number): Promise<void> {
  // Проверяем что объявление принадлежит пользователю
  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('telegram_user_id')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;
  if (listing.telegram_user_id !== telegramUserId) {
    throw new Error('Вы не можете удалить чужое объявление');
  }

  // Удаляем объявление
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}