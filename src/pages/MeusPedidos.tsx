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
  pendente: { label: "Pendente", color: "bg-stone-50 text-stone-500 border-stone-200", icon: Clock },
  pronto: { label: "Pronto", color: "bg-stone-900 text-white border-transparent", icon: Truck },
  retirado: { label: "Retirado", color: "bg-stone-100 text-stone-400 border-transparent", icon: CheckCircle2 },
  cancelado: { label: "Cancelado", color: "bg-red-50 text-red-700 border-red-100", icon: XCircle },
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
      <main className="min-h-screen flex items-center justify-center pt-20 bg-[#FAFAFA]">
        <div className="animate-spin h-6 w-6 border-2 border-gold border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-[#FAFAFA]">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-stone-100 transition-colors">
                <ArrowLeft className="h-5 w-5 text-stone-600" />
              </Button>
            </Link>
            <h1 className="text-2xl font-display font-semibold text-stone-900">Meus pedidos</h1>
          </div>
          <LogoutConfirm onConfirm={handleLogout}>
            <Button variant="ghost" size="sm" className="text-stone-400 hover:text-stone-600 hover:bg-transparent transition-colors">
              Sair
            </Button>
          </LogoutConfirm>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl shadow-sm border border-stone-100">
            <p className="text-stone-400 mb-8">Nenhum pedido encontrado</p>
            <Link to="/produtos">
              <Button className="bg-gold hover:bg-gold/90 text-white px-8 h-12 rounded-full transition-all shadow-lg shadow-gold/20">
                Ver produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const sc = statusConfig[order.status] || statusConfig.pendente;
              const date = new Date(order.created_at);
              const formattedDate = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });

              return (
                <Card key={order.id} className="overflow-hidden border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">
                            Pedido #{order.id.split("-")[0]}
                          </p>
                          <p className="text-sm text-stone-500">{formattedDate}</p>
                        </div>
                        <Badge className={`${sc.color} px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-tight border-none shadow-none`}>
                          {sc.label}
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-6">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-stone-600">
                              <span className="font-semibold text-stone-900">{item.quantity}x</span> {item.product_name}
                            </span>
                            <span className="text-stone-400">
                              R$ {(Number(item.unit_price) * item.quantity).toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.charities?.name && (
                        <div className="pt-4 border-t border-stone-50 mb-4">
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Entidade</p>
                          <p className="text-sm font-medium text-stone-700">{order.charities.name}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                        <div className="flex flex-col">
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Código</p>
                          <p className="font-mono font-bold text-stone-900 text-lg tracking-wider">
                            {order.pickup_code || "---"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Total</p>
                          <p className="text-xl font-bold text-gold">
                            R$ {Number(order.total_amount || order.total).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>
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
