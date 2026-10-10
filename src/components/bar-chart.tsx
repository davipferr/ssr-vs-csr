import { formatMoneyCompact, formatNumber } from "@/lib/format";
import type { Datum } from "@/lib/orders";

// Charts made of plain HTML + CSS widths. Rendered on the server they cost
// zero JavaScript, unlike a typical client-side charting library.

export function BarChart({ data, kind }: { data: Datum[]; kind: "money" | "count" }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const fmt = kind === "money" ? formatMoneyCompact : formatNumber;
  return (
    <ul className="space-y-1.5">
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[8rem_1fr_4.5rem] items-center gap-2 text-sm">
          <span className="truncate capitalize text-black/70 dark:text-white/70" title={d.label}>
            {d.label}
          </span>
          <span className="h-4 rounded-sm bg-black/5 dark:bg-white/5">
            <span
              className="block h-full rounded-sm bg-blue-500/80"
              style={{ width: `${Math.max((d.value / max) * 100, 1)}%` }}
            />
          </span>
          <span className="text-right tabular-nums">{fmt(d.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export function ColumnChart({ data }: { data: Datum[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div className="flex h-40 items-end gap-1.5">
        {data.map((d) => (
          <div key={d.label} className="group relative flex h-full flex-1 flex-col justify-end">
            <span className="pointer-events-none absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-xs tabular-nums group-hover:block">
              {formatMoneyCompact(d.value)}
            </span>
            <div className="rounded-t-sm bg-blue-500/80" style={{ height: `${(d.value / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1.5">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-black/50 dark:text-white/50">
            {d.label.slice(2)}
          </span>
        ))}
      </div>
    </div>
  );
}
