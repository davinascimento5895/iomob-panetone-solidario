import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
    campaign_name: "",
    whatsapp: "",
    email: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        campaign_name: settings.campaign_name || "",
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
    onError: (err: any) => {
      toast.error(err.message || "Erro ao salvar");
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
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Configurações</h1>
      <div className="bg-card rounded-xl shadow-sm p-6 max-w-lg space-y-5">
        <div className="space-y-2">
          <Label>Nome da Campanha</Label>
          <Input
            value={form.campaign_name}
            onChange={(e) => setForm({ ...form, campaign_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp de Contato</Label>
          <Input
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>E-mail de Contato</Label>
          <Input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <Button
          className="bg-gold hover:bg-gold-dark text-primary font-semibold"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
