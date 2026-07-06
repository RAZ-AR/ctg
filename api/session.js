import { getOrCreateUser } from "./_lib/mockState.js";
import { json, readBody } from "./_lib/response.js";
import { extractTelegramUser } from "./_lib/telegram.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const body = await readBody(req);
  const telegramUser = extractTelegramUser(req, body);
  const profile = getOrCreateUser(telegramUser);

  return json(res, 200, profile);
}
