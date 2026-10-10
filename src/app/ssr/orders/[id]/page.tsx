import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SubmitButton } from "@/components/client/submit-button";
import { OrderDetails, OrderHistory } from "@/components/order-details";
import { Card, CardSkeleton, LoadSteps, PageHeader } from "@/components/panels";
import { STATUSES } from "@/lib/filters";
import { formatMoney } from "@/lib/format";
import { getCustomerHistory, getOrder } from "@/lib/orders";
import { changeStatus } from "../actions";

async function loadOrder(params: PageProps<"/ssr/orders/[id]">["params"]) {
  const { id } = await params;
  const order = await getOrder(Number(id));
  if (!order) notFound();
  return order;
}

// SEO: this runs on the server, so <title>, <meta description> and Open Graph
// tags are in the HTML that search engines and link previews (WhatsApp,
// Slack, LinkedIn…) read. Check with "View Page Source".
export async function generateMetadata({ params }: PageProps<"/ssr/orders/[id]">): Promise<Metadata> {
  const order = await loadOrder(params);
  const title = `Order #${order.id}: ${order.product} for ${order.customer}`;
  const description = `${order.quantity}× ${order.product} shipped to ${order.country}, total ${formatMoney(order.total)}, status: ${order.status}.`;
  return { title, description, openGraph: { title, description, type: "article" } };
}

export default async function SsrOrderPage({ params }: PageProps<"/ssr/orders/[id]">) {
  const order = await loadOrder(params); // deduped with generateMetadata via React cache()

  return (
    <>
      <Link href="/ssr/orders" className="text-sm text-black/60 hover:underline dark:text-white/60">
        ← All orders
      </Link>
      <PageHeader mode="ssr" title={`Order #${order.id}`}>
        The title, description and Open Graph tags are generated on the server. Right-click → View Page Source and
        search for <code>og:title</code>. The CSR version of this page has none of that in its HTML.
      </PageHeader>

      <LoadSteps
        mode="ssr"
        steps={[
          <>Server loads the order once (<code>generateMetadata</code> and the page share the query)</>,
          <>The <code>&lt;head&gt;</code> tags and the order card are sent as HTML right away</>,
          <>&quot;Other orders by this customer&quot; is slow (~1s). It sits in a <code>&lt;Suspense&gt;</code> boundary, so its skeleton is sent first and the real HTML is <strong>streamed</strong> later in the same response</>,
          <>Changing the status uses a <strong>Server Action</strong>: a form POST handled on the server, no API route needed</>,
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Order details">
          <OrderDetails order={order} />
          <form action={changeStatus} className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/10 pt-4 dark:border-white/10">
            <input type="hidden" name="id" value={order.id} />
            <label className="text-sm" htmlFor="status">
              Change status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={order.status}
              key={order.status}
              className="rounded-md border border-black/15 bg-white px-2.5 py-1.5 text-sm capitalize dark:border-white/15 dark:bg-neutral-900"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <SubmitButton>Save</SubmitButton>
            <span className="w-full text-xs text-black/50 dark:text-white/50">
              Server Action. Works without JavaScript too (the browser does a normal form POST).
            </span>
          </form>
        </Card>

        <Card title={`Other orders by ${order.customer}`} note="streamed (~1s)">
          <Suspense fallback={<CardSkeleton lines={8} />}>
            <History customer={order.customer} excludeId={order.id} />
          </Suspense>
        </Card>
      </div>
    </>
  );
}

async function History({ customer, excludeId }: { customer: string; excludeId: number }) {
  const orders = await getCustomerHistory(customer, excludeId);
  return <OrderHistory orders={orders} detailPath="/ssr/orders" />;
}
