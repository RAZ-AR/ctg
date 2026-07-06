import { toggleFavoriteProduct } from "../_lib/mockState.js";
import { json, readBody } from "../_lib/response.js";
import { extractTelegramUser } from "../_lib/telegram.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "PUT") return json(res, 405, { error: "Method not allowed" });

  const body = await readBody(req);
  const telegramUser = extractTelegramUser(req, body);
  const productId = req.query?.productId;

  if (!productId) return json(res, 400, { error: "Missing product id" });

  return json(res, 200, {
    favorites: toggleFavoriteProduct(telegramUser, productId),
  });
}
