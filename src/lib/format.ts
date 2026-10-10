// Deterministic formatters: they produce the same output on the server and
// in the browser regardless of timezone/locale, which avoids hydration mismatches.

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const number = new Intl.NumberFormat("en-US");

export const formatMoney = (cents: number) => currency.format(cents / 100);
export const formatMoneyCompact = (cents: number) => compactCurrency.format(cents / 100);
export const formatNumber = (n: number) => number.format(n);

/** "2026-03-14T10:22:00.000Z" -> "2026-03-14" (UTC, no locale involved) */
export const formatDate = (iso: string) => iso.slice(0, 10);

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
