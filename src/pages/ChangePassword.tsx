
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import logoRotary from "@/assets/logo-rotary.svg";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { club_id, current_password } = (location.state as any) || {};

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!club_id) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("club-auth", {
        body: {
          action: "change-password",
          club_id,
          password: current_password,
          new_password: newPassword,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success("Senha alterada com sucesso! Agora você pode acessar o sistema.");
      navigate("/app/produtos");
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-navy/5 rounded-full mb-6">
              <ShieldCheck className="h-8 w-8 text-navy" />
            </div>
            <h1 className="text-xl font-bold text-navy-dark uppercase tracking-widest leading-tight">Segurança Obrigatória</h1>
            <p className="text-gray-400 mt-2 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Você está usando uma senha temporária. <br/> Por favor, defina uma nova senha para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" size="sm" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-11 bg-gray-50 border-gray-100 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" size="sm" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 bg-gray-50 border-gray-100 rounded-lg text-sm"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-12 transition-all active:scale-[0.98] shadow-md shadow-navy/10">
                {loading ? "SALVANDO..." : "DEFINIR NOVA SENHA"}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <img src={logoRotary} alt="Rotary" className="h-6 mx-auto opacity-20 grayscale" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChangePassword;
