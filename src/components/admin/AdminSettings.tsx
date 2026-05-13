import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, MessageSquare, Mail, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AdminSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("*");
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });

  const [form, setForm] = useState({
    whatsapp: "",
    email: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        whatsapp: settings.whatsapp || "",
        email: settings.email || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const [key, value] of Object.entries(form)) {
        await supabase.from("settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      }
    },
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: () => {
      toast.error("Erro ao salvar configurações. Tente novamente.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-navy-dark tracking-tight">Configurações</h1>
        <p className="text-xs text-muted-foreground">Gerencie as informações de suporte e contato do sistema</p>
      </div>

      <Card className="border-gray-100 shadow-sm max-w-2xl overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-sm font-bold text-navy-dark/40 uppercase tracking-widest">Canais de Contato</CardTitle>
          <CardDescription className="text-xs">Essas informações serão exibidas para os clientes no rodapé e páginas de ajuda.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-3 w-3 text-navy-dark/40" />
                <Label className="text-xs font-semibold text-navy-dark">WhatsApp de Suporte</Label>
              </div>
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="(00) 00000-0000"
                className="bg-white border-gray-200 h-10 text-sm focus:ring-navy"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-3 w-3 text-navy-dark/40" />
                <Label className="text-xs font-semibold text-navy-dark">E-mail de Contato</Label>
              </div>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="suporte@exemplo.com"
                className="bg-white border-gray-200 h-10 text-sm focus:ring-navy"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <Button
              className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg px-8 h-10 shadow-sm transition-all gap-2"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
