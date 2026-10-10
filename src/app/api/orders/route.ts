import { parseFilters } from "@/lib/filters";
import { getOrders } from "@/lib/orders";

// Only the CSR pages need this endpoint. The SSR pages call getOrders()
// directly. Same function, same SQL: the only difference is that here the
// result travels as JSON and the BROWSER turns it into HTML.
export async function GET(request: Request) {
  const filters = parseFilters(new URL(request.url).searchParams);
  return Response.json(await getOrders(filters));
}
