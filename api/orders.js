import { json, readBody } from "./_lib/response.js";
import { notifyOrderCreated } from "./_lib/notifications.js";
import { createOrder } from "./_lib/supabase.js";
import { extractTelegramUser, TelegramAuthError } from "./_lib/telegram.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const body = await readBody(req);
    const telegramUser = extractTelegramUser(req, body);
    const result = await createOrder(telegramUser, body);

    try {
      await notifyOrderCreated(result, telegramUser);
    } catch (error) {
      console.error("Order notification failed:", error);
    }

    return json(res, 200, result);
  } catch (error) {
    if (error instanceof TelegramAuthError) {
      return json(res, 401, { error: "Telegram authorization failed" });
    }
    throw error;
  }
}
