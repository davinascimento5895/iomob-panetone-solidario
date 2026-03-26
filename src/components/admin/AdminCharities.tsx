import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Heart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const CHART_COLORS = ["hsl(38, 80%, 55%)", "hsl(220, 60%, 25%)", "hsl(220, 40%, 40%)", "hsl(35, 85%, 40%)", "hsl(40, 70%, 65%)", "hsl(0, 60%, 50%)", "hsl(150, 50%, 40%)"];

const AdminCharities = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", logo_url: "" });

  const { data: charities = [] } = useQuery({
    queryKey: ["admin-charities"],
    queryFn: async () => {
      const { data } = await supabase.from("charities").select("*").order("created_at");
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders-charities"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("id, charity_id, total, status");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editing) {
        await supabase.from("charities").update(data).eq("id", editing.id);
      } else {
        await supabase.from("charities").insert(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-charities"] });
      setDialogOpen(false);
      setEditing(null);
      toast.success(editing ? "Instituição atualizada!" : "Instituição criada!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("charities").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-charities"] });
      toast.success("Instituição removida.");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await supabase.from("charities").update({ active }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-charities"] }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", logo_url: "" });
    setDialogOpen(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || "", logo_url: c.logo_url || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Nome obrigatório");
      return;
    }
    saveMutation.mutate({ name: form.name, description: form.description || null, logo_url: form.logo_url || null });
  };

  // Stats
  const totalOrdersWithCharity = orders.filter((o) => o.charity_id).length;
  const totalRevenueWithCharity = orders.filter((o) => o.charity_id).reduce((s, o) => s + Number(o.total), 0);

  const charityStats = charities.map((c) => {
    const cOrders = orders.filter((o) => o.charity_id === c.id);
    return {
      name: c.name.length > 15 ? c.name.slice(0, 15) + "…" : c.name,
      fullName: c.name,
      pedidos: cOrders.length,
      total: cOrders.reduce((s, o) => s + Number(o.total), 0),
    };
  });

  const chartConfig = { pedidos: { label: "Pedidos", color: "hsl(38, 80%, 55%)" } };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">Instituições</h1>
        <Button onClick={openCreate} className="bg-gold hover:bg-gold-dark text-primary font-semibold" size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nova
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-gold" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Pedidos Beneficentes</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{totalOrdersWithCharity}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-gold" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Valor Beneficente</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-foreground">R$ {totalRevenueWithCharity.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {charityStats.length > 0 && (
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-semibold">Pedidos por Instituição</CardTitle>
          </CardHeader>
          <CardContent className="px-1 sm:px-6 pb-3">
            <ChartContainer config={chartConfig} className="w-full h-[200px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charityStats} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="pedidos" radius={[4, 4, 0, 0]}>
                    {charityStats.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Charities list */}
      <div className="space-y-3">
        {charities.map((c) => {
          const cOrders = orders.filter((o) => o.charity_id === c.id);
          return (
            <Card key={c.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-gold flex-shrink-0" />
                    <h3 className="font-medium text-foreground truncate">{c.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description || "Sem descrição"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cOrders.length} pedido(s) · R$ {cOrders.reduce((s, o) => s + Number(o.total), 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch
                    checked={c.active}
                    onCheckedChange={(active) => toggleActive.mutate({ id: c.id, active })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {charities.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhuma instituição cadastrada.</p>
        )}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar Instituição" : "Nova Instituição"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da instituição" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição da instituição" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>URL do Logo (opcional)</Label>
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark text-primary font-semibold w-full sm:w-auto">
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCharities;
