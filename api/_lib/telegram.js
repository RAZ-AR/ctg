export function extractTelegramUser(req, body = {}) {
  const fromHeader = req.headers["x-telegram-user"];
  if (fromHeader) {
    try {
      return JSON.parse(fromHeader);
    } catch {
      return { id: 1042, first_name: "Bari", username: "coffee_friend", language_code: "en" };
    }
  }

  if (body.telegramUser) return body.telegramUser;

  return {
    id: 1042,
    first_name: "Bari",
    username: "coffee_friend",
    language_code: "en",
  };
}
