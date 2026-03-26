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
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-display font-bold text-foreground mb-2">Nenhum pedido</h2>
          <p className="text-muted-foreground text-sm mb-6">Você ainda não fez nenhum pedido</p>
          <Link to="/app/produtos">
            <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold rounded-xl">
              Ver Produtos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-3xl mx-auto flex flex-col gap-3">
      {orders.map((order: any) => {
        const sc = statusConfig[order.status] || statusConfig.pendente;
        const StatusIcon = sc.icon;
        const date = new Date(order.created_at);
        const formattedDate = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        const formattedTime = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

        return (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="bg-gold/10 p-1.5 rounded-lg">
                    <Package className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground leading-none">Retirada</p>
                    <p className="font-mono font-bold text-foreground tracking-wider text-sm">{order.pickup_code || "N/A"}</p>
                  </div>
                </div>
                <Badge className={`${sc.color} border font-semibold gap-1 text-[10px] px-1.5 py-0.5`}>
                  <StatusIcon className="h-3 w-3" />
                  {sc.label}
                </Badge>
              </div>

              {/* Items */}
              <div className="p-3 space-y-1">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.quantity}x {item.product_name}</span>
                    <span className="text-muted-foreground">
                      R$ {(Number(item.unit_price) * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/10">
                <span className="text-[10px] text-muted-foreground">
                  {formattedDate} {formattedTime}
                  {order.charities?.name && <span className="ml-1.5">· ❤️ {order.charities.name}</span>}
                </span>
                <p className="font-display font-bold text-foreground text-sm">
                  R$ {Number(order.total).toFixed(2).replace(".", ",")}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AppPedidos;
