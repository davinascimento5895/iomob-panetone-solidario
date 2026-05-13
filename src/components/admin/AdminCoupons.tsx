import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminCoupons = ({ readOnly = false }: { readOnly?: boolean }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_value: "",
    max_uses: "",
    expires_at: "",
  });
  const queryClient = useQueryClient();

  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const addCoupon = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("coupons").insert({
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order_value: form.min_order_value ? Number(form.min_order_value) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Cupom criado!");
      setDialogOpen(false);
      setForm({ code: "", discount_type: "percentage", discount_value: 0, min_order_value: "", max_uses: "", expires_at: "" });
    },
    onError: (e: any) => toast.error(e.message?.includes("unique") ? "Código já existe." : "Erro ao criar cupom."),
  });

  const toggleCoupon = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await supabase.from("coupons").update({ active }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("coupons").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Cupom excluído.");
    },
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-navy-dark tracking-tight">Cupons de Desconto</h1>
          <p className="text-xs text-muted-foreground">Gerencie ofertas e promoções para os clientes</p>
        </div>
        {!readOnly && (
          <Button 
            size="sm" 
            className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-9 shadow-sm transition-all px-6 uppercase text-[10px] tracking-widest" 
            onClick={() => setDialogOpen(true)}
          >
            Novo Cupom
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((c) => (
          <Card key={c.id} className={`border-gray-100 shadow-sm hover:shadow-md transition-all ${!c.active ? "opacity-50 grayscale-[0.5]" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-navy-dark tracking-wider">{c.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!readOnly && (
                    <>
                      <Switch checked={c.active} onCheckedChange={(v) => toggleCoupon.mutate({ id: c.id, active: v })} className="data-[state=checked]:bg-navy" />
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors text-[9px] font-bold uppercase" onClick={() => deleteCoupon.mutate(c.id)}>
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Valor do Desconto</p>
                <p className="text-2xl font-bold text-navy-dark tabular-nums">
                  {c.discount_type === "percentage" ? `${c.discount_value}%` : `R$ ${Number(c.discount_value).toFixed(2).replace('.', ',')}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-gray-50">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Pedido Mínimo</p>
                  <p className="text-[11px] font-medium text-navy-dark">
                    {c.min_order_value ? `R$ ${Number(c.min_order_value).toFixed(2)}` : "Livre"}
                  </p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Status de Uso</p>
                  <p className="text-[11px] font-medium text-navy-dark">
                    {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : " (∞)"}
                  </p>
                </div>
                {c.expires_at && (
                  <div className="col-span-2 space-y-0.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Válido Até</p>
                    <p className="text-[11px] font-medium text-navy-dark">
                      {new Date(c.expires_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {coupons.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400 italic">Nenhum cupom ativo no momento.</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-navy-dark tracking-tight">Novo Cupom de Desconto</DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Crie códigos promocionais para aplicar descontos em compras.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="NATAL10" className="font-mono uppercase" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" min={0} value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor mín. pedido</Label>
                <Input type="number" min={0} value={form.min_order_value} onChange={(e) => setForm({ ...form, min_order_value: e.target.value })} placeholder="Opcional" />
              </div>
              <div className="space-y-2">
                <Label>Máx. usos</Label>
                <Input type="number" min={1} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Ilimitado" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data de expiração</Label>
              <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-navy-dark">Cancelar</Button>
            <Button 
              className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg px-8 shadow-sm transition-all w-full sm:w-auto" 
              onClick={() => addCoupon.mutate()} 
              disabled={!form.code || form.discount_value <= 0}
            >
              Criar Cupom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
