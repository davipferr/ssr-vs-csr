import type { Kpis } from "@/lib/orders";
import { formatMoney, formatMoneyCompact, formatNumber } from "@/lib/format";

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const items = [
    { label: "Orders", value: formatNumber(kpis.orders) },
    { label: "Revenue", value: formatMoneyCompact(kpis.revenue) },
    { label: "Average order", value: formatMoney(kpis.averageOrder) },
    { label: "Customers", value: formatNumber(kpis.customers) },
    { label: "Delivered", value: `${(kpis.deliveredRate * 100).toFixed(1)}%` },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((i) => (
        <div key={i.label} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
          <div className="text-xs text-black/55 dark:text-white/55">{i.label}</div>
          <div className="text-xl font-semibold tabular-nums">{i.value}</div>
        </div>
      ))}
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-[66px] animate-pulse rounded-lg border border-black/10 bg-black/[0.03] dark:border-white/10 dark:bg-white/[0.04]" />
      ))}
    </div>
  );
}
