import { getKpis, getMonthlyRevenue, getStatusBreakdown, getTopCountries, getTopProducts } from "@/lib/orders";

const widgets = {
  kpis: getKpis,
  monthly: getMonthlyRevenue,
  status: getStatusBreakdown,
  countries: getTopCountries,
  products: getTopProducts,
};

export async function GET(_request: Request, ctx: RouteContext<"/api/stats/[widget]">) {
  const { widget } = await ctx.params;
  const load = widgets[widget as keyof typeof widgets];
  if (!load) return Response.json({ error: "Unknown widget" }, { status: 404 });
  return Response.json(await load());
}
