import { menu, tableNumbers } from "../../src/menuData.js";

const baseMenu = menu.map((item) => ({
  ...item,
  imageUrl: "",
  isAvailable: true,
  isRecommended: ["flat", "ice", "salt"].includes(item.id),
}));

const users = new Map();

function makeUser(init = {}) {
  const telegramId = Number(init.id || Date.now());
  const firstName = init.first_name || "Guest";
  const username = init.username || `guest_${String(telegramId).slice(-4)}`;
  const languageCode = (init.language_code || "en").slice(0, 2).toLowerCase();
  const digits = String(telegramId).slice(-4).padStart(4, "0");

  return {
    user: {
      telegramId,
      firstName,
      username,
      languageCode,
    },
    loyalty: {
      digits,
      points: 108,
      level: "Morning",
    },
    favorites: [],
    orders: [],
  };
}

export function getOrCreateUser(telegramUser) {
  const key = Number(telegramUser.id || 1042);
  if (!users.has(key)) {
    users.set(key, makeUser(telegramUser));
  }

  return users.get(key);
}

export function getProfile(telegramUser) {
  return getOrCreateUser(telegramUser);
}

export function getMenuResponse() {
  return {
    products: baseMenu,
    filters: ["all", "coffee", "cold", "tea", "food"],
    tables: tableNumbers,
  };
}

export function toggleFavoriteProduct(telegramUser, productId) {
  const profile = getOrCreateUser(telegramUser);
  profile.favorites = profile.favorites.includes(productId)
    ? profile.favorites.filter((id) => id !== productId)
    : [...profile.favorites, productId];
  return profile.favorites;
}

export function createMockOrder(telegramUser, payload) {
  const profile = getOrCreateUser(telegramUser);
  const items = (payload.items || [])
    .map((line) => {
      const product = baseMenu.find((item) => item.id === line.productId);
      if (!product || !line.quantity) return null;
      return {
        productId: product.id,
        title: product.title,
        quantity: line.quantity,
        unitPrice: product.price,
        lineTotal: product.price * line.quantity,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const pointsSpent = Math.max(0, Math.min(Number(payload.pointsToSpend) || 0, profile.loyalty.points, Math.floor(subtotal * 0.4)));
  const total = Math.max(0, subtotal - pointsSpent);

  const order = {
    id: `SF-${Date.now().toString().slice(-6)}`,
    status: "new",
    createdAt: new Date().toISOString(),
    mode: payload.mode || "now",
    tableNumber: payload.tableNumber || null,
    preorderMinutes: payload.preorderMinutes || null,
    paymentMethod: payload.paymentMethod || "card",
    pointsSpent,
    subtotal,
    total,
    comment: payload.comment || "",
    items,
  };

  profile.loyalty.points = Math.max(0, profile.loyalty.points - pointsSpent) + Math.floor(total / 20);
  profile.orders = [order, ...profile.orders].slice(0, 20);

  return {
    order,
    loyalty: profile.loyalty,
  };
}
