const fallbackApiBaseUrl =
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "https://ctg-razars-projects.vercel.app"
    : "";

const apiBaseUrl = window.SFAA_API_BASE_URL || fallbackApiBaseUrl;
const telegramInitData = window.Telegram?.WebApp?.initData || "";

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(telegramInitData ? { "X-Telegram-Init-Data": telegramInitData } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export function createSession(initData) {
  return request("/api/session", {
    method: "POST",
    body: JSON.stringify({ initData }),
  });
}

export function fetchMenu(language) {
  return request(`/api/menu?lang=${encodeURIComponent(language)}`);
}

export function fetchProfile() {
  return request("/api/me");
}

export function toggleFavorite(productId) {
  return request(`/api/favorites/${encodeURIComponent(productId)}`, {
    method: "PUT",
  });
}

export function createOrder(payload) {
  return request("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
