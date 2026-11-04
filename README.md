# LocalBites Farmer Co-op

LocalBites is a multi-page buyer and seller marketplace backed by Supabase.

## Page structure

```text
LocalBites/
├─ index.html                 Portal selection and authentication entry
├─ pages/
│  ├─ home.html              Buyer homepage
│  ├─ browse.html            Browse products
│  └─ orders.html            Buyer order history
├─ seller/
│  └─ dashboard.html         Seller dashboard and management modals
├─ partials/
│  └─ app-shell.html         Shared UI shell and reusable modal markup
├─ css/
│  └─ app.css                Shared design system
├─ js/
│  ├─ page-entry.js          Multi-page bootstrap and URL normalization
│  ├─ app.js                 Shared Supabase and application behavior
│  └─ supabase-config.js     Public Supabase client configuration
├─ assets/                   Local images and illustrations
├─ server/                   Optional local/Postman API
└─ sql/                      Supabase migrations and policies
```

The legacy root files `buyer.html`, `browse.html`, `orders.html`, and `seller.html`
remain as lightweight redirects so old bookmarks continue to work.

Buyer Profile and Checkout remain modal workflows because they share live cart,
authentication, and profile state. Seller product, order, delivery, inventory,
profile, and settings tools remain dashboard modals for the same reason.

## Run locally

1. Open the repository in VS Code.
2. Start the optional API with `npm.cmd start` when testing the Postman endpoints.
3. Use Live Server to open `index.html`.

Do not open the HTML files directly with `file://`; the page bootstrap loads the
shared shell over HTTP.

## Primary routes

- `/index.html` — portal selection and login/register flow
- `/pages/home.html` — buyer homepage
- `/pages/browse.html` — product catalog
- `/pages/orders.html` — buyer orders
- `/seller/dashboard.html` — seller portal

Supabase sessions persist across these same-origin pages. Buyer carts continue to
load from the authenticated buyer's Supabase cart records.

## Checks

Run:

```powershell
npm.cmd run check
```

This validates JavaScript syntax, server syntax, entry pages, route mappings, and
shared dependencies.

## Deployment

The HTML, CSS, JavaScript, partials, and assets can be deployed as a static project
on Vercel. Configure the production domain under Supabase Authentication → URL
Configuration. Never place a Supabase `service_role` key in frontend code.

## Playwright browser tests

The existing `npm.cmd run check` validates syntax and page wiring; the Postman
collection covers API requests. Playwright adds automated browser coverage.

```powershell
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Playwright starts its own static test server at http://127.0.0.1:4173. Live Server,
API startup, Supabase credentials, and real accounts are not required.

The suite runs on desktop Chromium and a mobile Chromium viewport. It checks
portal loading, buyer/seller auth forms, password visibility, login validation,
invalid credentials, signup confirmation, all protected entry routes and legacy
redirects, and recovery from a failed shared-shell request. Browser JavaScript
errors fail the test.

The real Supabase SDK is served from the pinned npm dependency during tests.
Remote HTTP responses are mocked and realtime WebSockets are closed. Tests do
not write to production. These tests cover guest UI behavior; successful login,
authenticated catalog/cart/checkout, seller management, and database policies
still require additional integration scenarios against a dedicated test project.

```powershell
npm.cmd run test:e2e:ui       # Interactive runner
npm.cmd run test:e2e:report   # Open the latest HTML results
npm.cmd run test:e2e -- --project=chromium
```

Failure screenshots and traces are saved under `test-results/`; the HTML report
is in `playwright-report/`. Both directories are ignored by Git.
Configuration reference: https://playwright.dev/docs/test-webserver
