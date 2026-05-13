
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logoRotary from "@/assets/logo-rotary.svg";

const StaffInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invite, setInvite] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const verifyToken = async () => {
      // Check current session
      const { data: sessionData } = await supabase.auth.getSession();
      setUser(sessionData.session?.user || null);

      const { data, error } = await supabase
        .from("staff_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .maybeSingle();

      if (error || !data) {
        toast.error("Convite inválido ou já utilizado.");
        navigate("/");
        return;
      }
      setInvite(data);
      if (sessionData.session?.user) {
        setFormData(prev => ({ ...prev, email: sessionData.session.user.email || "" }));
      }
      setLoading(false);
    };
    verifyToken();
  }, [token, navigate]);

  const handleAcceptInvite = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      // 1. Assign staff role
      await supabase.from("user_roles").insert({
        user_id: user.id,
        role: "staff"
      });

      // 2. Mark invite as used
      await supabase.from("staff_invitations").update({
        status: "active",
        used_at: new Date().toISOString(),
        used_by: user.id
      }).eq("id", invite.id);

      toast.success("Convite aceito! Bem-vindo à equipe.");
      navigate("/login/equipe");
    } catch (err: any) {
      toast.error("Erro ao aceitar convite: " + (err.message || "Tente novamente."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário.");

      // 2. Insert profile if not handled by trigger
      await supabase.from("profiles").upsert({
        id: authData.user.id,
        full_name: formData.fullName,
        email: formData.email
      });

      // 3. Assign staff role
      await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: "staff"
      });

      // 4. Mark invite as used
      await supabase.from("staff_invitations").update({
        status: "active",
        used_at: new Date().toISOString(),
        used_by: authData.user.id
      }).eq("id", invite.id);

      toast.success("Conta criada com sucesso! Bem-vindo à equipe.");
      navigate("/login/equipe");
    } catch (err: any) {
      toast.error("Erro no cadastro: " + (err.message || "Tente novamente."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm font-medium text-gray-400 italic">Verificando convite...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
              <img src={logoRotary} alt="Rotary" className="h-10 mx-auto" />
            </Link>
            <h1 className="text-xl font-bold text-navy-dark">Cadastro de Equipe</h1>
            <p className="text-gray-400 mt-2 text-xs font-medium">Preencha os dados para ativar seu acesso</p>
          </div>

          {user ? (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-medium text-gray-400 mb-1">Logado como</p>
                <p className="text-sm font-bold text-navy-dark">{user.email}</p>
              </div>
              <Button
                onClick={handleAcceptInvite}
                disabled={submitting}
                className="w-full bg-navy-dark hover:bg-black text-white font-bold rounded-xl h-12 transition-all shadow-sm text-sm"
              >
                {submitting ? "Processando..." : "Aceitar Convite e Entrar"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => supabase.auth.signOut().then(() => setUser(null))}
                className="w-full text-gray-400 hover:text-navy-dark text-xs font-medium"
              >
                Entrar com outra conta
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 ml-0.5">Nome Completo</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="h-11 bg-gray-50 border-gray-100 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 ml-0.5">E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-11 bg-gray-50 border-gray-100 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 ml-0.5">Senha</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-11 bg-gray-50 border-gray-100 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 ml-0.5">Confirmar Senha</Label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="h-11 bg-gray-50 border-gray-100 rounded-xl text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-navy-dark hover:bg-black text-white font-bold rounded-xl h-12 transition-all shadow-sm text-sm mt-4"
              >
                {submitting ? "Criando Conta..." : "Concluir Cadastro"}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center border-t border-gray-50 pt-6">
            <Link to="/login/equipe" className="text-xs font-medium text-gray-400 hover:text-navy-dark transition-colors">
              Já tem uma conta? Acessar Painel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StaffInvite;
