
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import logoRotary from "@/assets/logo-rotary.svg";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as any)?.redirect || "/admin";

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

      if (roleList.includes("admin")) {
        toast.success("Login administrativo realizado!");
        navigate("/admin", { replace: true });
      } else if (roleList.includes("moderator") || roleList.includes("moderador")) {
        toast.success("Login moderador realizado!");
        navigate("/moderator", { replace: true });
      } else {
        toast.error("Acesso negado: você não tem permissões administrativas.");
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
        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
              <img src={logoRotary} alt="Rotary" className="h-10 mx-auto" />
            </Link>
            <h1 className="text-xl font-bold text-navy-dark uppercase tracking-widest">Painel Admin</h1>
            <p className="text-gray-400 mt-2 text-xs font-medium uppercase tracking-widest">Acesso restrito a administradores</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10 bg-gray-50 border-gray-100 rounded-lg text-sm" />
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
                  className="h-10 bg-gray-50 border-gray-100 rounded-lg text-sm"
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

            <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-11 transition-all">
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

export default AdminLogin;
