import { json } from "./_lib/response.js";
import { getOrCreateUserProfile } from "./_lib/supabase.js";
import { extractTelegramUser } from "./_lib/telegram.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const telegramUser = extractTelegramUser(req);
  return json(res, 200, await getOrCreateUserProfile(telegramUser));
}
