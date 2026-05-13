import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Gift, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ComboItem {
  product_id: string;
  quantity: number;
}

const AdminCombos = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", combo_price: 0, items: [] as ComboItem[] });
  const [newItem, setNewItem] = useState({ product_id: "", quantity: 1 });
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("name");
      return data || [];
    },
  });

  const { data: combos = [], isLoading: combosLoading } = useQuery({
    queryKey: ["combos"],
    queryFn: async () => {
      console.log("Fetching combos with items...");
      const { data, error } = await supabase
        .from("combos")
        .select(`
          *,
          combo_items (
            *,
            products (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching combos:", error);
        throw error;
      }
      
      console.log("Combos data received:", data);
      return data || [];
    },
  });

  const addCombo = useMutation({
    mutationFn: async () => {
      console.log("Starting combo creation with items:", form.items);
      const { data, error: comboError } = await supabase.from("combos").insert({
        name: form.name,
        description: form.description || null,
        combo_price: form.combo_price,
      }).select().single();
      
      if (comboError) {
        console.error("Error creating combo header:", comboError);
        throw comboError;
      }

      if (form.items.length > 0) {
        console.log("Inserting items for combo:", data.id);
        const items = form.items.map((i) => ({ 
          combo_id: data.id, 
          product_id: i.product_id, 
          quantity: i.quantity 
        }));
        
        const { error: itemsError } = await supabase.from("combo_items").insert(items);
        if (itemsError) {
          console.error("Error inserting combo items:", itemsError);
          throw itemsError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combos"] });
      toast.success("Combo criado!");
      setDialogOpen(false);
      setForm({ name: "", description: "", combo_price: 0, items: [] });
    },
    onError: () => toast.error("Erro ao criar combo."),
  });

  const toggleCombo = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await supabase.from("combos").update({ active }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["combos"] }),
  });

  const deleteCombo = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from("combos").delete().eq("id", id);
      if (error) {
        console.error("deleteCombo error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combos"] });
      toast.success("Combo excluído.");
    },
    onError: (err: any) => {
      console.error("Erro ao excluir combo:", err);
      toast.error("Erro ao excluir combo.");
    },
  });

  const addItem = () => {
    if (!newItem.product_id || newItem.quantity <= 0) return;
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...newItem }] }));
    setNewItem({ product_id: "", quantity: 1 });
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const getProductName = (id: string) => products.find((p) => p.id === id)?.name || "N/A";

  // Calculate original price
  const originalPrice = form.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.product_id);
    return sum + (product ? Number(product.price) * item.quantity : 0);
  }, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-navy-dark tracking-tight">Combos</h1>
          <p className="text-xs text-muted-foreground">Crie e gerencie pacotes promocionais de produtos</p>
        </div>
        <Button 
          size="sm" 
          className="bg-navy hover:bg-navy-dark text-white font-medium rounded-lg h-9 shadow-sm transition-all" 
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> 
          Novo Combo
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {combos.map((combo: any) => (
          <Card key={combo.id} className={`border-gray-100 shadow-sm hover:shadow-md transition-all ${!combo.active ? "opacity-50 grayscale-[0.5]" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <Gift className="h-4 w-4 text-navy-dark/40" />
                  </div>
                  <span className="font-semibold text-navy-dark tracking-tight">{combo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={combo.active} onCheckedChange={(v) => toggleCombo.mutate({ id: combo.id, active: v })} className="data-[state=checked]:bg-navy" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" onClick={() => deleteCombo.mutate(combo.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {combo.description && <p className="text-xs text-gray-400 mb-4 line-clamp-2 italic">{combo.description}</p>}
              
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-xs font-bold text-gray-400">R$</span>
                <p className="text-2xl font-bold text-navy-dark tracking-tighter">
                  {Number(combo.combo_price).toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-gray-50">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Composição:</p>
                {combo.combo_items?.map((ci: any) => (
                  <div key={ci.id} className="flex items-center justify-between text-[11px] text-navy-dark/70 bg-gray-50/50 px-2 py-1 rounded">
                    <span className="truncate">{ci.products?.name || "N/A"}</span>
                    <span className="font-bold ml-2">x{ci.quantity}</span>
                  </div>
                ))}
                {(!combo.combo_items || combo.combo_items.length === 0) && (
                  <p className="text-[10px] text-gray-300 italic">Nenhum item vinculado</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {combos.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Gift className="h-8 w-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 italic">Nenhum combo cadastrado até o momento.</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-navy-dark tracking-tight">Configurar Novo Combo</DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Combine múltiplos produtos com um preço especial para incentivar vendas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome do Combo</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kit Família" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Descrição do combo" />
            </div>

            {/* Items */}
            <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Itens do Combo</Label>
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs shadow-sm">
                    <span className="flex-1 font-medium text-navy-dark">{item.quantity}x {getProductName(item.product_id)}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-300 hover:text-red-500" onClick={() => removeItem(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Select value={newItem.product_id} onValueChange={(v) => setNewItem({ ...newItem, product_id: v })}>
                  <SelectTrigger className="flex-1 h-9 bg-white border-gray-200 text-xs"><SelectValue placeholder="Selecionar produto..." /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} className="w-16 h-9 bg-white border-gray-200 text-xs text-center" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} />
                <Button variant="outline" size="sm" className="h-9 w-9 bg-white border-gray-200 text-navy hover:bg-navy hover:text-white transition-all" onClick={addItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preço do Combo</Label>
              <Input type="number" min={0} step={0.01} value={form.combo_price} onChange={(e) => setForm({ ...form, combo_price: Number(e.target.value) })} />
              {originalPrice > 0 && (
                <p className="text-xs text-muted-foreground">
                  Preço original: R$ {originalPrice.toFixed(2)} | Economia: R$ {(originalPrice - form.combo_price).toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-navy-dark">Cancelar</Button>
            <Button 
              className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg px-8 shadow-sm transition-all w-full sm:w-auto" 
              onClick={() => addCombo.mutate()} 
              disabled={!form.name || form.combo_price <= 0}
            >
              Criar Combo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCombos;
