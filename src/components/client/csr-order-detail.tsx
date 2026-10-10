"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderDetails, OrderHistory } from "@/components/order-details";
import { Card, CardSkeleton, LoadSteps, PageHeader } from "@/components/panels";
import { STATUSES, type Order } from "@/lib/filters";
import { markDataVisible } from "./page-metrics";
import { useFetchJson } from "./use-fetch-json";

export function CsrOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = useFetchJson<Order>(`/api/orders/${id}`);
  // Waterfall: we only know the customer after the first request finishes.
  const history = useFetchJson<Order[]>(order.data ? `/api/orders/${id}?history` : null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!order.data) return;
    markDataVisible();
    // SEO problem: the title is only set NOW, in the browser. Crawlers and
    // link previews that don't run JS saw the generic title from the shell.
    document.title = `Order #${order.data.id}: ${order.data.product} for ${order.data.customer} · SSR vs CSR`;
  }, [order.data]);

  async function save(formData: FormData) {
    setSaving(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: formData.get("status") }),
    });
    if (res.ok) order.setData(await res.json());
    setSaving(false);
  }

  return (
    <>
      <Link href="/csr/orders" className="text-sm text-black/60 hover:underline dark:text-white/60">
        ← All orders
      </Link>
      <PageHeader mode="csr" title={`Order #${id}`}>
        View Page Source: the <code>&lt;title&gt;</code> is generic and there is no description or <code>og:</code>{" "}
        tag. The real title is set by JavaScript after the data arrives, which most link-preview bots never run.
      </PageHeader>

      <LoadSteps
        mode="csr"
        steps={[
          <>Empty shell arrives; JavaScript downloads and runs</>,
          <><code>fetch(&apos;/api/orders/{id}&apos;)</code> loads the order</>,
          <>Only after that response can the browser ask for the customer&apos;s other orders: a <strong>request waterfall</strong></>,
          <><code>document.title</code> is set by JavaScript, too late for most crawlers</>,
          <>Saving needs a hand-written API route (<code>PATCH /api/orders/{id}</code>) plus fetch code</>,
        ]}
      />

      {order.error && <p className="rounded-md bg-rose-500/10 p-3 text-sm">Error: {order.error}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Order details" note={order.ms !== undefined ? `fetched in ${order.ms} ms` : undefined}>
          {order.data ? (
            <>
              <OrderDetails order={order.data} />
              <form
                action={save}
                className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/10 pt-4 dark:border-white/10"
              >
                <label className="text-sm" htmlFor="status">
                  Change status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={order.data.status}
                  key={order.data.status}
                  className="rounded-md border border-black/15 bg-white px-2.5 py-1.5 text-sm capitalize dark:border-white/15 dark:bg-neutral-900"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  disabled={saving}
                  className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </form>
            </>
          ) : (
            <CardSkeleton lines={9} />
          )}
        </Card>
        <Card
          title={order.data ? `Other orders by ${order.data.customer}` : "Other orders"}
          note={history.ms !== undefined ? `fetched in ${history.ms} ms (after the order)` : "waiting for the order first…"}
        >
          {history.data ? <OrderHistory orders={history.data} detailPath="/csr/orders" /> : <CardSkeleton lines={8} />}
        </Card>
      </div>
    </>
  );
}
