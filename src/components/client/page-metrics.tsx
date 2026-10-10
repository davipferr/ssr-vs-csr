"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { formatBytes } from "@/lib/format";

// Measures the REAL cost of the initial page load in this browser, using the
// standard Performance APIs. Compare the numbers between /ssr and /csr pages.

export const DATA_VISIBLE_EVENT = "metrics:data-visible";

/** CSR components call this once their data is on screen. */
export function markDataVisible() {
  if (performance.getEntriesByName("data-visible").length === 0) {
    performance.mark("data-visible");
    window.dispatchEvent(new Event(DATA_VISIBLE_EVENT));
  }
}

type Metrics = {
  fcp?: number;
  lcp?: number;
  hydrated: number;
  dataVisible?: number;
  htmlBytes: number;
  jsBytes: number;
  jsFiles: number;
  fetchBytes: number;
};

function collect(hydrated: number, lcp?: number): Metrics {
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const size = (r: PerformanceResourceTiming) => Math.max(r.transferSize, r.encodedBodySize);
  const scripts = resources.filter((r) => r.initiatorType === "script");
  const fetches = resources.filter((r) => r.initiatorType === "fetch" && r.name.includes("/api/"));
  const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime;
  const dataVisible = performance.getEntriesByName("data-visible")[0]?.startTime;
  return {
    fcp,
    lcp,
    hydrated,
    dataVisible,
    htmlBytes: nav ? Math.max(nav.transferSize, nav.encodedBodySize) : 0,
    jsBytes: scripts.reduce((sum, r) => sum + size(r), 0),
    jsFiles: scripts.length,
    fetchBytes: fetches.reduce((sum, r) => sum + size(r), 0),
  };
}

const ms = (v?: number) => (v === undefined ? "…" : `${Math.round(v)} ms`);

export function PageMetrics() {
  const pathname = usePathname();
  const [initialPath] = useState(pathname);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // This effect runs right after hydration: React has attached to the HTML.
    const hydrated = performance.now();
    let lcp: number | undefined;
    const refresh = () => setMetrics(collect(hydrated, lcp));

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      lcp = entries[entries.length - 1]?.startTime;
      refresh();
    });
    try {
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      /* LCP not supported (Firefox/Safari) */
    }

    refresh();
    const timer = setInterval(refresh, 1000); // pick up late-loading resources
    const stop = setTimeout(() => clearInterval(timer), 8000);
    window.addEventListener(DATA_VISIBLE_EVENT, refresh);
    return () => {
      observer.disconnect();
      clearInterval(timer);
      clearTimeout(stop);
      window.removeEventListener(DATA_VISIBLE_EVENT, refresh);
    };
  }, []);

  const isCsr = initialPath.startsWith("/csr");
  const navigatedAway = pathname !== initialPath;

  return (
    <div className="fixed bottom-3 right-3 z-50 w-72 rounded-lg border border-black/15 bg-white/95 text-xs shadow-lg backdrop-blur dark:border-white/15 dark:bg-neutral-900/95">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 font-semibold"
      >
        <span>
          Page-load metrics
          {/* Rendered on the server as "JS off"; flips once React hydrates. */}
          <span className={`ml-2 rounded px-1 py-0.5 font-normal ${metrics ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
            {metrics ? "JS running" : "JS not running"}
          </span>
        </span>
        <span>{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-black/10 px-3 py-2 dark:border-white/10">
          {!metrics ? (
            <p>
              No JavaScript has run. Everything on this page arrived as <strong>HTML from the server</strong>.
            </p>
          ) : (
            <>
              <p className="text-black/55 dark:text-white/55">
                Initial load of <code>{initialPath}</code>
                {navigatedAway && " (you navigated client-side since; press F5 to re-measure)"}
              </p>
              <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 tabular-nums">
                <dt title="First Contentful Paint: when the browser first painted anything">First paint (FCP)</dt>
                <dd>{ms(metrics.fcp)}</dd>
                <dt title="Largest Contentful Paint: when the biggest element appeared">Largest paint (LCP)</dt>
                <dd>{ms(metrics.lcp)}</dd>
                <dt title="When React finished hydrating and the page became interactive">Hydrated</dt>
                <dd>{ms(metrics.hydrated)}</dd>
                <dt className="font-semibold" title="When the order data was actually visible">
                  Data visible
                </dt>
                <dd className="font-semibold">
                  {isCsr ? ms(metrics.dataVisible) : `in HTML (≈ ${ms(metrics.fcp)})`}
                </dd>
                <dt className="pt-1">HTML document</dt>
                <dd className="pt-1">{formatBytes(metrics.htmlBytes)}</dd>
                <dt>JavaScript ({metrics.jsFiles} files)</dt>
                <dd>{formatBytes(metrics.jsBytes)}</dd>
                <dt>API JSON fetched</dt>
                <dd>{formatBytes(metrics.fetchBytes)}</dd>
              </dl>
              {process.env.NODE_ENV === "development" && (
                <p className="rounded bg-amber-500/15 p-1.5">
                  Dev mode: bundles are unminified and pages compile on demand. For honest numbers run{" "}
                  <code>npm run build && npm start</code>.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
