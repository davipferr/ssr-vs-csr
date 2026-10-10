import Link from "next/link";
import { PAGE_SIZE, toQueryString, type OrderFilters } from "@/lib/filters";
import { formatNumber } from "@/lib/format";

export function Pagination({
  filters,
  page,
  pageCount,
  total,
  basePath,
}: {
  filters: OrderFilters;
  page: number;
  pageCount: number;
  total: number;
  basePath: string;
}) {
  const href = (p: number) => `${basePath}${toQueryString(filters, { page: p })}`;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const btn =
    "rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10";
  const disabled = "pointer-events-none opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-black/60 dark:text-white/60">
        Showing <strong>{formatNumber(from)}</strong>–<strong>{formatNumber(to)}</strong> of{" "}
        <strong>{formatNumber(total)}</strong> orders · page {formatNumber(page)} of {formatNumber(pageCount)}
      </p>
      <div className="flex gap-2">
        <Link href={href(1)} className={`${btn} ${page <= 1 ? disabled : ""}`} aria-disabled={page <= 1}>
          « First
        </Link>
        <Link href={href(page - 1)} className={`${btn} ${page <= 1 ? disabled : ""}`} aria-disabled={page <= 1}>
          ‹ Prev
        </Link>
        <Link href={href(page + 1)} className={`${btn} ${page >= pageCount ? disabled : ""}`} aria-disabled={page >= pageCount}>
          Next ›
        </Link>
        <Link href={href(pageCount)} className={`${btn} ${page >= pageCount ? disabled : ""}`} aria-disabled={page >= pageCount}>
          Last »
        </Link>
      </div>
    </div>
  );
}
