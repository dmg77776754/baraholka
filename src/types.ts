export type Category = 'sell' | 'buy' | 'free' | 'services';
export type ProductCategory = 
  | 'electronics' | 'furniture' | 'clothing' | 'kids' | 'auto' 
  | 'garden' | 'pets' | 'food' | 'realty' | 'beauty' | 'sport' | 'other';
export type District = 'pervomayskoe' | 'kivenappa';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  category: Category;
  productCategory: ProductCategory;
  district: District;
  photos: string[]; // base64 data URLs
  contact: string; // legacy field for backward compat
  contactTelegram?: string; // @username
  contactPhone?: string; // +7 900 000-00-00
  telegramUserId?: number;
  telegramUsername?: string;
  isApproved: boolean;
  createdAt: number; // timestamp
}

export const CATEGORY_LABELS: Record<Category, string> = {
  sell: 'Продам',
  buy: 'Куплю',
  free: 'Отдам',
  services: 'Услуги',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  sell: 'bg-blue-100 text-blue-700',
  buy: 'bg-green-100 text-green-700',
  free: 'bg-orange-100 text-orange-700',
  services: 'bg-purple-100 text-purple-700',
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  electronics: '📱 Электроника',
  furniture: '🪑 Мебель',
  clothing: '👕 Одежда',
  kids: '🧸 Детское',
  auto: '🚗 Авто',
  garden: '🌱 Сад и огород',
  pets: '🐾 Животные',
  food: '🥕 Продукты',
  realty: '🏠 Недвижимость',
  beauty: '💄 Красота',
  sport: '⚽ Спорт',
  other: '📦 Другое',
};

export const PRODUCT_CATEGORY_ICONS: Record<ProductCategory, string> = {
  electronics: '📱',
  furniture: '🪑',
  clothing: '👕',
  kids: '🧸',
  auto: '🚗',
  garden: '🌱',
  pets: '🐾',
  food: '🥕',
  realty: '🏠',
  beauty: '💄',
  sport: '⚽',
  other: '📦',
};

export const DISTRICT_LABELS: Record<District, string> = {
  pervomayskoe: 'Первомайское',
  kivenappa: 'Кивеннапа',
};

