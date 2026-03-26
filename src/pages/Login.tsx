import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Phone } from "lucide-react";
import logoRotary from "@/assets/logo-rotary.svg";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as any)?.redirect || "/app/produtos";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/panetonesolidario/login",
        });
        if (error) throw error;
        toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
        setIsForgot(false);
      } else if (isSignUp) {
        const rawPhone = phone.replace(/\D/g, "");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, phone: rawPhone } },
        });
        if (error) throw error;
        toast.success("Conta criada com sucesso!");
        navigate(redirect);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        navigate(redirect);
      }
    } catch (err: any) {
      toast.error("Não foi possível autenticar. Verifique seus dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const title = isForgot ? "Recuperar Senha" : isSignUp ? "Criar Conta" : "Entrar";
  const subtitle = isForgot
    ? "Enviaremos um link de recuperação para seu e-mail"
    : isSignUp
      ? "Crie sua conta para fazer seu pedido"
      : "Acesse sua conta para fazer seu pedido";

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg p-6">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-4">
              <img src={logoRotary} alt="Rotary" className="h-12 mx-auto" />
            </Link>
            <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && !isForgot && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required={isSignUp} />
              </div>
            )}

            {isSignUp && !isForgot && (
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                      const formatted = v.length > 6
                        ? `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`
                        : v.length > 2
                        ? `(${v.slice(0,2)}) ${v.slice(2)}`
                        : v;
                      setPhone(formatted);
                    }}
                    required={isSignUp}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {!isForgot && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {!isSignUp && !isForgot && (
              <div className="text-right">
                <button type="button" onClick={() => setIsForgot(true)} className="text-xs text-muted-foreground hover:text-gold-dark transition-colors">
                  Esqueci minha senha
                </button>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Aguarde..." : isForgot ? "Enviar link" : isSignUp ? "Criar Conta" : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {isForgot ? (
              <button onClick={() => setIsForgot(false)} className="text-sm text-muted-foreground hover:text-gold-dark transition-colors">
                Voltar ao login
              </button>
            ) : (
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-gold-dark transition-colors"
              >
                {isSignUp ? "Já tem uma conta? Entre aqui" : "Não tem conta? Cadastre-se"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
