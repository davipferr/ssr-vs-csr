"use client";

import { useEffect, type ReactNode } from "react";
import { BarChart, ColumnChart } from "@/components/bar-chart";
import { KpiCards, KpiSkeleton } from "@/components/kpi-cards";
import { Card, CardSkeleton, LoadSteps, PageHeader } from "@/components/panels";
import type { Datum, Kpis } from "@/lib/orders";
import { markDataVisible } from "./page-metrics";
import { useFetchJson } from "./use-fetch-json";

export function CsrDashboard() {
  const kpis = useFetchJson<Kpis>("/api/stats/kpis");

  useEffect(() => {
    if (kpis.data) markDataVisible();
  }, [kpis.data]);

  return (
    <>
      <PageHeader mode="csr" title="Sales dashboard">
        Same five queries, same delays, but fetched by the browser after the JavaScript has loaded. Every widget
        starts its request later than in the SSR version, and the charts are rendered by JS on your device.
      </PageHeader>

      <LoadSteps
        mode="csr"
        steps={[
          <>Empty shell arrives. Nothing useful yet (no KPIs, no skeletons) until the JS runs</>,
          <>JavaScript downloads, React renders the skeletons</>,
          <>Five <code>fetch()</code> calls start, each a separate HTTP request (from far away on a real network)</>,
          <>Each JSON response arrives and React renders the chart in the browser</>,
          <>Total time = JS load + slowest request. The fetches only <em>start</em> after JS is ready</>,
        ]}
      />

      {kpis.data ? <KpiCards kpis={kpis.data} /> : <KpiSkeleton />}

      <div className="grid gap-5 lg:grid-cols-2">
        <Widget title="Revenue by month" url="/api/stats/monthly" render={(d) => <ColumnChart data={d} />} />
        <Widget title="Orders by status" url="/api/stats/status" render={(d) => <BarChart data={d} kind="count" />} />
        <Widget title="Top countries by revenue" url="/api/stats/countries" render={(d) => <BarChart data={d} kind="money" />} />
        <Widget title="Best-selling products (units)" url="/api/stats/products" render={(d) => <BarChart data={d} kind="count" />} />
      </div>
    </>
  );
}

function Widget({ title, url, render }: { title: string; url: string; render: (data: Datum[]) => ReactNode }) {
  const { data, ms } = useFetchJson<Datum[]>(url);
  return (
    <Card title={title} note={ms !== undefined ? `fetched in ${ms} ms` : "fetching…"}>
      {data ? render(data) : <CardSkeleton />}
    </Card>
  );
}
