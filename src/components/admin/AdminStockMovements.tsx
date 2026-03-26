import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, ArrowUpRight, ArrowDownRight, RotateCcw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminStockMovements = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ product_id: "", type: "entry", quantity: 0, reason: "" });
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      return data || [];
    },
  });

  const { data: movements = [] } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("stock_movements")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const addMovement = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("stock_movements").insert({
        product_id: form.product_id,
        type: form.type,
        quantity: form.quantity,
        reason: form.reason || null,
      });
      if (error) throw error;

      const product = products.find((p) => p.id === form.product_id);
      if (product) {
        const delta = form.type === "entry" ? form.quantity : form.type === "exit" ? -form.quantity : 0;
        const newStock = Math.max(0, product.stock + delta);
        await supabase.from("products").update({ stock: newStock }).eq("id", form.product_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Movimentação registrada!");
      setDialogOpen(false);
      setForm({ product_id: "", type: "entry", quantity: 0, reason: "" });
    },
    onError: () => toast.error("Erro ao registrar movimentação."),
  });

  const typeLabel = (t: string) => t === "entry" ? "Entrada" : t === "exit" ? "Saída" : "Ajuste";
  const typeIcon = (t: string) => t === "entry" ? <ArrowUpRight className="h-4 w-4 text-green-600" /> : t === "exit" ? <ArrowDownRight className="h-4 w-4 text-red-500" /> : <RotateCcw className="h-4 w-4 text-blue-500" />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Estoque</h1>
        <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary font-semibold" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Nova Movimentação</span><span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Current stock overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-3 sm:p-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.weight || "N/A"}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className={`text-lg font-bold ${p.stock <= 10 ? "text-destructive" : "text-foreground"}`}>{p.stock}</p>
                <p className="text-[10px] text-muted-foreground">un.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Movement history - Desktop table */}
      <Card className="hidden md:block">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Tipo</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Produto</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Qtd</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Motivo</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium text-xs">Data</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m: any) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2 px-2 flex items-center gap-1.5">{typeIcon(m.type)} {typeLabel(m.type)}</td>
                  <td className="py-2 px-2 text-foreground">{m.products?.name || "N/A"}</td>
                  <td className="py-2 px-2 font-medium text-foreground">{m.quantity}</td>
                  <td className="py-2 px-2 text-muted-foreground">{m.reason || "N/A"}</td>
                  <td className="py-2 px-2 text-muted-foreground text-xs">{new Date(m.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Nenhuma movimentação registrada.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Movement history - Mobile cards */}
      <div className="md:hidden space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Histórico</h3>
        {movements.map((m: any) => (
          <Card key={m.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {typeIcon(m.type)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{m.products?.name || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{m.reason || "Sem motivo"}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-bold text-foreground">{m.quantity} un.</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {movements.length === 0 && (
          <div className="py-6 text-center text-muted-foreground text-sm">Nenhuma movimentação registrada.</div>
        )}
      </div>

      {/* Add movement dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Movimentação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.stock} un.)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entrada</SelectItem>
                  <SelectItem value="exit">Saída</SelectItem>
                  <SelectItem value="adjustment">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} placeholder="Ex: Reposição, venda direta..." />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold w-full sm:w-auto" onClick={() => addMovement.mutate()} disabled={!form.product_id || form.quantity <= 0}>
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStockMovements;
