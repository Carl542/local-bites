"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pages = new Map([
  ["index.html", "landing"],
  ["pages/home.html", "buyer"],
  ["pages/browse.html", "browse"],
  ["pages/orders.html", "orders"],
  ["seller/dashboard.html", "seller"],
]);

for (const [relativePath, page] of pages) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`Missing page: ${relativePath}`);
  const html = fs.readFileSync(absolutePath, "utf8");
  if (!html.includes(`data-localbites-page="${page}"`)) {
    throw new Error(`Incorrect page marker in ${relativePath}`);
  }
  if (!html.includes("page-entry.js")) throw new Error(`Missing shared loader in ${relativePath}`);
}

for (const required of [
  "partials/app-shell.html",
  "js/page-entry.js",
  "js/app.js",
  "js/supabase-config.js",
  "css/app.css",
]) {
  if (!fs.existsSync(path.join(root, required))) throw new Error(`Missing shared dependency: ${required}`);
}

const loader = fs.readFileSync(path.join(root, "js/page-entry.js"), "utf8");
for (const route of ["pages/home.html", "pages/browse.html", "pages/orders.html", "seller/dashboard.html"]) {
  const source = route.startsWith("seller/") ? fs.readFileSync(path.join(root, "js/app.js"), "utf8") : loader;
  if (!source.includes(route)) throw new Error(`Missing route mapping: ${route}`);
}

console.log(`Validated ${pages.size} LocalBites entry pages and shared dependencies.`);
