import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { getDb } from "./db";
import { PAGE_SIZE, STATUSES, type Order, type OrderFilters, type OrdersPage, type Status } from "./filters";

// Every read below runs ONLY on the server. Both the SSR pages (directly) and
// the CSR pages (through /api/*) call these same functions, so the comparison
// is fair: identical SQL, identical simulated latency. The only difference is
// WHERE the result gets turned into HTML.

/** Simulated network latency to a real database server (local SQLite is too fast to be realistic). */
const DB_LATENCY_MS = 80;

/** Extra delays for the dashboard widgets, so streaming is easy to see. */
export const WIDGET_DELAYS = {
  kpis: 300,
  status: 700,
  products: 1200,
  monthly: 1800,
  countries: 2600,
} as const;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// node:sqlite returns null-prototype objects; React can only serialize plain ones.
const plain = <T,>(row: unknown) => ({ ...(row as object) }) as T;

async function beginQuery(extraDelay = 0) {
  // The SQLite driver is synchronous, so Next.js can't tell on its own that
  // this is request-time data. connection() says "don't prerender past this
  // point; wait for a real request".
  await connection();
  await sleep(DB_LATENCY_MS + extraDelay);
}

function buildWhere(filters: OrderFilters) {
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (filters.q) {
    const asId = Number(filters.q.replace(/^#/, ""));
    if (Number.isInteger(asId) && asId > 0) {
      clauses.push("id = ?");
      params.push(asId);
    } else {
      clauses.push("(customer LIKE ? OR email LIKE ? OR product LIKE ?)");
      const like = `%${filters.q}%`;
      params.push(like, like, like);
    }
  }
  if (filters.status) {
    clauses.push("status = ?");
    params.push(filters.status);
  }
  if (filters.country) {
    clauses.push("country = ?");
    params.push(filters.country);
  }
  if (filters.category) {
    clauses.push("category = ?");
    params.push(filters.category);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export async function getOrders(filters: OrderFilters): Promise<OrdersPage> {
  await beginQuery();
  const started = performance.now();
  const db = getDb();
  const { where, params } = buildWhere(filters);

  const { count } = db.prepare(`SELECT COUNT(*) AS count FROM orders ${where}`).get(...params) as { count: number };
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);

  // `sort` and `dir` are whitelisted in parseFilters, so interpolating is safe.
  const rows = db
    .prepare(
      `SELECT * FROM orders ${where}
       ORDER BY ${filters.sort} ${filters.dir}, id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, PAGE_SIZE, (page - 1) * PAGE_SIZE)
    .map((r) => plain<Order>(r));

  return { rows, total: count, page, pageCount, queryMs: Math.round(performance.now() - started) };
}

// cache() dedupes calls within ONE request: generateMetadata and the page both
// ask for the order, but the database is only hit once.
export const getOrder = cache(async (id: number): Promise<Order | null> => {
  await beginQuery();
  const row = getDb().prepare("SELECT * FROM orders WHERE id = ?").get(id);
  return row ? plain<Order>(row) : null;
});

export async function getCustomerHistory(customer: string, excludeId: number): Promise<Order[]> {
  await beginQuery(900);
  return getDb()
    .prepare("SELECT * FROM orders WHERE customer = ? AND id != ? ORDER BY created_at DESC LIMIT 8")
    .all(customer, excludeId)
    .map((r) => plain<Order>(r));
}

export function updateOrderStatus(id: number, status: Status) {
  if (!STATUSES.includes(status)) throw new Error(`Invalid status: ${status}`);
  getDb().prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
}

// ---------- Dashboard statistics ----------

export type Kpis = {
  orders: number;
  revenue: number;
  averageOrder: number;
  customers: number;
  deliveredRate: number;
};

export type Datum = { label: string; value: number };

const REVENUE_STATUSES = "status NOT IN ('cancelled', 'refunded')";

export async function getKpis(): Promise<Kpis> {
  await beginQuery(WIDGET_DELAYS.kpis);
  const row = getDb()
    .prepare(
      `SELECT
         COUNT(*) AS orders,
         SUM(CASE WHEN ${REVENUE_STATUSES} THEN total ELSE 0 END) AS revenue,
         COUNT(DISTINCT email) AS customers,
         AVG(CASE WHEN status = 'delivered' THEN 1.0 ELSE 0 END) AS deliveredRate
       FROM orders`,
    )
    .get() as Omit<Kpis, "averageOrder">;
  return { ...row, averageOrder: Math.round(row.revenue / row.orders) };
}

export async function getStatusBreakdown(): Promise<Datum[]> {
  await beginQuery(WIDGET_DELAYS.status);
  return getDb()
    .prepare("SELECT status AS label, COUNT(*) AS value FROM orders GROUP BY status ORDER BY value DESC")
    .all()
    .map((r) => plain<Datum>(r));
}

export async function getMonthlyRevenue(): Promise<Datum[]> {
  await beginQuery(WIDGET_DELAYS.monthly);
  return getDb()
    .prepare(
      `SELECT substr(created_at, 1, 7) AS label, SUM(total) AS value
       FROM orders WHERE ${REVENUE_STATUSES}
       GROUP BY label ORDER BY label DESC LIMIT 12`,
    )
    .all()
    .map((r) => plain<Datum>(r))
    .reverse();
}

export async function getTopCountries(): Promise<Datum[]> {
  await beginQuery(WIDGET_DELAYS.countries);
  return getDb()
    .prepare(
      `SELECT country AS label, SUM(total) AS value
       FROM orders WHERE ${REVENUE_STATUSES}
       GROUP BY country ORDER BY value DESC LIMIT 10`,
    )
    .all()
    .map((r) => plain<Datum>(r));
}

export async function getTopProducts(): Promise<Datum[]> {
  await beginQuery(WIDGET_DELAYS.products);
  return getDb()
    .prepare(
      `SELECT product AS label, SUM(quantity) AS value
       FROM orders WHERE ${REVENUE_STATUSES}
       GROUP BY product ORDER BY value DESC LIMIT 8`,
    )
    .all()
    .map((r) => plain<Datum>(r));
}
