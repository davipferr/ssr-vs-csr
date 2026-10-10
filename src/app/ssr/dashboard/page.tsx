import type { Metadata } from "next";
import { Suspense } from "react";
import { BarChart, ColumnChart } from "@/components/bar-chart";
import { KpiCards, KpiSkeleton } from "@/components/kpi-cards";
import { Card, CardSkeleton, LoadSteps, PageHeader } from "@/components/panels";
import {
  WIDGET_DELAYS,
  getKpis,
  getMonthlyRevenue,
  getStatusBreakdown,
  getTopCountries,
  getTopProducts,
} from "@/lib/orders";

export const metadata: Metadata = { title: "Dashboard (SSR + streaming)" };

// The page itself does NOT await anything. Each widget is its own async
// Server Component inside its own <Suspense> boundary, so all five queries
// start at the same time on the server and each one streams its HTML into
// the page as soon as it finishes. There's no client JS for the charts.
export default function SsrDashboardPage() {
  return (
    <>
      <PageHeader mode="ssr" title="Sales dashboard">
        Five aggregate queries over 100,000 orders, each with a different (simulated) cost. Watch them arrive one
        by one, fastest first, in a <strong>single HTTP response</strong>.
      </PageHeader>

      <LoadSteps
        mode="ssr"
        steps={[
          <>Server immediately sends the page frame + skeletons (the parts outside <code>&lt;Suspense&gt;</code>)</>,
          <>Meanwhile, all five queries run <strong>in parallel</strong> on the server, close to the database</>,
          <>As each finishes, its HTML is streamed into the same response and swapped in place of its skeleton</>,
          <>The page is complete after the slowest query (~{WIDGET_DELAYS.countries / 1000}s), not after the sum of all of them</>,
          <>Charts are plain HTML/CSS. Zero kilobytes of charting library sent to the browser</>,
        ]}
      />

      <Suspense fallback={<KpiSkeleton />}>
        <Kpis />
      </Suspense>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Revenue by month" note={`~${WIDGET_DELAYS.monthly} ms`}>
          <Suspense fallback={<CardSkeleton />}>
            <Monthly />
          </Suspense>
        </Card>
        <Card title="Orders by status" note={`~${WIDGET_DELAYS.status} ms`}>
          <Suspense fallback={<CardSkeleton />}>
            <Statuses />
          </Suspense>
        </Card>
        <Card title="Top countries by revenue" note={`~${WIDGET_DELAYS.countries} ms`}>
          <Suspense fallback={<CardSkeleton lines={10} />}>
            <Countries />
          </Suspense>
        </Card>
        <Card title="Best-selling products (units)" note={`~${WIDGET_DELAYS.products} ms`}>
          <Suspense fallback={<CardSkeleton lines={8} />}>
            <Products />
          </Suspense>
        </Card>
      </div>
    </>
  );
}

async function Kpis() {
  return <KpiCards kpis={await getKpis()} />;
}
async function Monthly() {
  return <ColumnChart data={await getMonthlyRevenue()} />;
}
async function Statuses() {
  return <BarChart data={await getStatusBreakdown()} kind="count" />;
}
async function Countries() {
  return <BarChart data={await getTopCountries()} kind="money" />;
}
async function Products() {
  return <BarChart data={await getTopProducts()} kind="count" />;
}
