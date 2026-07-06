const keys = {
  cart: "sfaa-cart",
  favorites: "sfaa-favorites",
  language: "sfaa-language",
  loyalty: "sfaa-loyalty-card",
  orders: "sfaa-orders",
};

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getSavedLanguage() {
  return localStorage.getItem(keys.language);
}

export function saveLanguage(language) {
  localStorage.setItem(keys.language, language);
}

export function getCart() {
  return readJson(keys.cart, {});
}

export function saveCart(cart) {
  writeJson(keys.cart, cart);
}

export function getFavorites() {
  return readJson(keys.favorites, []);
}

export function saveFavorites(favorites) {
  writeJson(keys.favorites, favorites);
}

export function getOrders() {
  return readJson(keys.orders, []);
}

export function saveOrders(orders) {
  writeJson(keys.orders, orders);
}

export function getOrCreateLoyalty(telegramUser) {
  const saved = readJson(keys.loyalty, null);
  if (saved) {
    return {
      digits: saved.digits || String(saved.number || "1042").replace(/\D/g, "").slice(-4).padStart(4, "0"),
      points: Number(saved.points || 108),
      level: saved.level || "Morning",
    };
  }

  const digits = `${telegramUser.id || Date.now()}`.slice(-4).padStart(4, "0");
  const card = { digits, points: 108, level: "Morning" };
  saveLoyalty(card);
  return card;
}

export function saveLoyalty(card) {
  writeJson(keys.loyalty, card);
}
