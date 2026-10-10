"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FiltersForm } from "@/components/filters-form";
import { OrdersTable, TableSkeleton } from "@/components/orders-table";
import { Pagination } from "@/components/pagination";
import { LoadSteps, PageHeader, RenderInfo } from "@/components/panels";
import { parseFilters, toQueryString, type OrdersPage } from "@/lib/filters";
import { formatBytes, formatNumber } from "@/lib/format";
import { markDataVisible } from "./page-metrics";
import { useFetchJson } from "./use-fetch-json";

// Everything in this file, including the shared table, filters and
// pagination components it imports, is shipped to the browser as JavaScript
// and runs there.
export function CsrOrders() {
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const { data, error, loading, ms, bytes } = useFetchJson<OrdersPage>(`/api/orders${toQueryString(filters)}`);

  useEffect(() => {
    if (data) markDataVisible();
  }, [data]);

  return (
    <>
      <PageHeader mode="csr" title="Orders explorer">
        The same app as a classic single-page app. The server sends an empty shell; the browser downloads React and
        this component, asks <code>/api/orders</code> for JSON and only then builds the table.
      </PageHeader>

      <LoadSteps
        mode="csr"
        steps={[
          <>Browser requests <code>/csr/orders?…</code> and receives an almost empty HTML shell</>,
          <>Browser downloads and executes the JavaScript bundles (React, Next.js router, this page)</>,
          <>React renders the page with a loading state</>,
          <>An effect fires <code>fetch(&apos;/api/orders?…&apos;)</code>: a second round trip to the server</>,
          <>Server queries SQLite (identical SQL) and returns JSON</>,
          <>Browser parses the JSON and React renders the table. <strong>Only now is the data visible</strong></>,
        ]}
      />

      <RenderInfo
        mode="csr"
        title="This render, measured in the browser"
        items={[
          { label: "Rendered by", value: "your browser" },
          { label: "API round trip", value: ms !== undefined ? `${ms} ms` : "…", hint: "fetch + download of the JSON" },
          { label: "JSON size", value: bytes ? formatBytes(bytes) : "…" },
          { label: "Rows matched", value: data ? formatNumber(data.total) : "…" },
          { label: "Rows rendered", value: data ? data.rows.length : "…", hint: "Built into DOM by React in the browser" },
        ]}
      />

      <FiltersForm filters={filters} basePath="/csr/orders" />
      {error && <p className="rounded-md bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">Error: {error}</p>}
      {data ? (
        <div className={`space-y-5 transition-opacity ${loading ? "opacity-50" : ""}`}>
          <Pagination filters={filters} page={data.page} pageCount={data.pageCount} total={data.total} basePath="/csr/orders" />
          <OrdersTable rows={data.rows} filters={filters} basePath="/csr/orders" detailPath="/csr/orders" />
          <Pagination filters={filters} page={data.page} pageCount={data.pageCount} total={data.total} basePath="/csr/orders" />
        </div>
      ) : (
        !error && <TableSkeleton />
      )}
    </>
  );
}
