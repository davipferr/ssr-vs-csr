"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", dot: "" },
  { href: "/ssr/orders", label: "SSR orders", dot: "bg-emerald-500" },
  { href: "/csr/orders", label: "CSR orders", dot: "bg-amber-500" },
  { href: "/hybrid/orders", label: "Hybrid orders", dot: "bg-violet-500" },
  { href: "/ssr/dashboard", label: "SSR dashboard", dot: "bg-emerald-500" },
  { href: "/csr/dashboard", label: "CSR dashboard", dot: "bg-amber-500" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {links.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 ${
              active ? "bg-black/10 font-medium dark:bg-white/15" : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {l.dot && <span className={`h-2 w-2 rounded-full ${l.dot}`} />}
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
