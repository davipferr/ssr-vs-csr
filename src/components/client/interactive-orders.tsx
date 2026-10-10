"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { Order } from "@/lib/filters";
import { formatMoney } from "@/lib/format";

// A client "island": the server already fetched and rendered these rows into
// the HTML (so they're visible instantly and without JS). Once hydrated, this
// component adds things the server can't do well: reacting to every
// keystroke and keeping local selection state, with no network round trip.
export function InteractiveOrders({ rows }: { rows: Order[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const deferredQuery = useDeferredValue(query.toLowerCase());

  const visible = deferredQuery
    ? rows.filter((o) =>
        `${o.id} ${o.customer} ${o.email} ${o.product} ${o.country} ${o.status}`.toLowerCase().includes(deferredQuery),
      )
    : rows;
  const selectedTotal = rows.filter((o) => selected.has(o.id)).reduce((sum, o) => sum + o.total, 0);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-violet-500/40 bg-violet-500/[0.06] p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Instant filter on this page (try typing)…"
          className="min-w-64 flex-1 rounded-md border border-black/15 bg-white px-2.5 py-1.5 text-sm dark:border-white/15 dark:bg-neutral-900"
        />
        <span className="text-sm tabular-nums">
          {visible.length} of {rows.length} rows · <strong>{selected.size}</strong> selected ={" "}
          <strong>{formatMoney(selectedTotal)}</strong>
        </span>
        {selected.size > 0 && (
          <button onClick={() => setSelected(new Set())} className="text-sm text-violet-700 hover:underline dark:text-violet-300">
            Clear selection
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-black/60 dark:bg-white/[0.04] dark:text-white/60">
            <tr>
              <th className="w-10 px-3 py-2" />
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Customer</th>
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Country</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {visible.map((o) => (
              <tr
                key={o.id}
                onClick={() => toggle(o.id)}
                className={`cursor-pointer ${selected.has(o.id) ? "bg-violet-500/10" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"}`}
              >
                <td className="px-3 py-2">
                  <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} onClick={(e) => e.stopPropagation()} />
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  <Link href={`/ssr/orders/${o.id}`} onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:underline dark:text-blue-400">
                    #{o.id}
                  </Link>
                </td>
                <td className="px-3 py-2">{o.customer}</td>
                <td className="px-3 py-2">{o.product}</td>
                <td className="px-3 py-2">{o.country}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatMoney(o.total)}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
