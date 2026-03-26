import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

  const { data: combos = [] } = useQuery({
    queryKey: ["combos"],
    queryFn: async () => {
      const { data } = await supabase.from("combos").select("*, combo_items(*, products(name))").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const addCombo = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("combos").insert({
        name: form.name,
        description: form.description || null,
        combo_price: form.combo_price,
      }).select().single();
      if (error) throw error;

      if (form.items.length > 0) {
        const items = form.items.map((i) => ({ combo_id: data.id, product_id: i.product_id, quantity: i.quantity }));
        await supabase.from("combo_items").insert(items);
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
      await supabase.from("combos").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combos"] });
      toast.success("Combo excluído.");
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
        <h1 className="text-2xl font-display font-bold text-foreground">Combos</h1>
        <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary font-semibold" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Combo
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {combos.map((combo: any) => (
          <Card key={combo.id} className={`${!combo.active ? "opacity-60" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-gold" />
                  <span className="font-bold text-foreground">{combo.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={combo.active} onCheckedChange={(v) => toggleCombo.mutate({ id: combo.id, active: v })} />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCombo.mutate(combo.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {combo.description && <p className="text-sm text-muted-foreground mb-2">{combo.description}</p>}
              <p className="text-2xl font-bold text-gold">R$ {Number(combo.combo_price).toFixed(2)}</p>
              <div className="mt-3 space-y-1">
                {combo.combo_items?.map((ci: any) => (
                  <p key={ci.id} className="text-xs text-muted-foreground">{ci.quantity}x {ci.products?.name || "N/A"}</p>
                ))}
                {(!combo.combo_items || combo.combo_items.length === 0) && (
                  <p className="text-xs text-muted-foreground">Nenhum item</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {combos.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">Nenhum combo cadastrado.</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Novo Combo</DialogTitle>
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
            <div className="space-y-2">
              <Label>Itens do Combo</Label>
              {form.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                  <span className="flex-1">{item.quantity}x {getProductName(item.product_id)}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(i)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Select value={newItem.product_id} onValueChange={(v) => setNewItem({ ...newItem, product_id: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Produto" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} className="w-20" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} />
                <Button variant="outline" size="sm" onClick={addItem}>+</Button>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold" onClick={() => addCombo.mutate()} disabled={!form.name || form.combo_price <= 0}>
              Criar Combo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCombos;
