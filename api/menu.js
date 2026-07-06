import { json } from "./_lib/response.js";
import { getMenu } from "./_lib/supabase.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  return json(res, 200, await getMenu(req.query?.lang));
}
