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

export function getTelegramLink(username: string): string {
  const clean = username.startsWith('@') ? username.slice(1) : username;
  return `https://t.me/${clean}`;
}

export function getPhoneLink(phone: string): string {
  return `tel:${phone.replace(/[\s\-()]/g, '')}`;
}
