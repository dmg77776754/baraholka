import { v4 as uuidv4 } from 'uuid';
import type { Listing, Category, ProductCategory, District } from './types';

const STORAGE_KEY = 'baraholka_listings_v3';

const DEMO_LISTINGS: Listing[] = [];

function getAll(): Listing[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_LISTINGS));
    return DEMO_LISTINGS;
  }
  return JSON.parse(raw) as Listing[];
}

function saveAll(listings: Listing[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

export function getApprovedListings(): Listing[] {
  return getAll()
    .filter((l) => l.isApproved)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllListings(): Listing[] {
  return getAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function addListing(data: {
  title: string;
  description: string;
  price: string;
  category: Category;
  productCategory: ProductCategory;
  district: District;
  photos: string[];
  contact: string;
  contactTelegram?: string;
  contactPhone?: string;
  telegramUserId?: number;
  telegramUsername?: string;
}): Listing {
  const listing: Listing = {
    id: uuidv4(),
    ...data,
    isApproved: false,
    createdAt: Date.now(),
  };
  const all = getAll();
  all.push(listing);
  saveAll(all);
  return listing;
}

export function toggleApproval(id: string): void {
  const all = getAll();
  const item = all.find((l) => l.id === id);
  if (item) {
    item.isApproved = !item.isApproved;
    saveAll(all);
  }
}

export function deleteListing(id: string): void {
  const all = getAll().filter((l) => l.id !== id);
  saveAll(all);
}
