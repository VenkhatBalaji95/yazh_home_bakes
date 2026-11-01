/* ==========================================================================
   YAZH HOME BAKES — ordering logic (vanilla JS)
   Single central order state · localStorage persistence · WhatsApp checkout
   ========================================================================== */
(function () {
  "use strict";

  /* ======================================================================
     1. CENTRAL CONFIGURATION  —  EDIT THESE VALUES
     ====================================================================== */
  const CONFIG = {
    // ▼▼ REPLACE with your WhatsApp business number: country code + number,
    //    digits only, no "+" or spaces. Example India: 919876543210
    whatsappNumber: "916380483106",

    brand: "Yazh Home Bakes",
    tagline: "Happiness in Every Bite",

    // Exact delivery policy message (shown in multiple places).
    deliveryMessage:
      "🚚 Free delivery within 7 km of Medavakkam, Chennai. Beyond 7 km, an additional ₹10 per kilometre will be charged (rounded up to the next whole kilometre). Final delivery charges will be confirmed by Yazh Home Bakes.",

    // Add-on price per selected item, by brownie weight (1kg is double 500g).
    frostingPrices: { "250g": 50, "500g": 100, "1kg": 200 },
    chipPrices: { "250g": 5, "500g": 10, "1kg": 20 },

    // Product prices are for egg-based brownies; eggless adds this per weight.
    egglessSurcharge: { "250g": 50, "500g": 100, "1kg": 200 },
  };

  /* ======================================================================
     2. PRODUCT DATA  —  names, descriptions, prices, image paths
        Replace the image paths with your real photos (see README).
     ====================================================================== */
  // Menu categories. Only "available" categories have an order flow today.
  const CATEGORIES = [
    {
      id: "brownies",
      name: "Brownies",
      status: "available",
      tagline: "Rich, fudgy and made to order",
    },
    {
      id: "blondies",
      name: "Blondies",
      status: "coming-soon",
      tagline: "Golden, buttery cousins of our brownies",
      desc: "Soft, chewy bars with a caramel-like sweetness — the perfect partner to our chocolate brownies.",
      art: "blondie",
    },
    {
      id: "cookies",
      name: "Cookies",
      status: "coming-soon",
      tagline: "Chunky, chewy and freshly baked",
      desc: "Golden edges, soft centres and generous chocolate in every bite.",
      art: "cookie",
    },
    {
      id: "ice-creams",
      name: "Ice Creams",
      status: "coming-soon",
      tagline: "Creamy, small-batch scoops",
      desc: "Homemade scoops made to pair beautifully with a warm brownie.",
      art: "icecream",
    },
  ];

  const WEIGHTS = [
    { key: "250g", label: "250g" },
    { key: "500g", label: "500g" },
    { key: "1kg", label: "1kg" },
  ];

  // Menu rows — each product's `group` must match one of these ids.
  const PRODUCT_GROUPS = [
    { id: "compound", title: "Classic Chocolate Brownies", sub: "Made with compound chocolate" },
    { id: "chocolate", title: "Signature Chocolate Brownies", sub: "Made with real chocolate" },
  ];

  const PRODUCTS = [
    {
      id: "fudge-classic",
      group: "compound",
      name: "Fudge Classic",
      desc: "Rich and fudgy dark compound brownie.",
      prices: { "250g": 250, "500g": 500, "1kg": 1000 },
      image: "assets/images/brownies/fudge-classic.jpg",
      tone: "#4a2c1a",
    },
    {
      id: "choco-melt",
      group: "chocolate",
      name: "Choco Melt",
      desc: "Rich dark chocolate brownie.",
      prices: { "250g": 310, "500g": 620, "1kg": 1240 },
      image: "assets/images/brownies/choco-melt.jpg",
      tone: "#3a2114",
      premium: true,
    },
    {
      id: "midnight-snow",
      group: "compound",
      name: "Midnight Snow",
      desc: "Delicious combination of dark and white compound chocolate.",
      prices: { "250g": 280, "500g": 560, "1kg": 1120 },
      image: "assets/images/brownies/midnight-snow.jpg",
      tone: "#5a3d2b",
    },
    {
      id: "midnight-melt",
      group: "compound",
      name: "Midnight Melt",
      desc: "Delicious combination of dark and milk compound chocolate.",
      prices: { "250g": 280, "500g": 560, "1kg": 1120 },
      image: "assets/images/brownies/midnight-melt.jpg",
      tone: "#4d3220",
    },
    {
      id: "midnight-elegance",
      group: "chocolate",
      name: "Midnight Elegance",
      desc: "Premium combination of dark and white chocolate.",
      prices: { "250g": 390, "500g": 780, "1kg": 1560 },
      image: "assets/images/brownies/midnight-elegance.jpg",
      tone: "#5e4330",
      premium: true,
    },
    {
      id: "choco-fusion",
      group: "chocolate",
      name: "Choco Fusion",
      desc: "Premium combination of dark and milk chocolate.",
      prices: { "250g": 390, "500g": 780, "1kg": 1560 },
      image: "assets/images/brownies/choco-fusion.jpg",
      tone: "#4a2e1c",
      premium: true,
    },
    {
      id: "choco-trio",
      group: "compound",
      name: "Choco Trio",
      desc: "A triple compound chocolate brownie with dark, milk and white compound chocolate.",
      prices: { "250g": 285, "500g": 570, "1kg": 1140 },
      image: "assets/images/brownies/choco-trio.jpg",
      tone: "#563a26",
    },
    {
      id: "choco-overload",
      group: "chocolate",
      name: "Choco Overload",
      desc: "An indulgent triple chocolate brownie made with dark, milk and white chocolate.",
      prices: { "250g": 395, "500g": 790, "1kg": 1580 },
      image: "assets/images/brownies/choco-overload.jpg",
      tone: "#3d2416",
      premium: true,
    },
  ];

  // Frostings — each shown generously spread on a brownie piece.
  // `type` is the plain description shown under the brand name.
  const FROSTINGS = [
    { id: "dark-ganache", name: "Midnight Ganache", type: "Dark Compound Ganache", image: "assets/images/frostings/dark-ganache.jpg", swirl: "#2a150c" },
    { id: "milk-ganache", name: "Silky Milk Ganache", type: "Milk Compound Ganache", image: "assets/images/frostings/milk-ganache.jpg", swirl: "#7a4a2b" },
    { id: "white-ganache", name: "Snowfall Ganache", type: "White Compound Ganache", image: "assets/images/frostings/white-ganache.jpg", swirl: "#efe4d2" },
    { id: "nutella", name: "Hazelnut Dream", type: "Nutella", image: "assets/images/frostings/nutella.jpg", swirl: "#5a3418" },
    { id: "biscoff", name: "Caramel Cookie Bliss", type: "Biscoff Spread", image: "assets/images/frostings/biscoff.jpg", swirl: "#b5703a" },
    { id: "pistachio", name: "Pistachio Royale", type: "Pistachio Cream", image: "assets/images/frostings/pistachio.jpg", swirl: "#8ba05a" },
    { id: "peanut-butter", name: "Peanut Butter Bliss", type: "Peanut Butter", image: "assets/images/frostings/peanut-butter.jpg", swirl: "#c79a52" },
  ];

  // Choco chips — `type` is the plain description shown under the brand name.
  const CHIPS = [
    { id: "dark-chips", name: "Midnight Bites", type: "Dark Chocolate Chips", image: "assets/images/chips/dark-chips.jpg", dot: "#2a150c" },
    { id: "milk-chips", name: "Cocoa Drops", type: "Milk Chocolate Chips", image: "assets/images/chips/milk-chips.jpg", dot: "#7a4a2b" },
    { id: "white-chips", name: "Snow Pearls", type: "White Chocolate Chips", image: "assets/images/chips/white-chips.jpg", dot: "#efe4d2" },
  ];

  /* ======================================================================
     3. CENTRAL ORDER STATE
     ====================================================================== */
  const STORAGE_KEY = "yazh_order_v1";
  const defaultState = () => ({
    productId: null,
    weight: "250g",
    eggless: false,
    frostings: [],
    chips: [],
    customer: { name: "" },
    // transient weight / egg choices per card before adding to order
    cardWeights: {},
    cardEggless: {},
  });

  let state = loadState();
  let currentStep = 0; // 0 = not in flow; 1..3 = frosting, chips, summary

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const loaded = Object.assign(
          defaultState(),
          saved && typeof saved === "object" ? saved : {}
        );
        loaded.customer = {
          name:
            loaded.customer && typeof loaded.customer.name === "string"
              ? loaded.customer.name
              : "",
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
        return loaded;
      }
    } catch (_) {}
    return defaultState();
  }
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  /* ======================================================================
     4. HELPERS
     ====================================================================== */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

  function getProduct(id) {
    return PRODUCTS.find((p) => p.id === id) || null;
  }
  function basePrice() {
    const p = getProduct(state.productId);
    return p ? p.prices[state.weight] : 0;
  }
  function egglessExtra() {
    return state.eggless ? CONFIG.egglessSurcharge[state.weight] || 0 : 0;
  }
  function cardPrice(p, weight, eggless) {
    return p.prices[weight] + (eggless ? CONFIG.egglessSurcharge[weight] || 0 : 0);
  }
  function frostingUnit() {
    return CONFIG.frostingPrices[state.weight] || 0;
  }
  function chipUnit() {
    return CONFIG.chipPrices[state.weight] || 0;
  }
  function frostingSubtotal() {
    return state.frostings.length * frostingUnit();
  }
  function chipsSubtotal() {
    return state.chips.length * chipUnit();
  }
  function subtotal() {
    return basePrice() + egglessExtra() + frostingSubtotal() + chipsSubtotal();
  }

  // SVG fallback so the site looks intentional before real photos are added.
  function placeholder(label, bg, accent, swirl) {
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='480'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
      `<stop offset='0' stop-color='${bg}'/>` +
      `<stop offset='1' stop-color='#241410'/></linearGradient></defs>` +
      `<rect width='600' height='480' fill='url(#g)'/>` +
      `<rect x='70' y='60' width='460' height='360' rx='34' fill='#1c0f0a' opacity='0.45'/>` +
      (swirl
        ? `<ellipse cx='300' cy='210' rx='170' ry='120' fill='${swirl}' opacity='0.92'/>` +
          `<ellipse cx='300' cy='210' rx='120' ry='80' fill='${swirl}' opacity='0.6'/>`
        : "") +
      `<text x='300' y='250' fill='#F5EBDD' font-family='Georgia,serif' font-size='40' ` +
      `font-weight='700' text-anchor='middle'>${label}</text>` +
      `<text x='300' y='300' fill='${accent}' font-family='Arial,sans-serif' font-size='18' ` +
      `letter-spacing='3' text-anchor='middle'>YAZH HOME BAKES</text></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  function imgOnError(fallback) {
    return `this.onerror=null;this.src=&quot;${fallback}&quot;`;
  }

  /* ======================================================================
     5. WhatsApp URL builders
     ====================================================================== */
  function waUrl(message) {
    const num = CONFIG.whatsappNumber.replace(/\D/g, "");
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(message);
  }

  const ENQUIRY_MESSAGE =
    "Hello Yazh Home Bakes!\n\n" +
    "I came across your website and would like to enquire about your brownies.\n\n" +
    "Could you please help me with some details?\n\n" +
    "Thank you!";

  function notifyMessage(category) {
    return (
      "Hello Yazh Home Bakes!\n\n" +
      "I'm interested in your upcoming " + category.name + ".\n" +
      "Please let me know when they are available to order.\n\n" +
      "Thank you!"
    );
  }

  function buildOrderMessage() {
    const p = getProduct(state.productId);
    const c = state.customer;
    const L = [];
    L.push("Hello Yazh Home Bakes!");
    L.push("");
    L.push("I would like to place an order.");
    L.push("");
    L.push("*BROWNIE DETAILS*");
    L.push("Product: " + (p ? p.name : "-"));
    L.push("Weight: " + state.weight);
    L.push("Type: " + (state.eggless ? "Eggless" : "Egg-based"));
    L.push("Base Price: " + inr(basePrice()));
    if (state.eggless) L.push("Eggless Extra: " + inr(egglessExtra()));
    L.push("");
    L.push("*FROSTING SELECTION*");
    if (state.frostings.length) {
      state.frostings.forEach((id) => {
        const f = FROSTINGS.find((x) => x.id === id);
        if (f) L.push("- " + f.name + " (" + f.type + "): " + inr(frostingUnit()));
      });
    } else {
      L.push("- None");
    }
    L.push("");
    L.push("*CHOCO CHIPS SELECTION*");
    if (state.chips.length) {
      state.chips.forEach((id) => {
        const ch = CHIPS.find((x) => x.id === id);
        if (ch) L.push("- " + ch.name + " (" + ch.type + "): " + inr(chipUnit()));
      });
    } else {
      L.push("- None");
    }
    L.push("");
    L.push("*ORDER SUMMARY*");
    L.push("Brownie: " + inr(basePrice()));
    if (state.eggless) L.push("Eggless Extra: " + inr(egglessExtra()));
    L.push("Frostings: " + inr(frostingSubtotal()));
    L.push("Choco Chips: " + inr(chipsSubtotal()));
    L.push("Subtotal: " + inr(subtotal()));
    L.push("");
    L.push("*CUSTOMER DETAILS*");
    L.push("Customer Name: " + c.name);
    L.push("");
    L.push("");
    L.push("Order Total: " + inr(subtotal()) + " + applicable delivery charges.");
    L.push("");
    L.push("Please confirm my order.");
    L.push("");
    L.push("Thank you!");
    return L.join("\n");
  }

  /* ======================================================================
     6. RENDER — product catalogue
     ====================================================================== */
  function productCard(p) {
      const w = state.cardWeights[p.id] || "250g";
      const eg = !!state.cardEggless[p.id];
      const fb = placeholder(p.name, p.tone, "#A07852");
      return `
      <article class="product" data-product="${p.id}">
        <div class="product__media">
          <img src="${p.image}" alt="${p.name} brownie" loading="lazy"
               onerror="${imgOnError(fb)}" />
          ${p.premium ? `<span class="product__flag">Premium</span>` : ""}
        </div>
        <div class="product__body">
          <h3 class="product__name">${p.name}</h3>
          <p class="product__desc">${p.desc}</p>
          <div class="egg-toggle" role="group" aria-label="Egg or eggless for ${p.name}">
            <button type="button" class="egg-opt${eg ? "" : " is-active"}" data-egg="egg" aria-pressed="${!eg}">
              <span>With Egg</span>
            </button>
            <button type="button" class="egg-opt${eg ? " is-active" : ""}" data-egg="eggless" aria-pressed="${eg}">
              <span>Eggless</span><small data-egg-extra>+${inr(CONFIG.egglessSurcharge[w])}</small>
            </button>
          </div>
          <div class="weights" role="group" aria-label="Choose weight for ${p.name}">
            ${WEIGHTS.map(
              (wt) => `
              <button type="button" class="weight${wt.key === w ? " is-active" : ""}"
                      data-weight="${wt.key}" aria-pressed="${wt.key === w}">
                <span>${wt.label}</span>
                <small data-wprice>${inr(cardPrice(p, wt.key, eg))}</small>
              </button>`
            ).join("")}
          </div>
          <div class="product__foot">
            <div class="product__price">
              <span>Price</span>
              <strong data-price>${inr(cardPrice(p, w, eg))}</strong>
            </div>
            <button type="button" class="btn btn--primary" data-customise="${p.id}">
              Customise &amp; Order
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderProducts() {
    const wrap = $("#productGrid");
    if (!wrap) return;
    wrap.innerHTML = PRODUCT_GROUPS.map((g) => {
      const items = PRODUCTS.filter((p) => p.group === g.id);
      return `
      <section class="product-group" aria-labelledby="group-${g.id}">
        <header class="group__head">
          <h3 class="group__title" id="group-${g.id}">${g.title}</h3>
          <p class="group__sub">${g.sub}</p>
        </header>
        <div class="product-grid">${items.map(productCard).join("")}</div>
      </section>`;
    }).join("");
  }

  /* ======================================================================
     6b. RENDER — menu categories & coming soon
     ====================================================================== */
  const ART = {
    blondie:
      `<svg viewBox="0 0 200 150" aria-hidden="true">` +
      `<ellipse cx="100" cy="128" rx="78" ry="10" fill="#382319" opacity=".12"/>` +
      `<path d="M38 62 100 40l62 22v44l-62 22-62-22Z" fill="#d9a866"/>` +
      `<path d="M38 62 100 84l62-22-62-22Z" fill="#ecc589"/>` +
      `<path d="M100 84v44l62-22V62Z" fill="#c48f4c"/>` +
      `<circle cx="82" cy="60" r="5" fill="#fff8ec"/><circle cx="110" cy="54" r="4" fill="#fff8ec"/>` +
      `<circle cx="124" cy="68" r="5" fill="#fff8ec"/><circle cx="96" cy="72" r="3.5" fill="#fff8ec"/></svg>`,
    cookie:
      `<svg viewBox="0 0 200 150" aria-hidden="true">` +
      `<ellipse cx="100" cy="132" rx="62" ry="9" fill="#382319" opacity=".12"/>` +
      `<circle cx="100" cy="74" r="56" fill="#c98a4b"/>` +
      `<circle cx="100" cy="74" r="48" fill="#dca064"/>` +
      `<circle cx="80" cy="58" r="7" fill="#382319"/><circle cx="118" cy="52" r="6" fill="#382319"/>` +
      `<circle cx="124" cy="88" r="7" fill="#382319"/><circle cx="90" cy="96" r="6" fill="#382319"/>` +
      `<circle cx="102" cy="74" r="4" fill="#382319"/><circle cx="70" cy="84" r="4" fill="#382319"/></svg>`,
    icecream:
      `<svg viewBox="0 0 200 150" aria-hidden="true">` +
      `<ellipse cx="100" cy="140" rx="34" ry="6" fill="#382319" opacity=".12"/>` +
      `<path d="M74 70h52l-26 68Z" fill="#d19a5c"/>` +
      `<path d="M80 80l34 22M120 80 88 104M84 92l22 16" stroke="#a9733b" stroke-width="3"/>` +
      `<circle cx="86" cy="58" r="22" fill="#5a3418"/>` +
      `<circle cx="114" cy="58" r="22" fill="#f3e6cf"/>` +
      `<circle cx="100" cy="38" r="22" fill="#e9c7a4"/>` +
      `<circle cx="100" cy="14" r="6" fill="#a83a32"/></svg>`,
  };

  function renderTabs() {
    const tabs = $("#menuTabs");
    if (!tabs) return;
    tabs.innerHTML = CATEGORIES.map((c, i) => {
      const soon = c.status !== "available";
      return `
      <button type="button" class="tab${i === 0 ? " is-active" : ""}" role="tab"
              id="tab-${c.id}" data-tab="${c.id}" aria-selected="${i === 0}">
        <span class="tab__name">${c.name}</span>
        <span class="tab__meta${soon ? " tab__meta--soon" : ""}">${soon ? "Coming soon" : "Order now"}</span>
      </button>`;
    }).join("");
  }

  function showTab(id) {
    const cat = CATEGORIES.find((c) => c.id === id);
    if (!cat) return;
    $$(".tab").forEach((t) => {
      const on = t.dataset.tab === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    const live = $("#panel-brownies");
    const soon = $("#panel-soon");
    const isSoon = cat.status !== "available";
    live.hidden = isSoon;
    soon.hidden = !isSoon;
    if (isSoon) {
      soon.setAttribute("aria-labelledby", "tab-" + cat.id);
      soon.innerHTML = `
        <div class="soon-panel">
          <div class="soon-panel__art">${ART[cat.art] || ""}</div>
          <div class="soon-panel__body">
            <span class="soon-badge">Coming soon</span>
            <h3>${cat.name}</h3>
            <p class="soon-panel__tag">${cat.tagline}</p>
            <p>${cat.desc}</p>
            <div class="soon-panel__actions">
              <a class="btn btn--whats" href="${waUrl(notifyMessage(cat))}" target="_blank" rel="noopener">Notify me on WhatsApp</a>
              <button type="button" class="btn btn--outline" data-tab-go="brownies">Order brownies today</button>
            </div>
          </div>
        </div>`;
    }
  }

  function renderSoonGrid() {
    const grid = $("#soonGrid");
    if (!grid) return;
    grid.innerHTML = CATEGORIES.filter((c) => c.status !== "available")
      .map(
        (c) => `
      <article class="soon-card soon-card--${c.art}">
        <span class="soon-badge">Coming soon</span>
        <div class="soon-card__art">${ART[c.art] || ""}</div>
        <h3>${c.name}</h3>
        <p class="soon-card__tag">${c.tagline}</p>
        <p class="soon-card__desc">${c.desc}</p>
        <a class="soon-card__link" href="${waUrl(notifyMessage(c))}" target="_blank" rel="noopener">
          Notify me <span aria-hidden="true">&rarr;</span>
        </a>
      </article>`
      )
      .join("");
  }

  function goToMenu(tabId) {
    showTab(tabId || "brownies");
    const el = $("#menu");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  /* ======================================================================
     7. RENDER — order flow (frosting / chips / summary)
     ====================================================================== */
  function updateCard(card) {
    const pid = card.dataset.product;
    const p = getProduct(pid);
    if (!p) return;
    const w = state.cardWeights[pid] || "250g";
    const eg = !!state.cardEggless[pid];
    $$(".weight", card).forEach((b) => {
      const on = b.dataset.weight === w;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
      $("[data-wprice]", b).textContent = inr(cardPrice(p, b.dataset.weight, eg));
    });
    $$(".egg-opt", card).forEach((b) => {
      const on = (b.dataset.egg === "eggless") === eg;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    $("[data-egg-extra]", card).textContent = "+" + inr(CONFIG.egglessSurcharge[w]);
    $("[data-price]", card).textContent = inr(cardPrice(p, w, eg));
  }

  function renderFrostings() {
    const wrap = $("#frostingGrid");
    if (!wrap) return;
    wrap.innerHTML = FROSTINGS.map((f) => {
      const active = state.frostings.includes(f.id);
      const fb = placeholder(f.name, "#3a2114", "#A07852", f.swirl);
      return `
      <button type="button" class="option${active ? " is-selected" : ""}" data-frosting="${f.id}"
              aria-pressed="${active}">
        <span class="option__check" aria-hidden="true">✓</span>
        <span class="option__media">
          <img src="${f.image}" alt="${f.name} (${f.type}) spread on a brownie" loading="lazy"
               onerror="${imgOnError(fb)}" />
        </span>
        <span class="option__info">
          <span class="option__text">
            <span class="option__name">${f.name}</span>
            <span class="option__type">${f.type}</span>
          </span>
          <span class="option__price">${inr(frostingUnit())}</span>
        </span>
      </button>`;
    }).join("");
    updateFrostingMeta();
  }

  function renderChips() {
    const wrap = $("#chipsGrid");
    if (!wrap) return;
    wrap.innerHTML = CHIPS.map((c) => {
      const active = state.chips.includes(c.id);
      const fb = placeholder(c.name, "#4a2e1c", "#A07852", c.dot);
      return `
      <button type="button" class="option${active ? " is-selected" : ""}" data-chip="${c.id}"
              aria-pressed="${active}">
        <span class="option__check" aria-hidden="true">✓</span>
        <span class="option__media">
          <img src="${c.image}" alt="${c.name} (${c.type}) on a brownie" loading="lazy"
               onerror="${imgOnError(fb)}" />
        </span>
        <span class="option__info">
          <span class="option__text">
            <span class="option__name">${c.name}</span>
            <span class="option__type">${c.type}</span>
          </span>
          <span class="option__price">${inr(chipUnit())}</span>
        </span>
      </button>`;
    }).join("");
    updateChipsMeta();
  }

  function updateFrostingMeta() {
    const count = $("#frostingCount");
    const sub = $("#frostingSubtotal");
    if (count) count.textContent = state.frostings.length;
    if (sub) sub.textContent = inr(frostingSubtotal());
    const rate = $("#frostingRate");
    if (rate) rate.textContent = inr(frostingUnit()) + " (" + state.weight + " brownie)";
  }
  function updateChipsMeta() {
    const count = $("#chipsCount");
    const sub = $("#chipsSubtotal");
    if (count) count.textContent = state.chips.length;
    if (sub) sub.textContent = inr(chipsSubtotal());
    const rate = $("#chipsRate");
    if (rate) rate.textContent = inr(chipUnit()) + " (" + state.weight + " brownie)";
  }

  function renderSummary() {
    const p = getProduct(state.productId);
    const box = $("#summaryBody");
    if (!box || !p) return;

    const frostingRows = state.frostings.length
      ? state.frostings
          .map((id) => {
            const f = FROSTINGS.find((x) => x.id === id);
            return `<li><span>${f.name}<small>${f.type}</small></span><span>${inr(frostingUnit())}</span></li>`;
          })
          .join("")
      : `<li class="muted"><span>No frosting added</span><span>₹0</span></li>`;

    const chipRows = state.chips.length
      ? state.chips
          .map((id) => {
            const c = CHIPS.find((x) => x.id === id);
            return `<li><span>${c.name}<small>${c.type}</small></span><span>${inr(chipUnit())}</span></li>`;
          })
          .join("")
      : `<li class="muted"><span>No choco chips added</span><span>₹0</span></li>`;

    box.innerHTML = `
      <div class="sum-row sum-row--lead">
        <div>
          <h4>${p.name}</h4>
          <span class="muted">Weight: ${state.weight} · ${state.eggless ? "Eggless" : "Egg-based"}</span>
        </div>
        <strong>${inr(basePrice())}</strong>
      </div>
      ${
        state.eggless
          ? `<div class="sum-row sum-row--extra"><span>Eggless preparation (${state.weight})</span><span>${inr(egglessExtra())}</span></div>`
          : ""
      }

      <div class="sum-block">
        <h5>Frostings</h5>
        <ul class="sum-list">${frostingRows}</ul>
        <div class="sum-sub"><span>Frosting subtotal</span><span>${inr(frostingSubtotal())}</span></div>
      </div>

      <div class="sum-block">
        <h5>Choco Chips</h5>
        <ul class="sum-list">${chipRows}</ul>
        <div class="sum-sub"><span>Choco chips subtotal</span><span>${inr(chipsSubtotal())}</span></div>
      </div>

      <div class="sum-row sum-row--total">
        <span>Brownie &amp; add-ons subtotal</span>
        <strong>${inr(subtotal())}</strong>
      </div>

      <div class="sum-delivery">
        <p class="delivery-note">${CONFIG.deliveryMessage}</p>
        <div class="sum-row">
          <span>Delivery</span>
          <strong class="to-confirm">To be confirmed</strong>
        </div>
      </div>

      <div class="sum-row sum-row--final">
        <span>Final amount</span>
        <strong>${inr(subtotal())} + applicable delivery charges</strong>
      </div>`;

    // restore customer inputs
    $("#custName").value = state.customer.name || "";
  }

  /* ======================================================================
     8. STEP NAVIGATION
     ====================================================================== */
  const STEP_IDS = ["step-frosting", "step-chips", "step-summary"];
  let flowOpener = null;

  function openFlow() {
    const flow = $("#orderFlow");
    flowOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    flow.classList.add("is-open");
    flow.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $("#closeFlow").focus();
  }
  function closeFlow() {
    const flow = $("#orderFlow");
    flow.classList.remove("is-open");
    flow.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    currentStep = 0;
    if (flowOpener && flowOpener.isConnected) flowOpener.focus();
    flowOpener = null;
  }

  function goToStep(step) {
    currentStep = step;
    STEP_IDS.forEach((id, i) => {
      const el = $("#" + id);
      if (el) el.classList.toggle("is-active", i === step - 1);
    });
    if (step === 1) renderFrostings();
    if (step === 2) renderChips();
    if (step === 3) renderSummary();
    const foot = $("#summaryFoot");
    if (foot) foot.classList.toggle("is-visible", step === 3);
    updateProgress();
    const panel = $("#flowScroll");
    if (panel) panel.scrollTop = 0;
  }

  function updateProgress() {
    // stages: 1 Brownie (done once product chosen), 2 Frosting, 3 Chips, 4 Summary
    const map = { 1: 2, 2: 3, 3: 4 };
    const activeStage = map[currentStep] || 1;
    $$(".progress__step").forEach((el) => {
      const n = Number(el.dataset.stage);
      el.classList.toggle("is-active", n === activeStage);
      el.classList.toggle("is-done", n < activeStage);
      if (n === activeStage) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });
  }

  function startOrder(productId) {
    const p = getProduct(productId);
    if (!p) return;
    state.productId = productId;
    state.weight = state.cardWeights[productId] || "250g";
    state.eggless = !!state.cardEggless[productId];
    saveState();
    openFlow();
    goToStep(1);
    toast(p.name + " (" + state.weight + (state.eggless ? ", eggless" : "") + ") added — now customise!");
  }

  /* ======================================================================
     9. VALIDATION + checkout
     ====================================================================== */
  function validateCustomer() {
    const name = $("#custName").value.trim();
    setFieldError("custName", name ? "" : "Please enter your name.");
    state.customer = { name };
    saveState();
    return Boolean(name);
  }
  function setFieldError(fieldId, msg) {
    const err = $("#" + fieldId + "Err");
    const input = $("#" + fieldId);
    if (err) err.textContent = msg;
    if (input) input.classList.toggle("is-invalid", !!msg);
  }

  /* ======================================================================
     10. TOAST
     ====================================================================== */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-show"), 2400);
  }

  /* ======================================================================
     11. RESET
     ====================================================================== */
  function resetOrder() {
    state = defaultState();
    saveState();
    renderProducts();
    renderFrostings();
    renderChips();
    closeFlow();
    toast("Order cleared");
  }

  /* ======================================================================
     12. EVENT BINDING
     ====================================================================== */
  function bindEvents() {
    // ---- Product grid: weight select, price update, customise ----
    const grid = $("#productGrid");
    grid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-product]");
      if (!card) return;
      const pid = card.dataset.product;

      const weightBtn = e.target.closest("[data-weight]");
      if (weightBtn) {
        state.cardWeights[pid] = weightBtn.dataset.weight;
        saveState();
        updateCard(card);
        return;
      }

      const eggBtn = e.target.closest("[data-egg]");
      if (eggBtn) {
        state.cardEggless[pid] = eggBtn.dataset.egg === "eggless";
        saveState();
        updateCard(card);
        return;
      }

      const customise = e.target.closest("[data-customise]");
      if (customise) startOrder(pid);
    });

    // ---- Frosting selection ----
    $("#frostingGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-frosting]");
      if (!btn) return;
      const id = btn.dataset.frosting;
      const i = state.frostings.indexOf(id);
      if (i >= 0) state.frostings.splice(i, 1);
      else state.frostings.push(id);
      const on = state.frostings.includes(id);
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", String(on));
      saveState();
      updateFrostingMeta();
    });

    // ---- Chips selection ----
    $("#chipsGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-chip]");
      if (!btn) return;
      const id = btn.dataset.chip;
      const i = state.chips.indexOf(id);
      if (i >= 0) state.chips.splice(i, 1);
      else state.chips.push(id);
      const on = state.chips.includes(id);
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", String(on));
      saveState();
      updateChipsMeta();
    });

    // ---- Flow navigation buttons ----
    $("#frostingBack").addEventListener("click", closeFlow);
    $("#frostingSkip").addEventListener("click", () => {
      state.frostings = [];
      saveState();
      renderFrostings();
      goToStep(2);
    });
    $("#frostingNext").addEventListener("click", () => goToStep(2));

    $("#chipsBack").addEventListener("click", () => goToStep(1));
    $("#chipsSkip").addEventListener("click", () => {
      state.chips = [];
      saveState();
      renderChips();
      goToStep(3);
    });
    $("#chipsNext").addEventListener("click", () => goToStep(3));

    $("#summaryBack").addEventListener("click", () => goToStep(2));
    $("#closeFlow").addEventListener("click", closeFlow);
    $("#flowOverlay").addEventListener("click", closeFlow);

    // Progress buttons navigate directly between order stages.
    $$("[data-progress-step]").forEach((el) => {
      el.addEventListener("click", () => {
        const stage = Number(el.dataset.progressStep);
        if (!state.productId) return;
        if (stage === 2) goToStep(1);
        else if (stage === 3) goToStep(2);
        else if (stage === 4) goToStep(3);
      });
    });

    // ---- Customer inputs persist ----
    ["custName"].forEach((idField) => {
      const el = $("#" + idField);
      el.addEventListener("input", () => {
        const key = idField.replace("cust", "").toLowerCase();
        state.customer[key] = el.value;
        saveState();
        setFieldError(idField, "");
      });
    });

    // ---- Place order via WhatsApp ----
    $("#placeOrder").addEventListener("click", () => {
      if (!state.productId) {
        toast("Please select a brownie first");
        return;
      }
      if (!validateCustomer()) {
        toast("Please complete the required details");
        const firstErr = $(".is-invalid");
        if (firstErr) firstErr.focus();
        return;
      }
      window.open(waUrl(buildOrderMessage()), "_blank", "noopener");
    });

    // ---- Reset ----
    $$("[data-reset]").forEach((b) =>
      b.addEventListener("click", resetOrder)
    );

    // ---- Floating & nav enquiry ----
    $$("[data-enquiry]").forEach((a) => {
      a.href = waUrl(ENQUIRY_MESSAGE);
    });

    // ---- Start-order CTA buttons scroll to catalogue ----
    $$('[data-scroll="catalogue"]').forEach((b) =>
      b.addEventListener("click", () => goToMenu("brownies"))
    );

    // ---- Menu tabs ----
    $("#menuTabs").addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab]");
      if (tab) showTab(tab.dataset.tab);
    });
    $("#panel-soon").addEventListener("click", (e) => {
      const go = e.target.closest("[data-tab-go]");
      if (go) goToMenu(go.dataset.tabGo);
    });

    // ---- Mobile nav ----
    const burger = $("#burger");
    const nav = $("#navLinks");
    if (burger && nav) {
      burger.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        burger.classList.toggle("is-open", open);
        burger.setAttribute("aria-expanded", String(open));
      });
      $$("a", nav).forEach((a) =>
        a.addEventListener("click", () => {
          nav.classList.remove("is-open");
          burger.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
        })
      );
    }

    // ---- Nav shadow on scroll ----
    const header = $("#header");
    if (header) {
      const onScroll = () =>
        header.classList.toggle("is-scrolled", window.scrollY > 10);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // ---- Escape closes flow ----
    document.addEventListener("keydown", (e) => {
      const flow = $("#orderFlow");
      if (e.key === "Escape") {
        closeFlow();
        return;
      }
      if (e.key !== "Tab" || !flow.classList.contains("is-open")) return;

      const panel = $(".order-flow__panel", flow);
      const focusable = $$('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])', panel)
        .filter((el) => el.getClientRects().length > 0);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ======================================================================
     13. STATIC CONTENT INJECTION
     ====================================================================== */
  function injectStatic() {
    $$("[data-delivery-msg]").forEach((el) => {
      el.textContent = CONFIG.deliveryMessage;
    });
    const eggNote = $("#eggNote");
    if (eggNote) {
      const s = CONFIG.egglessSurcharge;
      eggNote.textContent =
        "Prices shown are for egg-based brownies. Choose Eggless to add " +
        inr(s["250g"]) + " / " + inr(s["500g"]) + " / " + inr(s["1kg"]) +
        " for 250g / 500g / 1kg.";
    }
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ======================================================================
     14. INIT
     ====================================================================== */
  function init() {
    injectStatic();
    renderTabs();
    renderSoonGrid();
    renderProducts();
    renderFrostings();
    renderChips();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
