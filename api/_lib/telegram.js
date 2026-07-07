import { createHmac, timingSafeEqual } from "node:crypto";

const fallbackUser = {
  id: 1042,
  first_name: "Bari",
  username: "coffee_friend",
  language_code: "en",
};

export class TelegramAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "TelegramAuthError";
  }
}

function optionalEnv(name) {
  return process.env[name] ? String(process.env[name]).trim() : "";
}

function shouldRequireTelegramAuth() {
  return optionalEnv("TELEGRAM_AUTH_REQUIRED").toLowerCase() === "true";
}

function getInitData(req, body = {}) {
  return req.headers["x-telegram-init-data"] || body.initData || "";
}

function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash") || "";
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  return { hash, params, dataCheckString };
}

function verifyInitData(initData, botToken) {
  const { hash, dataCheckString } = parseInitData(initData);
  if (!hash || !dataCheckString) return false;

  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = createHmac("sha256", secret).update(dataCheckString).digest("hex");

  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(calculated, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function userFromInitData(initData) {
  const { params } = parseInitData(initData);
  const userJson = params.get("user");
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function extractTelegramUser(req, body = {}) {
  const initData = getInitData(req, body);
  const botToken = optionalEnv("TELEGRAM_BOT_TOKEN");

  if (initData && botToken) {
    if (!verifyInitData(initData, botToken)) {
      throw new TelegramAuthError("Invalid Telegram initData signature");
    }

    const user = userFromInitData(initData);
    if (user?.id) return user;
  }

  if (shouldRequireTelegramAuth()) {
    throw new TelegramAuthError("Telegram initData is required");
  }

  const fromHeader = req.headers["x-telegram-user"];
  if (fromHeader) {
    try {
      return JSON.parse(fromHeader);
    } catch {
      return fallbackUser;
    }
  }

  if (body.telegramUser) return body.telegramUser;

  return fallbackUser;
}
