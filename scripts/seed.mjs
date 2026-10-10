// Generates data/orders.db with 100,000 fake orders.
// Run with: npm run seed (dev/build run it automatically if the file is missing)
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import path from "node:path";

const TOTAL = 100_000;
const dir = path.join(process.cwd(), "data");
const file = path.join(dir, "orders.db");

if (process.argv.includes("--if-missing") && existsSync(file)) process.exit(0);

mkdirSync(dir, { recursive: true });
for (const f of [file, `${file}-wal`, `${file}-shm`]) {
  if (existsSync(f)) rmSync(f);
}

// Seeded PRNG so every run produces the same data set.
let seed = 42;
function random() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (arr) => arr[Math.floor(random() * arr.length)];

const firstNames = [
  "Ana", "Bruno", "Carla", "Diego", "Elena", "Felipe", "Gabriela", "Hugo", "Isabela", "João",
  "Karin", "Lucas", "Mariana", "Nicolas", "Olivia", "Pedro", "Quinn", "Rafael", "Sofia", "Tiago",
  "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zoe", "Liam", "Emma", "Noah", "Ava",
  "Mateo", "Mia", "Leo", "Chloe", "Arthur", "Alice", "Theo", "Laura", "Samuel", "Julia",
];
const lastNames = [
  "Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Almeida", "Ferreira", "Rodrigues", "Gomes",
  "Smith", "Johnson", "Brown", "Garcia", "Miller", "Davis", "Martinez", "Lopez", "Wilson", "Anderson",
  "Müller", "Schmidt", "Rossi", "Bianchi", "Dubois", "Martin", "Tanaka", "Sato", "Kim", "Nguyen",
];
const countries = [
  ["Brazil", 22], ["United States", 20], ["Germany", 9], ["United Kingdom", 8], ["Portugal", 6],
  ["France", 6], ["Canada", 5], ["Mexico", 5], ["Argentina", 4], ["Spain", 4],
  ["Italy", 3], ["Japan", 3], ["Netherlands", 2], ["Chile", 2], ["Australia", 1],
];
const products = [
  ["Mechanical Keyboard", "Peripherals", 129],
  ["Wireless Mouse", "Peripherals", 49],
  ["USB-C Hub", "Peripherals", 39],
  ['27" 4K Monitor', "Displays", 399],
  ['34" Ultrawide Monitor', "Displays", 649],
  ["Portable Monitor", "Displays", 219],
  ["Noise-Cancelling Headphones", "Audio", 299],
  ["Studio Microphone", "Audio", 159],
  ["Bluetooth Speaker", "Audio", 89],
  ["Laptop Stand", "Accessories", 59],
  ["Desk Mat", "Accessories", 25],
  ["Webcam 1080p", "Accessories", 79],
  ["Ergonomic Chair", "Furniture", 549],
  ["Standing Desk", "Furniture", 699],
  ["Monitor Arm", "Furniture", 119],
  ["External SSD 1TB", "Storage", 109],
  ["NAS 4-Bay", "Storage", 499],
  ["SD Card 256GB", "Storage", 35],
];
const statuses = [
  ["delivered", 55], ["shipped", 15], ["processing", 12], ["pending", 10], ["cancelled", 5], ["refunded", 3],
];

function weighted(list) {
  const total = list.reduce((s, [, w]) => s + w, 0);
  let r = random() * total;
  for (const [value, w] of list) {
    if ((r -= w) < 0) return value;
  }
  return list[list.length - 1][0];
}

const db = new DatabaseSync(file);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE orders (
    id          INTEGER PRIMARY KEY,
    customer    TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    country     TEXT    NOT NULL,
    product     TEXT    NOT NULL,
    category    TEXT    NOT NULL,
    quantity    INTEGER NOT NULL,
    unit_price  INTEGER NOT NULL, -- cents
    total       INTEGER NOT NULL, -- cents
    status      TEXT    NOT NULL,
    created_at  TEXT    NOT NULL  -- ISO 8601
  );
`);

const insert = db.prepare(`
  INSERT INTO orders (id, customer, email, country, product, category, quantity, unit_price, total, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const now = Date.now();
const twoYears = 1000 * 60 * 60 * 24 * 730;
const started = performance.now();

db.exec("BEGIN");
for (let id = 1; id <= TOTAL; id++) {
  const first = pick(firstNames);
  const last = pick(lastNames);
  const [product, category, basePrice] = pick(products);
  const quantity = random() < 0.8 ? 1 : 1 + Math.floor(random() * 4);
  // Small price variation so totals aren't all identical.
  const unitPrice = Math.round(basePrice * (0.9 + random() * 0.2) * 100);
  const createdAt = new Date(now - Math.floor(random() ** 1.4 * twoYears));
  const emailUser = `${first}.${last}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  insert.run(
    id,
    `${first} ${last}`,
    `${emailUser}${Math.floor(random() * 100)}@example.com`,
    weighted(countries),
    product,
    category,
    quantity,
    unitPrice,
    unitPrice * quantity,
    weighted(statuses),
    createdAt.toISOString(),
  );
}
db.exec("COMMIT");

db.exec(`
  CREATE INDEX idx_orders_status     ON orders(status);
  CREATE INDEX idx_orders_country    ON orders(country);
  CREATE INDEX idx_orders_category   ON orders(category);
  CREATE INDEX idx_orders_created_at ON orders(created_at);
  CREATE INDEX idx_orders_total      ON orders(total);
  ANALYZE;
`);
db.close();

console.log(
  `Seeded ${TOTAL.toLocaleString("en-US")} orders into ${path.relative(process.cwd(), file)} in ${Math.round(performance.now() - started)}ms`,
);
