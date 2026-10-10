import Link from "next/link";
import { toQueryString, type Order, type OrderFilters, type SortColumn } from "@/lib/filters";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge } from "./status-badge";

// Shared presentational component. Rendered by a Server Component it ships
// zero JavaScript; imported by a Client Component it becomes part of the bundle.

const columns: { key: SortColumn; label: string; align?: "right" }[] = [
  { key: "id", label: "Order" },
  { key: "customer", label: "Customer" },
  { key: "country", label: "Country" },
  { key: "product", label: "Product" },
  { key: "total", label: "Total", align: "right" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Date" },
];

export function OrdersTable({
  rows,
  filters,
  basePath,
  detailPath,
}: {
  rows: Order[];
  filters: OrderFilters;
  basePath: string;
  detailPath: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-black/60 dark:bg-white/[0.04] dark:text-white/60">
          <tr>
            {columns.map((col) => {
              const active = filters.sort === col.key;
              const nextDir = active && filters.dir === "desc" ? "asc" : "desc";
              return (
                <th key={col.key} className={`px-3 py-2 font-medium ${col.align === "right" ? "text-right" : ""}`}>
                  <Link
                    href={`${basePath}${toQueryString(filters, { sort: col.key, dir: nextDir, page: 1 })}`}
                    scroll={false}
                    className="hover:text-black dark:hover:text-white"
                  >
                    {col.label}
                    {active ? (filters.dir === "desc" ? " ↓" : " ↑") : ""}
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {rows.map((o) => (
            <tr key={o.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
              <td className="px-3 py-2 font-mono text-xs">
                <Link href={`${detailPath}/${o.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                  #{o.id}
                </Link>
              </td>
              <td className="px-3 py-2">
                <div className="font-medium">{o.customer}</div>
                <div className="text-xs text-black/50 dark:text-white/50">{o.email}</div>
              </td>
              <td className="px-3 py-2">{o.country}</td>
              <td className="px-3 py-2">
                <div>
                  {o.product}
                  {o.quantity > 1 && <span className="text-black/50 dark:text-white/50"> ×{o.quantity}</span>}
                </div>
                <div className="text-xs text-black/50 dark:text-white/50">{o.category}</div>
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{formatMoney(o.total)}</td>
              <td className="px-3 py-2">
                <StatusBadge status={o.status} />
              </td>
              <td className="px-3 py-2 tabular-nums text-black/70 dark:text-white/70">{formatDate(o.created_at)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-black/50 dark:text-white/50">
                No orders match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function TableSkeleton({ rows = 12 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
      <div className="h-9 bg-black/[0.03] dark:bg-white/[0.04]" />
      <div className="divide-y divide-black/5 dark:divide-white/5">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 px-3 py-3">
            <div className="h-3 w-12 rounded bg-black/10 dark:bg-white/10" />
            <div className="h-3 w-40 rounded bg-black/10 dark:bg-white/10" />
            <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10" />
            <div className="h-3 flex-1 rounded bg-black/10 dark:bg-white/10" />
            <div className="h-3 w-16 rounded bg-black/10 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
