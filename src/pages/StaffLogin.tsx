
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Users } from "lucide-react";
import logoRotary from "@/assets/logo-rotary.svg";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const StaffLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Falha ao obter sessão");

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const roleList = Array.isArray(roles) ? roles.map((r: any) => r.role) : [];

      if (roleList.includes("staff") || roleList.includes("admin")) {
        toast.success("Login de equipe realizado!");
        navigate("/equipe", { replace: true });
      } else {
        toast.error("Acesso negado: você não tem permissões de equipe.");
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      toast.error("Erro na autenticação: " + (err.message || "Verifique seus dados."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
              <img src={logoRotary} alt="Rotary" className="h-10 mx-auto" />
            </Link>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-navy-dark/40" />
              <h1 className="text-xl font-bold text-navy-dark uppercase tracking-widest">Painel Equipe</h1>
            </div>
            <p className="text-gray-400 mt-1 text-[10px] font-bold uppercase tracking-widest">Retirada e Logística</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-11 bg-gray-50 border-gray-100 rounded-xl text-sm" 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-gray-50 border-gray-100 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-navy-dark transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-navy-dark hover:bg-black text-white font-bold rounded-xl h-11 transition-all shadow-sm">
              {loading ? "Entrando..." : "Acessar Painel"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-[10px] font-bold text-gray-400 hover:text-navy-dark uppercase tracking-widest transition-colors">
              Voltar ao login de clubes
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StaffLogin;
