import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COLORS = ["#1e293b", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  pronto: "Pronto",
  retirado: "Retirado",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartão",
  retirada: "Na Retirada",
};

const AdminDashboard = () => {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders-enhanced", dateFrom, dateTo],
    queryFn: async () => {
      const start = startOfDay(new Date(dateFrom)).toISOString();
      const end = endOfDay(new Date(dateTo)).toISOString();
      
      const { data, error } = await supabase
        .from("orders")
        .select("*, charities(name)")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: topProducts = [] } = useQuery({
    queryKey: ["admin-top-products-enhanced", dateFrom, dateTo],
    queryFn: async () => {
      const start = startOfDay(new Date(dateFrom)).toISOString();
      const end = endOfDay(new Date(dateTo)).toISOString();
      
      const { data, error } = await supabase
        .from("order_items")
        .select("product_name, quantity, orders!inner(created_at, status)")
        .gte("orders.created_at", start)
        .lte("orders.created_at", end)
        .neq("orders.status", "cancelado");
      
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
  const canceledOrders = orders.filter((o) => o.status === "cancelado").length;
  const shippedOrders = orders.filter((o) => o.status === "enviado").length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const summaryStats = [
    { label: "Faturamento", value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: "text-navy-dark" },
    { label: "Pedidos Ativos", value: String(totalOrders), color: "text-navy-dark" },
    { label: "Cancelados", value: String(canceledOrders), color: "text-red-500" },
    { label: "Enviados", value: String(shippedOrders), color: "text-blue-500" },
  ];

  const timeSeriesData = useMemo(() => {
    const data: Record<string, number> = {};
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    
    let curr = new Date(start);
    while (curr <= end) {
      data[format(curr, "yyyy-MM-dd")] = 0;
      curr.setDate(curr.getDate() + 1);
    }

    activeOrders.forEach((o) => {
      const iso = o.created_at.slice(0, 10);
      if (data[iso] !== undefined) {
        data[iso] += Number(o.total);
      }
    });

    return Object.entries(data)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, total]) => ({
        date: format(new Date(date + "T12:00:00"), "dd/MM", { locale: ptBR }),
        total,
        fullDate: format(new Date(date + "T12:00:00"), "dd/MM/yyyy")
      }));
  }, [activeOrders, dateFrom, dateTo]);

  const paymentData = useMemo(() => {
    const stats: Record<string, number> = {};
    activeOrders.forEach((o) => {
      const method = o.payment_method || "retirada";
      stats[method] = (stats[method] || 0) + Number(o.total);
    });
    return Object.entries(stats).map(([name, value]) => ({ 
      name: paymentLabels[name] || name, 
      value 
    })).sort((a, b) => b.value - a.value);
  }, [activeOrders]);

  const recentOrders = [...orders].reverse().slice(0, 6);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 animate-pulse text-xs font-medium italic">Carregando dados operacionais...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden px-1 md:px-0 pb-12 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-navy-dark tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Análise completa do fluxo de pedidos e pagamentos</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">De</Label>
            <Input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 bg-gray-50 border-gray-100 rounded-xl text-xs font-semibold focus:ring-navy"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Até</Label>
            <Input 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 bg-gray-50 border-gray-100 rounded-xl text-xs font-semibold focus:ring-navy"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <Card key={stat.label} className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-xs font-medium text-gray-400">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-2 border-b border-gray-50">
            <CardTitle className="text-sm font-semibold text-gray-400">Evolução do Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#1e293b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={30} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${v}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#1e293b" fill="url(#chartGrad)" strokeWidth={2.5} activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-2 border-b border-gray-50">
            <CardTitle className="text-sm font-semibold text-gray-400">Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData.length > 0 ? paymentData : [{ name: 'Sem dados', value: 1 }]}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {paymentData.length === 0 && <Cell fill="#f1f5f9" />}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: '12px' }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2.5">
              {paymentData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs font-semibold text-navy-dark">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">
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
          <CardHeader className="pb-2 border-b border-gray-50">
            <CardTitle className="text-sm font-semibold text-gray-400">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: -20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f5f5f5" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#1e293b', fontWeight: '600' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: '12px' }}
                    formatter={(value: number) => [`${value} unidades`, 'Vendas']}
                  />
                  <Bar dataKey="total" fill="#1e293b" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="pb-2 border-b border-gray-50">
            <CardTitle className="text-sm font-semibold text-gray-400">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-xs font-medium text-gray-400 italic">Sem atividades no período selecionado</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-dark truncate">{order.customer_name}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {format(new Date(order.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-navy-dark">R$ {Number(order.total).toFixed(2)}</p>
                      <div className="flex items-center gap-2 justify-end mt-0.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{paymentLabels[order.payment_method] || "Retirada"}</span>
                        <span className={`text-[9px] font-bold uppercase ${
                          order.status === 'cancelado' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
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
