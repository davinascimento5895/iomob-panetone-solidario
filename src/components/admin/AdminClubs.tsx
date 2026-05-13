
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, RotateCcw, Search, Users, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminClubs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ["admin-clubs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (club: any) => {
      const { data, error } = await supabase.functions.invoke("club-auth", {
        body: {
          action: "reset-password",
          club_id: club.id,
        },
      });
      
      if (error) {
        const resp = (error as any).context;
        let errorMessage = "Erro ao resetar senha";
        if (resp && typeof resp.json === 'function') {
          try {
            const errorData = await resp.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
        throw new Error(errorMessage);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clubs"] });
      toast.success("Senha resetada com sucesso.");
    },
    onError: (error: any) => {
      toast.error("Erro ao resetar: " + error.message);
    },
  });

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-dark tracking-tight">Clubes</h1>
          <p className="text-sm text-gray-500 mt-1">Gerenciamento de acessos institucionais</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome do clube..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-gray-100 rounded-xl shadow-sm pl-10 h-11 text-sm transition-all focus:ring-navy"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-navy/5">
              <Users className="h-6 w-6 text-navy" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total de Clubes</p>
              <p className="text-2xl font-bold text-navy-dark">{clubs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-50">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acessos Ativos</p>
              <p className="text-2xl font-bold text-navy-dark">{clubs.filter(c => c.temp_password_used).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gold/5">
              <ShieldAlert className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pendentes</p>
              <p className="text-2xl font-bold text-navy-dark">{clubs.filter(c => !c.temp_password_used).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Clube</th>
                <th className="px-6 py-4">Senha Inicial</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Último Acesso</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Carregando dados...</td>
                </tr>
              ) : filteredClubs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Nenhum clube encontrado.</td>
                </tr>
              ) : (
                filteredClubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-navy-dark">
                      {club.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-50 px-2 py-1 rounded text-xs font-mono text-gray-600">
                          {showPasswords[club.id] ? club.initial_password : "••••••••"}
                        </code>
                        <button 
                          onClick={() => setShowPasswords(prev => ({ ...prev, [club.id]: !prev[club.id] }))}
                          className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400"
                        >
                          {showPasswords[club.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {club.temp_password_used ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 uppercase">
                          Senha Definida
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold/10 text-gold uppercase">
                          Temporária
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {club.last_login ? (
                        new Date(club.last_login).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                      ) : (
                        <span className="italic text-gray-300">Nunca acessou</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-gray-400 hover:text-navy uppercase tracking-widest gap-2">
                            <RotateCcw className="h-3 w-3" /> Resetar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl border-gray-100 shadow-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-display font-bold text-navy-dark">Resetar Senha?</AlertDialogTitle>
                            <AlertDialogDescription>
                              A senha do clube <span className="font-bold text-navy-dark">{club.name}</span> voltará para a senha inicial (<span className="font-mono text-gold font-bold">{club.initial_password}</span>).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl border-gray-100 text-xs font-bold uppercase tracking-widest">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => resetMutation.mutate(club)}
                              className="rounded-xl bg-navy hover:bg-navy-dark text-white text-xs font-bold uppercase tracking-widest"
                            >
                              Confirmar Reset
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminClubs;
