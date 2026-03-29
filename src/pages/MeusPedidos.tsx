import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LogoutConfirm from "@/components/LogoutConfirm";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowLeft, LogOut, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  pronto: { label: "Pronto p/ Retirada", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Truck },
  retirado: { label: "Retirado", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
};

const MeusPedidos = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { state: { redirect: "/meus-pedidos" } });
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data } = await supabase
        .from("orders")
        .select("*, charities(name), order_items(id, product_name, quantity, unit_price)")
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.email,
  });

  const handleLogout = async () => {
    try {
      const { markManualSignOut } = await import("@/lib/authHelpers");
      markManualSignOut();
    } catch (e) {
      // ignore
    }
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Meus Pedidos</h1>
          </div>
          <LogoutConfirm onConfirm={handleLogout}>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1" /> Sair
            </Button>
          </LogoutConfirm>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-xl font-display font-bold text-foreground mb-3">Nenhum pedido encontrado</h2>
            <p className="text-muted-foreground mb-8">Você ainda não fez nenhum pedido</p>
            <Link to="/produtos">
              <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold rounded-xl">
                Ver Produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const sc = statusConfig[order.status] || statusConfig.pendente;
              const StatusIcon = sc.icon;
              const date = new Date(order.created_at);
              const formattedDate = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
              const formattedTime = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="bg-gold/10 p-2 rounded-lg">
                          <Package className="h-4 w-4 text-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Código de Retirada</p>
                          <p className="font-mono font-bold text-foreground tracking-wider">{order.pickup_code || "N/A"}</p>
                        </div>
                      </div>
                      <Badge className={`${sc.color} border font-semibold gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {sc.label}
                      </Badge>
                    </div>

                    {/* Items */}
                    <div className="p-4 space-y-2">
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
                    <div className="flex items-center justify-between p-4 border-t border-border bg-muted/10">
                      <div className="text-xs text-muted-foreground">
                        {formattedDate} às {formattedTime}
                        {order.charities?.name && (
                          <span className="ml-2">· ❤️ {order.charities.name}</span>
                        )}
                      </div>
                      <p className="font-display font-bold text-foreground">
                        R$ {Number(order.total).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MeusPedidos;
