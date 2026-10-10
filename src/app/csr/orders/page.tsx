import type { Metadata } from "next";
import { Suspense } from "react";
import { AppLoading } from "@/components/client/app-loading";
import { ClientOnly } from "@/components/client/client-only";
import { CsrOrders } from "@/components/client/csr-orders";

export const metadata: Metadata = { title: "Orders (CSR)" };

// No data on the server: this page is prerendered ONCE at build time as an
// empty shell, and <ClientOnly> makes sure nothing below it is rendered until
// the JavaScript runs in the browser, exactly like a classic React SPA.
export default function CsrOrdersPage() {
  return (
    <Suspense fallback={<AppLoading />}>
      <ClientOnly fallback={<AppLoading />}>
        <CsrOrders />
      </ClientOnly>
    </Suspense>
  );
}
