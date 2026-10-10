import type { Metadata } from "next";
import { InteractiveOrders } from "@/components/client/interactive-orders";
import { FiltersForm } from "@/components/filters-form";
import { Pagination } from "@/components/pagination";
import { LoadSteps, PageHeader, RenderInfo } from "@/components/panels";
import { parseFilters } from "@/lib/filters";
import { formatBytes, formatNumber } from "@/lib/format";
import { getOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "Orders (Hybrid)" };

// The pattern you'll use most in real apps: a Server Component fetches the
// data, a Client Component makes it interactive.
export default async function HybridOrdersPage({ searchParams }: PageProps<"/hybrid/orders">) {
  const filters = parseFilters(await searchParams);
  const data = await getOrders(filters);
  // Props passed to a Client Component are serialized into the page (the RSC
  // payload) so React can hydrate it. That's the cost of interactivity.
  const propsBytes = new TextEncoder().encode(JSON.stringify(data.rows)).length;

  return (
    <>
      <PageHeader mode="hybrid" title="Orders explorer">
        The server queries the database and filters the 100,000 rows (filter form + pagination, same as SSR). The 50
        rows it returns are handed to a small Client Component that adds <strong>instant</strong> filtering and row
        selection, things that would need a server round trip on every keystroke otherwise.
      </PageHeader>

      <LoadSteps
        mode="hybrid"
        steps={[
          <>Server queries SQLite and renders the rows to HTML: visible immediately, even without JS</>,
          <>The same rows are also embedded as data (the RSC payload) so React can hydrate the island</>,
          <>After hydration, typing in the instant filter and selecting rows happen entirely in the browser: 0 ms network</>,
          <>Big jumps (another page, another status, searching all 100k) still go to the server via the URL</>,
        ]}
      />

      <RenderInfo
        mode="hybrid"
        title="The trade-off"
        items={[
          { label: "Rows matched (server)", value: formatNumber(data.total) },
          { label: "Rows sent", value: data.rows.length },
          { label: "SQL time", value: `${data.queryMs} ms` },
          { label: "Props serialized", value: formatBytes(propsBytes), hint: "Sent in addition to the HTML, so React can hydrate the island" },
          { label: "Instant filter latency", value: "~0 ms", hint: "No network: runs in the browser" },
        ]}
      />

      <FiltersForm filters={filters} basePath="/hybrid/orders" />
      <Pagination filters={filters} page={data.page} pageCount={data.pageCount} total={data.total} basePath="/hybrid/orders" />
      <InteractiveOrders key={data.rows.map((r) => r.id).join()} rows={data.rows} />
    </>
  );
}
