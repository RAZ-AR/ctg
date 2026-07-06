import { getProfile } from "./_lib/mockState.js";
import { json } from "./_lib/response.js";
import { extractTelegramUser } from "./_lib/telegram.js";

export default function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const telegramUser = extractTelegramUser(req);
  return json(res, 200, getProfile(telegramUser));
}
