function optionalEnv(name) {
  return process.env[name] ? String(process.env[name]).trim() : "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatMoney(value) {
  return `${Math.max(0, Math.round(Number(value) || 0))} ₽`;
}

function formatOrderMessage({ order, user }) {
  const target =
    order.mode === "now"
      ? `Стол ${order.tableNumber || "-"}`
      : `Предзаказ через ${order.preorderMinutes || "-"} мин`;
  const payment = order.paymentMethod === "cash" ? "наличные" : "карта";
  const customer = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "Telegram user";
  const items = order.items
    .map((item) => `• ${escapeHtml(item.title)} x${item.quantity} — ${formatMoney(item.lineTotal)}`)
    .join("\n");

  return [
    "<b>Новый заказ сфаауу</b>",
    "",
    `<b>Клиент:</b> ${escapeHtml(customer)}${user?.username ? ` (@${escapeHtml(user.username)})` : ""}`,
    `<b>Формат:</b> ${escapeHtml(target)}`,
    `<b>Оплата:</b> ${escapeHtml(payment)}`,
    `<b>Сумма:</b> ${formatMoney(order.total)}`,
    order.pointsSpent ? `<b>Баллами:</b> ${formatMoney(order.pointsSpent)}` : "",
    order.comment ? `<b>Комментарий:</b> ${escapeHtml(order.comment)}` : "",
    "",
    "<b>Состав:</b>",
    items || "Нет позиций",
    "",
    `<code>${escapeHtml(order.id)}</code>`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function notifyOrderCreated(orderResult, user) {
  const token = optionalEnv("TELEGRAM_ORDER_BOT_TOKEN") || optionalEnv("TELEGRAM_BOT_TOKEN");
  const chatId = optionalEnv("TELEGRAM_ORDER_CHAT_ID") || optionalEnv("TELEGRAM_ADMIN_CHAT_ID");

  if (!token || !chatId) {
    return { skipped: true, reason: "missing_telegram_order_env" };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatOrderMessage({ order: orderResult.order, user }),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Telegram order notification failed: ${response.status} ${details}`);
  }

  return response.json();
}
