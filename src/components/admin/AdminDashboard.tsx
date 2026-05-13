
import { useState, useMemo } from "react";
import { ShoppingBag, Package, TrendingUp, DollarSign, Calendar, Info, BarChart3, PieChart as PieIcon, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#94a3b8", "#cbd5e1", "#e2e8f0", "#f1f5f9", "#f8fafc"];

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  pronto: "Pronto",
  retirado: "Retirado",
  cancelado: "Cancelado",
};

const AdminDashboard = () => {
  const [period, setPeriod] = useState("30d");

  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };
  const days = daysMap[period] || 30;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders", period],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase
        .from("orders")
        .select("*, charities(name)")
        .gte("created_at", since)
        .order("created_at");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: topProducts = [] } = useQuery({
    queryKey: ["admin-top-products", period],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase
        .from("order_items")
        .select("product_name, quantity, orders!inner(created_at)")
        .gte("orders.created_at", since);
      
      if (error) throw error;

      const stats: Record<string, number> = {};
      data.forEach((item: any) => {
        stats[item.product_name] = (stats[item.product_name] || 0) + item.quantity;
      });

      return Object.entries(stats)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    },
  });

  const activeOrders = orders.filter((o) => o.status !== "cancelado");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = activeOrders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pickupsPending = orders.filter((o) => o.status === "pronto").length;

  const stats = [
    { label: "Faturamento", value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign },
    { label: "Pedidos", value: String(totalOrders), icon: ShoppingBag },
    { label: "Ticket Médio", value: `R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp },
    { label: "Retiradas", value: `${pickupsPending}`, icon: Package },
  ];

  const sortedChartData = useMemo(() => {
    const data: Record<string, number> = {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86400000);
      const iso = date.toISOString().slice(0, 10);
      data[iso] = 0;
    }
    orders.forEach((o) => {
      const iso = new Date(o.created_at).toISOString().slice(0, 10);
      if (data[iso] !== undefined) {
        data[iso] += Number(o.total);
      }
    });
    return Object.entries(data)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, total]) => ({
        date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        total,
        fullDate: new Date(date).toLocaleDateString("pt-BR")
      }));
  }, [orders, days]);

  const charityData = useMemo(() => {
    const stats: Record<string, number> = {};
    activeOrders.forEach((o: any) => {
      const name = o.charities?.name || "Outros";
      stats[name] = (stats[name] || 0) + Number(o.total);
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activeOrders]);

  const recentOrders = [...orders].reverse().slice(0, 6);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 animate-pulse uppercase tracking-widest text-xs font-bold">Carregando Análises...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden px-1 md:px-0 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-navy-dark tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Análise de desempenho operacional</p>
        </div>
        <div className="w-full sm:w-auto">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-100 rounded-xl shadow-sm h-11 font-bold text-navy-dark text-xs transition-all hover:border-gray-200">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-1">
              <SelectItem value="7d" className="rounded-xl text-xs font-semibold py-2.5 focus:bg-gray-50 focus:text-navy-dark">Últimos 7 dias</SelectItem>
              <SelectItem value="30d" className="rounded-xl text-xs font-semibold py-2.5 focus:bg-gray-50 focus:text-navy-dark">Últimos 30 dias</SelectItem>
              <SelectItem value="90d" className="rounded-xl text-xs font-semibold py-2.5 focus:bg-gray-50 focus:text-navy-dark">Últimos 90 dias</SelectItem>
              <SelectItem value="365d" className="rounded-xl text-xs font-semibold py-2.5 focus:bg-gray-50 focus:text-navy-dark">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gray-50">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                {orders.length === 0 && <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter bg-gray-50 px-1.5 py-0.5 rounded">Demonstração</span>}
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-navy-dark mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-2 border-b border-gray-50 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">Evolução do Faturamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-200" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sortedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={30} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${v}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                  />
                  <Area type="monotone" dataKey="total" stroke="#94a3b8" fill="url(#chartGrad)" strokeWidth={2} activeDot={{ r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-2 border-b border-gray-50 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">Instituições Beneficiadas</CardTitle>
            <PieIcon className="h-4 w-4 text-gray-200" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charityData.length > 0 ? charityData : [{ name: 'Sem dados', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {charityData.length === 0 && <Cell fill="#f1f5f9" />}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: '12px' }}
                    formatter={(value: number) => charityData.length > 0 ? [`R$ ${value.toFixed(2)}`, 'Total'] : ['-', 'Sem dados']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {charityData.slice(0, 3).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-navy-dark uppercase truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">
                    {((item.value / (totalRevenue || 1)) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-2 border-b border-gray-50 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">Produtos Mais Vendidos</CardTitle>
            <Trophy className="h-4 w-4 text-gray-200" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: -20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f5f5f5" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 'bold' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: '12px' }}
                    formatter={(value: number) => [`${value} unidades`, 'Vendas']}
                  />
                  <Bar dataKey="total" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-2 border-b border-gray-50">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-widest">Últimos Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-gray-200" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sem atividades recentes</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy-dark truncate uppercase">{order.customer_name}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-navy-dark">R$ {Number(order.total).toFixed(2)}</p>
                      <p className={`text-[9px] font-bold uppercase mt-0.5 text-gray-400`}>
                        {statusLabels[order.status] || order.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
