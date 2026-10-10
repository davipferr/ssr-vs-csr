import type { Metadata } from "next";
import { AppLoading } from "@/components/client/app-loading";
import { ClientOnly } from "@/components/client/client-only";
import { CsrDashboard } from "@/components/client/csr-dashboard";

export const metadata: Metadata = { title: "Dashboard (CSR)" };

export default function CsrDashboardPage() {
  return (
    <ClientOnly fallback={<AppLoading />}>
      <CsrDashboard />
    </ClientOnly>
  );
}
