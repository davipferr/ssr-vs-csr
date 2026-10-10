# ssr-vs-csr

The same orders back office (**100,000 orders** in SQLite) built three ways in Next.js, to *see* what
Server-Side Rendering is good for:

| Version | Where the HTML is made | Pages |
|---|---|---|
| **SSR** | On the server, from a direct DB query | `/ssr/orders`, `/ssr/orders/[id]`, `/ssr/dashboard` |
| **CSR** | In the browser, after fetching JSON from `/api/*` | `/csr/orders`, `/csr/orders/[id]`, `/csr/dashboard` |
| **Hybrid** | Server-rendered data + a client "island" for instant interactions | `/hybrid/orders` |

All versions use the same components, the same SQL and the same simulated DB latency. Only the rendering
strategy changes. A metrics panel (bottom-right) shows real FCP/LCP/hydration/bytes from your browser.

## Run it

Requires Node.js 22.13+ (uses the built-in `node:sqlite`; no native modules).

```bash
npm install
npm run build   # also seeds data/orders.db the first time
npm start       # http://localhost:3000
```

Use `npm run dev` while editing code, but measure with `build` + `start`; dev mode makes every number worse.
`npm run seed` regenerates the database (deterministic data).

## Experiments

The home page lists them in detail: disable JavaScript, View Page Source, throttle network/CPU, watch the
dashboard stream, run Lighthouse, spot the CSR request waterfall.

## Structure

```
scripts/seed.mjs              generates 100k orders into data/orders.db
src/lib/
  db.ts                       SQLite connection ("server-only": can never reach the browser)
  orders.ts                   all queries + simulated latency (used by SSR pages AND the API)
  filters.ts                  URL <-> filters parsing, shared by server and client
  format.ts                   deterministic formatters (no hydration mismatches)
src/components/               shared UI: rendered on the server by SSR pages, in the browser by CSR pages
src/components/client/        "use client" components (CSR pages, hybrid island, metrics panel)
src/app/ssr/                  async Server Components that query the DB directly; Server Action for updates
src/app/csr/                  empty shells + client components that fetch from the API
src/app/hybrid/               server fetch + interactive client island
src/app/api/                  JSON endpoints, needed only by the CSR version
```

## Notes

- `cacheComponents` (Partial Prerendering) is disabled in `next.config.ts` so SSR pages are rendered completely
  before being sent, which keeps the "works without JavaScript" experiment honest. Streaming is still shown
  explicitly with `<Suspense>` on the dashboard. Enabling it is a good next experiment.
- In Next.js even `"use client"` components are pre-rendered on the server. The CSR pages use a `ClientOnly`
  wrapper to behave like a pure SPA (Vite / Create React App) for a fair comparison.
