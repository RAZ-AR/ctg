export const assets = {
  coffee: "/public/assets/coffee-products-grid.png",
  reference: "/public/assets/reference-gradient-home.png",
};

export const localized = {
  menu: {
    flat: {
      ru: "двойной шот, плотное молоко",
      sr: "dupli šot, puno mleko",
      en: "double shot, silky milk",
    },
    ice: {
      ru: "лёд, молоко, эспрессо",
      sr: "led, mleko, espreso",
      en: "ice, milk, espresso",
    },
    matcha: {
      ru: "матча, овсяное, ваниль",
      sr: "mača, ovseno mleko, vanila",
      en: "matcha, oat milk, vanilla",
    },
    croissant: {
      ru: "круассан и эспрессо",
      sr: "kroasan i espreso",
      en: "croissant and espresso",
    },
    salt: {
      ru: "солёная карамель, крем",
      sr: "slana karamela, krem",
      en: "salted caramel, cream",
    },
    brew: {
      ru: "18 часов, мягкая кислотность",
      sr: "18 sati, blaga kiselost",
      en: "18 hours, soft acidity",
    },
  },
  addOns: {
    croissant: { ru: "круассан к кофе", sr: "kroasan uz kafu", en: "croissant with coffee" },
    matcha: { ru: "матча вместо десерта", sr: "mača umesto deserta", en: "matcha instead of dessert" },
    ice: { ru: "айс латте с собой", sr: "ajs latte za poneti", en: "iced latte to go" },
  },
  filters: {
    all: { ru: "всё", sr: "sve", en: "all" },
    coffee: { ru: "кофе", sr: "kafa", en: "coffee" },
    cold: { ru: "cold", sr: "hladno", en: "cold" },
    tea: { ru: "tea", sr: "čaj", en: "tea" },
    food: { ru: "еда", sr: "hrana", en: "food" },
  },
};

export const menu = [
  {
    id: "flat",
    category: "coffee",
    title: "Flat White",
    price: 230,
    badge: "hit",
    pos: "62% 23%",
  },
  {
    id: "ice",
    category: "cold",
    title: "Iced Latte",
    price: 260,
    badge: "cold",
    pos: "20% 22%",
  },
  {
    id: "matcha",
    category: "tea",
    title: "Matcha Cloud",
    price: 310,
    badge: "new",
    pos: "22% 76%",
  },
  {
    id: "croissant",
    category: "food",
    title: "Croissant Set",
    price: 340,
    badge: "food",
    pos: "74% 74%",
  },
  {
    id: "salt",
    category: "coffee",
    title: "Sea Salt Latte",
    price: 290,
    badge: "blue",
    pos: "60% 23%",
  },
  {
    id: "brew",
    category: "cold",
    title: "Cold Brew",
    price: 270,
    badge: "fast",
    pos: "18% 22%",
  },
];

export const addOns = [
  { id: "croissant", price: 190, pos: "78% 76%" },
  { id: "matcha", price: 310, pos: "23% 76%" },
  { id: "ice", price: 260, pos: "20% 22%" },
];

export const filters = [["all"], ["coffee"], ["cold"], ["tea"], ["food"]];

export const tableNumbers = ["01", "02", "03", "04", "05", "06", "07", "08"];
