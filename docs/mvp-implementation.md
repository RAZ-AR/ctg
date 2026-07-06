# Coffee Telegram Mini App MVP

## Current Prototype

- Frontend: live mobile mini app UI in `index.html`, `src/app.js`, and `src/styles.css`.
- Runtime now: Vercel production frontend plus serverless API routes under `api/`.
- Data now: user session, loyalty card, favorites, orders, and menu catalog are stored in Supabase.
- UI flows: home, product details modal, favorites, cart, now/preorder, table buttons, payment method, points spend, profile, order history, RU/SR/EN switching.
- Menu source: backend can seed from local menu data and now supports Google Sheets CSV sync with cache fallback.

## Next Build Order

1. Connect a real Google Sheet and fill it with production menu data, image URLs, badges, and availability.
2. Add Telegram order notification delivery for the venue using `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID`.
3. Add venue/admin order screen and `PATCH /api/admin/orders/:orderId` status workflow.
4. Replace soft Telegram fallback with strict `initData` validation in production mode.
5. Connect the final Mini App URL in BotFather and test from a real Telegram chat.
6. Add production product assets in storage and replace placeholder imagery in cards.

## Access Needed Next

1. Google Sheets:
   - either a published sheet id for CSV export,
   - or editor access to the menu sheet you want to use.
2. Telegram:
   - bot token,
   - admin chat id where new orders should arrive,
   - Mini App URL update in BotFather when we are ready.
3. Content:
   - final menu rows in the CSV format from `docs/google-sheets-menu-template.csv`,
   - final image URLs for products and promos.

## Runtime Flow

1. Telegram opens the Mini App and passes user data plus `language_code`.
2. Frontend calls backend with Telegram `initData`.
3. Backend validates `initData`, finds or creates the user and loyalty card.
4. Frontend loads menu items from the published menu API.
5. User adds items, favorites, table/preorder settings, payment method, points, and comment.
6. Backend creates an order, applies points rules, stores order items, and notifies the venue.
7. Profile reads loyalty state and order history from Supabase.

## Minimal API Endpoints

- `POST /api/session`
  Validates Telegram `initData`, returns user, loyalty card, and preferred language.

- `GET /api/menu?lang=ru`
  Returns categories, products, prices, availability, images, badges, and recommendations.

- `GET /api/me`
  Returns profile, loyalty card, favorites, and latest orders.

- `PUT /api/favorites/:productId`
  Toggles favorite for current Telegram user.

- `POST /api/orders`
  Creates an order with items, table/preorder, payment method, points spend, and comment.

- `PATCH /api/admin/orders/:orderId`
  Venue updates status: `new`, `accepted`, `preparing`, `ready`, `completed`, `cancelled`.

## Production Notes

- Supabase and Vercel are already connected for the current MVP runtime.
- `GOOGLE_SHEETS_MENU_ID` enables menu sync; `GOOGLE_SHEETS_MENU_GID` defaults to `0`.
- If Google Sheets is unavailable, backend keeps serving the last seeded catalog from Supabase.
- Never trust Telegram user fields from the browser without backend `initData` validation.
- Store product price snapshots in order items so old orders stay accurate after menu price changes.
- Keep Google Sheets as the staff-friendly source, but serve menu through backend/cache for speed.
- Use Supabase Row Level Security once real auth/session handling is in place.
