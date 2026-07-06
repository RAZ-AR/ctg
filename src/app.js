import { addOns, assets, filters, localized, menu, tableNumbers } from "./menuData.js";
import {
  getCart,
  getFavorites,
  getOrCreateLoyalty,
  getOrders,
  getSavedLanguage,
  saveCart,
  saveFavorites,
  saveLanguage,
  saveLoyalty,
  saveOrders,
} from "./store.js";

const telegramUser =
  window.Telegram?.WebApp?.initDataUnsafe?.user ||
  { first_name: "Бари", username: "coffee_friend", id: 1042 };

const app = document.querySelector("#app");

const supportedLanguages = ["ru", "sr", "en"];
const telegramLanguage = (telegramUser.language_code || "").slice(0, 2).toLowerCase();
const savedLanguage = getSavedLanguage();
const initialLanguage = supportedLanguages.includes(savedLanguage)
  ? savedLanguage
  : supportedLanguages.includes(telegramLanguage)
    ? telegramLanguage
    : "en";

const i18n = {
  ru: {
    home: "дом",
    menu: "меню",
    cart: "корзина",
    me: "я",
    toHome: "на главную",
    welcomeBack: "Welcome back",
    hello: "Привет",
    myCoffee: "мой кофе",
    card: "карта",
    points: "баллы",
    promo: "реклама",
    morningSoft: "утро мягче",
    secondDrink: "−20% на второй напиток",
    morningTime: "с 8:00 до 11:00",
    newItem: "новинка",
    seaSaltPromo: "морская соль и карамель",
    loyalty: "loyalty",
    fifthCoffee: "5-й кофе за баллы",
    collectInApp: "копи в mini app",
    quickFilter: "быстрый фильтр меню",
    add: "добавить",
    remove: "убавить",
    basket: "корзинка",
    now: "сейчас",
    preorder: "предзаказ",
    tableNumber: "номер стола",
    chooseTable: "выбери стол",
    startCookingIn: "начать готовить через",
    min: "мин",
    emptyCart: "Корзина пустая. Выбери напиток на главном экране.",
    upsell: "докупить",
    fast: "быстро",
    paymentMethod: "способ оплаты",
    cardPay: "карта",
    cash: "наличные",
    spendPointsUpTo: "погасить баллами до",
    comment: "комментарий",
    notePlaceholder: "например: без сахара",
    total: "сумма",
    withPoints: "баллами",
    addItems: "добавь позиции",
    checkout: "оформить",
    profile: "кабинет",
    data: "данные",
    loyaltyCard: "loyalty card",
    orders: "заказов",
    lastOrder: "последний заказ",
    history: "история",
    noHistory: "История появится после первого заказа.",
    inCart: "в корзине",
    table: "стол",
    inMinutes: "через",
    favorites: "избранное",
    noFavorites: "Пока нет избранного. Нажми сердечко на карточке товара.",
    details: "подробнее",
    detailText: "Подходит для быстрого заказа в зале или предзаказа. Можно оплатить картой, наличными или частично баллами.",
    recommended: "рекомендуем",
    close: "закрыть",
  },
  sr: {
    home: "početna",
    menu: "meni",
    cart: "korpa",
    me: "ja",
    toHome: "na početnu",
    welcomeBack: "Dobrodošli nazad",
    hello: "Zdravo",
    myCoffee: "moja kafa",
    card: "kartica",
    points: "poeni",
    promo: "reklame",
    morningSoft: "mekše jutro",
    secondDrink: "−20% na drugo piće",
    morningTime: "od 8:00 do 11:00",
    newItem: "novo",
    seaSaltPromo: "morska so i karamela",
    loyalty: "lojalnost",
    fifthCoffee: "5. kafa za poene",
    collectInApp: "skupljaj u mini app",
    quickFilter: "brzi filter menija",
    add: "dodaj",
    remove: "umanji",
    basket: "korpa",
    now: "sada",
    preorder: "prednarudžbina",
    tableNumber: "broj stola",
    chooseTable: "izaberi sto",
    startCookingIn: "početi pripremu za",
    min: "min",
    emptyCart: "Korpa je prazna. Izaberi piće na glavnom ekranu.",
    upsell: "dodaj još",
    fast: "brzo",
    paymentMethod: "način plaćanja",
    cardPay: "kartica",
    cash: "gotovina",
    spendPointsUpTo: "iskoristi poene do",
    comment: "komentar",
    notePlaceholder: "na primer: bez šećera",
    total: "ukupno",
    withPoints: "poenima",
    addItems: "dodaj stavke",
    checkout: "naruči",
    profile: "profil",
    data: "podaci",
    loyaltyCard: "kartica lojalnosti",
    orders: "narudžbi",
    lastOrder: "poslednja narudžbina",
    history: "istorija",
    noHistory: "Istorija će se pojaviti posle prve narudžbine.",
    inCart: "u korpi",
    table: "sto",
    inMinutes: "za",
    favorites: "omiljeno",
    noFavorites: "Još nema omiljenih. Pritisni srce na kartici proizvoda.",
    details: "detalji",
    detailText: "Dobro za brzu narudžbinu za sto ili prednarudžbinu. Plaćanje karticom, gotovinom ili delom poenima.",
    recommended: "preporučujemo",
    close: "zatvori",
  },
  en: {
    home: "home",
    menu: "menu",
    cart: "cart",
    me: "me",
    toHome: "go home",
    welcomeBack: "Welcome back",
    hello: "Hi",
    myCoffee: "my coffee",
    card: "card",
    points: "points",
    promo: "promo",
    morningSoft: "softer morning",
    secondDrink: "−20% on second drink",
    morningTime: "from 8:00 to 11:00",
    newItem: "new",
    seaSaltPromo: "sea salt and caramel",
    loyalty: "loyalty",
    fifthCoffee: "5th coffee with points",
    collectInApp: "collect in mini app",
    quickFilter: "quick menu filter",
    add: "add",
    remove: "remove",
    basket: "cart",
    now: "now",
    preorder: "preorder",
    tableNumber: "table number",
    chooseTable: "choose table",
    startCookingIn: "start cooking in",
    min: "min",
    emptyCart: "Your cart is empty. Pick a drink on the home screen.",
    upsell: "add more",
    fast: "quick",
    paymentMethod: "payment method",
    cardPay: "card",
    cash: "cash",
    spendPointsUpTo: "spend points up to",
    comment: "comment",
    notePlaceholder: "for example: no sugar",
    total: "total",
    withPoints: "points",
    addItems: "add items",
    checkout: "checkout",
    profile: "profile",
    data: "data",
    loyaltyCard: "loyalty card",
    orders: "orders",
    lastOrder: "last order",
    history: "history",
    noHistory: "History will appear after the first order.",
    inCart: "in cart",
    table: "table",
    inMinutes: "in",
    favorites: "favorites",
    noFavorites: "No favorites yet. Tap the heart on a product card.",
    details: "details",
    detailText: "Works for a quick table order or a preorder. Pay by card, cash, or partly with points.",
    recommended: "recommended",
    close: "close",
  },
};

const state = {
  screen: "home",
  filter: "all",
  language: initialLanguage,
  detailId: null,
  favorites: getFavorites(),
  cart: getCart(),
  orderMode: "now",
  table: "07",
  preorderMinutes: 20,
  payment: "card",
  pointsToSpend: 0,
  note: "",
  lastOrder: null,
  orders: getOrders(),
};

const loyalty = getOrCreateLoyalty(telegramUser);

function t(key) {
  return i18n[state.language]?.[key] || i18n.en[key] || key;
}

function localize(group, id) {
  return localized[group]?.[id]?.[state.language] || localized[group]?.[id]?.en || "";
}

function persistCart() {
  saveCart(state.cart);
}

function persistFavorites() {
  saveFavorites(state.favorites);
}

function money(value) {
  return `${Math.max(0, Math.round(value))} ₽`;
}

function itemById(id) {
  return menu.find((item) => item.id === id);
}

function cartItems() {
  return Object.entries(state.cart)
    .map(([id, count]) => ({ ...itemById(id), count }))
    .filter((item) => item.id && item.count > 0);
}

function cartCount() {
  return cartItems().reduce((sum, item) => sum + item.count, 0);
}

function subtotal() {
  return cartItems().reduce((sum, item) => sum + item.price * item.count, 0);
}

function pointsAvailable() {
  return Math.min(loyalty.points, Math.floor(subtotal() * 0.4));
}

function pointsSpend() {
  return Math.min(Number(state.pointsToSpend) || 0, pointsAvailable());
}

function total() {
  return subtotal() - pointsSpend();
}

function filteredMenu() {
  if (state.filter === "all") return menu;
  return menu.filter((item) => item.category === state.filter);
}

function isFavorite(id) {
  return state.favorites.includes(id);
}

function toggleFavorite(id) {
  state.favorites = isFavorite(id) ? state.favorites.filter((itemId) => itemId !== id) : [...state.favorites, id];
  persistFavorites();
  render();
}

function recommendedFor(id) {
  return menu.filter((item) => item.id !== id).slice(0, 3);
}

function addItem(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  persistCart();
  render();
}

function removeItem(id) {
  state.cart[id] = Math.max((state.cart[id] || 0) - 1, 0);
  if (!state.cart[id]) delete state.cart[id];
  persistCart();
  render();
}

function submitOrder() {
  if (!cartCount()) return;

  const order = {
    id: `SF-${Date.now().toString().slice(-4)}`,
    user: telegramUser.first_name || telegramUser.username || "Гость",
    createdAt: new Date().toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    mode: state.orderMode,
    target: state.orderMode === "now" ? `${t("table")} ${state.table}` : `${t("inMinutes")} ${state.preorderMinutes} ${t("min")}`,
    payment: state.payment === "card" ? t("cardPay") : t("cash"),
    points: pointsSpend(),
    total: total(),
    items: cartItems(),
    note: state.note,
  };

  loyalty.points = Math.max(0, loyalty.points - order.points) + Math.floor(order.total / 20);
  saveLoyalty(loyalty);
  state.lastOrder = order;
  state.orders = [order, ...state.orders].slice(0, 10);
  state.cart = {};
  state.pointsToSpend = 0;
  state.note = "";
  persistCart();
  saveOrders(state.orders);
  state.screen = "profile";
  render();
}

function Header() {
  return `
    <header class="appHeader">
      <button class="brand" data-screen="home" aria-label="${t("toHome")}">
        <span>сфаауу</span>
      </button>
      <div class="headerActions">
        <div class="langSwitch" aria-label="language">
          ${supportedLanguages
            .map(
              (lang) => `<button class="${state.language === lang ? "active" : ""}" data-lang="${lang}">${lang.toUpperCase()}</button>`,
            )
            .join("")}
        </div>
        <button class="searchBtn" data-screen="cart" aria-label="${t("cart")}">
          <span>${cartCount()}</span>
        </button>
      </div>
    </header>
  `;
}

function FoodImage(item, className = "foodImage") {
  return `<div class="${className}" style="background-image:url('${assets.coffee}');background-position:${item.pos};"></div>`;
}

function ProductCard(item) {
  const count = state.cart[item.id] || 0;
  return `
    <article class="productCard">
      <button class="favButton ${isFavorite(item.id) ? "active" : ""}" data-fav="${item.id}" aria-label="${t("favorites")} ${item.title}">♥</button>
      <button class="cardOpen" data-detail="${item.id}" aria-label="${t("details")} ${item.title}">
        ${FoodImage(item)}
        <span class="productText">
          <span>${item.badge}</span>
          <h3>${item.title}</h3>
          <p>${localize("menu", item.id)}</p>
        </span>
      </button>
      <div class="productBottom">
        <strong>${money(item.price)}</strong>
        <div class="qty">
          <button data-remove="${item.id}" aria-label="${t("remove")} ${item.title}">−</button>
          <b>${count}</b>
          <button data-add="${item.id}" aria-label="${t("add")} ${item.title}">+</button>
        </div>
      </div>
    </article>
  `;
}

function Favorites() {
  const favoriteItems = state.favorites.map(itemById).filter(Boolean);
  return `
    <header class="subHeader">
      <button data-screen="home">‹</button>
      <strong>${t("favorites")}</strong>
      <span>${favoriteItems.length}</span>
    </header>

    <section class="productGrid" aria-label="${t("favorites")}">
      ${
        favoriteItems.length
          ? favoriteItems.map(ProductCard).join("")
          : `<p class="empty wideEmpty">${t("noFavorites")}</p>`
      }
    </section>
  `;
}

function ProductDetail() {
  const item = state.detailId ? itemById(state.detailId) : null;
  if (!item) return "";
  const count = state.cart[item.id] || 0;

  return `
    <section class="modalLayer" data-close-detail>
      <article class="detailSheet" role="dialog" aria-modal="true" aria-label="${item.title}">
        <button class="detailClose" data-close-detail aria-label="${t("close")}">×</button>
        <button class="favButton detailFav ${isFavorite(item.id) ? "active" : ""}" data-fav="${item.id}" aria-label="${t("favorites")} ${item.title}">♥</button>
        ${FoodImage(item, "detailImage")}
        <div class="detailCopy">
          <span>${item.badge}</span>
          <h2>${item.title}</h2>
          <p>${localize("menu", item.id)}. ${t("detailText")}</p>
        </div>
        <div class="detailBuy">
          <strong>${money(item.price)}</strong>
          <div class="qty">
            <button data-remove="${item.id}">−</button>
            <b>${count}</b>
            <button data-add="${item.id}">+</button>
          </div>
        </div>
        <div class="sectionTitle detailTitle">
          <h2>${t("recommended")}</h2>
          <span>${t("fast")}</span>
        </div>
        <div class="upsellRail detailRail">
          ${recommendedFor(item.id)
            .map(
              (rec) => `
                <button class="upsellCard" data-detail="${rec.id}">
                  ${FoodImage(rec, "upsellImage")}
                  <span>${rec.title}</span>
                  <b>${money(rec.price)}</b>
                </button>
              `,
            )
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function Home() {
  const name = telegramUser.first_name || "guest";
  return `
    ${Header()}

    <section class="welcome">
      <div>
        <p>${t("welcomeBack")}</p>
        <h1>${t("hello")}, ${name}</h1>
      </div>
      <button data-screen="profile">${t("myCoffee")}</button>
    </section>

    <section class="loyaltyHero">
      <div>
        <span>${t("card")}</span>
        <strong>${loyalty.digits}</strong>
      </div>
      <div>
        <span>${t("points")}</span>
        <strong>${loyalty.points}</strong>
      </div>
    </section>

    <section class="promoRail" aria-label="${t("promo")}">
      <article class="promoCard peach">
        <small>${t("morningSoft")}</small>
        <h2>${t("secondDrink")}</h2>
        <p>${t("morningTime")}</p>
      </article>
      <article class="promoCard mint">
        <small>${t("newItem")}</small>
        <h2>Sea Salt Latte</h2>
        <p>${t("seaSaltPromo")}</p>
      </article>
      <article class="promoCard blue">
        <small>${t("loyalty")}</small>
        <h2>${t("fifthCoffee")}</h2>
        <p>${t("collectInApp")}</p>
      </article>
    </section>

    <nav class="filterPills" aria-label="${t("quickFilter")}">
      ${filters.map(([id]) => `<button class="${state.filter === id ? "active" : ""}" data-filter="${id}">${localize("filters", id)}</button>`).join("")}
    </nav>

    <section class="productGrid" aria-label="${t("menu")}">
      ${filteredMenu().map(ProductCard).join("")}
    </section>
  `;
}

function CartLine(item) {
  return `
    <article class="cartItem">
      ${FoodImage(item, "cartThumb")}
      <div>
        <strong>${item.title}</strong>
        <small>${localize("menu", item.id)}</small>
        <div class="qty compact">
          <button data-remove="${item.id}">−</button>
          <b>${item.count}</b>
          <button data-add="${item.id}">+</button>
        </div>
      </div>
      <span>${money(item.price * item.count)}</span>
    </article>
  `;
}

function Cart() {
  const items = cartItems();
  return `
    <header class="subHeader">
      <button data-screen="home">‹</button>
      <strong>${t("basket")}</strong>
      <span>${cartCount()}</span>
    </header>

    <section class="modeSwitch">
      <button class="${state.orderMode === "now" ? "active" : ""}" data-order-mode="now">${t("now")}</button>
      <button class="${state.orderMode === "preorder" ? "active" : ""}" data-order-mode="preorder">${t("preorder")}</button>
    </section>

    <section class="glassPanel targetPanel">
      ${
        state.orderMode === "now"
          ? `
            <span class="panelLabel">${t("chooseTable")}</span>
            <div class="tableButtons" aria-label="${t("tableNumber")}">
              ${tableNumbers
                .map((table) => `<button class="${state.table === table ? "active" : ""}" data-table="${table}">${table}</button>`)
                .join("")}
            </div>
          `
          : `
            <span class="panelLabel">${t("startCookingIn")}</span>
            <div class="minutes">
              ${[10, 20, 30]
                .map(
                  (min) => `<button class="${state.preorderMinutes === min ? "active" : ""}" data-minutes="${min}">${min} ${t("min")}</button>`,
                )
                .join("")}
            </div>
          `
      }
    </section>

    <section class="cartList">
      ${items.length ? items.map(CartLine).join("") : `<p class="empty">${t("emptyCart")}</p>`}
    </section>

    <section class="upsell">
      <div class="sectionTitle">
        <h2>${t("upsell")}</h2>
        <span>${t("fast")}</span>
      </div>
      <div class="upsellRail">
        ${addOns
          .map(
            (item) => `
              <button class="upsellCard" data-add="${item.id}">
                ${FoodImage(item, "upsellImage")}
                <span>${localize("addOns", item.id)}</span>
                <b>${money(item.price)}</b>
              </button>
            `,
          )
          .join("")}
      </div>
    </section>

    <section class="glassPanel paymentPanel">
      <span class="panelLabel">${t("paymentMethod")}</span>
      <div class="payOptions">
        <button class="${state.payment === "card" ? "active" : ""}" data-payment="card">${t("cardPay")}</button>
        <button class="${state.payment === "cash" ? "active" : ""}" data-payment="cash">${t("cash")}</button>
      </div>
      <label class="pointsInput">
        <span>${t("spendPointsUpTo")} ${pointsAvailable()}</span>
        <input id="pointsInput" type="number" min="0" max="${pointsAvailable()}" value="${pointsSpend()}" />
      </label>
      <label class="noteInput">
        <span>${t("comment")}</span>
        <textarea id="noteInput" rows="3" placeholder="${t("notePlaceholder")}">${state.note}</textarea>
      </label>
    </section>

    <section class="totalPanel">
      <div>
        <span>${t("total")}</span>
        <strong>${money(total())}</strong>
      </div>
      <small>${subtotal() ? `${t("withPoints")}: ${pointsSpend()} ₽` : t("addItems")}</small>
    </section>

    <button class="primaryAction" data-submit ${items.length ? "" : "disabled"}>${t("checkout")}</button>
  `;
}

function Profile() {
  const last = state.lastOrder || state.orders[0];
  return `
    <header class="subHeader">
      <button data-screen="home">‹</button>
      <strong>${t("profile")}</strong>
      <span>${loyalty.level}</span>
    </header>

    <section class="profileHero">
      <div>
        <p>${t("data")}</p>
        <h1>${telegramUser.first_name || "Гость"}</h1>
        <span>@${telegramUser.username || "telegram"}</span>
      </div>
    </section>

    <section class="loyaltyCard">
      <div>
        <span>${t("loyaltyCard")}</span>
        <strong>${loyalty.digits}</strong>
      </div>
      <div class="cardStats">
        <small>${loyalty.points} ${t("points")}</small>
        <small>${state.orders.length} ${t("orders")}</small>
        <small>QR</small>
      </div>
    </section>

    ${
      last
        ? `
          <section class="latestOrder">
            <span>${t("lastOrder")}</span>
            <h2>${last.target}</h2>
            <p>${last.items.map((item) => item.title).join(", ")}</p>
            <b>${money(last.total)}</b>
          </section>
        `
        : ""
    }

    <section class="history profileHistory">
      <div class="sectionTitle">
        <h2>${t("history")}</h2>
        <span>${state.orders.length}</span>
      </div>
      ${
        state.orders.length
          ? state.orders
              .map(
                (order) => `
                  <article>
                    <div>
                      <strong>${order.createdAt}</strong>
                      <small>${order.items.map((item) => item.title).join(", ")}</small>
                    </div>
                    <b>${money(order.total)}</b>
                  </article>
                `,
              )
              .join("")
          : `<p class="empty">${t("noHistory")}</p>`
      }
    </section>
  `;
}

function BottomBar() {
  return `
    <nav class="bottomNav" aria-label="navigation">
      <button class="${state.screen === "home" ? "active" : ""}" data-screen="home" aria-label="${t("home")}">⌂</button>
      <button class="${state.screen === "favorites" ? "active" : ""}" data-screen="favorites" aria-label="${t("favorites")}">♥</button>
      <button class="${state.screen === "cart" ? "active" : ""}" data-screen="cart" aria-label="${t("cart")}">⌁<span>${cartCount()}</span></button>
      <button class="${state.screen === "profile" ? "active" : ""}" data-screen="profile" aria-label="${t("me")}">◦</button>
    </nav>
  `;
}

function CartDock() {
  if (!cartCount() || state.screen === "cart") return "";
  return `
    <button class="cartDock" data-screen="cart">
      <span>${cartCount()} ${t("inCart")}</span>
      <b>${money(total())}</b>
    </button>
  `;
}

function render() {
  const view =
    state.screen === "cart" ? Cart() : state.screen === "profile" ? Profile() : state.screen === "favorites" ? Favorites() : Home();
  app.innerHTML = `
    <div class="screen">
      ${view}
    </div>
    ${CartDock()}
    ${BottomBar()}
    ${ProductDetail()}
  `;
}

app.addEventListener("click", (event) => {
  const screen = event.target.closest("[data-screen]")?.dataset.screen;
  const add = event.target.closest("[data-add]")?.dataset.add;
  const remove = event.target.closest("[data-remove]")?.dataset.remove;
  const favorite = event.target.closest("[data-fav]")?.dataset.fav;
  const filter = event.target.closest("[data-filter]")?.dataset.filter;
  const orderMode = event.target.closest("[data-order-mode]")?.dataset.orderMode;
  const minutes = event.target.closest("[data-minutes]")?.dataset.minutes;
  const payment = event.target.closest("[data-payment]")?.dataset.payment;
  const language = event.target.closest("[data-lang]")?.dataset.lang;
  const table = event.target.closest("[data-table]")?.dataset.table;
  const closeDetail = event.target.dataset.closeDetail !== undefined;
  const detail = event.target.closest("[data-detail]")?.dataset.detail;
  const submit = event.target.closest("[data-submit]");

  if (screen) {
    state.screen = screen;
    render();
  }
  if (favorite) {
    toggleFavorite(favorite);
    return;
  }
  if (add) {
    addItem(add);
    return;
  }
  if (remove) {
    removeItem(remove);
    return;
  }
  if (closeDetail) {
    state.detailId = null;
    render();
    return;
  }
  if (filter) {
    state.filter = filter;
    state.screen = "home";
    render();
  }
  if (orderMode) {
    state.orderMode = orderMode;
    render();
  }
  if (minutes) {
    state.preorderMinutes = Number(minutes);
    render();
  }
  if (payment) {
    state.payment = payment;
    render();
  }
  if (language && supportedLanguages.includes(language)) {
    state.language = language;
    saveLanguage(language);
    render();
  }
  if (table) {
    state.table = table;
    render();
  }
  if (detail) {
    state.detailId = detail;
    render();
  }
  if (submit) submitOrder();
});

app.addEventListener("input", (event) => {
  if (event.target.id === "pointsInput") state.pointsToSpend = Math.max(0, Number(event.target.value) || 0);
  if (event.target.id === "noteInput") state.note = event.target.value;
  if (event.target.id === "pointsInput") render();
});

render();
