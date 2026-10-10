import Link from "next/link";
import type { Order } from "@/lib/filters";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge } from "./status-badge";

// Shared between the SSR and CSR detail pages.

export function OrderDetails({ order }: { order: Order }) {
  const rows: [string, React.ReactNode][] = [
    ["Customer", order.customer],
    ["Email", order.email],
    ["Country", order.country],
    ["Product", `${order.product} (${order.category})`],
    ["Quantity", order.quantity],
    ["Unit price", formatMoney(order.unit_price)],
    ["Total", <strong key="t">{formatMoney(order.total)}</strong>],
    ["Status", <StatusBadge key="s" status={order.status} />],
    ["Created", formatDate(order.created_at)],
  ];
  return (
    <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-black/55 dark:text-white/55">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function OrderHistory({ orders, detailPath }: { orders: Order[]; detailPath: string }) {
  if (orders.length === 0) return <p className="text-sm text-black/55 dark:text-white/55">No other orders.</p>;
  return (
    <ul className="divide-y divide-black/5 text-sm dark:divide-white/5">
      {orders.map((o) => (
        <li key={o.id} className="flex items-center justify-between gap-3 py-1.5">
          <Link href={`${detailPath}/${o.id}`} className="font-mono text-xs text-blue-600 hover:underline dark:text-blue-400">
            #{o.id}
          </Link>
          <span className="flex-1 truncate">{o.product}</span>
          <StatusBadge status={o.status} />
          <span className="w-20 text-right tabular-nums">{formatMoney(o.total)}</span>
        </li>
      ))}
    </ul>
  );
}
