# сфаауу Coffee Telegram Mini App

Prototype and MVP scaffold for a Telegram Mini App coffee ordering flow.

## What Is Built

- Light gradient mobile UI.
- Telegram user fallback and language detection.
- RU / Serbian Latin / EN language switcher.
- Menu with filters, product detail sheets, favorites, cart, table buttons, preorder, payment method, points spend, comments, profile, and order history.
- Mock persistence through `src/store.js`.
- Mock menu adapter through `src/menuData.js`.
- Future API client in `src/apiClient.js`.
- Supabase schema and API docs in `docs/`.

## Run Locally

The current prototype works as a static app:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/
```

## Key Files

- `index.html` — static entrypoint.
- `src/app.js` — UI state and screens.
- `src/styles.css` — visual system.
- `src/menuData.js` — mock menu data adapter.
- `src/store.js` — local prototype store adapter.
- `src/apiClient.js` — future backend API client.
- `docs/supabase-schema.sql` — database schema draft.
- `docs/google-sheets-menu-template.csv` — staff-friendly menu source template.
- `docs/api-contract.md` — backend endpoint contract.

## Next Engineering Step

Implement the backend:

1. Create Supabase project and run `docs/supabase-schema.sql`.
2. Build `/api/session` with Telegram `initData` validation.
3. Build `/api/menu` from Google Sheets or Supabase.
4. Replace `src/store.js` local persistence with API-backed reads/writes.
5. Wire `src/apiClient.js` into the app boot and order creation flow.

Do not trust Telegram user fields from the browser until backend `initData` validation is in place.
