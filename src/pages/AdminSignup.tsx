
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import logoRotary from "@/assets/logo-rotary.svg";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminSignup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
        });

        setSuccess(true);
        toast.success("Solicitação de acesso enviada!");
      }
    } catch (err: any) {
      toast.error("Erro ao criar conta: " + (err.message || "Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-6">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-navy-dark mb-4">Conta Criada!</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Sua conta foi criada com sucesso, mas o acesso ao painel administrativo 
              <span className="font-bold"> exige aprovação manual</span>. 
              Por favor, aguarde o administrador liberar seu acesso.
            </p>
            <Button asChild className="w-full bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-11">
              <Link to="/admin/login">Voltar ao Login</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
              <img src={logoRotary} alt="Rotary" className="h-10 mx-auto" />
            </Link>
            <h1 className="text-xl font-bold text-navy-dark uppercase tracking-widest">Novo Admin</h1>
            <p className="text-gray-400 mt-2 text-xs font-medium uppercase tracking-widest">Solicitar acesso administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Nome Completo</Label>
              <Input 
                id="name" 
                placeholder="Seu nome" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                className="h-10 bg-gray-50 border-gray-100 rounded-lg text-sm" 
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-10 bg-gray-50 border-gray-100 rounded-lg text-sm" 
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
              {loading ? "Criando..." : "Criar Conta Admin"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/admin/login" className="text-[10px] font-bold text-gray-400 hover:text-navy-dark uppercase tracking-widest transition-colors">
              Já tem conta? Entrar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminSignup;
