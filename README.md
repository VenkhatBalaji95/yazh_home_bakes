# Yazh Home Bakes — Premium Brownie Ordering Website

A premium, mobile-first, **fully static** website for **Yazh Home Bakes**
(Medavakkam, Chennai). Customers browse eight brownies, pick a weight,
customise frosting and choco chips, review an order summary, and place the
order via **WhatsApp**. Built with **HTML5, CSS3 and vanilla JavaScript** — no
frameworks, no backend. Deploys cleanly on **GitHub Pages**.

> _Happiness in Every Bite._

---

## ✨ Features

- Premium boutique-bakery design using the brand palette and Playfair Display +
  Poppins typography.
- Eight brownie products with 250g / 500g / 1kg weight selection and live price.
- Every brownie is available **egg-based or eggless**. Listed prices are for
  egg-based; eggless adds a surcharge by weight (₹50 / ₹100 / ₹200), shown on
  the card, summary and WhatsApp message.
- Multi-step ordering journey with a progress indicator:
  **Brownie → Frosting → Choco Chips → Summary → WhatsApp**.
- Frostings and choco chips priced by brownie weight, with multi-select, deselect,
  running counts and subtotals, plus **Skip / Back / Continue**.
- Order summary with a single central calculation, Indian Rupee formatting, and
  **Delivery: To be confirmed** shown separately (no auto delivery fee, no
  distance input, no maps).
- WhatsApp checkout message generated dynamically with `encodeURIComponent()`.
- Floating WhatsApp enquiry button on every stage.
- Customer name with required-field validation before WhatsApp opens; no phone
  number or delivery address is collected.
- Selections persist across refresh via `localStorage`; **Clear Order** resets.
- Fully responsive (360px → 1920px) with graceful image fallbacks.
- SEO title/description, Open Graph tags and a favicon placeholder.

---

## 📁 Project structure

```
yazh_home_bakes/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js        # config, product data, order state, WhatsApp logic
├── assets/
│   ├── images/
│   │   ├── brownies/     # product + hero + about photos
│   │   ├── frostings/    # frosting-on-brownie photos
│   │   └── chips/        # choco-chip photos
│   └── logo/             # favicon, og-image, logo
└── README.md
```

---

## 🔧 1. Add your WhatsApp number (required)

Open `js/script.js` and edit the `CONFIG` block at the top:

```js
const CONFIG = {
  // country code + number, digits only. India example: 919876543210
  whatsappNumber: "910000000000",   // ← REPLACE THIS
  ...
};
```

All WhatsApp links (enquiry button, floating button, Place Order) use this one
value.

## 🖼️ 2. Replace the photographs

- Product/hero/about images → `assets/images/brownies/`
- Frosting images → `assets/images/frostings/`
- Choco-chip images → `assets/images/chips/`

Each folder has a `README.md` listing the exact filenames to use. Drop in your
photos with those names and they appear automatically. Until then, on-brand
placeholders are shown (nothing breaks). To use different names/paths, edit the
`image` values inside `js/script.js`.

**Frosting photo note:** show each frosting generously spread on an actual
brownie piece — same shape, angle, lighting and background for all seven.

## 💰 3. Edit products, prices & text (optional)

Everything is centralised in `js/script.js`:

- `CATEGORIES` — menu tabs and the "Coming Soon" cards (Brownies is
  `available`; Blondies, Cookies and Ice Creams are `coming-soon`, each with a
  WhatsApp "Notify me" link). Edit names, taglines and descriptions here.

- `PRODUCTS` — names, descriptions, prices per weight, image paths.
- `FROSTINGS`, `CHIPS` — add-on options (names, images).
- `CONFIG.frostingPrices`, `CONFIG.chipPrices` — add-on price per item by brownie
  weight (frosting ₹50 / ₹100 / ₹200, chips ₹5 / ₹10 / ₹20 for 250g / 500g / 1kg).
- `CONFIG.egglessSurcharge` — extra charge for eggless by weight (₹50 / ₹100 / ₹200).
- `CONFIG.deliveryMessage` — the delivery policy text shown across the site.

All totals are computed from one central order state, so prices stay consistent
on every screen.

**After editing CSS or JS**, bump the `?v=` number on the `style.css` and
`script.js` links in `index.html` (e.g. `?v=2` → `?v=3`) so visitors' browsers
load the new version instead of a cached copy.

---

## 🧪 Test locally

Use any static server from the project root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` directly in a browser.

**Quick checklist**

1. All 8 products show with correct prices for 250g/500g/1kg.
2. Changing weight highlights it and updates the price instantly.
3. “Customise & Order” opens the flow at the Frosting step.
4. Frostings/chips multi-select, deselect, and update counts + subtotals.
5. Example order: Fudge Classic 500g (₹500) + Midnight & Snowfall ganache (₹200) +
   Midnight Bites chips (₹10) → **Subtotal ₹710**, Delivery “To be confirmed”,
   Final “₹710 + applicable delivery charges”.
6. Required customer fields are validated before WhatsApp opens.
7. Refreshing the page keeps your selections; **Clear Order** resets them.
8. No horizontal scrolling on mobile; floating WhatsApp button stays clear.

---

## 🚀 Deploy to GitHub Pages

1. Create a GitHub repository (e.g. `yazh-home-bakes`) and push these files to
   the `main` branch root.
   ```bash
   git add .
   git commit -m "Yazh Home Bakes website"
   git push origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch**. Branch: **main**, folder: **/ (root)**.
4. Save. Your site publishes at
   `https://venkhatbalaji95.github.io/yazh_home_bakes/`.
5. Update the `og:url` / `canonical` URLs in `index.html` to match.

---

## 🔒 Privacy

Customer details are only used to build the WhatsApp message on the customer's
own device. Nothing is sent to any external server by this website. The customer
always taps **Send** manually in WhatsApp — orders are never placed automatically.
