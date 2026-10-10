import Form from "next/form";
import Link from "next/link";
import { CATEGORIES, COUNTRIES, STATUSES, type OrderFilters } from "@/lib/filters";

// A plain GET form. With JavaScript, next/form turns submits into client-side
// navigations. WITHOUT JavaScript it still works: the browser submits the form,
// the URL changes, and the server renders the filtered page.

const field =
  "rounded-md border border-black/15 bg-white px-2.5 py-1.5 text-sm dark:border-white/15 dark:bg-neutral-900";

export function FiltersForm({ filters, basePath }: { filters: OrderFilters; basePath: string }) {
  return (
    // `key` resets the uncontrolled inputs when the URL changes (e.g. back button).
    <Form
      key={JSON.stringify(filters)}
      action={basePath}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-black/10 p-3 dark:border-white/10"
    >
      <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-black/60 dark:text-white/60">
        Search
        <input name="q" defaultValue={filters.q} placeholder="Customer, email, product or #id" className={field} />
      </label>
      <Select name="status" label="Status" value={filters.status} options={STATUSES} />
      <Select name="country" label="Country" value={filters.country} options={COUNTRIES} />
      <Select name="category" label="Category" value={filters.category} options={CATEGORIES} />
      {filters.sort !== "id" && <input type="hidden" name="sort" value={filters.sort} />}
      {filters.dir !== "desc" && <input type="hidden" name="dir" value={filters.dir} />}
      <button
        type="submit"
        className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
      >
        Apply
      </button>
      <Link href={basePath} className="px-2 py-1.5 text-sm text-black/60 hover:underline dark:text-white/60">
        Reset
      </Link>
    </Form>
  );
}

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: readonly string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-black/60 dark:text-white/60">
      {label}
      <select name={name} defaultValue={value} className={`${field} capitalize`}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
