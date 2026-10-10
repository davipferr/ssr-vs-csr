import { AppLoading } from "@/components/client/app-loading";
import { ClientOnly } from "@/components/client/client-only";
import { CsrOrderDetail } from "@/components/client/csr-order-detail";

// No generateMetadata here on purpose: in a pure SPA the server knows nothing
// about the order, so the HTML only has the generic site title.
export default function CsrOrderPage() {
  return (
    <ClientOnly fallback={<AppLoading />}>
      <CsrOrderDetail />
    </ClientOnly>
  );
}
