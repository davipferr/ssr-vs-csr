import Link from "next/link";
import { modeStyles, type Mode } from "@/components/panels";

const versions: { mode: Mode; summary: string; links: { href: string; label: string }[]; points: string[] }[] = [
  {
    mode: "ssr",
    summary: "The server queries the database and sends finished HTML.",
    links: [
      { href: "/ssr/orders", label: "Orders" },
      { href: "/ssr/dashboard", label: "Dashboard" },
      { href: "/ssr/orders/1", label: "Order #1" },
    ],
    points: [
      "Data is visible on first paint",
      "Works with JavaScript disabled",
      "Real <title> and Open Graph tags for SEO",
      "No API routes; DB access stays on the server",
      "Streaming: slow widgets don't block fast ones",
    ],
  },
  {
    mode: "csr",
    summary: "The browser loads JS, fetches JSON, then builds the page.",
    links: [
      { href: "/csr/orders", label: "Orders" },
      { href: "/csr/dashboard", label: "Dashboard" },
      { href: "/csr/orders/1", label: "Order #1" },
    ],
    points: [
      "Empty shell until JS runs",
      "Extra round trip(s) after the JS loads",
      "Data request can't start until all JS has run",
      "Generic title in the HTML",
      "Needs a hand-written API for every read/write",
    ],
  },
  {
    mode: "hybrid",
    summary: "Server-rendered data plus a client island for interactivity.",
    links: [{ href: "/hybrid/orders", label: "Orders" }],
    points: [
      "Fast first paint like SSR",
      "Instant, per-keystroke interactions like CSR",
      "Cost: data is serialized for hydration",
      "This is how most real Next.js apps are built",
    ],
  },
];

const experiments: { title: string; how: string; expect: string }[] = [
  {
    title: "1. Disable JavaScript",
    how: "DevTools → Ctrl+Shift+P → type “Disable JavaScript” → reload each Orders page.",
    expect:
      "SSR: the table, filters, sorting and pagination all still work. CSR: “Loading app…” forever. Hybrid: the data is there, only the instant filter is dead.",
  },
  {
    title: "2. View Page Source",
    how: "Open /ssr/orders/1 and /csr/orders/1, press Ctrl+U and search for “og:title” and for the customer name.",
    expect: "SSR: the full order is in the HTML along with SEO tags. CSR: a spinner and a generic <title>.",
  },
  {
    title: "3. Slow network + slow phone",
    how: "DevTools → Network: “Slow 4G”, Performance: CPU 6× slowdown. Reload both Orders pages.",
    expect:
      "Watch the metrics panel (bottom-right): CSR must download and run JS before it even starts the data request, so “Data visible” is much later.",
  },
  {
    title: "4. Watch streaming",
    how: "Reload /ssr/dashboard, then /csr/dashboard.",
    expect:
      "SSR: the frame appears instantly and widgets pop in fastest-first, in one HTTP response (check the Network tab: one document request). CSR: one request per widget, all starting after the JS boots.",
  },
  {
    title: "5. Lighthouse",
    how: "DevTools → Lighthouse → Performance + SEO, mobile. Run on /ssr/orders and /csr/orders.",
    expect: "Compare LCP (when the main content appears) and the SEO score.",
  },
  {
    title: "6. Request waterfall",
    how: "Open /csr/orders/1 with the Network tab open.",
    expect:
      "The customer history request only starts after the order request finishes. On /ssr/orders/1 both happen on the server, next to the database.",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-3 pt-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          One app, <span className="text-emerald-600">rendered on the server</span> vs{" "}
          <span className="text-amber-500">rendered in the browser</span>
        </h1>
        <p className="max-w-3xl text-black/70 dark:text-white/70">
          An orders back office with <strong>100,000 orders</strong> in SQLite, built three times with the same
          components, the same SQL and the same simulated database latency. The only thing that changes is{" "}
          <em>where</em> the HTML is produced. Open the panel in the bottom-right corner on any page to see real
          measurements from your browser.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {versions.map((v) => (
          <div key={v.mode} className={`space-y-3 rounded-xl border p-4 ${modeStyles[v.mode].border}`}>
            <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold uppercase ${modeStyles[v.mode].badge}`}>
              {v.mode}
            </span>
            <h2 className="font-semibold">{modeStyles[v.mode].label}</h2>
            <p className="text-sm text-black/70 dark:text-white/70">{v.summary}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {v.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 pt-1">
              {v.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md border border-black/15 px-3 py-1 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Experiments to run</h2>
        <p className="rounded-lg bg-amber-500/10 p-3 text-sm">
          Run these against a <strong>production build</strong> (<code>npm run build</code> then{" "}
          <code>npm start</code>). In <code>npm run dev</code> pages compile on first visit and bundles are
          unminified, which makes every number worse and the comparison unfair.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {experiments.map((e) => (
            <div key={e.title} className="space-y-1.5 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
              <h3 className="font-semibold">{e.title}</h3>
              <p>
                <span className="text-black/50 dark:text-white/50">How: </span>
                {e.how}
              </p>
              <p>
                <span className="text-black/50 dark:text-white/50">Expect: </span>
                {e.expect}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-xl font-semibold">When is CSR the better choice?</h2>
        <p className="max-w-3xl text-black/70 dark:text-white/70">
          SSR wins on first load, SEO and weak devices. Client rendering wins when the UI reacts to every keystroke or
          drag (editors, canvases, spreadsheets), when data is private and SEO doesn&apos;t matter, or when you need it
          to work offline. That&apos;s why the <Link href="/hybrid/orders" className="underline">hybrid page</Link>{" "}
          exists: real apps render on the server by default and add client islands only where interaction needs them.
        </p>
      </section>
    </div>
  );
}
