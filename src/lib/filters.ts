// Shared between server and client: parsing the URL into a filter object.
// The URL is the single source of truth for both the SSR and CSR versions,
// which is what makes every filtered view shareable and bookmarkable.

export const PAGE_SIZE = 50;

export const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
export type Status = (typeof STATUSES)[number];

export const CATEGORIES = ["Peripherals", "Displays", "Audio", "Accessories", "Furniture", "Storage"] as const;

export const COUNTRIES = [
  "Argentina", "Australia", "Brazil", "Canada", "Chile", "France", "Germany", "Italy",
  "Japan", "Mexico", "Netherlands", "Portugal", "Spain", "United Kingdom", "United States",
] as const;

export const SORT_COLUMNS = ["id", "customer", "country", "product", "total", "status", "created_at"] as const;
export type SortColumn = (typeof SORT_COLUMNS)[number];

export type OrderFilters = {
  q: string;
  status: string;
  country: string;
  category: string;
  sort: SortColumn;
  dir: "asc" | "desc";
  page: number;
};

export type Order = {
  id: number;
  customer: string;
  email: string;
  country: string;
  product: string;
  category: string;
  quantity: number;
  unit_price: number;
  total: number;
  status: Status;
  created_at: string;
};

export type OrdersPage = {
  rows: Order[];
  total: number;
  page: number;
  pageCount: number;
  queryMs: number;
};

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function read(source: ParamSource, key: string): string {
  if (source instanceof URLSearchParams) return source.get(key) ?? "";
  const value = source[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseFilters(source: ParamSource): OrderFilters {
  const sort = read(source, "sort") as SortColumn;
  const page = Number.parseInt(read(source, "page"), 10);
  return {
    q: read(source, "q").trim().slice(0, 100),
    status: (STATUSES as readonly string[]).includes(read(source, "status")) ? read(source, "status") : "",
    country: (COUNTRIES as readonly string[]).includes(read(source, "country")) ? read(source, "country") : "",
    category: (CATEGORIES as readonly string[]).includes(read(source, "category")) ? read(source, "category") : "",
    sort: SORT_COLUMNS.includes(sort) ? sort : "id",
    dir: read(source, "dir") === "asc" ? "asc" : "desc",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Builds a query string from filters, applying `patch` and dropping defaults. */
export function toQueryString(filters: OrderFilters, patch: Partial<OrderFilters> = {}): string {
  const merged = { ...filters, ...patch };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.status) params.set("status", merged.status);
  if (merged.country) params.set("country", merged.country);
  if (merged.category) params.set("category", merged.category);
  if (merged.sort !== "id") params.set("sort", merged.sort);
  if (merged.dir !== "desc") params.set("dir", merged.dir);
  if (merged.page > 1) params.set("page", String(merged.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
