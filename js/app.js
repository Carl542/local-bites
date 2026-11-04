(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Configuration and application state
  // ---------------------------------------------------------------------------

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const PRODUCT_IMAGE_BUCKET = "product-images";
  const EMPTY_IMAGE =
    "https://placehold.co/500x500/e8f5eb/056532?text=Fresh+Produce";

  const state = {
    selectedRole: "buyer",
    currentUser: null,
    currentProfile: null,
    currentFarm: null,
    products: [],
    sellerProducts: [],
    cart: [],
    cartId: null,
    cartBusy: false,
    search: "",
    category: "All Items",
    browseSearch: "",
    browseCategory: "All Items",
    browseSort: "newest",
    browsePriceMin: null,
    browsePriceMax: null,
    buyerOrders: [],
    buyerOrderFilter: "all",
  };

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [
    ...parent.querySelectorAll(selector),
  ];

  const dom = {
    roleScreen: $("#role-screen"),
    buyerApp: $("#buyer-app"),
    sellerApp: $("#seller-app"),
    productGrid: $("#product-grid"),
    buyerHome: $(".buyer-storefront"),
    buyerBrowsePage: $("#buyer-browse-page"),
    buyerOrdersPage: $("#buyer-orders-page"),
    browseProductGrid: $("#browse-product-grid"),
    searchInput: $("#search-input"),
    toast: $("#toast"),
    cartDrawer: $("#cart-drawer"),
    cartOverlay: $("#cart-overlay"),
    cartItems: $("#cart-items"),
    cartCount: $("#cart-count"),
    cartTotal: $("#cart-total"),
    checkoutModal: $("#checkout-modal"),
    checkoutCard: $(".checkout-card"),
    checkoutForm: $("#checkout-form"),
    checkoutTotal: $("#checkout-total"),
    orderSuccess: $("#order-success"),
    ordersSection: $("#orders"),
    ordersList: $("#orders-list"),
    buyerOrderDetailModal: $("#buyer-order-detail-modal"),
    buyerOrderDetailBody: $("#buyer-order-detail-body"),
  };

  const ENTRY_FILES = {
    buyer: "pages/home.html",
    browse: "pages/browse.html",
    orders: "pages/orders.html",
    seller: "seller/dashboard.html",
  };

  function appUrl(path = "index.html") {
    return new URL(path, window.LOCALBITES_ROOT_URL || window.location.origin).href;
  }

  function currentPageKind() {
    return document.body.dataset.localbitesPage || "landing";
  }

  function currentBuyerRoute() {
    if (currentPageKind() === "browse") return "#browse";
    if (currentPageKind() === "orders") return "#orders";
    if (currentPageKind() === "buyer" && window.location.hash === "#about") return "#about";
    return "#home";
  }

  function buyerLinkRoute(link) {
    return link?.dataset.route || new URL(link?.href || "#home", window.location.href).hash || "#home";
  }

  function openBuyerEntry(page, options = {}) {
    const file = ENTRY_FILES[page] || ENTRY_FILES.buyer;
    const params = new URLSearchParams();
    if (options.farm) params.set("farm", options.farm);
    if (options.category && options.category !== "All Items") params.set("category", options.category);
    const query = params.toString();
    const target = new URL(file, window.LOCALBITES_ROOT_URL || window.location.href);
    target.search = query;
    window.location.href = target.href;
  }

  function redirectToRoleEntry(role) {
    const current = currentPageKind();
    if (role === "buyer" && ["buyer", "browse", "orders"].includes(current)) return false;
    if (role === "seller" && current === "seller") return false;
    const target = role === "seller" ? ENTRY_FILES.seller : ENTRY_FILES.buyer;
    window.location.href = appUrl(target);
    return true;
  }

  function restoreEntryFilters() {
    const params = new URLSearchParams(window.location.search);
    const farm = params.get("farm");
    const category = params.get("category");
    if (farm) state.browseSearch = farm;
    if (category) state.browseCategory = category;
  }

  // ---------------------------------------------------------------------------
  // General UI helpers
  // ---------------------------------------------------------------------------

  function escapeHtml(value = "") {
    return String(value).replace(
      /[&<>'"]/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[character],
    );
  }

  function safeImageUrl(value) {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : EMPTY_IMAGE;
    } catch {
      return EMPTY_IMAGE;
    }
  }

  function formatMoney(value) {
    return `₱${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  function showToast(message, duration = 2200) {
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    window.setTimeout(() => dom.toast.classList.remove("show"), duration);
  }

  function openModal(element) {
    element?.classList.add("open");
  }

  function closeModal(element) {
    element?.classList.remove("open");
  }

  function finishEntryBoot() {
    $("#entry-auth-loading")?.remove();
    document.body.classList.remove("entry-auth-pending");
  }

  function setPortal(role = null) {
    dom.roleScreen.style.display = role ? "none" : "grid";
    dom.buyerApp.style.display = role === "buyer" ? "block" : "none";
    dom.sellerApp.style.display = role === "seller" ? "block" : "none";
  }

  function setBuyerActiveNav(hash = "#home") {
    const normalized = ["#home", "#browse", "#orders", "#about"].includes(hash) ? hash : "#home";
    $$("#buyer-app .desktop-nav a, #buyer-app .mobile-nav a").forEach((link) => {
      const active = buyerLinkRoute(link) === normalized;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function syncBuyerNavFromScroll() {
    const route = currentBuyerRoute();
    if (["#browse", "#orders"].includes(route)) {
      setBuyerActiveNav(route);
      return;
    }
    const current = buyerLinkRoute($("#buyer-app .desktop-nav a.active"));
    if (["#about", "#orders"].includes(current)) return;
    const browse = $("#browse");
    const threshold = ($("#buyer-app .buyer-topbar")?.offsetHeight || 0) + 110;
    setBuyerActiveNav(browse && browse.getBoundingClientRect().top <= threshold ? "#browse" : "#home");
  }

  function renderBuyerRoute() {
    const route = currentBuyerRoute();
    const browsing = route === "#browse";
    const ordering = route === "#orders";
    if (dom.buyerHome) dom.buyerHome.hidden = browsing || ordering;
    if (dom.buyerBrowsePage) dom.buyerBrowsePage.hidden = !browsing;
    if (dom.buyerOrdersPage) dom.buyerOrdersPage.hidden = !ordering;
    setBuyerActiveNav(browsing ? "#browse" : ordering ? "#orders" : route === "#about" ? "#about" : "#home");
    if (browsing) {
      dom.searchInput.value = state.browseSearch;
      const pageSearch = $("#browse-search-input");
      if (pageSearch) pageSearch.value = state.browseSearch;
      renderBrowseProducts();
      window.scrollTo({ top: 0, behavior: "auto" });
    } else if (ordering) {
      dom.searchInput.value = "";
      if (state.currentUser && state.selectedRole === "buyer") loadBuyerOrders();
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      dom.searchInput.value = state.search;
      if (route === "#about") window.requestAnimationFrame(() => $("#about")?.scrollIntoView({ block: "start" }));
      else if (route === "#home") window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function createCloseButton(id, onClick) {
    const button = document.createElement("button");
    button.id = id;
    button.className = "close-cart";
    button.type = "button";
    button.innerHTML = "&times;";
    button.addEventListener("click", onClick);
    return button;
  }

  // ---------------------------------------------------------------------------
  // Generated dialogs and controls
  // ---------------------------------------------------------------------------

  const authModal = document.createElement("section");
  authModal.className = "auth-modal";
  authModal.setAttribute("role", "dialog");
  authModal.setAttribute("aria-modal", "true");
  authModal.setAttribute("aria-labelledby", "auth-title");
  authModal.innerHTML = `
    <div class="auth-card">
      <aside class="auth-visual" aria-hidden="true">
        <div class="auth-visual-brand">
          <span class="auth-logo-mark">
            <svg viewBox="0 0 48 48"><path d="M24 40V20M24 30C14 29 10 23 10 14c9 0 15 5 14 16Zm0-4c1-10 7-15 16-16 0 9-5 15-16 16Z"/></svg>
          </span>
          <span><strong>LocalBites</strong><small>FARMER CO-OP</small></span>
        </div>
        <p class="auth-visual-kicker">FRESH FOOD <i>•</i> STRONGER COMMUNITIES <i>•</i> BRIGHTER TOMORROWS</p>
        <p class="auth-script">Fresh.<br>Local.<br>Sustainable.<span></span></p>
        <span class="auth-leaf-large"></span>
        <span class="auth-leaf auth-leaf-one"></span>
        <span class="auth-leaf auth-leaf-two"></span>
        <div class="auth-harvest"><img src="${appUrl("assets/portal-produce-v2.png")}" alt=""></div>
      </aside>
      <div class="auth-panel">
        <button class="auth-close" id="auth-close" type="button" aria-label="Close authentication dialog">&times;</button>
        <div class="auth-head">
          <span class="auth-role" id="auth-role"><span id="auth-role-icon" aria-hidden="true">🛒</span><b id="auth-role-text">Buyer</b></span>
          <h2 id="auth-title">Welcome back to <span>LocalBites!</span></h2>
          <p id="auth-subtitle">Sign in to discover fresh harvests and support local farmers.</p>
        </div>
        <form class="auth-form" id="auth-form">
          <label for="auth-email">Email</label>
          <div class="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zM3 6l9 7 9-7"/></svg>
            <input id="auth-email" type="email" autocomplete="email" required placeholder="you@example.com">
          </div>
          <label for="auth-password">Password</label>
          <div class="auth-field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3M12 14v2"/></svg>
            <input id="auth-password" type="password" autocomplete="current-password" required minlength="6" placeholder="Enter your password">
            <button class="auth-password-toggle" id="auth-password-toggle" type="button" aria-label="Show password" aria-pressed="false">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>
            </button>
          </div>
          <div class="auth-status" id="auth-status" role="status" aria-live="polite"></div>
          <button class="auth-submit" type="submit" id="auth-submit"><span aria-hidden="true">⇥</span><b>Sign in</b></button>
          <div class="auth-divider"><span>or</span></div>
          <button type="button" class="auth-switch" id="auth-switch"><span aria-hidden="true">♙</span><b>Create a new account</b></button>
        </form>
        <div class="auth-community"><span aria-hidden="true">◒</span><p>Join our growing community of local farmers today and bring fresh food to more tables.</p><b aria-hidden="true">→</b></div>
      </div>
    </div>`;
  document.body.appendChild(authModal);

  const profileModal = document.createElement("section");
  profileModal.className = "profile-modal";
  profileModal.setAttribute("role", "dialog");
  profileModal.setAttribute("aria-modal", "true");
  profileModal.setAttribute("aria-labelledby", "profile-title");
  profileModal.innerHTML = `
    <div class="profile-card seller-profile-card">
      <header class="seller-profile-head"><span class="seller-profile-title-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-5 3-8 8-8s8 3 8 8"/></svg></span><div><h2 id="profile-title">Profile</h2><p id="profile-subtitle">Manage your account information.</p></div><button class="close-cart profile-close" type="button" aria-label="Close profile">&times;</button><i class="profile-leaf leaf-a" aria-hidden="true"></i><i class="profile-leaf leaf-b" aria-hidden="true"></i></header>
      <form class="profile-form" id="profile-form">
        <div class="seller-profile-layout">
          <aside class="seller-profile-summary">
            <div class="seller-profile-portrait"><img src="${appUrl("assets/seller-sidebar-landscape.svg")}" alt="LocalBites farm landscape"><span id="profile-summary-avatar" aria-hidden="true">B</span><button type="button" disabled aria-label="Profile photo upload is not available" title="Profile photo upload is not available yet"><svg viewBox="0 0 24 24"><path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/></svg></button></div>
            <h3 id="profile-summary-name">Buyer</h3><p id="profile-summary-role">Buyer Account</p><span class="seller-profile-active"><svg viewBox="0 0 24 24"><path d="M20 4C12 4 6 8 6 16c8 0 12-5 14-12ZM6 16c-1 1-2 3-2 5"/></svg><span id="profile-summary-badge">Active Account</span></span><hr>
            <dl><div><dt><svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zM3 6l9 7 9-7"/></svg><span class="sr-only">Email</span></dt><dd id="profile-summary-email">—</dd></div><div><dt><svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-3 2c2 4 4 6 8 8l2-3 5 2v4c0 1-1 2-2 2C10 23 1 14 2 3c0-1 1-2 3-2Z"/></svg><span class="sr-only">Phone</span></dt><dd id="profile-summary-phone">—</dd></div><div><dt><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg><span class="sr-only">Location</span></dt><dd id="profile-summary-location">—</dd></div><div><dt><svg viewBox="0 0 24 24"><path d="M4 5h16v16H4zM8 2v6m8-6v6M4 10h16"/></svg><span class="sr-only">Joined</span></dt><dd id="profile-summary-joined">—</dd></div></dl>
            <button type="button" class="profile-logout seller-profile-logout"><svg viewBox="0 0 24 24"><path d="M10 5H5v14h5M14 8l4 4-4 4m4-4H9"/></svg>Log out</button>
          </aside>
          <div class="seller-profile-details">
            <section class="seller-profile-section" data-profile-section="personal"><header><span><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-5 3-8 8-8s8 3 8 8"/></svg></span><div><h3>Personal Information</h3><p>Your basic account details.</p></div><button type="button" data-profile-edit="personal"><svg viewBox="0 0 24 24"><path d="m4 20 4-1 11-11-3-3L5 16l-1 4Zm10-13 3 3"/></svg>Edit</button></header><div class="seller-profile-fields">
              <label><span class="profile-field-label">Full Name <b class="profile-required" aria-hidden="true">*</b></span><span><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-5 3-8 8-8s8 3 8 8"/></svg><input name="full_name" aria-required="true" required readonly></span></label>
              <label>Username<span><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-5 3-8 8-8s8 3 8 8"/></svg><input name="username" readonly></span></label>
              <label>Email Address<span><svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zM3 6l9 7 9-7"/></svg><input name="email" type="email" readonly></span></label>
              <label>Contact Number<span><svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-3 2c2 4 4 6 8 8l2-3 5 2v4c0 1-1 2-2 2C10 23 1 14 2 3c0-1 1-2 3-2Z"/></svg><input name="phone" readonly></span></label>
              <input name="role" type="hidden">
            </div></section>
            <section class="seller-profile-section" id="farm-fields" data-profile-section="farm"><header><span><svg viewBox="0 0 24 24"><path d="M20 4C12 4 6 8 6 16c8 0 12-5 14-12ZM6 16c-1 1-2 3-2 5"/></svg></span><div><h3>Farm Information</h3><p>Your farm details and location.</p></div><button type="button" data-profile-edit="farm"><svg viewBox="0 0 24 24"><path d="m4 20 4-1 11-11-3-3L5 16l-1 4Zm10-13 3 3"/></svg>Edit</button></header><div class="seller-profile-fields">
              <label>Farm Name<span><svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6"/></svg><input name="farm_name" readonly></span></label>
              <label>Farm Location<span><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg><input name="location" readonly></span></label>
            </div></section>
            <section class="seller-profile-section buyer-delivery-section" id="buyer-delivery-fields" data-profile-section="delivery"><header><span><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg></span><div><h3>Delivery Information</h3><p>Manage your preferred checkout details.</p></div><button type="button" data-profile-edit="delivery"><svg viewBox="0 0 24 24"><path d="m4 20 4-1 11-11-3-3L5 16l-1 4Zm10-13 3 3"/></svg>Edit</button></header><div class="seller-profile-fields">
              <label><span class="profile-field-label">Restaurant / Business Name <small>(Optional)</small></span><span><svg viewBox="0 0 24 24"><path d="M4 10h16v11H4zM2 10l2-6h16l2 6M8 21v-6h4v6"/></svg><input name="business_name" maxlength="100" autocomplete="organization" readonly></span></label>
              <label><span class="profile-field-label">Preferred Delivery Address <b class="profile-required" aria-hidden="true">*</b></span><span class="profile-textarea-field"><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg><textarea name="delivery_address" rows="2" maxlength="240" autocomplete="street-address" aria-required="true" readonly></textarea></span></label>
            </div></section>
            <section class="seller-profile-security"><span><svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3Zm0 6v8m-3-4h6"/></svg></span><div><h3>Account Security</h3><p>Manage your account security.</p></div><button type="button" class="profile-password-reset"><svg viewBox="0 0 24 24"><path d="M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3"/></svg>Change Password</button></section>
          </div>
        </div>
        <div class="profile-feedback" id="profile-feedback" role="status" aria-live="polite" hidden></div>
        <div class="seller-profile-savebar" hidden><div class="profile-message" id="profile-message" role="status" aria-live="polite"></div><button type="button" class="profile-edit-cancel">Cancel</button><button type="submit"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>Save Changes</button></div>
      </form>
    </div>`;
  document.body.appendChild(profileModal);

  const sellerProductsModal = document.createElement("section");
  sellerProductsModal.className = "seller-products-modal";
  sellerProductsModal.setAttribute("role", "dialog");
  sellerProductsModal.setAttribute("aria-modal", "true");
  sellerProductsModal.setAttribute("aria-labelledby", "seller-products-title");
  sellerProductsModal.innerHTML = `
    <div class="seller-products-card">
      <div class="seller-products-head">
        <div class="seller-products-heading"><span class="seller-products-title-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 40V20M24 30C14 29 10 23 10 14c9 0 15 5 14 16Zm0-4c1-10 7-15 16-16 0 9-5 15-16 16Z"/></svg></span><div><h2 id="seller-products-title">Manage products</h2><p id="seller-products-subtitle">Manage the fresh products in your catalog.</p><span class="seller-products-count" id="seller-products-count">0 products</span></div></div>
        <div class="seller-products-head-actions"><button class="seller-products-add" type="button"><span aria-hidden="true">+</span> Add Product</button><button class="close-cart seller-products-close" type="button" aria-label="Close product dialog">&times;</button></div>
      </div>
      <p class="seller-db-status" id="seller-db-status"></p>
      <form class="seller-form" id="seller-product-form">
        <div class="seller-product-layout">
          <div class="seller-product-fields">
            <label class="seller-field-wide">Product name <b>*</b>
              <input name="name" required placeholder="e.g. Roma Tomatoes">
            </label>
            <div class="seller-form-grid">
              <label>Category <b>*</b>
                <select name="category" required>
                  <option>Vegetables</option>
                  <option>Fruits</option>
                  <option>Herbs</option>
                  <option>Dairy &amp; Eggs</option>
                  <option>Meat &amp; Seafood</option>
                </select>
              </label>
              <label>Unit <b>*</b>
                <select name="unit" required>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="item">Item</option>
                </select>
              </label>
              <label>Price (&#8369;) <b>*</b>
                <input name="price" type="number" min="0.01" step="0.01" required placeholder="0.00">
              </label>
              <label>Available quantity <b>*</b>
                <input name="quantity" type="number" min="0" step="0.01" required placeholder="e.g. 50">
              </label>
            </div>
            <label>Product description
              <textarea name="description" rows="3" placeholder="Describe freshness, harvest time, or packaging"></textarea>
            </label>
            <label>Product image
              <span class="seller-image-drop" id="seller-image-drop" tabindex="0">
                <input name="image" type="file" accept="image/png,image/jpeg,image/webp">
                <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 34V14m-8 8 8-8 8 8"/><path d="M12 36a8 8 0 0 1-1-16 13 13 0 0 1 25-2 9 9 0 0 1 0 18H12Z"/></svg>
                <strong>Click to upload an image</strong><small>or drag and drop</small><em>PNG, JPG or WEBP (Max 5MB)</em>
              </span>
            </label>
          </div>
          <aside class="seller-form-preview" aria-live="polite">
            <h3><span aria-hidden="true">&#9673;</span> Product Preview</h3>
            <p>This is how your product will appear to buyers.</p>
            <article>
              <img id="seller-preview-image" src="${EMPTY_IMAGE}" alt="Selected product preview">
              <strong id="seller-preview-name">Your product name</strong>
              <small id="seller-preview-category">Vegetables</small>
              <div><b id="seller-preview-price">&#8369;0/kg</b><span id="seller-preview-quantity">0 kg available</span></div>
              <p id="seller-preview-description">Your product description will appear here.</p>
            </article>
          </aside>
        </div>
        <div class="seller-product-actions-bar">
          <button type="button" class="seller-product-cancel">Cancel</button>
          <button type="submit" class="seller-product-save"><span aria-hidden="true">&#9635;</span><b>Save product</b></button>
        </div>
      </form>
      <div class="seller-db-list" id="seller-db-list"></div>
      <span class="seller-product-leaf leaf-one" aria-hidden="true"></span><span class="seller-product-leaf leaf-two" aria-hidden="true"></span>
    </div>`;
  document.body.appendChild(sellerProductsModal);

  const sellerOrdersModal = document.createElement("section");
  sellerOrdersModal.className = "seller-action-modal";
  sellerOrdersModal.setAttribute("role", "dialog");
  sellerOrdersModal.setAttribute("aria-modal", "true");
  sellerOrdersModal.setAttribute("aria-labelledby", "seller-orders-title");
  sellerOrdersModal.innerHTML = `
    <div class="seller-action-card seller-orders-card">
      <header class="seller-orders-head"><span class="seller-orders-title-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 2h9l4 4v16H6zM14 2v5h5M9 12h7M9 16h7M9 8h2"/></svg></span><div><h2 id="seller-orders-title">Incoming Orders</h2><p>View and manage customer orders, track fulfillment, and update order statuses.</p></div><button class="close-cart seller-orders-close" type="button" aria-label="Close incoming orders">&times;</button><span class="seller-orders-leaf leaf-a" aria-hidden="true"></span><span class="seller-orders-leaf leaf-b" aria-hidden="true"></span></header>
      <section class="seller-order-summary" id="seller-order-summary" aria-label="Order status summary"></section>
      <nav class="seller-order-filters" id="seller-order-filters" aria-label="Filter incoming orders"></nav>
      <div id="seller-order-list" class="seller-order-list" aria-live="polite">Loading orders...</div>
    </div>`;
  document.body.appendChild(sellerOrdersModal);

  const sellerDeliveriesModal = document.createElement("section");
  sellerDeliveriesModal.className = "seller-action-modal seller-deliveries-modal";
  sellerDeliveriesModal.setAttribute("role", "dialog");
  sellerDeliveriesModal.setAttribute("aria-modal", "true");
  sellerDeliveriesModal.setAttribute("aria-labelledby", "seller-deliveries-title");
  sellerDeliveriesModal.innerHTML = `
    <div class="seller-action-card seller-deliveries-card">
      <header class="seller-deliveries-head">
        <span class="seller-deliveries-title-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 6h11v11H3zM14 10h4l3 4v3h-7M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg></span>
        <div><h2 id="seller-deliveries-title">Deliveries</h2><p>Track and manage your order deliveries.</p></div>
        <button class="close-cart seller-deliveries-close" type="button" aria-label="Close deliveries">&times;</button>
        <span class="seller-deliveries-leaf" aria-hidden="true"></span>
      </header>
      <nav id="seller-delivery-filters" class="seller-delivery-filters" aria-label="Filter deliveries"></nav>
      <div id="seller-delivery-list" class="seller-delivery-list" aria-live="polite">Loading deliveries...</div>
    </div>`;
  document.body.appendChild(sellerDeliveriesModal);

  const sellerInventoryModal = document.createElement("section");
  sellerInventoryModal.className = "seller-action-modal seller-inventory-modal";
  sellerInventoryModal.setAttribute("role", "dialog");
  sellerInventoryModal.setAttribute("aria-modal", "true");
  sellerInventoryModal.setAttribute("aria-labelledby", "seller-inventory-title");
  sellerInventoryModal.innerHTML = `
    <div class="seller-action-card seller-inventory-card">
      <header class="seller-inventory-head">
        <span class="seller-inventory-title-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 20v-7M12 20V4M19 20V9"/></svg></span>
        <div><h2 id="seller-inventory-title">Inventory Alerts</h2><p>Monitor low stock products and restock to keep your farm ready.</p></div>
        <button class="close-cart seller-inventory-close" type="button" aria-label="Close inventory alerts">&times;</button>
        <span class="seller-inventory-leaf leaf-a" aria-hidden="true"></span><span class="seller-inventory-leaf leaf-b" aria-hidden="true"></span>
      </header>
      <section id="seller-inventory-summary" class="seller-inventory-summary" aria-label="Inventory summary"></section>
      <div class="seller-inventory-tools"><nav id="seller-inventory-filters" class="seller-inventory-filters" aria-label="Filter inventory"></nav><label class="seller-inventory-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><span class="sr-only">Search inventory</span><input id="seller-inventory-search" type="search" placeholder="Search products..." autocomplete="off"></label></div>
      <div id="seller-inventory-list" class="seller-inventory-list" aria-live="polite">Loading inventory...</div>
    </div>`;
  document.body.appendChild(sellerInventoryModal);

  const sellerSettingsModal = document.createElement("section");
  sellerSettingsModal.className = "seller-action-modal seller-settings-modal";
  sellerSettingsModal.setAttribute("role", "dialog");
  sellerSettingsModal.setAttribute("aria-modal", "true");
  sellerSettingsModal.setAttribute("aria-labelledby", "seller-settings-title");
  sellerSettingsModal.innerHTML = `
    <div class="seller-action-card seller-settings-card">
      <header class="seller-settings-head"><span class="seller-settings-title-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-3.6v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1A2 2 0 0 0 4.6 15a2 2 0 0 0-1.8-1.2H2v-3.6h.8A2 2 0 0 0 4.6 9a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 4.6a2 2 0 0 0 1.2-1.8V2h3.6v.8A2 2 0 0 0 15 4.6a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.2H22v3.6h-.8A2 2 0 0 0 19.4 15Z"/></svg></span><div><h2 id="seller-settings-title">Settings</h2><p>Manage your preferences and account settings.</p></div><button class="close-cart seller-settings-close" type="button" aria-label="Close settings">&times;</button><i class="seller-settings-leaf leaf-a" aria-hidden="true"></i><i class="seller-settings-leaf leaf-b" aria-hidden="true"></i></header>
      <div class="seller-settings-content">
        <section class="seller-settings-section"><header><span><svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg></span><div><h3>Notifications</h3><p>Receive important updates about your orders and inventory.</p></div></header><div class="seller-settings-rows">
          <div class="seller-settings-row"><span><svg viewBox="0 0 24 24"><path d="M5 4h3l2 11h9l2-8H9M12 20h.01M18 20h.01"/></svg></span><div><strong>Order Notifications</strong><small>Get notified when you receive new orders from buyers.</small></div><button type="button" class="seller-settings-switch" data-setting-toggle="orders" role="switch" aria-checked="true"><i></i><b>Enabled</b></button></div>
          <div class="seller-settings-row"><span><svg viewBox="0 0 24 24"><path d="m12 2 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V7M12 12v10"/></svg></span><div><strong>Inventory Alerts</strong><small>Get notified when your products are low in stock.</small></div><button type="button" class="seller-settings-switch" data-setting-toggle="inventory" role="switch" aria-checked="true"><i></i><b>Enabled</b></button></div>
        </div></section>
        <section class="seller-settings-section seller-appearance-section"><header><span><svg viewBox="0 0 24 24"><path d="M21 15a9 9 0 1 1-12-12 7 7 0 0 0 12 12Z"/></svg></span><div><h3>Appearance</h3><p>Choose your preferred display theme.</p></div></header><div class="seller-theme-options">
          <button type="button" data-theme-choice="light"><span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></span><div><strong>Light Mode</strong><small>Clean and bright interface</small></div><i aria-hidden="true"></i></button>
          <button type="button" data-theme-choice="dark"><span><svg viewBox="0 0 24 24"><path d="M21 15a9 9 0 1 1-12-12 7 7 0 0 0 12 12Z"/></svg></span><div><strong>Dark Mode</strong><small>Easy on the eyes at night</small></div><i aria-hidden="true"></i></button>
        </div></section>
        <section class="seller-settings-section seller-security-section"><header><span><svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3Zm0 5v10m-5-5h10"/></svg></span><div><h3>Account Security</h3><p>Manage your account security and password.</p></div></header><div class="seller-settings-row"><span><svg viewBox="0 0 24 24"><path d="M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3"/></svg></span><div><strong>Change Password</strong><small>Update your password to keep your account secure.</small></div><button type="button" class="seller-settings-password"><svg viewBox="0 0 24 24"><path d="M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3"/></svg>Change Password</button></div></section>
      </div>
    </div>`;
  document.body.appendChild(sellerSettingsModal);

  const sellerInfoModal = document.createElement("section");
  sellerInfoModal.className = "seller-action-modal";
  sellerInfoModal.innerHTML = `
    <div class="seller-action-card">
      <button class="close-cart seller-info-close" type="button">&times;</button>
      <h2 id="seller-info-title"></h2>
      <div id="seller-info-content"></div>
    </div>`;
  document.body.appendChild(sellerInfoModal);

  const themeButton = document.createElement("button");
  themeButton.className = "theme-toggle";
  themeButton.type = "button";
  themeButton.setAttribute("aria-label", "Toggle dark mode");
  document.body.appendChild(themeButton);

  function createProfilePills() {
    $$(".seller-top").forEach((header) => {
      const button = document.createElement("button");
      button.className = "icon-button profile-open";
      button.type = "button";
      button.setAttribute("aria-label", "View profile");
      button.innerHTML = `
        <span class="profile-avatar">&#9679;</span>
        <span class="profile-copy"><strong>Guest User</strong><small>View Profile</small></span>
        <span class="profile-arrow">&rsaquo;</span>`;
      button.addEventListener("click", openProfileEditor);

      const logoutButton = $(".logout-btn", header);
      header.insertBefore(button, logoutButton || null);
    });
  }

  // ---------------------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------------------

  function setTheme(darkMode) {
    document.body.classList.toggle("dark-mode", darkMode);
    themeButton.textContent = darkMode ? "\u2600" : "\u263E";
    localStorage.setItem("localbites-dark", darkMode ? "1" : "0");
    if (sellerSettingsModal.classList.contains("open")) renderSellerSettings();
  }

  function sellerSettingsStorageKey() {
    return `localbites-seller-settings:${state.currentUser?.id || "guest"}`;
  }

  function loadSellerSettings() {
    try {
      return { orders: true, inventory: true, ...JSON.parse(localStorage.getItem(sellerSettingsStorageKey()) || "{}") };
    } catch {
      return { orders: true, inventory: true };
    }
  }

  function saveSellerSettings(settings) {
    localStorage.setItem(sellerSettingsStorageKey(), JSON.stringify(settings));
  }

  function renderSellerSettings() {
    const settings = loadSellerSettings();
    $$("[data-setting-toggle]", sellerSettingsModal).forEach((button) => {
      const enabled = Boolean(settings[button.dataset.settingToggle]);
      button.classList.toggle("on", enabled);
      button.setAttribute("aria-checked", String(enabled));
      $("b", button).textContent = enabled ? "Enabled" : "Disabled";
    });
    const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    $$("[data-theme-choice]", sellerSettingsModal).forEach((button) => {
      const selected = button.dataset.themeChoice === currentTheme;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function openSellerSettings() {
    renderSellerSettings();
    openModal(sellerSettingsModal);
  }

  // ---------------------------------------------------------------------------
  // Authentication and portal routing
  // ---------------------------------------------------------------------------

  let signUpMode = false;

  function clearAuthForm() {
    $("#auth-form").reset();
    $("#auth-status").textContent = "";
    $("#auth-password").type = "password";
    $("#auth-password-toggle").setAttribute("aria-label", "Show password");
    $("#auth-password-toggle").setAttribute("aria-pressed", "false");
  }

  function updateAuthCopy() {
    const seller = state.selectedRole === "seller";
    $(".auth-card").dataset.role = state.selectedRole;
    $(".auth-card").classList.toggle("auth-signup", signUpMode);
    $("#auth-role-text").textContent = seller ? "Seller" : "Buyer";
    $("#auth-role-icon").textContent = seller ? "🌱" : "🛒";
    $("#auth-title").innerHTML = signUpMode
      ? "Create your <span>LocalBites</span> account"
      : "Welcome back to <span>LocalBites!</span>";
    $("#auth-subtitle").textContent = signUpMode
      ? seller
        ? "Create a seller account to manage your farm, products, and customers."
        : "Create a buyer account to discover fresh harvests from local farmers."
      : seller
        ? "Sign in to manage your farm, products, and reach more customers."
        : "Sign in to discover fresh harvests and support local farmers.";
    $("#auth-submit b").textContent = signUpMode ? "Create account" : "Sign in";
    $("#auth-switch b").textContent = signUpMode
      ? "I already have an account"
      : "Create a new account";
    $("#auth-password").autocomplete = signUpMode
      ? "new-password"
      : "current-password";
  }

  function openAuth(role) {
    state.selectedRole = role;
    signUpMode = false;
    clearAuthForm();
    updateAuthCopy();
    openModal(authModal);
    window.setTimeout(() => $("#auth-email").focus(), 0);
  }

  function toggleAuthMode() {
    signUpMode = !signUpMode;
    $("#auth-status").textContent = "";
    updateAuthCopy();
  }

  async function ensureProfile(user, role) {
    const existing = await db
      .from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", user.id)
      .maybeSingle();

    if (existing.error) throw existing.error;
    if (existing.data) return existing.data;

    const fullName = user.email?.split("@")[0] || "LocalBites User";
    const created = await db
      .from("profiles")
      .insert({ id: user.id, full_name: fullName, role })
      .select("id, full_name, phone, role")
      .single();

    if (created.error) throw created.error;
    return created.data;
  }

  async function ensureSellerFarm(user, profile) {
    const existing = await db
      .from("farms")
      .select("id, farm_name, location")
      .eq("seller_id", user.id)
      .maybeSingle();

    if (existing.error) throw existing.error;
    if (existing.data) return existing.data;

    const created = await db
      .from("farms")
      .insert({
        seller_id: user.id,
        farm_name: `${profile.full_name}'s Farm`,
        location: "Digos Valley",
      })
      .select("id, farm_name, location")
      .single();

    if (created.error) throw created.error;
    return created.data;
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    const status = $("#auth-status");
    const submit = $("#auth-submit");
    const email = $("#auth-email").value.trim();
    const password = $("#auth-password").value;
    status.textContent = "Connecting to Supabase...";
    submit.disabled = true;
    submit.classList.add("is-loading");

    try {
      const response = signUpMode
        ? await db.auth.signUp({ email, password })
        : await db.auth.signInWithPassword({ email, password });

      if (response.error) throw response.error;

      if (!response.data.session) {
        status.textContent = "Account created. Confirm your email, then sign in.";
        return;
      }

      const profile = await ensureProfile(response.data.user, state.selectedRole);

      if (profile.role !== state.selectedRole) {
        await db.auth.signOut();
        throw new Error(`This account is registered as a ${profile.role}. Please use the ${profile.role} portal.`);
      }

      state.currentUser = response.data.user;
      state.currentProfile = profile;
      state.currentFarm =
        state.selectedRole === "seller" || profile.role === "seller"
          ? await ensureSellerFarm(response.data.user, profile)
          : null;
      SUPABASE_FARM_ID = state.currentFarm?.id || "";

      closeModal(authModal);
      if (redirectToRoleEntry(state.selectedRole)) return;
      setPortal(state.selectedRole);
      await updateProfileDisplay();

      if (state.selectedRole === "buyer") {
        await Promise.all([loadBuyerProducts(), loadBuyerOrders(), loadBuyerCart()]);
      } else {
        await Promise.all([refreshPendingBadge(), loadSellerDashboard()]);
      }
    } catch (error) {
      status.textContent = error.message;
    } finally {
      submit.disabled = false;
      submit.classList.remove("is-loading");
    }
  }

  async function logout() {
    await db.auth.signOut();
    state.currentUser = null;
    state.currentProfile = null;
    state.currentFarm = null;
    state.cart = [];
    state.cartId = null;
    state.buyerOrders = [];
    SUPABASE_FARM_ID = "";

    renderCart();
    clearAuthForm();
    closeAllModals();
    setPortal();
    if (currentPageKind() !== "landing") window.location.href = appUrl("index.html");
  }

  function closeAllModals() {
    [
      authModal,
      profileModal,
      sellerProductsModal,
      sellerOrdersModal,
      sellerDeliveriesModal,
      sellerInventoryModal,
      sellerSettingsModal,
      sellerInfoModal,
      dom.checkoutModal,
      dom.buyerOrderDetailModal,
    ].forEach(closeModal);
    dom.buyerOrderDetailModal?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("buyer-order-detail-open");
    document.body.classList.remove("profile-dialog-open");
    profileReturnFocus = null;
    toggleCart(false);
  }

  // ---------------------------------------------------------------------------
  // Dynamic profiles
  // ---------------------------------------------------------------------------

  async function updateProfileDisplay() {
    if (!state.currentUser) return;

    const profileResult = await db
      .from("profiles")
      .select("full_name, phone, role, created_at")
      .eq("id", state.currentUser.id)
      .single();

    if (profileResult.error) return;
    state.currentProfile = profileResult.data;

    const name = state.currentProfile.full_name;
    const buyerHeading = $("#buyer-app .hero h1");
    const buyerBadge = $("#buyer-app .hero .eyebrow");
    const sellerGreetingName = $("#seller-greeting-name");

    if (buyerHeading) buyerHeading.textContent = `Good morning, ${name}!`;
    if (buyerBadge) buyerBadge.textContent = `\u25CF ${name} \u2022 LocalBites buyer`;
    const buyerProfileName = $("#buyer-app .buyer-profile-button strong");
    const buyerProfileAvatar = $("#buyer-app .buyer-profile-avatar");
    if (buyerProfileName) buyerProfileName.textContent = name;
    if (buyerProfileAvatar) buyerProfileAvatar.textContent = name.trim().charAt(0).toUpperCase() || "B";
    if (sellerGreetingName) sellerGreetingName.textContent = name;

    $$(".profile-copy strong").forEach((element) => {
      element.textContent = name;
    });
    const sellerAvatar = $("#seller-app .profile-avatar");
    if (sellerAvatar) sellerAvatar.textContent = name.trim().charAt(0).toUpperCase() || "S";

    if (
      state.selectedRole === "seller" ||
      state.currentProfile.role === "seller"
    ) {
      const farmResult = await db
        .from("farms")
        .select("id, farm_name, location")
        .eq("seller_id", state.currentUser.id)
        .single();

      if (!farmResult.error) {
        state.currentFarm = farmResult.data;
        SUPABASE_FARM_ID = state.currentFarm.id;
        const farmBadge = $("#seller-farm-name");
        if (farmBadge) farmBadge.textContent = `🌱 ${state.currentFarm.farm_name}`;
        const sellerProfileCopy = $("#seller-app .profile-copy small");
        if (sellerProfileCopy) sellerProfileCopy.textContent = state.currentFarm.farm_name;
      }
    }
  }

  let profileReturnFocus = null;
  let activeProfileSection = null;

  function closeProfileEditor() {
    closeModal(profileModal);
    document.body.classList.remove("profile-dialog-open");
    profileReturnFocus?.focus?.();
    profileReturnFocus = null;
  }

  async function openProfileEditor() {
    if (!state.currentUser) return;

    const opening = !profileModal.classList.contains("open");
    if (opening) profileReturnFocus = document.activeElement;
    await updateProfileDisplay();
    const form = $("#profile-form");
    const buyerMode = state.selectedRole === "buyer";
    const metadata = state.currentUser.user_metadata || {};
    profileModal.classList.toggle("buyer-profile-mode", buyerMode);
    $("#profile-title").textContent = buyerMode ? "Buyer Profile" : "Profile";
    $("#profile-subtitle").textContent = buyerMode
      ? "Manage your buyer account and delivery information."
      : "Manage your account and farm information.";
    const savedFullName = String(state.currentProfile?.full_name || "").trim();
    form.elements.full_name.dataset.savedValue = savedFullName;
    form.elements.full_name.value = savedFullName || "Not provided";
    form.elements.phone.value = state.currentProfile?.phone || "";
    form.elements.email.value = state.currentUser.email || "";
    form.elements.username.value = metadata.username || state.currentUser.email?.split("@")[0] || state.currentProfile?.full_name || (buyerMode ? "Buyer" : "Seller");
    form.elements.business_name.value = metadata.business_name || "";
    form.elements.delivery_address.value = metadata.delivery_address || "";
    const accountRole =
      state.currentProfile?.role === "seller" ? "Seller" : "Buyer";
    const portalRole = state.selectedRole === "seller" ? "Seller" : "Buyer";
    form.elements.role.value = `${accountRole} account \u2022 ${portalRole} portal`;

    const sellerFields = $("#farm-fields");
    sellerFields.style.display = !buyerMode && state.currentFarm ? "grid" : "none";
    $("#buyer-delivery-fields").style.display = buyerMode ? "block" : "none";

    form.elements.farm_name.value = state.currentFarm?.farm_name || "";
    form.elements.location.value = state.currentFarm?.location || "";
    $("#profile-message").textContent = "";
    if (opening) {
      const feedback = $("#profile-feedback");
      feedback.hidden = true;
      feedback.textContent = "";
      feedback.className = "profile-feedback";
    }
    $("#profile-summary-name").textContent = state.currentProfile?.full_name || form.elements.username.value;
    $("#profile-summary-role").textContent = buyerMode ? `@${form.elements.username.value}` : "Farmer / Seller";
    $("#profile-summary-badge").textContent = buyerMode ? "LocalBites Buyer" : "Active Account";
    $("#profile-summary-avatar").textContent = (state.currentProfile?.full_name || form.elements.username.value).trim().charAt(0).toUpperCase() || "B";
    $("#profile-summary-email").textContent = state.currentUser.email || "Not provided";
    $("#profile-summary-phone").textContent = state.currentProfile?.phone || "Not provided";
    $("#profile-summary-location").textContent = buyerMode
      ? metadata.delivery_address || "No saved delivery address"
      : state.currentFarm?.location || "Not provided";
    $("#profile-summary-joined").textContent = state.currentProfile?.created_at
      ? `Joined ${new Date(state.currentProfile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}`
      : "Join date unavailable";
    setProfileEditMode(null);
    openModal(profileModal);
    document.body.classList.add("profile-dialog-open");
    if (opening) window.requestAnimationFrame(() => $(".profile-close")?.focus());
  }

  function setProfileEditMode(section) {
    activeProfileSection = section;
    const form = $("#profile-form");
    if (section) {
      const feedback = $("#profile-feedback");
      feedback.hidden = true;
      feedback.textContent = "";
    }
    const personal = section === "personal";
    const farm = section === "farm";
    const delivery = section === "delivery";
    form.elements.full_name.readOnly = !personal;
    form.elements.phone.readOnly = !personal;
    form.elements.farm_name.readOnly = !farm;
    form.elements.location.readOnly = !farm;
    form.elements.business_name.readOnly = !delivery;
    form.elements.delivery_address.readOnly = !delivery;
    $$("[data-profile-section]", profileModal).forEach((element) => element.classList.toggle("is-editing", element.dataset.profileSection === section));
    $(".seller-profile-savebar").hidden = !section;
    if (personal && !form.elements.full_name.dataset.savedValue) form.elements.full_name.value = "";
    if (section) {
      const first = section === "personal"
        ? form.elements.full_name
        : section === "delivery" ? form.elements.business_name : form.elements.farm_name;
      window.setTimeout(() => first.focus(), 0);
    }
  }

  async function sendProfilePasswordReset(event) {
    const button = event?.currentTarget || $(".profile-password-reset");
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = "Sending…";
    const result = await db.auth.resetPasswordForEmail(state.currentUser.email, {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    });
    button.disabled = false;
    button.innerHTML = original;
    if (result.error) {
      showToast(result.error.message, 4000);
      return;
    }
    showToast(`Password reset link sent to ${state.currentUser.email}`, 4000);
  }

  async function saveProfile(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = $("#profile-message");
    const saveButton = $(".seller-profile-savebar button[type='submit']");
    const saveLabel = saveButton.innerHTML;
    saveButton.disabled = true;
    saveButton.textContent = "Saving…";
    message.textContent = "Saving your profile…";
    message.className = "profile-message";

    const section = activeProfileSection;
    const fullName = String(form.get("full_name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const businessName = String(form.get("business_name") || "").trim();
    const deliveryAddress = String(form.get("delivery_address") || "").trim();
    if (section === "personal" && fullName.length < 2) {
      message.textContent = "Full name must contain at least 2 characters.";
      message.className = "profile-message error";
      saveButton.disabled = false;
      saveButton.innerHTML = saveLabel;
      return;
    }
    if (section === "personal" && phone && (!/^[0-9+()\-\s]{7,20}$/.test(phone))) {
      message.textContent = "Enter a valid contact number using 7 to 20 digits or phone symbols.";
      message.className = "profile-message error";
      saveButton.disabled = false;
      saveButton.innerHTML = saveLabel;
      return;
    }

    if (section === "delivery" && !deliveryAddress) {
      message.textContent = "Preferred delivery address is required.";
      message.className = "profile-message error";
      saveButton.disabled = false;
      saveButton.innerHTML = saveLabel;
      event.currentTarget.elements.delivery_address.focus();
      return;
    }

    if (section === "personal") {
      const profileResult = await db
        .from("profiles")
        .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
        .eq("id", state.currentUser.id);
      if (profileResult.error) {
        message.textContent = profileResult.error.message;
        message.className = "profile-message error";
        saveButton.disabled = false;
        saveButton.innerHTML = saveLabel;
        showToast(profileResult.error.message, 4000);
        return;
      }
    }

    if (section === "delivery" && state.selectedRole === "buyer") {
      const userResult = await db.auth.updateUser({
        data: {
          ...(state.currentUser.user_metadata || {}),
          business_name: businessName,
          delivery_address: deliveryAddress,
        },
      });
      if (userResult.error) {
        message.textContent = userResult.error.message;
        message.className = "profile-message error";
        saveButton.disabled = false;
        saveButton.innerHTML = saveLabel;
        showToast(userResult.error.message, 4000);
        return;
      }
      state.currentUser = userResult.data.user;
    }

    if (section === "farm" && state.currentFarm) {
      const farmResult = await db
        .from("farms")
        .update({
          farm_name: form.get("farm_name").trim(),
          location: form.get("location").trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("seller_id", state.currentUser.id);

      if (farmResult.error) {
        message.textContent = farmResult.error.message;
        message.className = "profile-message error";
        saveButton.disabled = false;
        saveButton.innerHTML = saveLabel;
        showToast(farmResult.error.message, 4000);
        return;
      }
    }

    saveButton.disabled = false;
    saveButton.innerHTML = saveLabel;
    await updateProfileDisplay();
    if (state.selectedRole === "seller") await loadSellerDashboard();
    await openProfileEditor();
    setProfileEditMode(null);
    const feedback = $("#profile-feedback");
    feedback.textContent = "Changes saved successfully.";
    feedback.className = "profile-feedback success";
    feedback.hidden = false;
    showToast("Profile updated successfully");
  }

  // ---------------------------------------------------------------------------
  // Buyer products and catalog filters
  // ---------------------------------------------------------------------------

  async function loadBuyerProducts() {
    const result = await db
      .from("products")
      .select(
        "id, name, category, price, unit, available_quantity, image_url, farms(id, farm_name, description, location, verified)",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (result.error) {
      dom.productGrid.innerHTML = `<div class="order-empty">Unable to load products: ${escapeHtml(result.error.message)}</div>`;
      if (dom.browseProductGrid) dom.browseProductGrid.innerHTML = `<div class="order-empty">Unable to load products: ${escapeHtml(result.error.message)}</div>`;
      return;
    }

    state.products = result.data || [];
    renderBuyerCategories();
    renderFarmerSpotlight();
    renderBuyerFeaturedFarms();
    renderBuyerDispatch();
    const productsStatus = $("#buyer-products-status");
    if (productsStatus) productsStatus.textContent = "Updated just now";
    renderBuyerProducts();
    renderBrowseProducts();
  }

  function renderBuyerCategories() {
    const available = state.products.filter((product) => Number(product.available_quantity) > 0);
    $$(".categories [data-category]").forEach((button) => {
      const category = button.dataset.category;
      const count = category === "All Items"
        ? available.length
        : available.filter((product) => product.category === category).length;
      $("small", button).textContent = `${count} ${category === "All Items" ? "total" : count === 1 ? "item" : "items"}`;
      const representative = available.find((product) => product.category === category && product.image_url);
      const icon = $(".category-icon", button);
      if (representative && icon) {
        icon.style.backgroundImage = `url("${safeImageUrl(representative.image_url)}")`;
        icon.classList.add("has-product-image");
      } else if (icon) {
        icon.style.removeProperty("background-image");
        icon.classList.remove("has-product-image");
      }
    });
    $$("#browse-category-filters [data-browse-category]").forEach((button) => {
      const category = button.dataset.browseCategory;
      const count = category === "All Items"
        ? available.length
        : available.filter((product) => product.category === category).length;
      $("em", button).textContent = count;
      const icon = $(".category-icon", button);
      const representative = available.find((product) => product.category === category && product.image_url);
      const fallbackImage = {
        Vegetables: appUrl("assets/category-vegetables-v2.png"),
        Herbs: appUrl("assets/category-herbs-v2.png"),
        "Dairy & Eggs": appUrl("assets/category-eggs-v2.png"),
        "Meat & Seafood": appUrl("assets/category-meat-v2.png"),
      }[category];
      const categoryImage = representative ? safeImageUrl(representative.image_url) : fallbackImage;
      if (category !== "All Items" && categoryImage && icon) {
        icon.style.backgroundImage = `url("${categoryImage}")`;
        icon.classList.add("has-product-image");
      } else if (icon) {
        icon.style.removeProperty("background-image");
        icon.classList.remove("has-product-image");
      }
    });
  }

  function renderBuyerDispatch() {
    const farmIds = new Set(state.products
      .filter((product) => Number(product.available_quantity) > 0 && product.farms?.id)
      .map((product) => product.farms.id));
    const target = $("#buyer-dispatch-farms");
    if (!target) return;
    target.textContent = farmIds.size
      ? `${farmIds.size} partner farm${farmIds.size === 1 ? "" : "s"} currently listing fresh harvests`
      : "No participating farms are currently listing harvests";
  }

  function renderFarmerSpotlight() {
    const target = $("#farmer-spotlight");
    const location = $("#spotlight-location");
    if (!target) return;
    const groups = new Map();
    state.products.filter((product) => Number(product.available_quantity) > 0 && product.farms?.id)
      .forEach((product) => {
        if (!groups.has(product.farms.id)) groups.set(product.farms.id, { farm: product.farms, products: [] });
        groups.get(product.farms.id).products.push(product);
      });
    const spotlight = [...groups.values()].sort((a, b) => b.products.length - a.products.length)[0];
    if (!spotlight) {
      if (location) location.textContent = "";
      target.innerHTML = '<article class="farmer-card farmer-empty">No partner farm currently has available harvests.</article>';
      return;
    }
    const { farm, products } = spotlight;
    const stockSummary = products.slice(0, 2).map((product) =>
      `${Number(product.available_quantity)} ${escapeHtml(product.unit)} ${escapeHtml(product.name)}`,
    ).join(" • ");
    if (location) location.textContent = farm.location || "Local partner farm";
    target.innerHTML = `<article class="farmer-card">
      <div class="farmer-avatar" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 41V22M24 31C14 30 10 24 10 15c9 0 15 5 14 16Zm0-5c1-10 7-15 16-16 0 9-5 15-16 16Z"/></svg></div>
      <div><h3>${escapeHtml(farm.farm_name)}</h3>${farm.verified ? '<span class="verified">✓ Verified Farm</span>' : ""}<p>${escapeHtml(farm.description || `Fresh products available from ${farm.location || "a local partner farm"}.`)}</p></div>
      <div class="lot"><small>CURRENT HARVEST AVAILABLE</small><strong>${stockSummary}</strong><button class="order-btn" type="button" data-spotlight-farm="${escapeHtml(farm.farm_name)}">View products</button></div>
    </article>`;
  }

  function renderBuyerFeaturedFarms() {
    const target = $("#buyer-featured-farms");
    if (!target) return;
    const farms = new Map();
    state.products.forEach((product) => {
      const farm = product.farms;
      if (farm?.id && !farms.has(farm.id)) farms.set(farm.id, farm);
    });
    const visible = [...farms.values()].slice(0, 4);
    if (!visible.length) {
      target.innerHTML = '<div class="farmer-empty">No partner farms are currently listing products.</div>';
      return;
    }
    target.innerHTML = visible.map((farm) => `
      <button type="button" class="buyer-farm-card" data-farm-id="${escapeHtml(farm.id)}" data-featured-farm="${escapeHtml(farm.farm_name)}" aria-label="View products from ${escapeHtml(farm.farm_name)}">
        <span class="buyer-farm-image"><img src="${appUrl("assets/seller-sidebar-landscape.svg")}" alt="" loading="lazy"></span>
        <span class="buyer-farm-copy"><strong><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6"/></svg>${escapeHtml(farm.farm_name)}</strong><small><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg>${escapeHtml(farm.location || "Location not provided")}</small><span>View Farm <i aria-hidden="true">→</i></span></span>
      </button>`).join("");
  }

  function renderBuyerProducts() {
    const search = state.search.toLowerCase();
    const filtered = state.products.filter((product) => {
      const matchesSearch = `${product.name} ${product.category} ${product.farms?.farm_name || ""}`
        .toLowerCase()
        .includes(search);
      const matchesCategory =
        state.category === "All Items" || product.category === state.category;
      return matchesSearch && matchesCategory;
    });

    if (!filtered.length) {
      dom.productGrid.innerHTML =
        '<div class="order-empty">No matching products are available.</div>';
      return;
    }

    dom.productGrid.innerHTML = filtered.map(buyerProductCard).join("");
  }

  function buyerProductCard(product) {
    const stock = Number(product.available_quantity) || 0;
    const unit = product.unit || "kg";
    return `<article class="product" data-product-id="${product.id}" data-product-stock="${stock}">
      <div class="product-img"><img src="${safeImageUrl(product.image_url)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async"><span>Fresh</span></div>
      <div class="product-copy"><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.farms?.farm_name || "Local partner farm")}</p><div class="price">${formatMoney(product.price)} <small>/ ${escapeHtml(unit)}</small></div><span class="stock-badge ${stock <= 0 ? "sold" : ""}">${stock > 0 ? `${stock} ${escapeHtml(unit)} available` : "SOLD OUT"}</span></div>
      <div class="product-actions"><div class="product-quantity"><button type="button" data-product-qty="decrease" aria-label="Decrease quantity">−</button><b>1</b><button type="button" data-product-qty="increase" aria-label="Increase quantity">+</button></div><button class="add" type="button" ${stock <= 0 ? "disabled" : ""}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2 11h11l2-8H6M9 20h.01M17 20h.01"/></svg> Add to Cart</button></div>
    </article>`;
  }

  function renderBrowseProducts() {
    if (!dom.browseProductGrid) return;
    const query = state.browseSearch.trim().toLowerCase();
    let products = state.products.filter((product) => {
      const price = Number(product.price) || 0;
      const matchesCategory = state.browseCategory === "All Items" || product.category === state.browseCategory;
      const matchesSearch = !query || `${product.name} ${product.farms?.farm_name || ""}`.toLowerCase().includes(query);
      const matchesMinimum = state.browsePriceMin === null || price >= state.browsePriceMin;
      const matchesMaximum = state.browsePriceMax === null || price <= state.browsePriceMax;
      return Number(product.available_quantity) > 0 && matchesCategory && matchesSearch && matchesMinimum && matchesMaximum;
    });
    if (state.browseSort === "price-asc") products.sort((a, b) => Number(a.price) - Number(b.price));
    else if (state.browseSort === "price-desc") products.sort((a, b) => Number(b.price) - Number(a.price));
    else if (state.browseSort === "name") products.sort((a, b) => a.name.localeCompare(b.name));

    const title = $("#browse-results-title");
    const count = $("#browse-results-count");
    if (title) title.textContent = state.browseCategory === "All Items" ? "All Available Products" : state.browseCategory;
    if (count) count.textContent = `Showing ${products.length} product${products.length === 1 ? "" : "s"}`;
    $$("#browse-category-filters [data-browse-category]").forEach((button) => button.classList.toggle("active", button.dataset.browseCategory === state.browseCategory));
    dom.browseProductGrid.innerHTML = products.length
      ? products.map(buyerProductCard).join("")
      : '<div class="browse-empty"><strong>No products found</strong><p>Try another category, search term, or price range.</p></div>';
  }

  async function getOrCreateBuyerCart() {
    if (!state.currentUser || state.selectedRole !== "buyer") throw new Error("Sign in as a buyer to use your cart.");
    if (state.cartId) return state.cartId;

    const existing = await db.from("carts").select("id").eq("buyer_id", state.currentUser.id).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data?.id) {
      state.cartId = existing.data.id;
      return state.cartId;
    }

    const created = await db.from("carts").insert({ buyer_id: state.currentUser.id }).select("id").single();
    if (created.error?.code === "23505") {
      const retry = await db.from("carts").select("id").eq("buyer_id", state.currentUser.id).single();
      if (retry.error) throw retry.error;
      state.cartId = retry.data.id;
      return state.cartId;
    }
    if (created.error) throw created.error;
    state.cartId = created.data.id;
    return state.cartId;
  }

  function cartItemFromProduct(product, quantity) {
    return {
      productId: product.id,
      name: product.name,
      farmName: product.farms?.farm_name || "Local partner farm",
      unitPrice: Number(product.price),
      unit: product.unit || "kg",
      imageUrl: safeImageUrl(product.image_url),
      quantity: Number(quantity),
      available: Number(product.available_quantity) || 0,
    };
  }

  async function loadBuyerCart() {
    if (!state.currentUser || state.selectedRole !== "buyer") return;
    try {
      const cartId = await getOrCreateBuyerCart();
      const result = await db.from("cart_items")
        .select("id, product_id, quantity, products(id, name, price, unit, available_quantity, image_url, is_active, farms(farm_name))")
        .eq("cart_id", cartId)
        .order("created_at", { ascending: true });
      if (result.error) throw result.error;

      const invalidIds = [];
      const quantityCorrections = [];
      state.cart = (result.data || []).flatMap((row) => {
        const product = row.products;
        const stock = Number(product?.available_quantity) || 0;
        if (!product || product.is_active === false || stock <= 0) {
          invalidIds.push(row.id);
          return [];
        }
        const quantity = Math.min(Number(row.quantity), stock);
        if (quantity !== Number(row.quantity)) quantityCorrections.push({ id: row.id, quantity });
        return [cartItemFromProduct(product, quantity)];
      });

      if (invalidIds.length) await db.from("cart_items").delete().in("id", invalidIds).eq("cart_id", cartId);
      await Promise.all(quantityCorrections.map((item) =>
        db.from("cart_items").update({ quantity: item.quantity }).eq("id", item.id).eq("cart_id", cartId),
      ));
      renderCart();
      if (invalidIds.length || quantityCorrections.length) showToast("Your cart was updated to match current availability.");
    } catch (error) {
      state.cart = [];
      renderCart();
      showToast(`Unable to restore cart: ${error.message}`, 3500);
    }
  }

  async function fetchCurrentCartProduct(productId) {
    const result = await db.from("products")
      .select("id, name, price, unit, available_quantity, image_url, is_active, farms(farm_name)")
      .eq("id", productId)
      .eq("is_active", true)
      .maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) throw new Error("This product is no longer available.");
    return result.data;
  }

  async function persistCartQuantity(productId, quantity) {
    const cartId = await getOrCreateBuyerCart();
    if (quantity <= 0) {
      const removed = await db.from("cart_items").delete().eq("cart_id", cartId).eq("product_id", productId);
      if (removed.error) throw removed.error;
      return;
    }
    const saved = await db.from("cart_items").upsert(
      { cart_id: cartId, product_id: productId, quantity },
      { onConflict: "cart_id,product_id" },
    );
    if (saved.error) throw saved.error;
  }

  async function addProductToCart(productId, amount = 1) {
    if (state.cartBusy) return;
    state.cartBusy = true;
    try {
      const product = await fetchCurrentCartProduct(productId);
      const stock = Number(product.available_quantity) || 0;
      if (stock <= 0) throw new Error(`${product.name} is currently out of stock.`);
      const cartItem = state.cart.find((item) => item.productId === productId);
      const requestedQuantity = (cartItem?.quantity || 0) + Math.max(1, Number(amount) || 1);
      if (requestedQuantity > stock) throw new Error(`Only ${stock} ${product.unit || "kg"} available`);
      await persistCartQuantity(productId, requestedQuantity);
      if (cartItem) Object.assign(cartItem, cartItemFromProduct(product, requestedQuantity));
      else state.cart.push(cartItemFromProduct(product, requestedQuantity));
      renderCart();
      showToast(`${product.name} added to cart`);
    } catch (error) {
      showToast(error.message, 3500);
    } finally {
      state.cartBusy = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Cart
  // ---------------------------------------------------------------------------

  function getCartTotal() {
    const total = state.cart.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    );
    return Math.round((total + Number.EPSILON) * 100) / 100;
  }

  let cartReturnFocus = null;

  function toggleCart(open) {
    if (open) cartReturnFocus = document.activeElement;
    dom.cartDrawer.classList.toggle("open", open);
    dom.cartOverlay.classList.toggle("open", open);
    dom.cartDrawer.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("cart-open", open);
    if (open) {
      window.requestAnimationFrame(() => $("#close-cart")?.focus());
    } else if (cartReturnFocus instanceof HTMLElement) {
      cartReturnFocus.focus();
      cartReturnFocus = null;
    }
  }

  function renderCart() {
    const totalQuantity = state.cart.reduce(
      (quantity, item) => quantity + item.quantity,
      0,
    );
    const cartTotal = getCartTotal();
    dom.cartCount.textContent = totalQuantity;
    dom.cartTotal.textContent = formatMoney(cartTotal);
    $("#cart-item-count").textContent = `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`;
    $("#cart-summary-items").textContent = totalQuantity;
    $("#cart-summary-subtotal").textContent = formatMoney(cartTotal);
    $("#checkout-btn").disabled = !state.cart.length;
    $("#clear-cart").disabled = !state.cart.length;
    const sideTotal = $("#buyer-cart-total");
    const sideItems = $("#buyer-cart-items");
    const sideCheckout = $("#buyer-checkout-btn");
    if (sideTotal) sideTotal.textContent = formatMoney(getCartTotal());
    if (sideCheckout) sideCheckout.disabled = !state.cart.length;
    if (dom.checkoutModal.classList.contains("open")) renderCheckoutSummary();

    if (!state.cart.length) {
      dom.cartItems.innerHTML = `
        <div class="cart-empty">
          <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 4h2l2 11h11l2-8H6M9 20h.01M17 20h.01"/></svg></span>
          <strong>Your cart is empty</strong>
          <p>Add fresh products to get started.</p>
          <button type="button" data-cart-browse>Browse Products</button>
        </div>`;
      if (sideItems) sideItems.innerHTML = '<div class="buyer-cart-empty"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 4h2l2 11h11l2-8H6M9 20h.01M17 20h.01"/></svg></span><strong>Your cart is empty</strong><small>Add fresh products to get started.</small></div>';
      return;
    }

    dom.cartItems.innerHTML = state.cart
      .map(
        (item) => `
          <article class="cart-item" data-product-id="${item.productId}">
            <img class="cart-item-img" src="${safeImageUrl(item.imageUrl)}" alt="${escapeHtml(item.name)}">
            <div class="cart-item-copy">
              <div class="cart-item-title"><h3>${escapeHtml(item.name)}</h3><strong>${formatMoney(item.unitPrice)} / ${escapeHtml(item.unit)}</strong></div>
              <p class="cart-item-farm">${escapeHtml(item.farmName || "Local partner farm")}</p>
              <div class="cart-item-bottom">
                <div class="quantity" aria-label="Quantity for ${escapeHtml(item.name)}">
                  <button type="button" data-cart-action="decrease" aria-label="Decrease ${escapeHtml(item.name)}">&minus;</button>
                  <span>${item.quantity}</span>
                  <button type="button" data-cart-action="increase" aria-label="Increase ${escapeHtml(item.name)}">+</button>
                </div>
                <div class="cart-line-total"><strong>${formatMoney(item.unitPrice * item.quantity)}</strong><small>Subtotal</small></div>
              </div>
            </div>
            <button type="button" class="remove-item" data-cart-action="remove" aria-label="Remove ${escapeHtml(item.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
          </article>`,
      )
      .join("");
    if (sideItems) sideItems.innerHTML = state.cart.map((item) => `
      <article class="buyer-side-cart-item" data-product-id="${item.productId}">
        <img src="${safeImageUrl(item.imageUrl)}" alt="${escapeHtml(item.name)}">
        <div class="buyer-side-product"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.farmName || "Local partner farm")}</small><em><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4C12 4 6 8 6 16c8 0 12-5 14-12ZM6 16c-1 1-2 3-2 5"/></svg>${item.quantity} ${escapeHtml(item.unit)} × ${formatMoney(item.unitPrice)}</em></div>
        <div class="buyer-side-quantity"><button type="button" data-cart-action="decrease" aria-label="Decrease ${escapeHtml(item.name)}">−</button><b>${item.quantity}</b><button type="button" data-cart-action="increase" aria-label="Increase ${escapeHtml(item.name)}">+</button></div>
        <button class="buyer-side-remove" type="button" data-cart-action="remove" aria-label="Remove ${escapeHtml(item.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/></svg></button>
        <strong class="buyer-side-line-total">${formatMoney(item.unitPrice * item.quantity)}</strong>
      </article>`).join("");
  }

  async function updateCartItem(productId, action) {
    if (state.cartBusy) return;
    const index = state.cart.findIndex((item) => item.productId === productId);
    if (index < 0) return;
    state.cartBusy = true;
    try {
      const item = state.cart[index];
      let quantity = action === "remove" ? 0 : item.quantity + (action === "increase" ? 1 : -1);
      if (quantity > 0) {
        const product = await fetchCurrentCartProduct(productId);
        const stock = Number(product.available_quantity) || 0;
        if (quantity > stock) throw new Error(`Only ${stock} ${product.unit || "kg"} available`);
        await persistCartQuantity(productId, quantity);
        Object.assign(item, cartItemFromProduct(product, quantity));
      } else {
        await persistCartQuantity(productId, 0);
        state.cart.splice(index, 1);
      }
      renderCart();
    } catch (error) {
      showToast(error.message, 3500);
    } finally {
      state.cartBusy = false;
    }
  }

  async function clearBuyerCart() {
    try {
      if (state.cartId) {
        const result = await db.from("cart_items").delete().eq("cart_id", state.cartId);
        if (result.error) throw result.error;
      }
      state.cart = [];
      renderCart();
    } catch (error) {
      showToast(error.message, 3500);
    }
  }

  // ---------------------------------------------------------------------------
  // Checkout and buyer order history
  // ---------------------------------------------------------------------------

  let checkoutToken = null;
  let checkoutReturnFocus = null;

  function renderCheckoutSummary() {
    const summaryItems = $("#checkout-review-items");
    const totalQuantity = state.cart.reduce((total, item) => total + item.quantity, 0);
    const total = getCartTotal();
    $("#checkout-item-count").textContent = `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`;
    $("#checkout-subtotal").textContent = formatMoney(total);
    dom.checkoutTotal.textContent = formatMoney(total);
    const submitButton = $("button[type='submit']", dom.checkoutForm);
    submitButton.disabled = !state.cart.length;
    if (!state.cart.length) {
      summaryItems.innerHTML = '<div class="checkout-review-empty"><strong>Your cart is empty</strong><small>Return to your cart or browse products to continue.</small></div>';
      return;
    }
    summaryItems.innerHTML = state.cart.map((item) => `
      <article class="checkout-review-item" data-product-id="${item.productId}">
        <img src="${safeImageUrl(item.imageUrl)}" alt="${escapeHtml(item.name)}">
        <div class="checkout-review-copy"><div><h4>${escapeHtml(item.name)}</h4><strong>${formatMoney(item.unitPrice)} / ${escapeHtml(item.unit)}</strong></div><p>${escapeHtml(item.farmName || "Local partner farm")}</p><div><span class="checkout-review-quantity"><button type="button" data-checkout-cart-action="decrease" aria-label="Decrease ${escapeHtml(item.name)}">&minus;</button><b>${item.quantity}</b><button type="button" data-checkout-cart-action="increase" aria-label="Increase ${escapeHtml(item.name)}">+</button></span><strong>${formatMoney(item.unitPrice * item.quantity)}</strong></div></div>
        <button class="checkout-remove-item" type="button" data-checkout-cart-action="remove" aria-label="Remove ${escapeHtml(item.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      </article>`).join("");
  }

  function syncCheckoutDeliveryFields() {
    const dispatchSelected = dom.checkoutForm.elements.delivery.value === "route_dispatch";
    const address = dom.checkoutForm.elements.address;
    address.required = dispatchSelected;
    $("#checkout-address-label").classList.toggle("is-optional", !dispatchSelected);
    $("#checkout-address-help").textContent = dispatchSelected
      ? "Required for route dispatch."
      : "Not required for farm pickup.";
  }

  function closeCheckout({ reopenCart = false } = {}) {
    closeModal(dom.checkoutModal);
    dom.checkoutModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("checkout-open");
    if (reopenCart) {
      const cartTrigger = $("#open-cart") || checkoutReturnFocus;
      toggleCart(true);
      cartReturnFocus = cartTrigger;
    } else if (checkoutReturnFocus instanceof HTMLElement) {
      checkoutReturnFocus.focus();
    }
  }

  function openCheckout() {
    if (!state.cart.length) {
      showToast("Add a product before checking out");
      return;
    }

    dom.checkoutForm.elements.name.value =
      state.currentProfile?.full_name || "";
    dom.checkoutForm.elements.phone.value =
      state.currentProfile?.phone || dom.checkoutForm.elements.phone.value;
    const metadata = state.currentUser?.user_metadata || {};
    dom.checkoutForm.elements.business_name.value = metadata.business_name || dom.checkoutForm.elements.business_name.value;
    dom.checkoutForm.elements.address.value = metadata.delivery_address || dom.checkoutForm.elements.address.value;
    dom.checkoutCard.classList.remove("success");
    dom.orderSuccess.classList.remove("show");
    renderCheckoutSummary();
    syncCheckoutDeliveryFields();
    $("#checkout-status").textContent = "";
    checkoutToken = checkoutToken || crypto.randomUUID();
    toggleCart(false);
    checkoutReturnFocus = document.activeElement;
    openModal(dom.checkoutModal);
    dom.checkoutModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("checkout-open");
    window.requestAnimationFrame(() => $("#close-checkout")?.focus());
  }

  async function submitCheckout(event) {
    event.preventDefault();

    if (!state.currentUser || state.selectedRole !== "buyer") {
      showToast("Sign in as a buyer before checking out");
      return;
    }

    if (!state.cart.length) {
      showToast("Your cart is empty.");
      return;
    }

    syncCheckoutDeliveryFields();
    if (!dom.checkoutForm.reportValidity()) return;
    const submitButton = $("button[type='submit']", dom.checkoutForm);
    const submitLabel = $("span", submitButton);
    const checkoutStatus = $("#checkout-status");
    submitButton.disabled = true;
    submitLabel.textContent = "Placing order...";
    checkoutStatus.textContent = "Securely validating your cart and inventory…";
    checkoutStatus.className = "checkout-status";

    try {
      const form = new FormData(dom.checkoutForm);
      checkoutToken = checkoutToken || crypto.randomUUID();
      const checkoutResult = await db.rpc("place_buyer_order", {
        p_contact_name: state.currentProfile?.full_name || form.get("name"),
        p_phone: form.get("phone"),
        p_business_name: form.get("business_name"),
        p_delivery_address: form.get("address"),
        p_delivery_method: form.get("delivery"),
        p_payment_method: form.get("payment"),
        p_checkout_token: checkoutToken,
      });
      if (checkoutResult.error) throw checkoutResult.error;
      const completedOrder = checkoutResult.data?.[0];
      if (!completedOrder?.order_id) throw new Error("Checkout did not return a completed order.");

      state.cart = [];
      renderCart();
      await Promise.all([loadBuyerProducts(), loadBuyerOrders()]);

      dom.checkoutTotal.textContent = formatMoney(completedOrder.total);
      dom.checkoutCard.classList.add("success");
      dom.orderSuccess.classList.add("show");
      checkoutStatus.textContent = "";
      checkoutToken = null;
    } catch (error) {
      const message = error.message || "Checkout failed. Your cart was not changed.";
      checkoutStatus.textContent = message;
      checkoutStatus.className = "checkout-status error";
      showToast(message, 4500);
    } finally {
      submitButton.disabled = false;
      submitLabel.textContent = "Place Order";
    }
  }

  // Buyer-facing groups cover every value in the existing order_status enum.
  // Legacy values stay readable without rewriting historical database records.
  const buyerOrderStatusGroups = Object.freeze({
    pending: ["pending"],
    accepted: ["accepted", "confirmed", "preparing"],
    ready_for_pickup: ["ready_for_pickup"],
    dispatched: ["dispatched"],
    completed: ["completed"],
    delivered: ["delivered"],
    rejected: ["rejected", "cancelled"],
  });
  const buyerActiveGroups = new Set(["pending", "accepted", "ready_for_pickup", "dispatched"]);
  const buyerSuccessfulGroups = new Set(["completed", "delivered"]);

  function buyerOrderStatusGroup(status = "") {
    return Object.keys(buyerOrderStatusGroups).find((group) => buyerOrderStatusGroups[group].includes(status)) || "unknown";
  }

  function buyerOrderMatchesFilter(order, filter) {
    return filter === "all" || buyerOrderStatusGroup(order.status) === filter;
  }

  function buyerOrderStatusCounts() {
    const counts = Object.fromEntries([...Object.keys(buyerOrderStatusGroups), "unknown"].map((status) => [status, 0]));
    state.buyerOrders.forEach((order) => { counts[buyerOrderStatusGroup(order.status)] += 1; });
    return counts;
  }

  function buyerDeliveryLabel(method = "") {
    return method === "farm_pickup" ? "Farm Pickup" : method === "route_dispatch" ? "Route Dispatch" : orderStatusLabel(method);
  }

  function buyerPaymentLabel(method = "") {
    return method === "cash_on_delivery" ? "Cash on Delivery" : method === "gcash" ? "GCash" : orderStatusLabel(method);
  }

  function renderBuyerOrderFilters() {
    const counts = buyerOrderStatusCounts();
    $$("#buyer-order-filters [data-buyer-order-filter]").forEach((button) => {
      const filter = button.dataset.buyerOrderFilter;
      const count = filter === "all"
        ? Object.values(counts).reduce((sum, value) => sum + value, 0)
        : counts[filter] || 0;
      $("b", button).textContent = count;
      button.classList.toggle("active", filter === state.buyerOrderFilter);
      button.setAttribute("aria-pressed", String(filter === state.buyerOrderFilter));
    });
  }

  function buyerOrderEmptyState(filtered = false) {
    return `<div class="buyer-orders-empty">
      <span aria-hidden="true"><svg viewBox="0 0 96 80"><path d="M19 34 48 20l29 14-29 15-29-15Z"/><path d="M19 34v29l29 15V49L19 34Zm58 0v29L48 78V49l29-15Z"/><path d="m34 27 29 15v10l-8-3v-6L26 31"/></svg></span>
      <strong>${filtered ? "No matching orders" : "No orders yet"}</strong>
      <p>${filtered ? "No purchases match this status filter." : "Your orders from local farmers will appear here once you make a purchase."}</p>
      <a href="${appUrl(ENTRY_FILES.browse)}">Browse Products <span aria-hidden="true">→</span></a>
    </div>`;
  }

  function renderBuyerOrders() {
    if (!dom.ordersList) return;
    const counts = buyerOrderStatusCounts();
    $("#buyer-orders-total").textContent = Object.values(counts).reduce((sum, value) => sum + value, 0);
    $("#buyer-orders-active").textContent = [...buyerActiveGroups].reduce((sum, status) => sum + counts[status], 0);
    $("#buyer-orders-completed").textContent = [...buyerSuccessfulGroups].reduce((sum, status) => sum + counts[status], 0);
    renderBuyerOrderFilters();
    const orders = state.buyerOrderFilter === "all"
      ? state.buyerOrders
      : state.buyerOrders.filter((order) => buyerOrderMatchesFilter(order, state.buyerOrderFilter));
    if (!orders.length) {
      dom.ordersList.innerHTML = buyerOrderEmptyState(Boolean(state.buyerOrders.length));
      return;
    }
    dom.ordersList.innerHTML = orders.map((order) => {
      const orderItems = order.order_items || [];
      const thumbnails = orderItems.slice(0, 2).map((item) => `<img src="${safeImageUrl(item.products?.image_url || EMPTY_IMAGE)}" alt="${escapeHtml(item.product_name)}">`).join("");
      const remaining = orderItems.length - 2;
      const productLines = orderItems.slice(0, 2).map((item) => `<span><strong>${escapeHtml(item.product_name)}</strong> (${item.quantity} ${escapeHtml(item.unit || "kg")})</span>`).join("");
      const farmRecords = orderItems.map((item) => item.products?.farms).filter(Boolean);
      const farmNames = [...new Set(farmRecords.map((farm) => farm.farm_name).filter(Boolean))];
      const locations = [...new Set(farmRecords.map((farm) => farm.location).filter(Boolean))];
      const sellerLabel = farmNames.length > 1 ? `${farmNames[0]} +${farmNames.length - 1}` : farmNames[0] || "Local partner farm";
      return `<article class="buyer-order-card" data-order-id="${order.id}">
        <div class="buyer-order-identity"><h3>Order #${escapeHtml(order.id.slice(0, 8).toUpperCase())}</h3><p><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>${new Date(order.created_at).toLocaleString()}</p><span class="buyer-order-status status-${escapeHtml(order.status)}">${escapeHtml(orderStatusLabel(order.status))}</span></div>
        <div class="buyer-order-preview"><div class="buyer-order-thumbs">${thumbnails || `<img src="${EMPTY_IMAGE}" alt="">`}${remaining > 0 ? `<i>+${remaining}<small>item${remaining === 1 ? "" : "s"}</small></i>` : ""}</div><div class="buyer-order-products-copy"><small>Products</small>${productLines || "<span>Order items unavailable</span>"}${remaining > 0 ? `<em>+ ${remaining} more item${remaining === 1 ? "" : "s"}</em>` : ""}</div></div>
        <div class="buyer-order-seller"><small>Seller</small><strong><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18L19 4H5l-2 6Zm2 0v10h14V10M9 20v-6h6v6"/></svg>${escapeHtml(sellerLabel)}</strong>${locations.length ? `<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg>${escapeHtml(locations[0])}</span>` : ""}</div>
        <div class="buyer-order-total"><small>Total Amount</small><strong>${formatMoney(order.total)}</strong><span>${orderItems.length} item${orderItems.length === 1 ? "" : "s"}</span></div>
        <button class="buyer-order-details-button" type="button" data-buyer-order-details="${order.id}">View Details <span aria-hidden="true">→</span></button>
      </article>`;
    }).join("");
  }

  function buyerOrderProgress(status, deliveryMethod) {
    if (["rejected", "cancelled"].includes(status)) return `<div class="buyer-order-progress rejected"><span>${escapeHtml(orderStatusLabel(status))}</span><p>This item will not proceed to fulfillment.</p></div>`;
    const workflows = {
      farm_pickup: ["pending", "accepted", "ready_for_pickup", "completed"],
      route_dispatch: ["pending", "accepted", "dispatched", "delivered"],
    };
    const steps = workflows[deliveryMethod];
    if (!steps) return `<div class="buyer-order-progress single"><span>${escapeHtml(orderStatusLabel(status))}</span><p>Fulfillment method unavailable.</p></div>`;
    const progressStatus = ["confirmed", "preparing"].includes(status) ? "accepted" : status;
    const currentIndex = steps.indexOf(progressStatus);
    if (currentIndex < 0) return `<div class="buyer-order-progress single"><span>${escapeHtml(orderStatusLabel(status))}</span><p>Stored historical fulfillment state.</p></div>`;
    return `<ol class="buyer-order-progress">${steps.map((step, index) => `<li class="${index < currentIndex ? "done" : index === currentIndex ? "current" : ""}"><i aria-hidden="true"></i><span>${escapeHtml(orderStatusLabel(step))}</span></li>`).join("")}</ol>`;
  }

  let buyerOrderDetailReturnFocus = null;

  function openBuyerOrderDetails(orderId) {
    const order = state.buyerOrders.find((item) => item.id === orderId);
    if (!order || !dom.buyerOrderDetailModal) return;
    const items = (order.order_items || []).map((item) => {
      const status = item.seller_status || order.status;
      const farmName = item.products?.farms?.farm_name || (item.seller_id ? `Seller ${item.seller_id.slice(0, 8)}` : "Local partner farm");
      const farmLocation = item.products?.farms?.location || "";
      const lineTotal = Number(item.line_total ?? Number(item.quantity) * Number(item.unit_price));
      return `<article class="buyer-order-detail-item"><div class="buyer-order-detail-product"><img src="${safeImageUrl(item.products?.image_url || EMPTY_IMAGE)}" alt="${escapeHtml(item.product_name)}"><div><strong>${escapeHtml(item.product_name)}</strong><small>${escapeHtml(farmName)}${farmLocation ? ` · ${escapeHtml(farmLocation)}` : ""}</small><span>${item.quantity} ${escapeHtml(item.unit || "kg")} × ${formatMoney(item.unit_price)}/${escapeHtml(item.unit || "kg")}</span></div><div class="buyer-order-detail-line-total"><span class="buyer-order-item-status status-${escapeHtml(status)}">${escapeHtml(orderStatusLabel(status))}</span><b>${formatMoney(lineTotal)}</b></div></div>${buyerOrderProgress(status, order.delivery_method)}</article>`;
    }).join("");
    dom.buyerOrderDetailBody.innerHTML = `<section class="buyer-order-detail-overview"><div><small>Order Reference</small><strong>#${escapeHtml(order.id.slice(0, 8).toUpperCase())}</strong></div><div><small>Placed On</small><strong>${new Date(order.created_at).toLocaleString()}</strong></div><div><small>Status</small><span class="buyer-order-status status-${escapeHtml(order.status)}">${escapeHtml(orderStatusLabel(order.status))}</span></div></section>
      <section class="buyer-order-detail-items"><h3>Purchased Products</h3>${items || '<p>Order items are unavailable.</p>'}</section>
      <section class="buyer-order-detail-meta"><div><small>Delivery Method</small><strong>${escapeHtml(buyerDeliveryLabel(order.delivery_method))}</strong></div><div><small>Payment Method</small><strong>${escapeHtml(buyerPaymentLabel(order.payment_method))}</strong></div><div><small>Contact Name</small><strong>${escapeHtml(order.contact_name)}</strong></div><div><small>Contact Number</small><strong>${escapeHtml(order.phone)}</strong></div>${order.business_name ? `<div><small>Business Name</small><strong>${escapeHtml(order.business_name)}</strong></div>` : ""}${order.delivery_method === "route_dispatch" && order.delivery_address ? `<div><small>Delivery Address</small><strong>${escapeHtml(order.delivery_address)}</strong></div>` : ""}<div><small>Stored Subtotal</small><strong>${formatMoney(order.subtotal)}</strong></div><div class="total"><small>Stored Order Total</small><strong>${formatMoney(order.total)}</strong></div></section>`;
    buyerOrderDetailReturnFocus = document.activeElement;
    dom.buyerOrderDetailModal.classList.add("open");
    dom.buyerOrderDetailModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("buyer-order-detail-open");
    $("#close-buyer-order-detail")?.focus();
  }

  function closeBuyerOrderDetails() {
    dom.buyerOrderDetailModal?.classList.remove("open");
    dom.buyerOrderDetailModal?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("buyer-order-detail-open");
    buyerOrderDetailReturnFocus?.focus?.();
    buyerOrderDetailReturnFocus = null;
  }

  async function loadBuyerOrders() {
    if (!state.currentUser || state.selectedRole !== "buyer") return;
    if (dom.ordersList) dom.ordersList.innerHTML = '<div class="buyer-orders-loading">Loading your orders…</div>';
    const orderFields = "id, buyer_id, status, subtotal, total, contact_name, phone, business_name, delivery_address, delivery_method, payment_method, created_at";
    const baseItems = "id, seller_id, product_name, quantity, unit, unit_price, line_total, products(image_url, farms(farm_name, location))";
    let result = await db.from("orders")
      .select(`${orderFields}, order_items(${baseItems}, seller_status)`)
      .eq("buyer_id", state.currentUser.id)
      .eq("buyer_hidden", false)
      .order("created_at", { ascending: false });
    if (result.error && (result.error.code === "42703" || result.error.code === "PGRST204" || String(result.error.message).includes("seller_status"))) {
      result = await db.from("orders")
        .select(`${orderFields}, order_items(${baseItems})`)
        .eq("buyer_id", state.currentUser.id)
        .eq("buyer_hidden", false)
        .order("created_at", { ascending: false });
    }
    if (result.error) {
      if (dom.ordersList) dom.ordersList.innerHTML = `<div class="buyer-orders-error"><strong>Unable to load orders</strong><p>${escapeHtml(result.error.message)}</p><button type="button" data-retry-buyer-orders>Try Again</button></div>`;
      return;
    }
    // Keep a defensive ownership check in addition to the query predicate and RLS.
    state.buyerOrders = (result.data || []).filter((order) => order.buyer_id === state.currentUser.id);
    renderBuyerOrders();
  }

  // ---------------------------------------------------------------------------
  // Seller product management
  // ---------------------------------------------------------------------------

  let editingSellerProductId = null;
  let sellerPreviewObjectUrl = "";
  let sellerProductReturnFocus = null;
  let reopenInventoryAfterProductEdit = false;

  function updateSellerProductPreview(imageSource = "") {
    const form = $("#seller-product-form");
    if (!form) return;
    const unit = form.elements.unit.value || "kg";
    const price = Number(form.elements.price.value || 0);
    $("#seller-preview-name").textContent = form.elements.name.value.trim() || "Your product name";
    $("#seller-preview-category").textContent = form.elements.category.value || "Vegetables";
    $("#seller-preview-price").textContent = `₱${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}/${unit}`;
    $("#seller-preview-quantity").textContent = `${Number(form.elements.quantity.value || 0)} ${unit} available`;
    $("#seller-preview-description").textContent = form.elements.description.value.trim() || "Your product description will appear here.";
    if (imageSource) $("#seller-preview-image").src = imageSource;
  }

  function validateSellerProductImage(file) {
    if (!file?.size) return "";
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return "Choose a PNG, JPEG, or WebP image.";
    if (file.size > 5 * 1024 * 1024) return "Product image must be 5MB or smaller.";
    return "";
  }

  function previewSellerProductImage(file) {
    const error = validateSellerProductImage(file);
    const status = $("#seller-db-status");
    if (error) {
      status.textContent = error;
      status.className = "seller-db-status error";
      return false;
    }
    if (sellerPreviewObjectUrl) URL.revokeObjectURL(sellerPreviewObjectUrl);
    sellerPreviewObjectUrl = file?.size ? URL.createObjectURL(file) : "";
    updateSellerProductPreview(sellerPreviewObjectUrl || EMPTY_IMAGE);
    $("#seller-image-drop").classList.toggle("has-image", Boolean(file?.size));
    status.textContent = file?.size ? `${file.name} selected` : "";
    status.className = "seller-db-status";
    return true;
  }

  function closeSellerProductsModal() {
    closeModal(sellerProductsModal);
    if (reopenInventoryAfterProductEdit) {
      reopenInventoryAfterProductEdit = false;
      openInventoryAlerts();
    } else {
      sellerProductReturnFocus?.focus?.();
    }
  }

  async function loadSellerProducts() {
    const status = $("#seller-db-status");
    const list = $("#seller-db-list");

    if (!state.currentFarm) {
      status.textContent = "No farm is connected to this seller account.";
      status.className = "seller-db-status error";
      return;
    }

    const result = await db
      .from("products")
      .select("id, name, category, price, unit, available_quantity, description, image_url")
      .eq("farm_id", state.currentFarm.id)
      .order("created_at", { ascending: false });

    if (result.error) {
      status.textContent = result.error.message;
      status.className = "seller-db-status error";
      return;
    }

    status.className = "seller-db-status";
    state.sellerProducts = result.data || [];
    const productCount = $("#seller-products-count");
    productCount.textContent = `${result.data.length} product${result.data.length === 1 ? "" : "s"}`;
    status.textContent = "";
    list.innerHTML = result.data.length ? result.data
      .map(
        (product) => {
          const quantity = Number(product.available_quantity || 0);
          const stockClass = quantity <= 0 ? "out" : quantity <= 5 ? "low" : "in";
          const stockLabel = quantity <= 0 ? "Out of Stock" : quantity <= 5 ? "Low Stock" : "In Stock";
          return `
          <article class="seller-db-product" data-product-id="${product.id}">
            <img src="${safeImageUrl(product.image_url)}" alt="${escapeHtml(product.name)}">
            <div class="seller-db-product-copy">
              <strong>${escapeHtml(product.name)}</strong>
              <div class="seller-product-badges"><span>${escapeHtml(product.category)}</span><span class="seller-stock-badge ${stockClass}"><i aria-hidden="true"></i>${stockLabel}</span></div>
              <small><b>${formatMoney(product.price)}/${escapeHtml(product.unit)}</b><i aria-hidden="true"></i>${product.available_quantity} ${escapeHtml(product.unit)} available</small>
            </div>
            <div class="seller-product-actions">
              <button type="button" class="edit-product" aria-label="Edit ${escapeHtml(product.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4-1 11-11-3-3L5 16l-1 4Zm10-13 3 3"/></svg>Edit</button>
              <button type="button" class="delete-product" aria-label="Delete ${escapeHtml(product.name)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/></svg>Delete</button>
            </div>
          </article>`;
        },
      )
      .join("") : `<div class="seller-products-empty"><svg viewBox="0 0 96 80" aria-hidden="true"><path d="M22 35h52l-5 34H27l-5-34Z"/><path d="M18 38h60v12H18zM31 50v19m34-19v19"/><path d="M48 34C35 27 34 15 38 7c10 4 14 14 10 27Zm2 0c2-14 11-22 23-20-1 12-9 20-23 20Z"/></svg><strong>No products yet</strong><p>Add your first fresh harvest and make it available to local buyers.</p><button type="button" class="seller-products-empty-add">+ Add Your First Product</button></div>`;
  }

  async function openSellerProducts(showForm) {
    sellerProductReturnFocus = document.activeElement;
    if (showForm) {
      editingSellerProductId = null;
      $("#seller-product-form").reset();
      previewSellerProductImage(null);
    }
    $(".seller-products-card").classList.toggle("form-open", showForm);
    $("#seller-products-title").textContent = showForm
      ? "Add product"
      : "My Products";
    $("#seller-products-subtitle").textContent = showForm
      ? "List your fresh harvest so local buyers can discover and order from your farm."
      : "Manage the fresh products in your catalog.";
    $("#seller-product-form").style.display = showForm ? "grid" : "none";
    openModal(sellerProductsModal);
    if (showForm) window.setTimeout(() => $("#seller-product-form [name='name']").focus(), 0);
    await loadSellerProducts();
  }

  function editSellerProduct(productId) {
    const product = state.sellerProducts.find((item) => item.id === productId);
    if (!product || !state.currentFarm) {
      const status = $("#seller-db-status");
      status.textContent = "This product is unavailable or does not belong to your farm.";
      status.className = "seller-db-status error";
      return;
    }
    const form = $("#seller-product-form");
    editingSellerProductId = product.id;
    $(".seller-products-card").classList.add("form-open");
    $("#seller-products-title").textContent = "Edit product";
    $("#seller-products-subtitle").textContent = "Update this product while preserving its seller and farm ownership.";
    form.style.display = "grid";
    form.elements.name.value = product.name || "";
    form.elements.category.value = product.category || "Vegetables";
    form.elements.price.value = product.price ?? "";
    form.elements.unit.value = product.unit || "kg";
    form.elements.quantity.value = product.available_quantity ?? 0;
    form.elements.description.value = product.description || "";
    updateSellerProductPreview(safeImageUrl(product.image_url));
    $("#seller-db-status").textContent = "Update the product details or available stock.";
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveSellerProduct(event) {
    event.preventDefault();
    const status = $("#seller-db-status");
    // currentTarget is cleared once the synchronous event dispatch finishes,
    // so retain the form element before awaiting storage/database requests.
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const saveButton = $(".seller-product-save");
    const image = form.get("image");
    const name = String(form.get("name") || "").trim();
    const category = String(form.get("category") || "").trim();
    const unit = String(form.get("unit") || "").trim();
    const price = Number(form.get("price"));
    const quantity = Number(form.get("quantity"));

    if (!name || !category || !unit || !Number.isFinite(price) || price <= 0 || !Number.isFinite(quantity) || quantity < 0) {
      status.textContent = "Enter a product name, category, unit, a price greater than zero, and a nonnegative quantity.";
      status.className = "seller-db-status error";
      formElement.reportValidity();
      return;
    }

    const imageError = validateSellerProductImage(image);
    if (imageError) {
      status.textContent = imageError;
      status.className = "seller-db-status error";
      return;
    }

    if (!state.currentFarm) {
      status.textContent = "No farm is connected to this account.";
      status.className = "seller-db-status error";
      return;
    }

    status.textContent = "Saving product...";
    status.className = "seller-db-status";
    saveButton.disabled = true;
    saveButton.querySelector("b").textContent = "Saving…";

    try {
      let imageUrl = null;

      if (image?.size) {
        const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const storagePath = `${state.currentFarm.id}/${crypto.randomUUID()}-${safeName}`;
        const upload = await db.storage
          .from(PRODUCT_IMAGE_BUCKET)
          .upload(storagePath, image);

        if (upload.error) throw upload.error;
        imageUrl = db.storage
          .from(PRODUCT_IMAGE_BUCKET)
          .getPublicUrl(storagePath).data.publicUrl;
      }

      const payload = {
        farm_id: state.currentFarm.id,
        name,
        category,
        price,
        unit,
        available_quantity: quantity,
        description: form.get("description").trim(),
      };
      if (imageUrl) payload.image_url = imageUrl;

      const wasEditing = Boolean(editingSellerProductId);
      const result = wasEditing
        ? await db.from("products").update(payload)
            .eq("id", editingSellerProductId)
            .eq("farm_id", state.currentFarm.id)
            .select("id")
            .maybeSingle()
        : await db.from("products").insert({ ...payload, image_url: imageUrl });

      if (result.error) throw result.error;
      if (wasEditing && !result.data) throw new Error("Product was not updated. It may no longer exist or you may not have permission.");

      formElement.reset();
      editingSellerProductId = null;
      await Promise.all([loadSellerProducts(), loadBuyerProducts(), loadSellerDashboard()]);
      if (wasEditing) {
        $(".seller-products-card").classList.remove("form-open");
        formElement.style.display = "none";
        $("#seller-products-title").textContent = "My Products";
        $("#seller-products-subtitle").textContent = "Manage the fresh products in your catalog.";
      } else {
        $("#seller-products-title").textContent = "Add product";
      }
      status.textContent = wasEditing ? "Product updated successfully." : "Product saved successfully.";
      status.className = "seller-db-status success";
      if (sellerPreviewObjectUrl) URL.revokeObjectURL(sellerPreviewObjectUrl);
      sellerPreviewObjectUrl = "";
      updateSellerProductPreview(EMPTY_IMAGE);
      $("#seller-image-drop").classList.remove("has-image");
      if (wasEditing && reopenInventoryAfterProductEdit) {
        reopenInventoryAfterProductEdit = false;
        closeModal(sellerProductsModal);
        await openInventoryAlerts();
        showToast("Stock updated successfully");
      }
    } catch (error) {
      status.textContent = error.message;
      status.className = "seller-db-status error";
    } finally {
      saveButton.disabled = false;
      saveButton.querySelector("b").textContent = "Save product";
    }
  }

  async function deleteSellerProduct(productId, triggerButton) {
    if (!window.confirm("Remove this product from your catalog?")) return;

    const status = $("#seller-db-status");
    const originalLabel = triggerButton?.innerHTML;
    if (triggerButton) {
      triggerButton.disabled = true;
      triggerButton.textContent = "Deleting…";
    }
    status.textContent = "Deleting product…";
    status.className = "seller-db-status";

    try {
      const result = await db
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("farm_id", state.currentFarm.id)
        .select("id")
        .maybeSingle();

      if (result.error) throw result.error;
      if (!result.data) throw new Error("Product was not deleted. It may no longer exist or you may not have permission.");

      await Promise.all([loadSellerProducts(), loadBuyerProducts(), loadSellerDashboard()]);
      status.textContent = "Product deleted successfully.";
      status.className = "seller-db-status success";
      showToast("Product removed");
    } catch (error) {
      status.textContent = error.message;
      status.className = "seller-db-status error";
      showToast(error.message);
    } finally {
      if (triggerButton?.isConnected) {
        triggerButton.disabled = false;
        triggerButton.innerHTML = originalLabel;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Seller orders, deliveries, and badge
  // ---------------------------------------------------------------------------

  async function getSellerOrderItems() {
    if (!state.currentUser) return { data: [], error: null };
    const baseFields = "order_id, product_name, quantity, unit, unit_price, line_total, products(image_url, category), orders!inner(id, status, contact_name, phone, business_name, delivery_method, payment_method, created_at)";
    let result = await db
      .from("order_items")
      .select(
        `order_id, product_name, quantity, unit, unit_price, line_total, seller_status, products(image_url, category), orders!inner(id, status, contact_name, phone, business_name, delivery_method, payment_method, created_at)`,
      )
      .eq("seller_id", state.currentUser.id);
    const missingSellerStatus = result.error && (
      result.error.code === "42703" ||
      result.error.code === "PGRST204" ||
      String(result.error.message).includes("seller_status")
    );
    if (!missingSellerStatus) return result;

    result = await db.from("order_items")
      .select(baseFields)
      .eq("seller_id", state.currentUser.id);
    if (!result.error) {
      result.data = (result.data || []).map((row) => ({ ...row, seller_status: row.orders?.status || "pending" }));
      return { ...result, schemaFallback: true };
    }
    return result;
  }

  function groupSellerOrders(rows = []) {
    const orders = new Map();
    rows.forEach((row) => {
      if (!orders.has(row.order_id)) {
        orders.set(row.order_id, {
          id: row.order_id,
          status: row.seller_status || row.orders.status,
          buyerOrderStatus: row.orders.status,
          contactName: row.orders.contact_name,
          phone: row.orders.phone,
          businessName: row.orders.business_name,
          deliveryMethod: row.orders.delivery_method,
          paymentMethod: row.orders.payment_method,
          createdAt: row.orders.created_at,
          sellerTotal: 0,
          items: [],
        });
      }
      orders.get(row.order_id).items.push(row);
      orders.get(row.order_id).sellerTotal += Number(
        row.line_total ?? Number(row.quantity) * Number(row.unit_price),
      );
    });
    return [...orders.values()].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }

  async function refreshPendingBadge() {
    if (!state.currentUser || state.selectedRole !== "seller") return;
    const result = await getSellerOrderItems();
    if (result.error) return;

    const pendingCount = groupSellerOrders(result.data).filter(
      (order) => order.status === "pending",
    ).length;
    const badge = $("#seller-nav-pending");
    if (badge) {
      badge.textContent = pendingCount;
      badge.hidden = !pendingCount;
    }
  }

  function orderStatusLabel(status = "") {
    const labels = {
      pending: "Pending",
      accepted: "Accepted",
      ready_for_pickup: "Ready for pickup",
      completed: "Completed",
      dispatched: "Dispatched",
      delivered: "Delivered",
      rejected: "Rejected",
      confirmed: "Confirmed (legacy)",
      preparing: "Preparing (legacy)",
      cancelled: "Cancelled (legacy)",
    };
    return labels[status] || String(status).replaceAll("_", " ");
  }

  const sellerStatusLabel = orderStatusLabel;

  function sellerOrderActions(order) {
    const actions = {
      farm_pickup: {
        pending: [["accepted", "Accept"], ["rejected", "Reject"]],
        accepted: [["ready_for_pickup", "Mark ready for pickup"], ["rejected", "Reject"]],
        ready_for_pickup: [["completed", "Complete pickup"]],
      },
      route_dispatch: {
        pending: [["accepted", "Accept"], ["rejected", "Reject"]],
        accepted: [["dispatched", "Mark dispatched"], ["rejected", "Reject"]],
        dispatched: [["delivered", "Mark delivered"]],
      },
    };
    return actions[order.deliveryMethod]?.[order.status] || [];
  }

  function renderSellerDashboardProducts(products = []) {
    const target = $("#seller-dashboard-products");
    if (!target) return;
    target.classList.toggle("is-empty", !products.length);
    if (!products.length) {
      target.innerHTML = `<div class="seller-empty">
        <svg class="seller-empty-art seller-empty-crate" viewBox="0 0 180 100" aria-hidden="true">
          <path d="M27 76c-8-2-12-8-9-14 3-6 10-7 16-4-2-12 7-21 19-19 3-16 25-22 36-9 10-13 32-8 35 9 13-5 27 4 25 18 9 0 16 6 15 13-1 8-8 11-18 11H40c-6 0-10-2-13-5Z" fill="#eaf7ec"/>
          <path d="M74 49c-12-17-5-31 8-34 5 12 2 24-8 34Zm31 1c3-18 14-27 28-23-1 14-11 23-28 23Z" fill="#71bd63"/>
          <path d="M97 50c-2-18 6-31 20-33 5 14-2 27-20 33Z" fill="#9bd38a"/>
          <path d="M117 53c-1-11 6-19 17-18 3 11-5 19-17 18Z" fill="#4ca94f"/>
          <circle cx="99" cy="48" r="15" fill="#f37735"/><path d="m99 34 4-6 3 7 7-2-4 7" fill="#409644"/>
          <path d="M56 49h78l-6 39H62l-6-39Z" fill="#b98a5d"/><path d="M52 53h86v12H52zM59 75h72v9H59z" fill="#d2a375"/><path d="M73 49v39m44-39v39" stroke="#9b704b" stroke-width="4"/>
          <path d="m38 35 4 7 8 1-6 5 2 8-8-4-7 4 2-8-6-5 8-1 3-7Z" fill="#badfbc"/><circle cx="146" cy="39" r="3" fill="#6b776e"/>
        </svg>
        <strong>No products yet</strong>
        <p>Add your first harvest and start reaching more customers today.</p>
        <button class="seller-empty-action add-product" type="button">+ Add Your First Product</button>
      </div>`;
      return;
    }
    target.innerHTML = products.slice(0, 5).map((product) => {
      const quantity = Number(product.available_quantity || 0);
      const stockClass = quantity <= 0 ? "out" : quantity <= 5 ? "low" : "in";
      const stockText = quantity <= 0 ? "Out of stock" : `${quantity} ${escapeHtml(product.unit)} available`;
      return `<button class="seller-preview-product" type="button" data-product-id="${product.id}">
        <img src="${safeImageUrl(product.image_url)}" alt="">
        <span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.category)}</small></span>
        <b>${formatMoney(product.price)}/${escapeHtml(product.unit)}</b>
        <i class="${stockClass}">${stockText}</i><em aria-hidden="true">⋮</em>
      </button>`;
    }).join("");
  }

  function renderSellerDashboardOrders(orders = []) {
    const target = $("#seller-dashboard-orders");
    if (!target) return;
    target.classList.toggle("is-empty", !orders.length);
    if (!orders.length) {
      target.innerHTML = `<div class="seller-empty">
        <svg class="seller-empty-art seller-empty-parcel" viewBox="0 0 180 100" aria-hidden="true">
          <path d="M25 78c-9-1-14-7-12-14 2-7 10-10 17-7-2-13 9-23 22-19 6-17 30-20 39-4 10-12 30-7 33 9 14-5 28 5 24 19 10 0 17 7 15 14-2 8-10 10-20 10H39c-6 0-11-1-14-5Z" fill="#eaf7ec"/>
          <path d="M62 43 96 29l34 14-34 16-34-16Z" fill="#c6ded5"/><path d="M62 43v37l34 14V59L62 43Z" fill="#bad4cb"/><path d="m130 43-34 16v35l34-17V43Z" fill="#9dbfb4"/><path d="m83 34 34 15v10l-8-2v-7L75 38l8-4Z" fill="#7d9d93"/>
          <path d="M47 35c-7-10-3-19 5-21 4 8 2 16-5 21Zm83 4c2-12 10-18 19-15-1 10-8 16-19 15Z" fill="#70b965"/><path d="m148 45 3 6 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1 3-6Z" fill="#64736a"/>
        </svg>
        <strong>No seller orders yet.</strong>
        <p>Once buyers place orders for your products, they will appear here.</p>
        <button class="seller-empty-tip seller-empty-action" type="button">
          <span aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M17 29c-3-2-5-6-5-10a12 12 0 0 1 24 0c0 4-2 8-5 10-2 2-2 3-2 5H19c0-2 0-3-2-5Z"/><path d="M19 38h10M21 42h6M24 3V0M9 8 6 5m33 3 3-3M5 20H1m46 0h-4"/></svg></span><b>Start by adding products to your farm<small>List your fresh produce so local buyers can place orders.</small></b><i aria-hidden="true">›</i>
        </button>
      </div>`;
      return;
    }
    target.innerHTML = `<div class="seller-orders-table-wrap"><table class="seller-orders-table">
      <thead><tr><th scope="col">Order</th><th scope="col">Buyer</th><th scope="col">Items</th><th scope="col">Total</th><th scope="col">Status</th><th scope="col">Date</th></tr></thead>
      <tbody>${orders.slice(0, 5).map((order) => `
        <tr data-order-id="${order.id}" tabindex="0" aria-label="Open order ${escapeHtml(order.id.slice(0, 6).toUpperCase())}">
          <td><strong>#${escapeHtml(order.id.slice(0, 6).toUpperCase())}</strong></td>
          <td>${escapeHtml(order.contactName || "Buyer")}</td>
          <td>${order.items.length} item${order.items.length === 1 ? "" : "s"}</td>
          <td><b>${formatMoney(order.sellerTotal)}</b></td>
          <td><span class="seller-table-status status-${escapeHtml(order.status)}">${escapeHtml(sellerStatusLabel(order.status))}</span></td>
          <td><time datetime="${escapeHtml(order.createdAt)}">${new Date(order.createdAt).toLocaleDateString()}</time></td>
        </tr>`).join("")}</tbody>
    </table></div>`;
  }

  async function loadSellerDashboard() {
    if (!state.currentUser || state.selectedRole !== "seller" || !state.currentFarm) return;
    const status = $("#seller-dashboard-status");
    if (status) status.textContent = "Loading live seller data…";

    const [productsResult, orderItemsResult] = await Promise.all([
      db.from("products")
        .select("id, name, category, price, unit, available_quantity, image_url, is_active, created_at")
        .eq("farm_id", state.currentFarm.id)
        .order("created_at", { ascending: false }),
      getSellerOrderItems(true),
    ]);

    if (productsResult.error || orderItemsResult.error) {
      if (status) status.textContent = productsResult.error?.message || orderItemsResult.error?.message;
      return;
    }

    const products = productsResult.data || [];
    const orders = groupSellerOrders(orderItemsResult.data || []);
    const pending = orders.filter((order) => order.status === "pending").length;
    const deliveries = orders.filter((order) => ["accepted", "dispatched", "ready_for_pickup"].includes(order.status)).length;
    const sales = orders.filter((order) => ["delivered", "completed"].includes(order.status))
      .reduce((total, order) => total + order.sellerTotal, 0);
    const lowStock = products.filter((product) => Number(product.available_quantity) <= 5).length;

    $("#seller-stat-products").textContent = products.length;
    $("#seller-stat-pending").textContent = pending;
    $("#seller-stat-deliveries").textContent = deliveries;
    $("#seller-stat-sales").textContent = formatMoney(sales);
    $("#seller-stock-note").textContent = !products.length
      ? "No products added"
      : lowStock
        ? `${lowStock} stock alert${lowStock === 1 ? "" : "s"}`
        : "Stock levels healthy";
    $("#seller-pending-note").textContent = pending ? "Needs attention" : "No pending orders";
    $("#seller-deliveries-note").textContent = deliveries ? "Out for delivery" : "No active deliveries";
    $("#seller-sales-note").textContent = "From delivered orders";

    const pendingBadge = $("#seller-nav-pending");
    pendingBadge.textContent = pending;
    pendingBadge.hidden = !pending;
    const alertBadge = $("#seller-nav-alerts");
    alertBadge.textContent = lowStock;
    alertBadge.hidden = !lowStock;
    const headerAlert = $("#seller-alert-dot");
    headerAlert.textContent = lowStock > 99 ? "99+" : String(lowStock);
    headerAlert.hidden = !lowStock;
    headerAlert.closest("button")?.setAttribute(
      "aria-label",
      lowStock ? `View ${lowStock} inventory alert${lowStock === 1 ? "" : "s"}` : "View inventory alerts",
    );

    renderSellerDashboardProducts(products);
    renderSellerDashboardOrders(orders);
    if (status) status.textContent = "";
  }

  let sellerInventoryFilter = "all";
  let sellerInventorySearch = "";
  let sellerInventoryCache = [];
  const sellerLowStockThreshold = 5;

  function inventoryStatus(product) {
    const quantity = Number(product.available_quantity || 0);
    if (quantity <= 0) return "out";
    if (quantity <= sellerLowStockThreshold) return "low";
    return "healthy";
  }

  function renderInventoryChrome(products) {
    const countFor = (status) => products.filter((product) => inventoryStatus(product) === status).length;
    const summaries = [
      ["out", "Out of Stock", countFor("out"), "M12 8v5m0 4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"],
      ["low", "Low Stock", countFor("low"), "M12 3 2 21h20L12 3Zm0 7v5m0 3h.01"],
      ["total", "Total Products", products.length, "m12 2 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V7M12 12v10"],
      ["healthy", "Healthy Stock", countFor("healthy"), "m5 12 4 4L19 6"],
    ];
    $("#seller-inventory-summary").innerHTML = summaries.map(([status, label, count, icon]) => `<article class="seller-inventory-summary-card status-${status}"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${icon}"/></svg></span><strong>${count}</strong><small>${label}</small></article>`).join("");
    const filters = [
      ["all", "All Products", products.length, "M6 2h9l4 4v16H6zM14 2v5h5M9 12h7M9 16h7"],
      ["out", "Out of Stock", countFor("out"), "M12 8v5m0 4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"],
      ["low", "Low Stock", countFor("low"), "M12 3 2 21h20L12 3Zm0 7v5m0 3h.01"],
      ["healthy", "Healthy", countFor("healthy"), "m7 12 3 3 7-7M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"],
    ];
    $("#seller-inventory-filters").innerHTML = filters.map(([value, label, count, icon]) => `<button type="button" data-inventory-filter="${value}" class="${sellerInventoryFilter === value ? "active" : ""}"><svg class="status-${value}" viewBox="0 0 24 24" aria-hidden="true"><path d="${icon}"/></svg><span>${label}</span><b>${count}</b></button>`).join("");
  }

  function renderInventoryProducts() {
    const target = $("#seller-inventory-list");
    const query = sellerInventorySearch.trim().toLowerCase();
    const products = sellerInventoryCache.filter((product) => {
      const matchesFilter = sellerInventoryFilter === "all" || inventoryStatus(product) === sellerInventoryFilter;
      const matchesSearch = !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
    if (!products.length) {
      target.innerHTML = `<div class="seller-inventory-empty"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 2 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V7M12 12v10"/></svg></span><strong>No products found</strong><p>${sellerInventorySearch ? "Try a different product name or category." : "No products match this inventory status."}</p></div>`;
      return;
    }
    target.innerHTML = products.map((product) => {
      const quantity = Number(product.available_quantity || 0);
      const status = inventoryStatus(product);
      const statusLabel = status === "out" ? "Out of Stock" : status === "low" ? "Low Stock" : "Healthy";
      const statusHelp = status === "out" ? "Please restock immediately." : status === "low" ? "Consider restocking soon." : "Stock levels are good.";
      return `<article class="seller-inventory-row" data-product-id="${escapeHtml(product.id)}">
        <section class="seller-inventory-product"><img src="${safeImageUrl(product.image_url)}" alt="${escapeHtml(product.name)}"><div><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(product.category)}</span><small>${formatMoney(product.price)}/${escapeHtml(product.unit)}</small></div></section>
        <section class="seller-inventory-quantity status-${status} ${status === "out" ? "is-empty" : ""}"><strong>${quantity} ${escapeHtml(product.unit)}</strong><small>in stock</small></section>
        <section class="seller-inventory-status"><span class="status-${status}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${status === "out" ? "M12 8v5m0 4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" : status === "low" ? "M12 3 2 21h20L12 3Zm0 7v5m0 3h.01" : "m7 12 3 3 7-7M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"}"/></svg>${statusLabel}</span><small>${statusHelp}</small></section>
        <section class="seller-inventory-action"><button type="button" class="${status === "healthy" ? "secondary" : ""}" data-update-stock><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Update Stock</button></section>
      </article>`;
    }).join("");
  }

  async function openInventoryAlerts() {
    const target = $("#seller-inventory-list");
    target.textContent = "Loading inventory…";
    openModal(sellerInventoryModal);
    if (!state.currentFarm) {
      target.textContent = "No farm is connected to this seller account.";
      return;
    }
    const result = await db.from("products")
      .select("id, name, category, price, unit, available_quantity, description, image_url")
      .eq("farm_id", state.currentFarm.id)
      .order("available_quantity", { ascending: true });
    if (result.error) {
      target.textContent = result.error.message;
      showToast(result.error.message, 4000);
      return;
    }
    sellerInventoryCache = result.data || [];
    state.sellerProducts = sellerInventoryCache;
    renderInventoryChrome(sellerInventoryCache);
    renderInventoryProducts();
  }

  let sellerOrderFilter = "all";
  let sellerOrderCache = [];
  let sellerOrderActionsEnabled = true;
  let sellerDeliveryFilter = "all";
  let sellerDeliveryCache = [];
  let sellerDeliveryActionsEnabled = true;
  const sellerOrderStatusConfig = {
    pending: { label: "Pending", icon: "M5 4h4l2 11h8l2-8H10M12 20h.01M18 20h.01" },
    accepted: { label: "Accepted", icon: "m7 12 3 3 7-7M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" },
    dispatched: { label: "Dispatched", icon: "M3 6h11v11H3zM14 10h4l3 4v3h-7M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" },
    delivered: { label: "Delivered", icon: "m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" },
    rejected: { label: "Rejected", icon: "m8 8 8 8m0-8-8 8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" },
    ready_for_pickup: { label: "Ready for Pickup", icon: "M4 8h16v12H4zM8 8V5h8v3M8 13h8" },
    completed: { label: "Completed", icon: "m7 12 3 3 7-7M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" },
  };

  function renderSellerOrderChrome(orders) {
    const baseStatuses = ["pending", "accepted", "dispatched", "delivered", "rejected", "completed"];
    const optionalStatuses = ["ready_for_pickup"].filter((status) => orders.some((order) => order.status === status));
    const statuses = [...baseStatuses, ...optionalStatuses];
    if (sellerOrderFilter !== "all" && !statuses.includes(sellerOrderFilter)) sellerOrderFilter = "all";
    const countFor = (status) => orders.filter((order) => order.status === status).length;
    $("#seller-order-summary").innerHTML = statuses.map((status) => {
      const config = sellerOrderStatusConfig[status];
      return `<article class="seller-order-summary-card status-${status}"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${config.icon}"/></svg></span><strong>${countFor(status)}</strong><small>${config.label}</small></article>`;
    }).join("");
    $("#seller-order-filters").innerHTML = ["all", ...statuses].map((status) => {
      const label = status === "all" ? "All Orders" : sellerOrderStatusConfig[status].label;
      const count = status === "all" ? orders.length : countFor(status);
      return `<button type="button" data-order-filter="${status}" class="${sellerOrderFilter === status ? "active" : ""}"><i class="status-${status}" aria-hidden="true"></i>${label}<b>${count}</b></button>`;
    }).join("");
  }

  function renderIncomingSellerOrders(orders, target, actions = true) {
    if (!orders.length) {
      target.innerHTML = '<div class="seller-orders-empty"><span aria-hidden="true">&#9635;</span><strong>No orders found</strong><p>Customer orders matching this view will appear here.</p></div>';
      return;
    }
    target.innerHTML = orders.map((order) => {
      const products = order.items.map((item) => `<div class="seller-order-product"><img src="${safeImageUrl(item.products?.image_url || EMPTY_IMAGE)}" alt="${escapeHtml(item.product_name)}"><p><b>${escapeHtml(item.product_name)}</b>${item.products?.category ? `<em>${escapeHtml(item.products.category)}</em>` : ""}<small>${item.quantity} ${escapeHtml(item.unit || "kg")} &times; ${formatMoney(item.unit_price)}/${escapeHtml(item.unit || "kg")}</small></p><strong>${formatMoney(item.line_total ?? Number(item.quantity) * Number(item.unit_price))}</strong></div>`).join("");
      const nextActions = actions ? sellerOrderActions(order) : [];
      const controls = nextActions.length ? `<div class="order-actions">${nextActions.map(([status, label]) => `<button class="${status === "rejected" ? "reject-order" : "approve-order"}" data-status="${status}">${label}</button>`).join("")}</div>` : "";
      return `<article class="seller-order-card" data-order-id="${order.id}">
        <section class="seller-order-customer"><header><h3 title="${escapeHtml(order.id)}">Order #${escapeHtml(order.id.slice(0, 8).toUpperCase())}</h3><button type="button" class="seller-copy-order" data-copy-order-id="${escapeHtml(order.id)}" aria-label="Copy order ID"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></button></header><p><span aria-hidden="true">&#9675;</span>${escapeHtml(order.contactName || "Buyer")}</p>${order.businessName ? `<p><span aria-hidden="true">&#9633;</span>${escapeHtml(order.businessName)}</p>` : ""}${order.phone ? `<p><span aria-hidden="true">&#9675;</span>${escapeHtml(order.phone)}</p>` : ""}<p><span aria-hidden="true">&#9635;</span>${new Date(order.createdAt).toLocaleString()}</p><div class="seller-order-methods"><span>${escapeHtml(sellerStatusLabel(order.deliveryMethod || ""))}</span><span>${escapeHtml(sellerStatusLabel(order.paymentMethod || ""))}</span></div></section>
        <section class="seller-order-card-main"><header><h4>Products (${order.items.length})</h4><span class="seller-order-badge status-${escapeHtml(order.status)}">${escapeHtml(sellerStatusLabel(order.status))}</span></header><div class="seller-order-products">${products}</div></section>
        <aside class="seller-order-summary-panel"><div><small>Total Amount</small><strong>${formatMoney(order.sellerTotal)}</strong></div><dl><div><dt>Payment Method</dt><dd>${escapeHtml(sellerStatusLabel(order.paymentMethod || ""))}</dd></div><div><dt>Delivery Method</dt><dd>${escapeHtml(sellerStatusLabel(order.deliveryMethod || ""))}</dd></div></dl></aside>${controls}</article>`;
    }).join("");
  }

  function renderSellerOrders(orders, target, actions = true) {
    if (!orders.length) {
      target.innerHTML = '<div class="order-empty">No orders found.</div>';
      return;
    }

    target.innerHTML = orders
      .map((order) => {
        const products = order.items
          .map(
            (item) =>
              `<span class="seller-order-line"><b>${escapeHtml(item.product_name)}</b><small>${item.quantity} ${escapeHtml(item.unit || "kg")} × ${formatMoney(item.unit_price)}/${escapeHtml(item.unit || "kg")}</small><strong>${formatMoney(item.line_total ?? Number(item.quantity) * Number(item.unit_price))}</strong></span>`,
          )
          .join("");
        const nextActions = actions ? sellerOrderActions(order) : [];
        const controls = nextActions.length
          ? `<div class="order-actions">${nextActions.map(([status, label]) =>
              `<button class="${status === "rejected" ? "reject-order" : "approve-order"}" data-status="${status}">${label}</button>`,
            ).join("")}</div>`
          : "";

        return `
          <article class="order-card" data-order-id="${order.id}">
            <div class="seller-order-main">
              <strong title="${escapeHtml(order.id)}">Order #${escapeHtml(order.id.slice(0, 8).toUpperCase())}</strong>
              <p><b>${escapeHtml(order.contactName || "Buyer")}</b>${order.businessName ? ` · ${escapeHtml(order.businessName)}` : ""}${order.phone ? ` · ${escapeHtml(order.phone)}` : ""}</p>
              <p>${new Date(order.createdAt).toLocaleString()} · ${escapeHtml(sellerStatusLabel(order.deliveryMethod || ""))} · ${escapeHtml(sellerStatusLabel(order.paymentMethod || ""))}</p>
              <div class="seller-order-lines">${products}</div>
              <p class="seller-order-total">Your items total: <strong>${formatMoney(order.sellerTotal)}</strong></p>
            </div>
            <span class="order-status">${escapeHtml(sellerStatusLabel(order.status))}</span>
            ${controls}
          </article>`;
      })
      .join("");
  }

  async function openSellerOrders() {
    openModal(sellerOrdersModal);
    const target = $("#seller-order-list");
    target.textContent = "Loading orders...";
    const result = await getSellerOrderItems();

    if (result.error) {
      target.textContent = result.error.message;
      return;
    }

    sellerOrderCache = groupSellerOrders(result.data);
    sellerOrderActionsEnabled = !result.schemaFallback;
    renderSellerOrderChrome(sellerOrderCache);
    const visibleOrders = sellerOrderFilter === "all"
      ? sellerOrderCache
      : sellerOrderCache.filter((order) => order.status === sellerOrderFilter);
    renderIncomingSellerOrders(visibleOrders, target, sellerOrderActionsEnabled);
    if (result.schemaFallback) {
      target.insertAdjacentHTML("afterbegin", '<p class="seller-order-migration-note">Orders are shown using the shared order status. Apply <code>sql/order-fulfillment-workflow.sql</code> to enable delivery-specific actions.</p>');
    }
    await refreshPendingBadge();
  }

  async function updateSellerOrder(orderId, status, triggerButton, source = "orders") {
    if (status === "rejected" && !window.confirm("Reject this order? Reserved stock for your items will be returned to inventory.")) return;
    const originalText = triggerButton?.textContent;
    if (triggerButton) {
      triggerButton.disabled = true;
      triggerButton.textContent = "Updating…";
    }
    const result = await db.rpc("update_seller_order_status", {
      p_order_id: orderId,
      p_status: status,
    });
    if (result.error) {
      const missingRpc = result.error.code === "PGRST202" || String(result.error.message).includes("update_seller_order_status");
      showToast(missingRpc ? "Apply sql/order-fulfillment-workflow.sql in Supabase before updating fulfillment status." : result.error.message, 4500);
      if (triggerButton?.isConnected) {
        triggerButton.disabled = false;
        triggerButton.textContent = originalText;
      }
      return;
    }

    if (source === "deliveries") await openDeliveries();
    else await openSellerOrders();
    await loadSellerDashboard();
    showToast(`Order marked ${orderStatusLabel(status).toLowerCase()}`);
  }

  function deliveryFilterFor(order) {
    if (order.status === "accepted") return "to_dispatch";
    if (["dispatched", "ready_for_pickup"].includes(order.status)) return "in_transit";
    if (["delivered", "completed"].includes(order.status)) return "delivered";
    return "";
  }

  function renderDeliveryFilters(orders) {
    const filters = [
      ["all", "All Deliveries"],
      ["to_dispatch", "To Dispatch"],
      ["in_transit", "In Transit"],
      ["delivered", "Delivered"],
    ];
    const countFor = (filter) => filter === "all"
      ? orders.length
      : orders.filter((order) => deliveryFilterFor(order) === filter).length;
    $("#seller-delivery-filters").innerHTML = filters.map(([value, label]) =>
      `<button type="button" data-delivery-filter="${value}" class="${sellerDeliveryFilter === value ? "active" : ""}"><i class="delivery-filter-dot ${value}" aria-hidden="true"></i><span>${label}</span><b>${countFor(value)}</b></button>`,
    ).join("");
  }

  function deliveryActionFor(order) {
    if (order.status === "accepted") {
      return order.deliveryMethod === "farm_pickup"
        ? ["ready_for_pickup", "Mark Ready for Pickup"]
        : ["dispatched", "Mark as Dispatched"];
    }
    if (order.status === "dispatched") return ["delivered", "Mark as Delivered"];
    if (order.status === "ready_for_pickup") return ["completed", "Complete Pickup"];
    return null;
  }

  function renderDeliveries(orders) {
    const target = $("#seller-delivery-list");
    const visible = sellerDeliveryFilter === "all"
      ? orders
      : orders.filter((order) => deliveryFilterFor(order) === sellerDeliveryFilter);
    if (!visible.length) {
      target.innerHTML = '<div class="seller-deliveries-empty"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 6h11v11H3zM14 10h4l3 4v3h-7M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg></span><strong>No deliveries found</strong><p>Deliveries matching this status will appear here.</p></div>';
      return;
    }
    target.innerHTML = visible.map((order) => {
      const statusClass = deliveryFilterFor(order);
      const action = sellerDeliveryActionsEnabled ? deliveryActionFor(order) : null;
      const completed = order.status === "delivered";
      const actionControl = action
        ? `<button type="button" class="seller-delivery-action" data-delivery-status="${action[0]}"><span aria-hidden="true">${action[0] === "dispatched" ? "▣" : "✓"}</span>${action[1]}</button>`
        : completed
          ? '<button type="button" class="seller-delivery-action is-complete" disabled><span aria-hidden="true">✓</span>Delivered</button>'
          : "";
      const products = order.items.map((item) => `<div class="seller-delivery-product"><img src="${safeImageUrl(item.products?.image_url || EMPTY_IMAGE)}" alt="${escapeHtml(item.product_name)}"><span><strong>${escapeHtml(item.product_name)}</strong><small>${item.quantity} ${escapeHtml(item.unit || "kg")} &times; ${formatMoney(item.unit_price)}/${escapeHtml(item.unit || "kg")}</small></span></div>`).join("");
      return `<article class="seller-delivery-card" data-order-id="${escapeHtml(order.id)}">
        <section class="seller-delivery-order"><h3>Order #${escapeHtml(order.id.slice(0, 8).toUpperCase())}</h3><p><span aria-hidden="true">▣</span>${new Date(order.createdAt).toLocaleString()}</p><p><span aria-hidden="true">▱</span>${escapeHtml(sellerStatusLabel(order.deliveryMethod || ""))}</p></section>
        <section class="seller-delivery-products">${products}</section>
        <section class="seller-delivery-state"><span class="seller-delivery-badge ${statusClass} status-${escapeHtml(order.status)}">${escapeHtml(sellerStatusLabel(order.status))}</span><p><small>Total</small><strong>${formatMoney(order.sellerTotal)}</strong></p></section>
        <section class="seller-delivery-controls">${actionControl}</section>
      </article>`;
    }).join("");
  }

  async function openDeliveries() {
    const target = $("#seller-delivery-list");
    target.textContent = "Loading deliveries...";
    openModal(sellerDeliveriesModal);

    const result = await getSellerOrderItems(true);
    if (result.error) {
      target.textContent = result.error.message;
      return;
    }

    sellerDeliveryCache = groupSellerOrders(result.data).filter(
      (order) => ["accepted", "dispatched", "ready_for_pickup", "delivered", "completed"].includes(order.status),
    );
    sellerDeliveryActionsEnabled = !result.schemaFallback;
    renderDeliveryFilters(sellerDeliveryCache);
    renderDeliveries(sellerDeliveryCache);
    if (result.schemaFallback) {
      target.insertAdjacentHTML("afterbegin", '<p class="seller-order-migration-note">Deliveries are read-only until <code>sql/order-fulfillment-workflow.sql</code> is applied.</p>');
    }
  }

  function openMessages() {
    $("#seller-info-title").textContent = "Messages";
    $("#seller-info-content").innerHTML =
      '<div class="order-empty">Messaging will be available in a future update.</div>';
    openModal(sellerInfoModal);
  }

  function handleBuyerProductGridClick(event) {
    const quantityButton = event.target.closest("[data-product-qty]");
    if (quantityButton) {
      const card = quantityButton.closest("[data-product-id]");
      const value = $(".product-quantity b", card);
      const stock = Number(card.dataset.productStock) || 0;
      const next = Number(value.textContent) + (quantityButton.dataset.productQty === "increase" ? 1 : -1);
      value.textContent = Math.max(1, Math.min(stock || 1, next));
      return;
    }
    const button = event.target.closest(".add");
    if (!button) return;
    const card = button.closest("[data-product-id]");
    addProductToCart(card.dataset.productId, Number($(".product-quantity b", card)?.textContent) || 1);
  }

  // ---------------------------------------------------------------------------
  // Events and initialization
  // ---------------------------------------------------------------------------

  function bindEvents() {
    $$('[data-role]').forEach((button) =>
      button.addEventListener("click", () => openAuth(button.dataset.role)),
    );

    $("#auth-close").addEventListener("click", () => {
      closeModal(authModal);
      clearAuthForm();
      setPortal();
    });
    authModal.addEventListener("click", (event) => {
      if (event.target === authModal) $("#auth-close").click();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && authModal.classList.contains("open")) {
        $("#auth-close").click();
      }
    });
    $("#auth-switch").addEventListener("click", toggleAuthMode);
    $("#auth-password-toggle").addEventListener("click", () => {
      const input = $("#auth-password");
      const reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      $("#auth-password-toggle").setAttribute("aria-label", reveal ? "Hide password" : "Show password");
      $("#auth-password-toggle").setAttribute("aria-pressed", String(reveal));
    });
    $("#auth-form").addEventListener("submit", handleAuthSubmit);

    $$(".logout-btn").forEach((button) => button.addEventListener("click", logout));
    $(".back-role")?.addEventListener("click", logout);
    $(".profile-logout").addEventListener("click", logout);
    $(".profile-close").addEventListener("click", closeProfileEditor);
    profileModal.addEventListener("click", (event) => {
      if (event.target === profileModal) closeProfileEditor();
    });
    profileModal.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-profile-edit]");
      if (editButton) setProfileEditMode(editButton.dataset.profileEdit);
    });
    $(".profile-edit-cancel").addEventListener("click", openProfileEditor);
    $(".profile-password-reset").addEventListener("click", sendProfilePasswordReset);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && profileModal.classList.contains("open")) closeProfileEditor();
    });
    $("#profile-form").addEventListener("submit", saveProfile);
    $(".seller-settings-close").addEventListener("click", () => closeModal(sellerSettingsModal));
    sellerSettingsModal.addEventListener("click", (event) => {
      if (event.target === sellerSettingsModal) closeModal(sellerSettingsModal);
      const toggle = event.target.closest("[data-setting-toggle]");
      if (toggle) {
        const settings = loadSellerSettings();
        const key = toggle.dataset.settingToggle;
        settings[key] = !settings[key];
        saveSellerSettings(settings);
        renderSellerSettings();
        showToast(`${key === "orders" ? "Order notifications" : "Inventory alerts"} ${settings[key] ? "enabled" : "disabled"}`);
      }
      const themeChoice = event.target.closest("[data-theme-choice]");
      if (themeChoice) setTheme(themeChoice.dataset.themeChoice === "dark");
    });
    $(".seller-settings-password").addEventListener("click", sendProfilePasswordReset);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && sellerSettingsModal.classList.contains("open")) closeModal(sellerSettingsModal);
    });

    $("#open-cart").addEventListener("click", () => toggleCart(true));
    $("#close-cart").addEventListener("click", () => toggleCart(false));
    dom.cartOverlay.addEventListener("click", () => toggleCart(false));
    $("#clear-cart").addEventListener("click", clearBuyerCart);
    $("#checkout-btn").addEventListener("click", openCheckout);
    $("#keep-shopping").addEventListener("click", () => toggleCart(false));

    dom.cartItems.addEventListener("click", (event) => {
      if (event.target.closest("[data-cart-browse]")) {
        toggleCart(false);
        openBuyerEntry("browse");
        return;
      }
      const button = event.target.closest("[data-cart-action]");
      if (!button) return;
      const item = button.closest("[data-product-id]");
      updateCartItem(item.dataset.productId, button.dataset.cartAction);
    });

    document.addEventListener("keydown", (event) => {
      if (!dom.cartDrawer.classList.contains("open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        toggleCart(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...dom.cartDrawer.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    dom.productGrid.addEventListener("click", handleBuyerProductGridClick);
    dom.browseProductGrid?.addEventListener("click", handleBuyerProductGridClick);

    dom.searchInput.addEventListener("input", (event) => {
      if (currentPageKind() === "browse") {
        state.browseSearch = event.target.value.trim();
        const pageSearch = $("#browse-search-input");
        if (pageSearch) pageSearch.value = state.browseSearch;
        renderBrowseProducts();
      } else {
        state.search = event.target.value.trim();
        renderBuyerProducts();
      }
    });
    $(".filter-btn")?.addEventListener("click", () => openBuyerEntry("browse"));

    $("#buyer-view-cart")?.addEventListener("click", () => toggleCart(true));
    $("#buyer-checkout-btn")?.addEventListener("click", openCheckout);
    $("#buyer-cart-items")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-cart-action]");
      if (!button) return;
      const item = button.closest("[data-product-id]");
      updateCartItem(item.dataset.productId, button.dataset.cartAction);
    });
    const buyerAccount = $(".buyer-account");
    const buyerAccountButton = $(".buyer-profile-button");
    const buyerAccountMenu = $(".buyer-account-menu");
    const setBuyerAccountMenu = (open) => {
      if (!buyerAccountButton || !buyerAccountMenu) return;
      buyerAccountButton.setAttribute("aria-expanded", String(open));
      buyerAccountMenu.hidden = !open;
      buyerAccount.classList.toggle("open", open);
      if (open) buyerAccountMenu.querySelector("[role='menuitem']")?.focus();
    };
    buyerAccountButton?.addEventListener("click", () => setBuyerAccountMenu(buyerAccountMenu.hidden));
    buyerAccountMenu?.addEventListener("click", (event) => {
      const action = event.target.closest("[data-buyer-account]")?.dataset.buyerAccount;
      if (!action) return;
      setBuyerAccountMenu(false);
      if (action === "profile") openProfileEditor();
      if (action === "logout") logout();
    });
    document.addEventListener("click", (event) => {
      if (buyerAccount && !buyerAccount.contains(event.target)) setBuyerAccountMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && buyerAccountMenu && !buyerAccountMenu.hidden) {
        setBuyerAccountMenu(false);
        buyerAccountButton.focus();
      }
    });
    $("#buyer-featured-farms")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-featured-farm]");
      if (!button) return;
      setBuyerActiveNav("#browse");
      state.browseSearch = button.dataset.featuredFarm;
      state.browseCategory = "All Items";
      openBuyerEntry("browse", { farm: state.browseSearch });
    });
    $$("#buyer-app a[data-route='#browse']").forEach((link) => {
      link.addEventListener("click", () => {
        setBuyerActiveNav("#browse");
        state.browseCategory = "All Items";
        state.browseSearch = "";
        state.browsePriceMin = null;
        state.browsePriceMax = null;
        if ($("#browse-price-min")) $("#browse-price-min").value = "";
        if ($("#browse-price-max")) $("#browse-price-max").value = "";
        renderBrowseProducts();
      });
    });

    $$(".categories button").forEach((button) => {
      button.addEventListener("click", () => {
        setBuyerActiveNav("#browse");
        state.browseCategory = button.dataset.category || $("strong", button).textContent.trim();
        state.browseSearch = "";
        openBuyerEntry("browse", { category: state.browseCategory });
      });
    });
    $("#browse-category-filters")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-browse-category]");
      if (!button) return;
      state.browseCategory = button.dataset.browseCategory;
      renderBrowseProducts();
    });
    $("#browse-search-input")?.addEventListener("input", (event) => {
      state.browseSearch = event.target.value.trim();
      dom.searchInput.value = state.browseSearch;
      renderBrowseProducts();
    });
    $("#browse-sort-select")?.addEventListener("change", (event) => {
      state.browseSort = event.target.value;
      renderBrowseProducts();
    });
    $("#browse-apply-price")?.addEventListener("click", () => {
      const minimum = $("#browse-price-min").value;
      const maximum = $("#browse-price-max").value;
      const nextMinimum = minimum === "" ? null : Math.max(0, Number(minimum));
      const nextMaximum = maximum === "" ? null : Math.max(0, Number(maximum));
      if (nextMinimum !== null && nextMaximum !== null && nextMinimum > nextMaximum) {
        showToast("Minimum price cannot be greater than maximum price.", 3200);
        return;
      }
      state.browsePriceMin = nextMinimum;
      state.browsePriceMax = nextMaximum;
      renderBrowseProducts();
    });
    $("#farmer-spotlight").addEventListener("click", (event) => {
      const button = event.target.closest("[data-spotlight-farm]");
      if (!button) return;
      state.search = button.dataset.spotlightFarm;
      dom.searchInput.value = state.search;
      state.category = "All Items";
      $$(".categories button").forEach((item) => item.classList.toggle("selected", item.dataset.category === "All Items"));
      openBuyerEntry("browse", { farm: state.search });
    });

    $$("#buyer-app .desktop-nav a, #buyer-app .mobile-nav a").forEach((link) => {
      link.addEventListener("click", () => setBuyerActiveNav(buyerLinkRoute(link)));
    });
    window.addEventListener("hashchange", renderBuyerRoute);
    $("#buyer-app .brand")?.addEventListener("click", () => setBuyerActiveNav("#home"));
    $("#buyer-order-filters")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-buyer-order-filter]");
      if (!button) return;
      state.buyerOrderFilter = button.dataset.buyerOrderFilter;
      renderBuyerOrders();
    });
    dom.ordersList?.addEventListener("click", (event) => {
      const detailsButton = event.target.closest("[data-buyer-order-details]");
      if (detailsButton) openBuyerOrderDetails(detailsButton.dataset.buyerOrderDetails);
      if (event.target.closest("[data-retry-buyer-orders]")) loadBuyerOrders();
    });
    $("#close-buyer-order-detail")?.addEventListener("click", closeBuyerOrderDetails);
    dom.buyerOrderDetailModal?.addEventListener("click", (event) => {
      if (event.target === dom.buyerOrderDetailModal) closeBuyerOrderDetails();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dom.buyerOrderDetailModal?.classList.contains("open")) closeBuyerOrderDetails();
    });
    let buyerNavFrame = 0;
    window.addEventListener("scroll", () => {
      if (buyerNavFrame) return;
      buyerNavFrame = window.requestAnimationFrame(() => {
        buyerNavFrame = 0;
        syncBuyerNavFromScroll();
      });
    }, { passive: true });

    $("#close-checkout").addEventListener("click", () => closeCheckout());
    $("#back-to-cart").addEventListener("click", () => closeCheckout({ reopenCart: true }));
    dom.checkoutForm.addEventListener("change", (event) => {
      if (event.target.name === "delivery") syncCheckoutDeliveryFields();
    });
    $("#checkout-review-items").addEventListener("click", (event) => {
      const button = event.target.closest("[data-checkout-cart-action]");
      if (!button) return;
      const item = button.closest("[data-product-id]");
      updateCartItem(item.dataset.productId, button.dataset.checkoutCartAction);
    });
    dom.checkoutModal.addEventListener("click", (event) => {
      if (event.target === dom.checkoutModal) closeCheckout();
    });
    dom.checkoutForm.addEventListener("submit", submitCheckout);
    $("#continue-shopping").addEventListener("click", () => {
      closeCheckout();
      dom.checkoutCard.classList.remove("success");
      dom.orderSuccess.classList.remove("show");
      dom.checkoutForm.reset();
      syncCheckoutDeliveryFields();
    });
    document.addEventListener("keydown", (event) => {
      if (!dom.checkoutModal.classList.contains("open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeCheckout();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...dom.checkoutCard.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    $(".add-product").addEventListener("click", () => openSellerProducts(true));
    $("#seller-dashboard-products").addEventListener("click", (event) => {
      openSellerProducts(Boolean(event.target.closest(".seller-empty-action")));
    });
    $("#seller-dashboard-orders").addEventListener("click", (event) => {
      if (event.target.closest(".seller-empty-action")) {
        openSellerProducts(true);
        return;
      }
      openSellerOrders();
    });
    $("#seller-dashboard-orders").addEventListener("keydown", (event) => {
      if (!event.target.closest("[data-order-id]") || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      openSellerOrders();
    });
    $$('[data-seller-action]').forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.sellerAction;
        if (button.closest(".seller-nav")) {
          $$(".seller-nav [data-seller-action]").forEach((item) => item.classList.toggle("active", item === button));
        }
        if (action === "dashboard") loadSellerDashboard();
        if (action === "products") openSellerProducts(false);
        if (action === "orders") openSellerOrders();
        if (action === "deliveries") openDeliveries();
        if (action === "inventory") openInventoryAlerts();
        if (action === "profile") openProfileEditor();
        if (action === "settings") openSellerSettings();
        closeSellerNavigation();
      });
    });
    $$(".seller-nav [data-seller-action]").forEach((button) => {
      const label = $(".seller-nav-copy strong", button)?.textContent.trim();
      if (label) {
        button.setAttribute("aria-label", label);
        button.title = label;
      }
    });
    const sellerMenu = $(".seller-menu");
    const closeSellerNavigation = () => {
      $("#seller-app").classList.remove("sidebar-open");
      sellerMenu.setAttribute("aria-expanded", "false");
    };
    sellerMenu.setAttribute("aria-expanded", "false");
    sellerMenu.addEventListener("click", () => {
      const isOpen = $("#seller-app").classList.toggle("sidebar-open");
      sellerMenu.setAttribute("aria-expanded", String(isOpen));
    });
    $(".seller-sidebar-overlay").addEventListener("click", closeSellerNavigation);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && $("#seller-app").classList.contains("sidebar-open")) closeSellerNavigation();
    });

    $(".seller-products-close").addEventListener("click", closeSellerProductsModal);
    $(".seller-products-add").addEventListener("click", () => openSellerProducts(true));
    $(".seller-product-cancel").addEventListener("click", closeSellerProductsModal);
    $("#seller-product-form").addEventListener("submit", saveSellerProduct);
    $("#seller-product-form").addEventListener("input", () => updateSellerProductPreview());
    $("#seller-product-form [name='image']").addEventListener("change", (event) => {
      previewSellerProductImage(event.target.files[0]);
    });
    const imageDrop = $("#seller-image-drop");
    const imageInput = $("#seller-product-form [name='image']");
    imageDrop.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        imageInput.click();
      }
    });
    ["dragenter", "dragover"].forEach((type) => imageDrop.addEventListener(type, (event) => {
      event.preventDefault();
      imageDrop.classList.add("dragging");
    }));
    ["dragleave", "drop"].forEach((type) => imageDrop.addEventListener(type, (event) => {
      event.preventDefault();
      imageDrop.classList.remove("dragging");
    }));
    imageDrop.addEventListener("drop", (event) => {
      const file = event.dataTransfer.files[0];
      if (!file || !previewSellerProductImage(file)) return;
      const transfer = new DataTransfer();
      transfer.items.add(file);
      imageInput.files = transfer.files;
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && sellerProductsModal.classList.contains("open")) closeSellerProductsModal();
    });
    $("#seller-db-list").addEventListener("click", (event) => {
      if (event.target.closest(".seller-products-empty-add")) {
        openSellerProducts(true);
        return;
      }
      const button = event.target.closest(".delete-product, .edit-product");
      if (!button) return;
      const productId = button.closest("[data-product-id]").dataset.productId;
      if (button.classList.contains("edit-product")) editSellerProduct(productId);
      else deleteSellerProduct(productId, button);
    });

    $(".seller-orders-close").addEventListener("click", () =>
      closeModal(sellerOrdersModal),
    );
    $("#seller-order-list").addEventListener("click", (event) => {
      const copyButton = event.target.closest("[data-copy-order-id]");
      if (copyButton) {
        if (!navigator.clipboard) {
          showToast("Copy is unavailable in this browser");
          return;
        }
        navigator.clipboard.writeText(copyButton.dataset.copyOrderId)
          .then(() => showToast("Order ID copied"))
          .catch(() => showToast("Unable to copy order ID"));
        return;
      }
      const button = event.target.closest("[data-status]");
      if (!button) return;
      const orderId = button.closest("[data-order-id]").dataset.orderId;
      updateSellerOrder(orderId, button.dataset.status, button);
    });
    $("#seller-order-filters").addEventListener("click", (event) => {
      const button = event.target.closest("[data-order-filter]");
      if (!button) return;
      sellerOrderFilter = button.dataset.orderFilter;
      $$("#seller-order-filters [data-order-filter]").forEach((item) => item.classList.toggle("active", item === button));
      const visibleOrders = sellerOrderFilter === "all"
        ? sellerOrderCache
        : sellerOrderCache.filter((order) => order.status === sellerOrderFilter);
      renderIncomingSellerOrders(visibleOrders, $("#seller-order-list"), sellerOrderActionsEnabled);
    });
    $(".seller-deliveries-close").addEventListener("click", () => closeModal(sellerDeliveriesModal));
    sellerDeliveriesModal.addEventListener("click", (event) => {
      if (event.target === sellerDeliveriesModal) closeModal(sellerDeliveriesModal);
    });
    $("#seller-delivery-filters").addEventListener("click", (event) => {
      const button = event.target.closest("[data-delivery-filter]");
      if (!button) return;
      sellerDeliveryFilter = button.dataset.deliveryFilter;
      renderDeliveryFilters(sellerDeliveryCache);
      renderDeliveries(sellerDeliveryCache);
    });
    $("#seller-delivery-list").addEventListener("click", (event) => {
      const button = event.target.closest("[data-delivery-status]");
      if (!button) return;
      const orderId = button.closest("[data-order-id]")?.dataset.orderId;
      if (orderId) updateSellerOrder(orderId, button.dataset.deliveryStatus, button, "deliveries");
    });
    $(".seller-inventory-close").addEventListener("click", () => closeModal(sellerInventoryModal));
    sellerInventoryModal.addEventListener("click", (event) => {
      if (event.target === sellerInventoryModal) closeModal(sellerInventoryModal);
    });
    $("#seller-inventory-filters").addEventListener("click", (event) => {
      const button = event.target.closest("[data-inventory-filter]");
      if (!button) return;
      sellerInventoryFilter = button.dataset.inventoryFilter;
      renderInventoryChrome(sellerInventoryCache);
      renderInventoryProducts();
    });
    $("#seller-inventory-search").addEventListener("input", (event) => {
      sellerInventorySearch = event.target.value;
      renderInventoryProducts();
    });
    $("#seller-inventory-list").addEventListener("click", async (event) => {
      const button = event.target.closest("[data-update-stock]");
      if (!button) return;
      const productId = button.closest("[data-product-id]")?.dataset.productId;
      if (!productId) return;
      reopenInventoryAfterProductEdit = true;
      closeModal(sellerInventoryModal);
      await openSellerProducts(false);
      editSellerProduct(productId);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && sellerDeliveriesModal.classList.contains("open")) closeModal(sellerDeliveriesModal);
      if (event.key === "Escape" && sellerInventoryModal.classList.contains("open")) closeModal(sellerInventoryModal);
    });
    $(".seller-info-close").addEventListener("click", () =>
      closeModal(sellerInfoModal),
    );
    themeButton.addEventListener("click", () =>
      setTheme(!document.body.classList.contains("dark-mode")),
    );
  }

  function subscribeToRealtimeProducts() {
    db.channel("localbites-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        async () => {
          await loadBuyerProducts();
          if (state.currentUser && state.selectedRole === "buyer") await loadBuyerCart();
          if (state.currentUser && state.selectedRole === "seller" && sellerInventoryModal.classList.contains("open")) await openInventoryAlerts();
        },
      )
      .subscribe();
  }

  function subscribeToRealtimeOrders() {
    const refreshOrders = async () => {
      if (!state.currentUser) return;
      if (state.selectedRole === "buyer") await loadBuyerOrders();
      if (state.selectedRole === "seller") {
        await Promise.all([loadSellerDashboard(), refreshPendingBadge()]);
        if (sellerOrdersModal.classList.contains("open")) await openSellerOrders();
        if (sellerDeliveriesModal.classList.contains("open")) await openDeliveries();
      }
    };
    db.channel("localbites-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, refreshOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, refreshOrders)
      .subscribe();
  }

  async function restoreAuthenticatedSession() {
    const sessionResult = await db.auth.getSession();
    const user = sessionResult.data.session?.user;
    if (!user) {
      if (currentPageKind() !== "landing") {
        window.location.replace(appUrl("index.html"));
        return true;
      }
      return false;
    }

    const profileResult = await db.from("profiles").select("full_name, phone, role").eq("id", user.id).single();
    if (profileResult.error) {
      showToast(`Unable to restore session: ${profileResult.error.message}`, 3500);
      if (currentPageKind() !== "landing") {
        window.location.replace(appUrl("index.html"));
        return true;
      }
      return false;
    }

    state.currentUser = user;
    state.currentProfile = profileResult.data;
    state.selectedRole = profileResult.data.role;
    state.currentFarm = state.selectedRole === "seller"
      ? await ensureSellerFarm(user, profileResult.data)
      : null;
    SUPABASE_FARM_ID = state.currentFarm?.id || "";
    if (redirectToRoleEntry(state.selectedRole)) return true;
    setPortal(state.selectedRole);
    await updateProfileDisplay();
    if (state.selectedRole === "buyer") {
      await Promise.all([loadBuyerProducts(), loadBuyerOrders(), loadBuyerCart()]);
    } else {
      await Promise.all([refreshPendingBadge(), loadSellerDashboard()]);
    }
    return false;
  }

  function initialize() {
    restoreEntryFilters();
    createProfilePills();
    bindEvents();
    renderBuyerRoute();
    renderCart();
    setTheme(localStorage.getItem("localbites-dark") === "1");
    setPortal();
    loadBuyerProducts();
    restoreAuthenticatedSession()
      .then((redirecting) => {
        if (!redirecting) finishEntryBoot();
      })
      .catch((error) => {
        finishEntryBoot();
        showToast(`Unable to restore session: ${error.message}`, 3500);
      });
    subscribeToRealtimeProducts();
    subscribeToRealtimeOrders();

    window.setInterval(() => {
      if (state.currentUser && state.selectedRole === "seller") {
        refreshPendingBadge();
      }
    }, 30_000);
  }

  initialize();
})();
