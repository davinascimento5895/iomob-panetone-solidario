import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const CHART_COLORS = [
  "hsl(220, 60%, 25%)", // Navy Dark
  "hsl(220, 40%, 40%)", // Navy Muted
  "hsl(220, 20%, 55%)", // Steel Gray
  "hsl(220, 15%, 70%)", // Light Gray
  "hsl(215, 30%, 35%)", // Deep Slate
];

const AdminCharities = ({ readOnly = false }: { readOnly?: boolean }) => {
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
  const activeOrders = orders.filter((o) => o.status !== "cancelado");
  const totalOrdersWithCharity = activeOrders.filter((o) => o.charity_id).length;
  const totalRevenueWithCharity = activeOrders.filter((o) => o.charity_id).reduce((s, o) => s + Number(o.total), 0);

  const charityStats = charities.map((c) => {
    const cOrders = activeOrders.filter((o) => o.charity_id === c.id);
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-navy-dark tracking-tight">Instituições</h1>
          <p className="text-xs text-muted-foreground">Monitore o desempenho e repasses das parcerias</p>
        </div>
        {!readOnly && (
          <Button 
            size="sm" 
            className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-9 shadow-sm transition-all px-6 uppercase text-[10px] tracking-widest" 
            onClick={openCreate}
          >
            Nova Instituição
          </Button>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-gray-100 shadow-sm bg-navy text-white overflow-hidden relative">
          <CardContent className="p-5">
            <p className="text-[10px] font-medium uppercase tracking-widest opacity-60">Pedidos Beneficentes</p>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl font-semibold tabular-nums text-white">{totalOrdersWithCharity}</h2>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden relative">
          <CardContent className="p-5">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Valor Arrecadado</p>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-semibold text-navy-dark tabular-nums">R$ {totalRevenueWithCharity.toFixed(2).replace('.', ',')}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {charityStats.length > 0 && (
        <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 px-6 border-b border-gray-50 bg-gray-50/30">
            <CardTitle className="text-xs font-bold text-navy-dark/40 uppercase tracking-widest">Volume de Pedidos por Instituição</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charityStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 20%, 95%)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: 'hsl(220, 20%, 60%)' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(220, 20%, 60%)' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="pedidos" radius={[6, 6, 0, 0]} barSize={40}>
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
      <div className="grid grid-cols-1 gap-4">
        {charities.map((c) => {
          const cOrders = activeOrders.filter((o) => o.charity_id === c.id);
          const cRevenue = cOrders.reduce((s, o) => s + Number(o.total), 0);
          return (
            <Card key={c.id} className={`border-gray-100 shadow-sm hover:shadow-md transition-all ${!c.active ? "opacity-50 grayscale-[0.5]" : ""}`}>
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-navy-dark tracking-tight">{c.name}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 italic line-clamp-1">{c.description || "Sem descrição detalhada"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Pedidos</span>
                      <span className="text-xs font-semibold text-navy-dark">{cOrders.length}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-gray-100"></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Arrecadação</span>
                      <span className="text-xs font-semibold text-navy-dark">R$ {cRevenue.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-3 pt-4 sm:pt-0 border-t sm:border-none border-gray-50">
                    <div className="flex items-center gap-2 mr-2">
                      <span className="text-[10px] font-medium text-gray-400">Ativa</span>
                      <Switch
                        checked={c.active}
                        onCheckedChange={(active) => toggleActive.mutate({ id: c.id, active })}
                        className="data-[state=checked]:bg-navy"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-navy hover:bg-navy/5 text-[9px] font-bold uppercase" onClick={() => openEdit(c)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-300 hover:text-red-500 hover:bg-red-50 text-[9px] font-bold uppercase" onClick={() => deleteMutation.mutate(c.id)}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {charities.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400 italic">Nenhuma instituição cadastrada.</p>
          </div>
        )}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-navy-dark tracking-tight">
              {editing ? "Editar Instituição" : "Cadastrar Nova Instituição"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Configure as informações e parcerias com instituições beneficentes.
            </DialogDescription>
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
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-navy-dark">Cancelar</Button>
            <Button 
              onClick={handleSave} 
              className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg px-8 shadow-sm transition-all w-full sm:w-auto"
            >
              {editing ? "Salvar Alterações" : "Criar Instituição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCharities;
