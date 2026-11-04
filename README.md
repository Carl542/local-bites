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
