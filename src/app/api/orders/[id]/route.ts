import { STATUSES, type Status } from "@/lib/filters";
import { getCustomerHistory, getOrder, updateOrderStatus } from "@/lib/orders";

export async function GET(request: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const order = await getOrder(Number(id));
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  if (new URL(request.url).searchParams.has("history")) {
    return Response.json(await getCustomerHistory(order.customer, order.id));
  }
  return Response.json(order);
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const { status } = (await request.json()) as { status?: Status };
  if (!status || !STATUSES.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }
  updateOrderStatus(Number(id), status);
  return Response.json(await getOrder(Number(id)));
}
