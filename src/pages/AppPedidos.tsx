import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  pronto: { label: "Pronto", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Truck },
  retirado: { label: "Retirado", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
};

const AppPedidos = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("orders")
        .select("*, charities(name), order_items(id, product_name, quantity, unit_price)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!userId,
  });

  if (orders.length === 0) {
    return (
      <div className="flex-1 min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <Package className="h-8 w-8 text-gray-300" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-navy-dark uppercase tracking-widest">Nenhum pedido</h2>
            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">Você ainda não realizou nenhum pedido</p>
          </div>
          <Button asChild className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-10 px-8 shadow-sm transition-all active:scale-[0.98]">
            <Link to="/app/produtos" className="uppercase tracking-widest text-[10px]">Ver Produtos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-5 pb-24 md:pb-5 min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto space-y-3">
        {orders.map((order: any) => {
          const sc = statusConfig[order.status] || statusConfig.pendente;
          const StatusIcon = sc.icon;
          const date = new Date(order.created_at);
          const formattedDate = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
          const formattedTime = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

          return (
            <Card key={order.id} className="overflow-hidden border-gray-100 shadow-sm rounded-xl bg-white">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-3 bg-white border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <Package className="h-4 w-4 text-navy-dark" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Código de Retirada</p>
                      <p className="font-mono font-bold text-navy-dark tracking-widest text-sm">{order.pickup_code || "---"}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 ${sc.color.split(' ')[1]} font-bold uppercase tracking-widest text-[9px]`}>
                    <StatusIcon className="h-3 w-3" />
                    {sc.label}
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 space-y-2 bg-white">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-baseline">
                      <span className="text-[11px] text-navy-dark font-medium">{item.quantity}x {item.product_name}</span>
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
                        R$ {(Number(item.unit_price) * item.quantity).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50/30 border-t border-gray-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      {formattedDate} • {formattedTime}
                    </span>
                    {order.charities?.name && (
                      <span className="text-[9px] text-navy-dark/60 font-bold uppercase tracking-widest">
                        Apoio: {order.charities.name}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Total</p>
                    <p className="font-bold text-navy-dark text-base">
                      R$ {Number(order.total).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AppPedidos;
