import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminStockMovements = ({ readOnly = false }: { readOnly?: boolean }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ product_id: "", type: "entrada", quantity: 1, reason: "" });
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
        const delta = form.type === "entrada" ? form.quantity : form.type === "saida" ? -form.quantity : 0;
        const newStock = Math.max(0, product.stock + delta);
        await supabase.from("products").update({ stock: newStock }).eq("id", form.product_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Movimentação registrada com sucesso!");
      setDialogOpen(false);
      setForm({ product_id: "", type: "entrada", quantity: 1, reason: "" });
    },
    onError: (err: any) => {
      console.error("Stock movement error:", err);
      toast.error(`Erro: ${err.message || "Não foi possível registrar a movimentação."}`);
    },
  });

  const typeLabel = (t: string) => t === "entrada" ? "Entrada" : t === "saida" ? "Saída" : "Ajuste";

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: products.reduce((acc, p) => acc + (p.stock || 0), 0),
    entriesToday: movements
      .filter(m => m.type === 'entrada' && new Date(m.created_at).toDateString() === new Date().toDateString())
      .reduce((acc, m) => acc + (m.quantity || 0), 0),
    exitsToday: movements
      .filter(m => m.type === 'saida' && new Date(m.created_at).toDateString() === new Date().toDateString())
      .reduce((acc, m) => acc + (m.quantity || 0), 0),
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-navy-dark tracking-tight">Estoque</h1>
          <p className="text-xs text-muted-foreground">Gerenciamento de entrada e saída de produtos</p>
        </div>
        {!readOnly && (
          <Button 
            size="sm" 
            className="bg-navy hover:bg-navy-dark text-white font-medium rounded-lg h-9 shadow-sm transition-all px-6" 
            onClick={() => setDialogOpen(true)}
          >
            Nova Movimentação
          </Button>
        )}
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-gray-100 shadow-sm bg-navy text-white overflow-hidden relative">
          <CardContent className="p-5">
            <p className="text-[10px] font-medium uppercase tracking-widest opacity-60">Total em Estoque</p>
            <h2 className="text-2xl font-semibold tabular-nums mt-1 text-white">{stats.total} <span className="text-[10px] font-normal opacity-50 uppercase tracking-tighter">unidades</span></h2>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden relative">
          <CardContent className="p-5">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Entradas (Hoje)</p>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-semibold text-navy-dark tabular-nums">+{stats.entriesToday}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden relative">
          <CardContent className="p-5">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Saídas (Hoje)</p>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-semibold text-navy-dark tabular-nums">-{stats.exitsToday}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Search & List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Input 
              placeholder="Buscar produto..." 
              className="h-10 border-gray-100 bg-white shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => (
              <Card key={p.id} className="border-gray-100 shadow-sm hover:border-navy/10 transition-all cursor-default">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">{p.weight || "N/A"}</p>
                    <p className="text-sm font-medium text-navy-dark truncate leading-tight">{p.name}</p>
                  </div>
                  <div className={`text-right flex-shrink-0 ml-3 px-2.5 py-1 rounded-lg min-w-[45px] shadow-sm ${p.stock <= 10 ? "bg-red-500" : "bg-navy"}`}>
                    <p className="text-sm font-semibold tabular-nums text-white">{p.stock}</p>
                    <p className="text-[8px] font-medium text-white/70 uppercase tracking-tighter">un.</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="py-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium italic">Nenhum produto encontrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed History */}
        <div className="lg:col-span-8">
          <Card className="border-gray-100 shadow-sm overflow-hidden h-full">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-navy-dark/60 uppercase tracking-widest">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/30">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-navy-dark/40 font-medium text-[10px] uppercase tracking-wider">Operação</th>
                      <th className="text-left py-3 px-4 text-navy-dark/40 font-medium text-[10px] uppercase tracking-wider">Produto</th>
                      <th className="text-left py-3 px-4 text-navy-dark/40 font-medium text-[10px] uppercase tracking-wider text-right">Qtd</th>
                      <th className="text-left py-3 px-4 text-navy-dark/40 font-medium text-[10px] uppercase tracking-wider">Referência / Motivo</th>
                      <th className="text-left py-3 px-4 text-navy-dark/40 font-medium text-[10px] uppercase tracking-wider text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movements.map((m: any) => (
                      <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-widest ${
                            m.type === 'entrada' ? 'bg-green-50 text-green-700' : 
                            m.type === 'saida' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {typeLabel(m.type)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-navy-dark font-medium text-xs">{m.products?.name || "N/A"}</td>
                        <td className="py-3 px-4 font-medium text-navy-dark tabular-nums text-right">{m.type === 'saida' ? '-' : '+'}{m.quantity}</td>
                        <td className="py-3 px-4 text-gray-400 text-[11px] font-normal italic max-w-[200px] truncate">{m.reason || "—"}</td>
                        <td className="py-3 px-4 text-gray-400 text-[9px] font-medium text-right">{new Date(m.created_at).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))}
                    {movements.length === 0 && (
                      <tr><td colSpan={5} className="py-24 text-center text-gray-300 text-xs italic">Nenhuma atividade registrada no período.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Movement history - Mobile cards */}
      <div className="md:hidden space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Histórico</h3>
        {movements.map((m: any) => (
          <Card key={m.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
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
        <DialogContent className="sm:max-w-md border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-navy-dark tracking-tight">Nova Movimentação</DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Registre entradas, saídas ou ajustes manuais para atualizar o saldo dos produtos.
            </DialogDescription>
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
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
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
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto text-gray-400 hover:text-navy-dark">Cancelar</Button>
            <Button 
              className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg px-8 shadow-sm transition-all w-full sm:w-auto" 
              onClick={() => addMovement.mutate()} 
              disabled={!form.product_id || form.quantity <= 0}
            >
              Registrar Movimentação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStockMovements;
