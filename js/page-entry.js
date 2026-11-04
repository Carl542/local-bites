(() => {
  "use strict";

  const page = document.body.dataset.localbitesPage || "landing";
  const loaderUrl = new URL(document.currentScript.src);
  const rootUrl = new URL("../", loaderUrl);
  const routeByPage = {
    landing: "#landing",
    buyer: "#home",
    browse: "#browse",
    orders: "#orders",
    seller: "#seller",
  };
  const pageByRoute = {
    "#home": "pages/home.html",
    "#browse": "pages/browse.html",
    "#orders": "pages/orders.html",
    "#about": "pages/home.html#about",
  };

  window.LOCALBITES_ROOT_URL = rootUrl.href;

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(source, rootUrl).href;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load ${source}`));
      document.body.append(script);
    });
  }

  function rewriteShellUrls(shell) {
    shell.querySelectorAll("[src]").forEach((element) => {
      const source = element.getAttribute("src");
      if (source && !/^(?:[a-z]+:|\/\/|data:|#)/i.test(source)) {
        element.setAttribute("src", new URL(source, rootUrl).href);
      }
    });

    shell.querySelectorAll("a[href]").forEach((link) => {
      const route = link.getAttribute("href");
      if (!pageByRoute[route]) return;
      link.dataset.route = route;
      link.href = new URL(pageByRoute[route], rootUrl).href;
    });
  }

  async function boot() {
    const response = await fetch(new URL("partials/app-shell.html", rootUrl), {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Unable to load the LocalBites application shell.");

    const source = await response.text();
    const parsed = new DOMParser().parseFromString(source, "text/html");
    const fragment = document.createDocumentFragment();
    [...parsed.body.children]
      .filter((node) => node.tagName !== "SCRIPT")
      .forEach((node) => fragment.append(document.importNode(node, true)));

    rewriteShellUrls(fragment);
    document.body.replaceChildren(fragment);
    document.body.dataset.localbitesPage = page;
    document.body.dataset.localbitesRoute = routeByPage[page] || "#landing";

    if (page !== "landing") {
      document.body.classList.add("entry-auth-pending");
      const loadingCover = document.createElement("div");
      loadingCover.id = "entry-auth-loading";
      loadingCover.className = "entry-auth-loading";
      loadingCover.setAttribute("role", "status");
      loadingCover.setAttribute("aria-live", "polite");
      loadingCover.innerHTML = `
        <span class="entry-auth-loading-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48"><path d="M24 40V20M24 30C14 29 10 23 10 14c9 0 15 5 14 16Zm0-4c1-10 7-15 16-16 0 9-5 15-16 16Z"/></svg>
        </span>
        <strong>LocalBites</strong>
        <small>Restoring your secure session…</small>
        <i aria-hidden="true"></i>`;
      document.body.append(loadingCover);
    }

    await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
    await loadScript("js/supabase-config.js");
    await loadScript("js/app.js?v=20261104-44");
  }

  boot().catch((error) => {
    document.body.innerHTML = `
      <main class="entry-load-error">
        <h1>LocalBites</h1>
        <p>${error.message}</p>
        <a href="${new URL("index.html", rootUrl).href}">Return to portal selection</a>
      </main>`;
  });
})();
