
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
import { CheckCircle2, Search, QrCode, UserCheck, XCircle, Info } from "lucide-react";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-gray-100 text-gray-500" },
  pronto: { label: "Pronto p/ Retirada", className: "bg-gray-200 text-navy-dark" },
  retirado: { label: "Retirado", className: "bg-navy-dark text-white" },
  cancelado: { label: "Cancelado", className: "bg-gray-50 text-gray-300 line-through" },
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

  const { data: adminProfiles = {} } = useQuery({
    queryKey: ["admin-profiles", orders.length],
    queryFn: async () => {
      const ids = orders.flatMap((o: any) => [o.paid_by, o.delivered_by]).filter(Boolean);
      if (ids.length === 0) return {};
      const { data } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => { map[p.id] = p.full_name || p.id.slice(0, 8); });
      return map;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (status === "cancelado") {
        setCancelOrderId(id);
        setCancelDialogOpen(true);
        throw new Error("__cancel_dialog__");
      }
      const now = new Date().toISOString();
      const tracking = status === "pronto" ? { paid_by: adminUserId, paid_at: now } : 
                       status === "retirado" ? { delivered_by: adminUserId, delivered_at: now } : {};
      
      await supabase.from("orders").update({ status, ...tracking }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders-all"] }),
    onError: (err) => {
      if (err.message !== "__cancel_dialog__") {
        toast.error("Erro ao atualizar pedido.");
      }
    },
  });

  const handleCancelConfirm = async () => {
    if (!cancelOrderId || !cancelReason.trim()) return;
    try {
      const { error } = await supabase.rpc("cancel_order", {
        p_order_id: cancelOrderId,
        p_reason: cancelReason.trim(),
      });
      if (error) throw error;
      toast.success("Pedido cancelado.");
      queryClient.invalidateQueries({ queryKey: ["admin-orders-all"] });
    } catch (err: any) {
      toast.error("Erro ao cancelar.");
    } finally {
      setCancelDialogOpen(false);
      setCancelOrderId(null);
      setCancelReason("");
    }
  };

  const handlePickupSearch = async () => {
    const code = pickupCode.trim().toUpperCase();
    if (code.length !== 6) return;
    const { data } = await supabase.from("orders").select("*").eq("pickup_code", code).single();
    if (!data) {
      toast.error("Pedido não encontrado.");
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
    toast.success("Retirada confirmada!");
    setPickupDialogOpen(false);
    setFoundOrder(null);
    setPickupCode("");
    queryClient.invalidateQueries({ queryKey: ["admin-orders-all"] });
  };

  const formatTrackingInfo = (userId: string | null, timestamp: string | null) => {
    if (!userId || !timestamp) return null;
    const name = adminProfiles[userId] || userId.slice(0, 8);
    const date = new Date(timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    return `${name} (${date})`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-dark tracking-tight">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de vendas e validação de retiradas</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="CÓDIGO DE RETIRADA..."
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value.toUpperCase().slice(0, 6))}
              className="bg-white border-gray-100 rounded-xl shadow-sm pl-10 h-11 text-sm font-mono uppercase tracking-widest"
              onKeyDown={(e) => e.key === "Enter" && handlePickupSearch()}
            />
          </div>
          <Button onClick={handlePickupSearch} className="bg-navy-dark hover:bg-black text-white font-bold rounded-xl h-11 px-6 shadow-sm">
            Validar
          </Button>
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Cliente / Código</th>
                <th className="px-6 py-4">Instituição</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Responsáveis</th>
                <th className="px-6 py-4 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order: any) => {
                const s = statusMap[order.status] || { label: order.status, className: "bg-gray-100 text-gray-400" };
                const paidInfo = formatTrackingInfo(order.paid_by, order.paid_at);
                const deliveredInfo = formatTrackingInfo(order.delivered_by, order.delivered_at);
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-navy-dark uppercase">{order.customer_name}</p>
                      <p className="text-[10px] font-mono text-gray-400 tracking-widest mt-0.5">{order.pickup_code || "---"}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 uppercase font-medium">
                      {order.charities?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 font-bold text-navy-dark">
                      R$ {Number(order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <Select value={order.status} onValueChange={(v) => updateStatus.mutate({ id: order.id, status: v })}>
                        <SelectTrigger className="h-9 w-44 rounded-xl border-gray-100 bg-white text-xs font-semibold shadow-sm overflow-hidden">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.className}`}>{s.label}</span>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                          {Object.entries(statusMap).map(([key, val]) => (
                            <SelectItem key={key} value={key} className="text-xs uppercase font-bold tracking-widest">{val.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-[9px] text-gray-400 uppercase tracking-tight leading-relaxed">
                      {paidInfo && (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3 w-3 text-gray-300" />
                          <span>PGTO: {paidInfo}</span>
                        </div>
                      )}
                      {deliveredInfo && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <CheckCircle2 className="h-3 w-3 text-gray-300" />
                          <span>ENTR: {deliveredInfo}</span>
                        </div>
                      )}
                      {!paidInfo && !deliveredInfo && <span>---</span>}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">Nenhum pedido registrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={pickupDialogOpen} onOpenChange={setPickupDialogOpen}>
        <DialogContent className="rounded-2xl border-gray-100 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-navy-dark flex items-center gap-2 uppercase tracking-widest text-xs">
              <QrCode className="h-4 w-4 text-gray-400" /> Validação de Retirada
            </DialogTitle>
          </DialogHeader>
          {foundOrder && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-3 border border-gray-100">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código</span>
                  <span className="font-mono font-bold tracking-[0.2em] text-navy-dark text-lg">{foundOrder.pickup_code}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</span>
                  <span className="font-bold text-navy-dark uppercase text-xs">{foundOrder.customer_name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                  <span className="font-bold text-navy-dark text-lg">R$ {Number(foundOrder.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPickupDialogOpen(false)} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Fechar</Button>
            {foundOrder && foundOrder.status !== "retirado" && foundOrder.status !== "cancelado" && (
              <Button onClick={confirmPickup} className="bg-navy-dark hover:bg-black text-white rounded-xl font-bold uppercase tracking-widest text-[10px] flex-1">
                Confirmar Entrega
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="rounded-2xl border-gray-100 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-navy-dark flex items-center gap-2 uppercase tracking-widest text-xs text-gray-400">
              <Info className="h-4 w-4" /> Cancelar Pedido
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Motivo</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Erro no cadastro..."
                className="rounded-xl border-gray-100 min-h-[100px] text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Voltar</Button>
            <Button onClick={handleCancelConfirm} disabled={!cancelReason.trim()} className="bg-gray-200 hover:bg-gray-300 text-navy-dark rounded-xl font-bold uppercase tracking-widest text-[10px] flex-1">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
