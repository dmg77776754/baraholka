// Telegram WebApp integration helper

interface TelegramWebApp {
  initDataUnsafe?: {
    user?: {
      id: number;
      username?: string;
      first_name?: string;
    };
  };
  ready: () => void;
  expand: () => void;
  MainButton: {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (fn: () => void) => void;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getTelegramUser() {
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user) {
    return {
      id: tg.initDataUnsafe.user.id,
      username: tg.initDataUnsafe.user.username,
      firstName: tg.initDataUnsafe.user.first_name,
    };
  }
  return null;
}

export function initTelegram() {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
  }
}

export function isTelegramEnv(): boolean {
  return !!window.Telegram?.WebApp?.initDataUnsafe?.user;
}

export function getContactLink(contact: string): string {
  if (contact.startsWith('@')) {
    return `https://t.me/${contact.slice(1)}`;
  }
  if (contact.startsWith('+') || /^\d/.test(contact)) {
    return `tel:${contact.replace(/[\s\-()]/g, '')}`;
  }
  return `https://t.me/${contact}`;
}

export function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Если указано +7... или 8...
  if (/^\+?7\d{10}$/.test(cleaned)) {
    return `+${cleaned.replace(/^\+?/, '')}`;
  }

  // Российский номер с ведущей 8
  if (/^8\d{10}$/.test(cleaned)) {
    return `+7${cleaned.slice(1)}`;
  }

  // Номер без кода страны (10 цифр) — считаем российским
  if (/^\d{10}$/.test(cleaned)) {
    return `+7${cleaned}`;
  }

  // Другие форматы: попробуем принять +<цифры> от 10 до 15
  if (/^\+\d{10,15}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

export function isValidPhone(phone: string): boolean {
  return normalizePhone(phone) !== null;
}

export function normalizeTelegramUsername(username: string): string | null {
  if (!username) return null;
  const clean = username.startsWith('@') ? username.slice(1) : username;
  if (!/^[a-zA-Z0-9_]{5,32}$/.test(clean)) return null;
  return clean;
}

export function isValidTelegramUsername(username: string): boolean {
  return normalizeTelegramUsername(username) !== null;
}

export function getPhoneLink(phone: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return '#';
  return `tel:${normalized}`;
}

export function getTelegramLink(username: string): string {
  const clean = normalizeTelegramUsername(username) || username;
  return `https://t.me/${clean}`;
}

export function openExternalLink(url: string) {
  const tg = window.Telegram?.WebApp;
  if (tg?.openLink) {
    tg.openLink(url);
    return;
  }
  window.open(url, '_blank');
}
