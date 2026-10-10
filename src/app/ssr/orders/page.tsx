import type { Metadata } from "next";
import { FiltersForm } from "@/components/filters-form";
import { OrdersTable } from "@/components/orders-table";
import { Pagination } from "@/components/pagination";
import { LoadSteps, PageHeader, RenderInfo } from "@/components/panels";
import { parseFilters } from "@/lib/filters";
import { formatNumber } from "@/lib/format";
import { getOrders } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Orders (SSR)",
  description: "100,000 orders rendered on the server: filtered, sorted and paginated before the HTML is sent.",
};

async function load(searchParams: PageProps<"/ssr/orders">["searchParams"]) {
  const started = performance.now();
  const filters = parseFilters(await searchParams); // reading searchParams => rendered per request
  const data = await getOrders(filters);
  return {
    filters,
    data,
    serverMs: Math.round(performance.now() - started),
    renderedAt: new Date().toISOString().slice(11, 23),
  };
}

// This is a Server Component (the default). It is async, talks to the
// database directly, and its code is never sent to the browser.
export default async function SsrOrdersPage({ searchParams }: PageProps<"/ssr/orders">) {
  const { filters, data, serverMs, renderedAt } = await load(searchParams);

  return (
    <>
      <PageHeader mode="ssr" title="Orders explorer">
        The server queries 100,000 orders, keeps the 50 you asked for and sends them as ready-to-show HTML. The
        filter form, sorting and pagination are plain links and GET forms, so they work even with JavaScript
        disabled.
      </PageHeader>

      <LoadSteps
        mode="ssr"
        steps={[
          <>Browser requests <code>/ssr/orders?…</code></>,
          <>Server reads the URL and queries SQLite (filter, sort, LIMIT 50)</>,
          <>Server renders the table to HTML and sends one complete document</>,
          <><strong>Browser paints the data immediately</strong>. Nothing else is needed to see it</>,
          <>A small JS bundle hydrates the nav and the filter form for faster navigations (optional!)</>,
        ]}
      />

      <RenderInfo
        mode="ssr"
        title="This render, measured on the server"
        items={[
          { label: "Rendered at (UTC)", value: renderedAt, hint: "Refresh: this changes on every request" },
          { label: "SQL time", value: `${data.queryMs} ms`, hint: "COUNT + SELECT on 100k rows" },
          { label: "Server total", value: `${serverMs} ms`, hint: "Includes ~80 ms simulated DB network latency" },
          { label: "Rows matched", value: formatNumber(data.total) },
          { label: "Rows sent", value: data.rows.length, hint: "Only the visible page leaves the server" },
        ]}
      />

      <FiltersForm filters={filters} basePath="/ssr/orders" />
      <Pagination filters={filters} page={data.page} pageCount={data.pageCount} total={data.total} basePath="/ssr/orders" />
      <OrdersTable rows={data.rows} filters={filters} basePath="/ssr/orders" detailPath="/ssr/orders" />
      <Pagination filters={filters} page={data.page} pageCount={data.pageCount} total={data.total} basePath="/ssr/orders" />
    </>
  );
}
