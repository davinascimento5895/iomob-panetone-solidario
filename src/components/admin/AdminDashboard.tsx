import { useState } from "react";
import { ShoppingBag, Package, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CHART_COLORS = ["hsl(38, 80%, 55%)", "hsl(220, 60%, 25%)", "hsl(220, 40%, 40%)", "hsl(35, 85%, 40%)", "hsl(40, 70%, 65%)"];

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  pronto: "Pronto p/ Retirada",
  retirado: "Retirado",
  cancelado: "Cancelado",
};

const revenueChartConfig = {
  total: { label: "Faturamento", color: "hsl(38, 80%, 55%)" },
  cumulative: { label: "Faturamento (acumulado)", color: "hsl(38, 80%, 55%)" },
};
const ordersChartConfig = { count: { label: "Pedidos", color: "hsl(220, 60%, 25%)" } };

const AdminDashboard = () => {
  const [period, setPeriod] = useState("30d");
  const [revenueView, setRevenueView] = useState<"daily" | "cumulative">("daily");

  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };
  const days = daysMap[period] || 30;

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*");
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders", period],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data } = await supabase.from("orders").select("*").gte("created_at", since).order("created_at");
      return data || [];
    },
  });

  // Previous period for trend calculation
  const { data: prevOrders = [] } = useQuery({
    queryKey: ["admin-orders-prev", period],
    queryFn: async () => {
      const end = new Date(Date.now() - days * 86400000).toISOString();
      const start = new Date(Date.now() - days * 2 * 86400000).toISOString();
      const { data } = await supabase.from("orders").select("*").gte("created_at", start).lt("created_at", end);
      return data || [];
    },
  });

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const activeOrders = orders.filter((o) => o.status !== "cancelado");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = activeOrders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pickupsPending = orders.filter((o) => o.status === "pronto").length;

  const activePrevOrders = prevOrders.filter((o) => o.status !== "cancelado");
  const prevRevenue = activePrevOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const prevOrderCount = activePrevOrders.length;
  const prevAvgTicket = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

  const calcTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? "+100%" : "";
    const pct = ((curr - prev) / prev) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
  };

  const revenueTrend = calcTrend(totalRevenue, prevRevenue);
  const ordersTrend = calcTrend(totalOrders, prevOrderCount);
  const ticketTrend = calcTrend(avgTicket, prevAvgTicket);

  // Build daily aggregates using ISO date keys to guarantee chronological order,
  // and also compute a cumulative series for the revenue chart when requested.
  const revenueByIso: Record<string, number> = {};
  const ordersByIso: Record<string, number> = {};

  orders.forEach((o) => {
    const iso = new Date(o.created_at).toISOString().slice(0, 10); // YYYY-MM-DD
    revenueByIso[iso] = (revenueByIso[iso] || 0) + Number(o.total);
    ordersByIso[iso] = (ordersByIso[iso] || 0) + 1;
  });

  const allIsoDates = Array.from(new Set([...Object.keys(revenueByIso), ...Object.keys(ordersByIso)]));
  const sortedIsoDates = allIsoDates.sort((a, b) => +new Date(a) - +new Date(b));

  const revenueData = sortedIsoDates.map((iso) => ({
    date: new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    iso,
    total: revenueByIso[iso] || 0,
  }));

  // cumulative
  let _cum = 0;
  const revenueDataWithCumulative = revenueData.map((d) => ({ ...d, cumulative: (_cum += d.total) }));

  const ordersData = sortedIsoDates.map((iso) => ({
    date: new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    count: ordersByIso[iso] || 0,
  }));

  const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: statusLabels[name] || name,
    value,
  }));

  const recentOrders = [...orders].reverse().slice(0, 5);

  const stats = [
    { label: "Faturamento", value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, trend: revenueTrend, up: totalRevenue >= prevRevenue },
    { label: "Pedidos", value: String(totalOrders), icon: ShoppingBag, trend: ordersTrend, up: totalOrders >= prevOrderCount },
    { label: "Ticket Médio", value: `R$ ${avgTicket.toFixed(2)}`, icon: TrendingUp, trend: ticketTrend, up: avgTicket >= prevAvgTicket },
    { label: "Aguard. Retirada", value: `${pickupsPending}`, icon: Package, trend: "", up: true },
  ];

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px] sm:w-[140px] text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="365d">1 ano</SelectItem>
            </SelectContent>
          </Select>

          <Select value={revenueView} onValueChange={setRevenueView}>
            <SelectTrigger className="w-[140px] text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Por dia</SelectItem>
              <SelectItem value="cumulative">Acumulado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-muted">
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-gold" />
                </div>
                {stat.trend && (
                  <span className={`flex items-center text-[10px] sm:text-xs font-medium ${stat.up ? "text-green-600" : "text-red-500"}`}>
                    {stat.up ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{stat.value}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-semibold">Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="px-1 sm:px-6 pb-3">
            <ChartContainer config={revenueChartConfig} className="w-full h-[200px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueDataWithCumulative} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 80%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 80%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 88%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`} width={50} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey={revenueView === "daily" ? "total" : "cumulative"}
                    stroke="hsl(38, 80%, 55%)"
                    fill="url(#goldGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-semibold">Pedidos por Dia</CardTitle>
          </CardHeader>
          <CardContent className="px-1 sm:px-6 pb-3">
            <ChartContainer config={ordersChartConfig} className="w-full h-[200px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 88%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(220, 60%, 25%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-semibold">Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="px-1 sm:px-6 pb-3">
            <div className="w-full h-[200px] sm:h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-semibold">Últimos Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Cliente</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Código</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Total</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Status</th>
                    <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-2 px-2 text-foreground">{order.customer_name}</td>
                      <td className="py-2 px-2 font-mono text-xs text-foreground">{order.pickup_code || "N/A"}</td>
                      <td className="py-2 px-2 text-foreground">R$ {Number(order.total).toFixed(2)}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "retirado" ? "bg-green-100 text-green-700" :
                          order.status === "pendente" ? "bg-yellow-100 text-yellow-700" :
                          order.status === "pronto" ? "bg-blue-100 text-blue-700" :
                          "bg-red-100 text-red-700"
                        }`}>{statusLabels[order.status] || order.status}</span>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-xs">{new Date(order.created_at).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Nenhum pedido no período.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{order.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-medium text-foreground">R$ {Number(order.total).toFixed(2)}</p>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      order.status === "retirado" ? "bg-green-100 text-green-700" :
                      order.status === "pendente" ? "bg-yellow-100 text-yellow-700" :
                      order.status === "pronto" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>{statusLabels[order.status] || order.status}</span>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="py-6 text-center text-muted-foreground text-sm">Nenhum pedido no período.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
