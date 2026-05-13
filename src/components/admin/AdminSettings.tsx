import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link as LinkIcon, Copy, User, Trash2, CheckCircle2, Clock } from "lucide-react";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("*");
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ["admin-invitations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("staff_invitations")
        .select("*, profiles!staff_invitations_used_by_fkey(full_name, email)")
        .order("created_at", { ascending: false });
      return data || [];
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
      toast.success("Configurações salvas.");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: () => toast.error("Erro ao salvar."),
  });

  const createInviteMutation = useMutation({
    mutationFn: async () => {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const { error } = await supabase.from("staff_invitations").insert({
        token,
        status: "pending"
      });
      if (error) throw error;
      return token;
    },
    onSuccess: (token) => {
      const url = `${window.location.origin}/invite/staff/${token}`;
      navigator.clipboard.writeText(url);
      toast.success("Link de convite criado e copiado!");
      queryClient.invalidateQueries({ queryKey: ["admin-invitations"] });
    },
    onError: () => toast.error("Erro ao criar convite."),
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("staff_invitations")
        .update({ status: "revoked" })
        .eq("id", id);
      if (error) throw error;
      
      const invite = invitations.find((i: any) => i.id === id);
      if (invite?.used_by) {
        await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", invite.used_by)
          .eq("role", "staff");
      }
    },
    onSuccess: () => {
      toast.success("Acesso revogado.");
      setRevokingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-invitations"] });
    },
    onError: () => toast.error("Erro ao revogar acesso."),
  });

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/invite/staff/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-navy-dark tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground font-medium">Gestão de canais e equipe</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-sm font-bold text-navy-dark/60">Canais de Contato</CardTitle>
            <CardDescription className="text-xs font-medium text-gray-400">Suporte e Atendimento</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-navy-dark">WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="bg-white border-gray-100 h-11 text-sm rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-navy-dark">E-mail</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="suporte@exemplo.com"
                  className="bg-white border-gray-100 h-11 text-sm rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50">
              <Button
                className="w-full bg-navy hover:bg-navy-dark text-white font-bold rounded-xl h-11 shadow-sm transition-all text-sm"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-navy-dark/60">Gestão de Equipe</CardTitle>
                <CardDescription className="text-xs font-medium text-gray-400">Slots e Acessos</CardDescription>
              </div>
              <Button
                onClick={() => createInviteMutation.mutate()}
                disabled={createInviteMutation.isPending}
                size="sm"
                className="bg-navy-dark hover:bg-black text-white font-bold rounded-lg h-9 px-4 text-[10px] uppercase tracking-widest shadow-lg"
              >
                {createInviteMutation.isPending ? "..." : "Novo Slot"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {invitations.filter(i => i.status !== 'revoked').map((invite: any) => (
                <div 
                  key={invite.id} 
                  className={`group relative flex flex-col p-4 rounded-2xl border transition-all ${
                    invite.status === 'active' 
                      ? "bg-white border-gray-100 shadow-sm" 
                      : "bg-gray-50/50 border-dashed border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl ${
                        invite.status === 'active' ? "bg-navy/5 text-navy" : "bg-gray-100 text-gray-400"
                      }`}>
                        {invite.status === 'active' ? <User className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-navy-dark truncate leading-tight">
                          {invite.profiles?.full_name || "Slot disponível"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {invite.status === 'active' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Membro Ativo</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 text-gold" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Aguardando registro</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {invite.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-xl"
                          onClick={() => copyInviteLink(invite.token)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                        onClick={() => setRevokingId(invite.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {invite.profiles?.email && (
                    <p className="text-[10px] font-medium text-gray-400 mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      {invite.profiles.email}
                    </p>
                  )}
                </div>
              ))}
              
              {invitations.filter(i => i.status !== 'revoked').length === 0 && (
                <div className="py-10 text-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-100">
                  <p className="text-xs font-medium text-gray-300 italic">Nenhum slot de equipe criado.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={revokingId !== null} onOpenChange={(open) => !open && setRevokingId(null)}>
        <AlertDialogContent className="rounded-2xl border-gray-100 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-navy-dark text-lg">Revogar Acesso?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-gray-500">
              Esta ação removerá instantaneamente o acesso desta pessoa ao painel de equipe. Você tem certeza?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-gray-100 text-sm font-semibold">Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              onClick={() => revokingId && revokeMutation.mutate(revokingId)}
            >
              Confirmar Revogação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSettings;
