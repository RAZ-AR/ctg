import { filters, localized, menu, tableNumbers } from "../../src/menuData.js";

const allowedLanguages = new Set(["ru", "sr", "en"]);
const defaultPoints = 108;
const defaultLevel = "Morning";
const menuSyncTtlMs = 5 * 60 * 1000;

let lastMenuSyncAt = 0;
let lastMenuSyncMode = "seed";

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getBaseUrl() {
  return getEnv("SUPABASE_URL").replace(/\/$/, "");
}

function getServiceRoleKey() {
  return getEnv("SUPABASE_SERVICE_ROLE_KEY");
}

function getOptionalEnv(name) {
  const value = process.env[name];
  return value ? String(value).trim() : "";
}

function normalizeLanguage(languageCode) {
  const shortCode = String(languageCode || "en").slice(0, 2).toLowerCase();
  return allowedLanguages.has(shortCode) ? shortCode : "en";
}

function mapMenuRow(item, index) {
  const copy = localized.menu[item.id] || {};
  return {
    id: item.id,
    category: item.category,
    title: item.title,
    title_ru: item.title,
    title_sr: item.title,
    title_en: item.title,
    description_ru: copy.ru || "",
    description_sr: copy.sr || "",
    description_en: copy.en || "",
    price: item.price,
    image_url: "",
    badge: item.badge || null,
    sort_order: index,
    is_available: true,
    is_recommended: ["flat", "ice", "salt"].includes(item.id),
  };
}

async function supabaseRequest(path, { method = "GET", query = {}, body, headers = {} } = {}) {
  const url = new URL(`${getBaseUrl()}/rest/v1/${path}`);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method,
    headers: {
      apikey: getServiceRoleKey(),
      Authorization: `Bearer ${getServiceRoleKey()}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase ${method} ${path} failed: ${response.status} ${details}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function inFilter(values) {
  return `in.(${values.map((value) => `"${String(value).replaceAll('"', '\\"')}"`).join(",")})`;
}

function notInFilter(values) {
  return `not.${inFilter(values)}`;
}

function parseBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "").trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return fallback;
}

function parseInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCsv(text) {
  const rows = [];
  let currentCell = "";
  let currentRow = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      currentRow.push(currentCell);
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

function mapSheetRowToMenuProduct(headers, row) {
  const record = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
  if (!record.id) return null;

  return {
    id: record.id.trim(),
    category: record.category?.trim() || "coffee",
    title: record.title?.trim() || record.title_en?.trim() || record.id.trim(),
    title_ru: record.title_ru?.trim() || record.title?.trim() || record.id.trim(),
    title_sr: record.title_sr?.trim() || record.title?.trim() || record.id.trim(),
    title_en: record.title_en?.trim() || record.title?.trim() || record.id.trim(),
    description_ru: record.description_ru?.trim() || "",
    description_sr: record.description_sr?.trim() || "",
    description_en: record.description_en?.trim() || "",
    price: parseInteger(record.price, 0),
    image_url: record.image_url?.trim() || "",
    badge: record.badge?.trim() || null,
    sort_order: parseInteger(record.sort_order, 0),
    is_available: parseBoolean(record.is_available, true),
    is_recommended: parseBoolean(record.is_recommended, false),
  };
}

async function replaceMenuProducts(products) {
  await supabaseRequest("menu_products", {
    method: "POST",
    query: {
      on_conflict: "id",
      columns:
        "id,category,title,title_ru,title_sr,title_en,description_ru,description_sr,description_en,price,image_url,badge,sort_order,is_available,is_recommended",
    },
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: products,
  });

  if (products.length) {
    await supabaseRequest("menu_products", {
      method: "PATCH",
      query: {
        id: notInFilter(products.map((product) => product.id)),
      },
      headers: {
        Prefer: "return=minimal",
      },
      body: {
        is_available: false,
      },
    });
  }
}

async function syncMenuFromGoogleSheets() {
  const sheetId = getOptionalEnv("GOOGLE_SHEETS_MENU_ID");
  if (!sheetId) return false;

  const gid = getOptionalEnv("GOOGLE_SHEETS_MENU_GID") || "0";
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${encodeURIComponent(gid)}`;
  const response = await fetch(csvUrl);

  if (!response.ok) {
    throw new Error(`Google Sheets menu export failed: ${response.status}`);
  }

  const csvText = await response.text();
  const rows = parseCsv(csvText);
  const [headerRow, ...bodyRows] = rows;

  if (!headerRow?.length) {
    throw new Error("Google Sheets menu export is empty");
  }

  const headers = headerRow.map((header) => header.trim());
  const products = bodyRows
    .map((row) => mapSheetRowToMenuProduct(headers, row))
    .filter(Boolean);

  if (!products.length) {
    throw new Error("Google Sheets menu export has no valid products");
  }

  await replaceMenuProducts(products);
  lastMenuSyncAt = Date.now();
  lastMenuSyncMode = "google-sheets";
  return true;
}

export function getMenuFilters() {
  return filters.flat().map((key) => key);
}

export function getTableNumbers() {
  return tableNumbers;
}

function mapProductForClient(product, language) {
  const code = normalizeLanguage(language);
  const title = product[`title_${code}`] || product.title;
  const description = product[`description_${code}`] || "";

  return {
    id: product.id,
    category: product.category,
    title,
    description,
    price: product.price,
    imageUrl: product.image_url || "",
    badge: product.badge,
    isAvailable: product.is_available,
    isRecommended: product.is_recommended,
  };
}

function mapOrderForClient(order, items) {
  return {
    id: order.id,
    status: order.status,
    createdAt: order.created_at,
    mode: order.mode,
    tableNumber: order.table_number,
    preorderMinutes: order.preorder_minutes,
    paymentMethod: order.payment_method,
    pointsSpent: order.points_spent,
    subtotal: order.subtotal,
    total: order.total,
    comment: order.comment || "",
    items: items.map((item) => ({
      productId: item.product_id,
      title: item.title_snapshot,
      quantity: item.quantity,
      unitPrice: item.unit_price_snapshot,
      lineTotal: item.line_total,
    })),
  };
}

export async function ensureMenuSeeded() {
  const existing = await supabaseRequest("menu_products", {
    query: { select: "id", limit: 1 },
  });

  if (Array.isArray(existing) && existing.length > 0) return;

  await replaceMenuProducts(menu.map(mapMenuRow));
}

async function ensureMenuCatalogReady() {
  if (Date.now() - lastMenuSyncAt < menuSyncTtlMs) return;

  try {
    const synced = await syncMenuFromGoogleSheets();
    if (synced) return;
  } catch (error) {
    console.error("Google Sheets menu sync failed:", error);
  }

  await ensureMenuSeeded();
  lastMenuSyncAt = Date.now();
  lastMenuSyncMode = "seed";
}

export async function getMenu(language) {
  await ensureMenuCatalogReady();

  const products = await supabaseRequest("menu_products", {
    query: {
      select:
        "id,category,title,title_ru,title_sr,title_en,description_ru,description_sr,description_en,price,image_url,badge,sort_order,is_available,is_recommended",
      order: "sort_order.asc",
    },
  });

  return {
    products: products.map((product) => mapProductForClient(product, language)),
    filters: getMenuFilters(),
    tables: getTableNumbers(),
    source: lastMenuSyncMode,
  };
}

export async function getOrCreateUserProfile(telegramUser) {
  await ensureMenuCatalogReady();

  const telegramId = Number(telegramUser.id || 1042);
  const languageCode = normalizeLanguage(telegramUser.language_code);
  const payload = {
    telegram_id: telegramId,
    username: telegramUser.username || `guest_${String(telegramId).slice(-4)}`,
    first_name: telegramUser.first_name || "Guest",
    last_name: telegramUser.last_name || null,
    language_code: languageCode,
    updated_at: new Date().toISOString(),
  };

  let user = await supabaseRequest("app_users", {
    query: {
      select: "*",
      telegram_id: `eq.${telegramId}`,
      limit: 1,
    },
  });

  if (!user.length) {
    user = await supabaseRequest("app_users", {
      method: "POST",
      query: { select: "*" },
      headers: {
        Prefer: "return=representation",
      },
      body: payload,
    });
  } else {
    user = await supabaseRequest("app_users", {
      method: "PATCH",
      query: {
        telegram_id: `eq.${telegramId}`,
        select: "*",
      },
      headers: {
        Prefer: "return=representation",
      },
      body: payload,
    });
  }

  const userRow = user[0];
  let loyalty = await supabaseRequest("loyalty_cards", {
    query: {
      select: "*",
      user_id: `eq.${userRow.id}`,
      limit: 1,
    },
  });

  if (!loyalty.length) {
    loyalty = await supabaseRequest("loyalty_cards", {
      method: "POST",
      query: { select: "*" },
      headers: {
        Prefer: "return=representation",
      },
      body: {
        user_id: userRow.id,
        card_digits: String(telegramId).slice(-4).padStart(4, "0"),
        points: defaultPoints,
        level: defaultLevel,
      },
    });
  }

  const loyaltyRow = loyalty[0];

  const favoriteRows = await supabaseRequest("user_favorites", {
    query: {
      select: "product_id",
      user_id: `eq.${userRow.id}`,
      order: "created_at.desc",
    },
  });

  const orderRows = await supabaseRequest("orders", {
    query: {
      select: "*",
      user_id: `eq.${userRow.id}`,
      order: "created_at.desc",
      limit: 20,
    },
  });

  const orderIds = orderRows.map((row) => row.id);
  const orderItems = orderIds.length
    ? await supabaseRequest("order_items", {
        query: {
          select: "*",
          order_id: inFilter(orderIds),
          order: "id.asc",
        },
      })
    : [];

  const itemsByOrderId = orderItems.reduce((acc, item) => {
    acc[item.order_id] ||= [];
    acc[item.order_id].push(item);
    return acc;
  }, {});

  return {
    user: {
      telegramId: userRow.telegram_id,
      firstName: userRow.first_name,
      username: userRow.username,
      languageCode: normalizeLanguage(userRow.language_code),
    },
    loyalty: {
      digits: loyaltyRow.card_digits,
      points: loyaltyRow.points,
      level: loyaltyRow.level,
    },
    favorites: favoriteRows.map((row) => row.product_id),
    orders: orderRows.map((row) => mapOrderForClient(row, itemsByOrderId[row.id] || [])),
    _internal: {
      userId: userRow.id,
      loyaltyCardId: loyaltyRow.id,
      loyaltyPoints: loyaltyRow.points,
    },
  };
}

export async function toggleFavorite(telegramUser, productId) {
  const profile = await getOrCreateUserProfile(telegramUser);

  const existing = await supabaseRequest("user_favorites", {
    query: {
      select: "product_id",
      user_id: `eq.${profile._internal.userId}`,
      product_id: `eq.${productId}`,
      limit: 1,
    },
  });

  if (existing.length) {
    await supabaseRequest("user_favorites", {
      method: "DELETE",
      query: {
        user_id: `eq.${profile._internal.userId}`,
        product_id: `eq.${productId}`,
      },
    });
  } else {
    await supabaseRequest("user_favorites", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: {
        user_id: profile._internal.userId,
        product_id: productId,
      },
    });
  }

  const updated = await supabaseRequest("user_favorites", {
    query: {
      select: "product_id",
      user_id: `eq.${profile._internal.userId}`,
      order: "created_at.desc",
    },
  });

  return updated.map((row) => row.product_id);
}

export async function createOrder(telegramUser, payload) {
  await ensureMenuCatalogReady();

  const profile = await getOrCreateUserProfile(telegramUser);
  const requestedItems = Array.isArray(payload.items) ? payload.items : [];
  const requestedIds = [...new Set(requestedItems.map((item) => item.productId).filter(Boolean))];

  const products = requestedIds.length
    ? await supabaseRequest("menu_products", {
        query: {
          select:
            "id,title,title_ru,title_sr,title_en,description_ru,description_sr,description_en,price,is_available",
          id: inFilter(requestedIds),
        },
      })
    : [];

  const productsById = new Map(products.map((product) => [product.id, product]));

  const items = requestedItems
    .map((line) => {
      const quantity = Number(line.quantity || 0);
      const product = productsById.get(line.productId);
      if (!product || !product.is_available || quantity <= 0) return null;

      return {
        productId: product.id,
        title: product.title,
        quantity,
        unitPrice: product.price,
        lineTotal: product.price * quantity,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const maxPoints = Math.min(profile._internal.loyaltyPoints, Math.floor(subtotal * 0.4));
  const pointsSpent = Math.max(0, Math.min(Number(payload.pointsToSpend) || 0, maxPoints));
  const total = Math.max(0, subtotal - pointsSpent);

  const insertedOrders = await supabaseRequest("orders", {
    method: "POST",
    query: { select: "*" },
    headers: {
      Prefer: "return=representation",
    },
    body: {
      user_id: profile._internal.userId,
      loyalty_card_id: profile._internal.loyaltyCardId,
      mode: payload.mode || "now",
      table_number: payload.mode === "now" ? payload.tableNumber || null : null,
      preorder_minutes: payload.mode === "preorder" ? Number(payload.preorderMinutes) || null : null,
      payment_method: payload.paymentMethod || "card",
      points_spent: pointsSpent,
      subtotal,
      total,
      comment: payload.comment || "",
    },
  });

  const orderRow = insertedOrders[0];

  if (items.length) {
    await supabaseRequest("order_items", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: items.map((item) => ({
        order_id: orderRow.id,
        product_id: item.productId,
        title_snapshot: item.title,
        unit_price_snapshot: item.unitPrice,
        quantity: item.quantity,
        line_total: item.lineTotal,
      })),
    });
  }

  const updatedPoints = Math.max(0, profile._internal.loyaltyPoints - pointsSpent) + Math.floor(total / 20);
  const updatedCards = await supabaseRequest("loyalty_cards", {
    method: "PATCH",
    query: {
      id: `eq.${profile._internal.loyaltyCardId}`,
      select: "*",
    },
    headers: {
      Prefer: "return=representation",
    },
    body: {
      points: updatedPoints,
      updated_at: new Date().toISOString(),
    },
  });

  return {
    order: mapOrderForClient(orderRow, items.map((item) => ({
      product_id: item.productId,
      title_snapshot: item.title,
      quantity: item.quantity,
      unit_price_snapshot: item.unitPrice,
      line_total: item.lineTotal,
    }))),
    loyalty: {
      digits: updatedCards[0].card_digits,
      points: updatedCards[0].points,
      level: updatedCards[0].level,
    },
  };
}
