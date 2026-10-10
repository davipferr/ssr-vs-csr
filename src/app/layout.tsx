import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { NavLinks } from "@/components/client/nav-links";
import { PageMetrics } from "@/components/client/page-metrics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "SSR vs CSR", template: "%s · SSR vs CSR" },
  description: "The same 100,000-order app built twice to compare Server-Side and Client-Side Rendering in Next.js.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 border-b border-black/10 bg-background/90 backdrop-blur dark:border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
            <Link href="/" className="font-semibold tracking-tight">
              ssr<span className="text-black/40 dark:text-white/40">-vs-</span>csr
            </Link>
            <NavLinks />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 pb-80 sm:pb-24">{children}</main>
        <PageMetrics />
      </body>
    </html>
  );
}
