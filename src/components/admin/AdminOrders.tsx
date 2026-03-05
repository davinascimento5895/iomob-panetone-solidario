import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Search, QrCode, UserCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-yellow-100 text-yellow-700" },
  pronto: { label: "Pronto p/ Retirada", className: "bg-blue-100 text-blue-700" },
  retirado: { label: "Retirado", className: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", className: "bg-red-100 text-red-700" },
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [pickupCode, setPickupCode] = useState("");
  const [foundOrder, setFoundOrder] = useState<any>(null);
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminUserId(session?.user?.id || null);
    });
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders-all"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, charities(name)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["admin-order-items", foundOrder?.id],
    enabled: !!foundOrder,
    queryFn: async () => {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", foundOrder.id);
      return data || [];
    },
  });

  // Fetch admin profiles for tracking
  const adminIds = orders
    .flatMap((o: any) => [o.paid_by, o.delivered_by])
    .filter(Boolean)
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

  const { data: adminProfiles = {} } = useQuery({
    queryKey: ["admin-profiles", adminIds.join(",")],
    enabled: adminIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name").in("id", adminIds);
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => { map[p.id] = p.full_name || p.id.slice(0, 8); });
      return map;
    },
  });

  const getTrackingFields = (newStatus: string) => {
    const now = new Date().toISOString();
    if (newStatus === "pronto") return { paid_by: adminUserId, paid_at: now };
    if (newStatus === "retirado") return { delivered_by: adminUserId, delivered_at: now };
    return {};
  };

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (status === "cancelado") {
        setCancelOrderId(id);
        setCancelDialogOpen(true);
        throw new Error("__cancel_dialog__");
      }
      const tracking = getTrackingFields(status);
      await supabase.from("orders").update({ status, ...tracking }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders-all"] }),
    onError: (err) => {
      if (err.message !== "__cancel_dialog__") {
        toast.error("Erro ao atualizar", { description: err.message });
      }
    },
  });

  const handleCancelConfirm = async () => {
    if (!cancelOrderId || !cancelReason.trim()) {
      toast.error("Informe o motivo do cancelamento");
      return;
    }
    try {
      const { error } = await supabase.rpc("cancel_order", {
        p_order_id: cancelOrderId,
        p_reason: cancelReason.trim(),
      });
      if (error) throw error;
      toast.success("Pedido cancelado", { description: "Estoque devolvido automaticamente." });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-all"] });
    } catch (err: any) {
      toast.error("Erro ao cancelar", { description: err.message });
    } finally {
      setCancelDialogOpen(false);
      setCancelOrderId(null);
      setCancelReason("");
    }
  };

  const handlePickupSearch = async () => {
    const code = pickupCode.trim().toUpperCase();
    if (code.length !== 6) {
      toast.error("Código inválido", { description: "O código de retirada deve ter 6 caracteres." });
      return;
    }
    const { data } = await supabase.from("orders").select("*").eq("pickup_code", code).single();
    if (!data) {
      toast.error("Pedido não encontrado", { description: "Nenhum pedido com esse código." });
      return;
    }
    setFoundOrder(data);
    setPickupDialogOpen(true);
  };

  const confirmPickup = async () => {
    if (!foundOrder) return;
    const now = new Date().toISOString();
    await supabase.from("orders").update({
      status: "retirado",
      delivered_by: adminUserId,
      delivered_at: now,
    }).eq("id", foundOrder.id);
    toast.success("Retirada confirmada!", { description: `Pedido de ${foundOrder.customer_name} marcado como retirado.` });
    setPickupDialogOpen(false);
    setFoundOrder(null);
    setPickupCode("");
    queryClient.invalidateQueries({ queryKey: ["admin-orders-all"] });
  };

  const formatTrackingInfo = (userId: string | null, timestamp: string | null) => {
    if (!userId || !timestamp) return null;
    const name = adminProfiles[userId] || userId.slice(0, 8) + "…";
    const date = new Date(timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    return `${name} em ${date}`;
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-display font-bold text-foreground">Pedidos</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Código (6 letras)"
            value={pickupCode}
            onChange={(e) => setPickupCode(e.target.value.toUpperCase().slice(0, 6))}
            className="flex-1 sm:flex-none sm:w-[200px] font-mono uppercase tracking-widest"
            onKeyDown={(e) => e.key === "Enter" && handlePickupSearch()}
          />
          <Button onClick={handlePickupSearch} className="bg-gold hover:bg-gold-dark text-primary font-semibold flex-shrink-0">
            <Search className="h-4 w-4 mr-1" /> Buscar
          </Button>
        </div>
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Código</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Instituição</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Aprovações</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                const s = statusMap[order.status] || { label: order.status, className: "bg-muted text-muted-foreground" };
                const paidInfo = formatTrackingInfo(order.paid_by, order.paid_at);
                const deliveredInfo = formatTrackingInfo(order.delivered_by, order.delivered_at);
                return (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">{order.customer_name}</td>
                    <td className="py-3 px-4 font-mono text-xs tracking-wider text-foreground">{order.pickup_code || "N/A"}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{order.charities?.name || "N/A"}</td>
                    <td className="py-3 px-4 text-foreground">R$ {Number(order.total).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <Select value={order.status} onValueChange={(v) => updateStatus.mutate({ id: order.id, status: v })}>
                        <SelectTrigger className="h-7 w-[160px] text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>{s.label}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusMap).map(([key, val]) => (
                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-muted-foreground space-y-0.5">
                      {paidInfo && (
                        <div className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          <span>Pgto: {paidInfo}</span>
                        </div>
                      )}
                      {deliveredInfo && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>Entrega: {deliveredInfo}</span>
                        </div>
                      )}
                      {!paidInfo && !deliveredInfo && <span>—</span>}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Nenhum pedido registrado.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {orders.map((order: any) => {
          const s = statusMap[order.status] || { label: order.status, className: "bg-muted text-muted-foreground" };
          const paidInfo = formatTrackingInfo(order.paid_by, order.paid_at);
          const deliveredInfo = formatTrackingInfo(order.delivered_by, order.delivered_at);
          return (
            <Card key={order.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{order.customer_name}</p>
                    <p className="font-mono text-xs tracking-wider text-muted-foreground">{order.pickup_code || "N/A"}</p>
                    {order.charities?.name && (
                      <p className="text-xs text-gold mt-0.5">♥ {order.charities.name}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${s.className}`}>
                    {s.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-foreground">R$ {Number(order.total).toFixed(2)}</span>
                    {Number(order.discount) > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">-R$ {Number(order.discount).toFixed(2)}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("pt-BR")}</span>
                </div>

                {(paidInfo || deliveredInfo) && (
                  <div className="bg-muted/50 rounded-lg p-2 space-y-1 text-[11px] text-muted-foreground">
                    {paidInfo && (
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        <span>Pgto: {paidInfo}</span>
                      </div>
                    )}
                    {deliveredInfo && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>Entrega: {deliveredInfo}</span>
                      </div>
                    )}
                  </div>
                )}

                <Select value={order.status} onValueChange={(v) => updateStatus.mutate({ id: order.id, status: v })}>
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusMap).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          );
        })}
        {orders.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">Nenhum pedido registrado.</div>
        )}
      </div>

      {/* Pickup validation dialog */}
      <Dialog open={pickupDialogOpen} onOpenChange={setPickupDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <QrCode className="h-5 w-5 text-gold" /> Validação de Retirada
            </DialogTitle>
          </DialogHeader>
          {foundOrder && (
            <div className="space-y-4 py-2">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Código</span>
                  <span className="font-mono font-bold tracking-widest text-foreground">{foundOrder.pickup_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliente</span>
                  <span className="font-medium text-foreground">{foundOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold text-foreground">R$ {Number(foundOrder.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status Atual</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(statusMap[foundOrder.status] || statusMap.pendente).className}`}>
                    {(statusMap[foundOrder.status] || { label: foundOrder.status }).label}
                  </span>
                </div>
                {foundOrder.paid_by && foundOrder.paid_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pgto aprovado</span>
                    <span className="text-xs text-foreground flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-blue-500" />
                      {formatTrackingInfo(foundOrder.paid_by, foundOrder.paid_at)}
                    </span>
                  </div>
                )}
              </div>

              {orderItems.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Itens do Pedido:</p>
                  <div className="bg-muted rounded-lg p-3 space-y-1">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.quantity}x {item.product_name}</span>
                        <span className="text-muted-foreground">R$ {(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {foundOrder.status === "retirado" && (
                <p className="text-sm text-green-600 font-medium text-center">✅ Este pedido já foi retirado.</p>
              )}
              {foundOrder.status === "cancelado" && (
                <p className="text-sm text-red-500 font-medium text-center">❌ Este pedido foi cancelado.</p>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setPickupDialogOpen(false)} className="w-full sm:w-auto">Fechar</Button>
            {foundOrder && foundOrder.status !== "retirado" && foundOrder.status !== "cancelado" && (
              <Button onClick={confirmPickup} className="bg-green-600 hover:bg-green-700 text-white font-semibold w-full sm:w-auto">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirmar Retirada
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel order dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={(open) => { if (!open) { setCancelDialogOpen(false); setCancelOrderId(null); setCancelReason(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" /> Cancelar Pedido
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Informe o motivo do cancelamento. O estoque será devolvido automaticamente.</p>
            <div className="space-y-1.5">
              <Label className="text-sm">Motivo *</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Cliente solicitou cancelamento"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => { setCancelDialogOpen(false); setCancelReason(""); }} className="w-full sm:w-auto">
              Voltar
            </Button>
            <Button onClick={handleCancelConfirm} disabled={!cancelReason.trim()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto">
              <XCircle className="h-4 w-4 mr-1.5" /> Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
